/**
 * normalize-watch-ids.mjs
 *
 * Uses Gemini to canonicalize brand names, model names, and watch_ids across
 * all approved photos. Fixes:
 *   - Brand casing inconsistencies (OMEGA → Omega, SEIKO → Seiko)
 *   - Fragmented watchIds for the same watch (hash/size suffixes)
 *   - Brand repeated in model name (seiko-seiko-5-sports)
 *   - Garbled slugs from special characters (m-hle-glash-tte)
 *   - Completely wrong watchIds (part-of-my-collection)
 *   - watchId is just the brand with no model
 *
 * Outputs a preview of all changes and asks for confirmation before writing.
 *
 * Usage:
 *   node scripts/normalize-watch-ids.mjs [--dry-run]
 *
 * Requires env: DATABASE_URL, GEMINI_API_KEY
 */

import { neon } from '@neondatabase/serverless'
import { GoogleGenerativeAI } from '@google/generative-ai'
import * as readline from 'readline'

const DRY_RUN = process.argv.includes('--dry-run')

for (const k of ['DATABASE_URL', 'GEMINI_API_KEY']) {
  if (!process.env[k]) { console.error(`Missing env: ${k}`); process.exit(1) }
}

const sql = neon(process.env.DATABASE_URL)
const client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
const model = client.getGenerativeModel({ model: 'gemini-2.5-flash' })

// ── helpers ──────────────────────────────────────────────────────────────────

function toSlug(str) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // strip diacritics
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function confirm(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
  return new Promise((resolve) => rl.question(question, (ans) => { rl.close(); resolve(ans.trim().toLowerCase()) }))
}

// ── Step 1: fetch all distinct combos ────────────────────────────────────────

console.log('Fetching watch data from DB…')
const rows = await sql`
  SELECT
    watch_id,
    brand_name,
    model_name,
    COUNT(*) AS photo_count
  FROM photos
  WHERE status = 'approved'
  GROUP BY watch_id, brand_name, model_name
  ORDER BY brand_name, model_name
`
console.log(`Found ${rows.length} distinct (watch_id, brand, model) combinations.\n`)

// ── Step 2: ask Gemini to canonicalize everything in one shot ─────────────────

const inputList = rows.map((r, i) => ({
  index: i,
  watch_id: r.watch_id,
  brand_name: r.brand_name,
  model_name: r.model_name,
  photo_count: Number(r.photo_count),
}))

const prompt = `You are a watch database curator. I will give you a JSON array of watch entries from a community photo gallery. Each entry has: index, watch_id (a URL slug), brand_name, model_name, photo_count.

Your job is to return a canonicalized version of EVERY entry. For each entry, return the corrected canonical_brand, canonical_model, and canonical_watch_id.

Rules:
1. Brand names: use standard title case (Omega, Seiko, Hamilton, Casio, Timex — not OMEGA/SEIKO/HAMILTON/CASIO/TIMEX)
2. Model names: use the official model name. Strip the brand name if it appears at the start (e.g. "Seiko 5 Sports" → "5 Sports"). Keep reference numbers if they are the primary identifier.
3. watch_id: must be slug format (lowercase, hyphens, no special chars, no diacritics). Format: {brand-slug}-{model-slug}. Never include the brand twice. Never include hash suffixes (e.g. -10bf81, -27f3a2, -e8e5dd) or size suffixes (e.g. -42mm) unless the size is part of the official model name.
4. Merge duplicates: if multiple entries clearly refer to the same physical watch model, they must ALL get the same canonical_watch_id. Use the most specific/official name. Examples: "Sea Dweller" and "Sea-Dweller" → same watch_id. "Khaki Field Automatic" entries with hash/size suffixes → all map to "hamilton-khaki-field-automatic". "Datejust 41" and "Oyster Perpetual Datejust 41" → "rolex-datejust-41" (Datejust 41 is the model name; "Oyster Perpetual" is the collection, not part of the model name).
5. Wrong watchIds: if watch_id bears no relation to the brand/model (e.g. "part-of-my-collection" for a Breitling), generate the correct slug from brand+model.
6. Special characters in brand/model: remove diacritics from slugs but keep them in the display names (canonical_brand, canonical_model).
7. Beacroft vs Beaucroft: pick one consistent spelling — use "Beucroft" only if that is the brand's actual name; otherwise use the most common spelling. Check if this is a real brand.
8. Lorca "Model No.1 GMT" vs "No. 1 GMT": pick the official model name.
9. "Nomos" vs "Nomos Glashütte": use the brand's official short name for watch_id slugs (nomos), but correct the brand display name to "Nomos Glashütte" if that is official. These are the SAME brand.
10. Seiko "Alpinist" vs "Prospex Alpinist": these ARE different — "Alpinist" alone typically refers to the Prospex Alpinist line. Decide if they should be merged.

Return ONLY a JSON array with one object per input entry (same length, same order):
[
  {
    "index": 0,
    "canonical_brand": "...",
    "canonical_model": "...",
    "canonical_watch_id": "..."
  },
  ...
]

No markdown, no explanation, JSON only.

Input:
${JSON.stringify(inputList, null, 2)}`

console.log('Sending to Gemini for canonicalization…')
const result = await model.generateContent(prompt)
const text = result.response.text()

const jsonMatch = text.match(/\[[\s\S]*\]/)
if (!jsonMatch) {
  console.error('Could not extract JSON from Gemini response:')
  console.error(text)
  process.exit(1)
}

let canonical
try {
  canonical = JSON.parse(jsonMatch[0])
} catch (e) {
  console.error('Failed to parse Gemini JSON:', e.message)
  console.error(text)
  process.exit(1)
}

if (canonical.length !== rows.length) {
  console.error(`Mismatch: sent ${rows.length} entries, got ${canonical.length} back`)
  process.exit(1)
}

// ── Step 3: build change set ──────────────────────────────────────────────────

const changes = []

for (let i = 0; i < rows.length; i++) {
  const orig = rows[i]
  const norm = canonical[i]

  const brandChanged = orig.brand_name !== norm.canonical_brand
  const modelChanged = orig.model_name !== norm.canonical_model
  const watchIdChanged = orig.watch_id !== norm.canonical_watch_id

  if (brandChanged || modelChanged || watchIdChanged) {
    changes.push({
      orig_watch_id: orig.watch_id,
      orig_brand: orig.brand_name,
      orig_model: orig.model_name,
      photo_count: Number(orig.photo_count),
      new_watch_id: norm.canonical_watch_id,
      new_brand: norm.canonical_brand,
      new_model: norm.canonical_model,
      brand_changed: brandChanged,
      model_changed: modelChanged,
      watch_id_changed: watchIdChanged,
    })
  }
}

// ── Step 4: preview ───────────────────────────────────────────────────────────

if (changes.length === 0) {
  console.log('No changes needed — data is already clean.')
  process.exit(0)
}

console.log(`\n${'─'.repeat(80)}`)
console.log(`PROPOSED CHANGES (${changes.length} entries, ${changes.reduce((s, c) => s + c.photo_count, 0)} photos affected)`)
console.log('─'.repeat(80))

// Group by new_watch_id to surface merges clearly
const mergeGroups = new Map()
for (const c of changes) {
  if (!mergeGroups.has(c.new_watch_id)) mergeGroups.set(c.new_watch_id, [])
  mergeGroups.get(c.new_watch_id).push(c)
}

for (const [newId, group] of mergeGroups) {
  if (group.length > 1) {
    // Multiple old IDs → one new ID = a merge
    console.log(`\n[MERGE → ${newId}]`)
    for (const c of group) {
      console.log(`  ${c.orig_watch_id} (${c.photo_count} photos)  "${c.orig_brand} ${c.orig_model}"`)
    }
    const rep = group[0]
    console.log(`  → brand: "${rep.new_brand}"  model: "${rep.new_model}"`)
  } else {
    const c = group[0]
    const parts = []
    if (c.brand_changed) parts.push(`brand: "${c.orig_brand}" → "${c.new_brand}"`)
    if (c.model_changed) parts.push(`model: "${c.orig_model}" → "${c.new_model}"`)
    if (c.watch_id_changed) parts.push(`watch_id: "${c.orig_watch_id}" → "${c.new_watch_id}"`)
    console.log(`\n[${c.photo_count} photo${c.photo_count !== 1 ? 's' : ''}] ${parts.join(' | ')}`)
  }
}

console.log(`\n${'─'.repeat(80)}\n`)

if (DRY_RUN) {
  console.log('--dry-run: no changes written.')
  process.exit(0)
}

// ── Step 5: confirm and apply ─────────────────────────────────────────────────

const answer = await confirm('Apply all changes? (yes/no): ')
if (answer !== 'yes') {
  console.log('Aborted.')
  process.exit(0)
}

console.log('\nApplying changes…')
let updated = 0
let errors = 0

for (const c of changes) {
  try {
    await sql`
      UPDATE photos
      SET
        watch_id   = ${c.new_watch_id},
        brand_name = ${c.new_brand},
        model_name = ${c.new_model}
      WHERE
        watch_id   = ${c.orig_watch_id}
        AND brand_name = ${c.orig_brand}
        AND model_name = ${c.orig_model}
    `
    updated++
    process.stdout.write('.')
  } catch (e) {
    errors++
    console.error(`\nFailed to update ${c.orig_watch_id}: ${e.message}`)
  }
}

console.log(`\n\nDone. ${updated} batches updated, ${errors} errors.`)
console.log('Note: photo slugs are unchanged — existing /photo/[slug] URLs still work.')
