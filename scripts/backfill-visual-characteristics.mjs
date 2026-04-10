/**
 * Backfill script: Use Gemini to extract visual characteristics for all
 * approved photos that don't have them yet.
 *
 * Extracts: dialColor, bezelColor, caseMaterial, strapType, watchStyle
 *
 * Usage:
 *   DATABASE_URL="..." GEMINI_API_KEY="..." \
 *   node scripts/backfill-visual-characteristics.mjs [--dry-run]
 */

import { neon } from '@neondatabase/serverless'
import { GoogleGenerativeAI } from '@google/generative-ai'

const DRY_RUN = process.argv.includes('--dry-run')
const DELAY_MS = 1500 // 1.5s between requests to avoid rate limits

for (const k of ['DATABASE_URL', 'GEMINI_API_KEY']) {
  if (!process.env[k]) { console.error(`Missing: ${k}`); process.exit(1) }
}

const sql = neon(process.env.DATABASE_URL)
const client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
const model = client.getGenerativeModel({ model: 'gemini-2.5-flash' })

const PROMPT = `You are an expert watch analyst. Look at this wrist photo and identify ONLY the visual characteristics listed below. Return JSON ONLY, no markdown.

{
  "dialColor": "dominant dial color (e.g. black, white, blue, green, silver, gray, champagne, mother-of-pearl, skeleton)",
  "bezelColor": "bezel color or insert type (e.g. black, blue, blue-red, black-green, silver, none, ceramic black)",
  "caseMaterial": "case material (e.g. stainless steel, titanium, gold, rose gold, ceramic, plastic, carbon)",
  "strapType": "strap or bracelet type (e.g. steel bracelet, leather, rubber, NATO, mesh, canvas, integrated rubber)",
  "watchStyle": "primary category (e.g. diver, dress, field, pilot, chronograph, GMT, casual, digital, racing, tool)"
}

Rules:
1. Use lowercase values.
2. Return null for any field you genuinely cannot determine.
3. For multi-color bezels use hyphenated form: "blue-red", "black-green".
4. JSON only — no explanation, no markdown.`

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function main() {
  console.log(`\n=== Backfill Visual Characteristics ${DRY_RUN ? '(DRY RUN)' : ''} ===\n`)

  const rows = await sql`
    SELECT id, url, brand_name, model_name
    FROM photos
    WHERE status = 'approved' AND dial_color IS NULL
    ORDER BY created_at DESC
  `
  console.log(`Found ${rows.length} photos to process\n`)

  let success = 0
  let failed = 0

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    const label = `[${i + 1}/${rows.length}] ${row.id.slice(0, 8)} ${row.brand_name || '?'} ${row.model_name || '?'}`

    try {
      // Fetch the image
      const res = await fetch(row.url)
      if (!res.ok) throw new Error(`fetch ${res.status}`)
      const buf = Buffer.from(await res.arrayBuffer())
      const base64 = buf.toString('base64')
      const mimeType = 'image/webp'

      if (DRY_RUN) {
        console.log(`  [DRY] ${label} — would send ${buf.length} bytes to Gemini`)
        success++
        await sleep(100) // minimal delay in dry run
        continue
      }

      // Call Gemini
      const result = await model.generateContent([
        { inlineData: { mimeType, data: base64 } },
        { text: PROMPT },
      ])
      const text = result.response.text()
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) throw new Error('No JSON in response')

      const data = JSON.parse(jsonMatch[0])

      // Update DB
      await sql`
        UPDATE photos SET
          dial_color = ${data.dialColor || null},
          bezel_color = ${data.bezelColor || null},
          case_material = ${data.caseMaterial || null},
          strap_type = ${data.strapType || null},
          watch_style = ${data.watchStyle || null}
        WHERE id = ${row.id}
      `

      console.log(`  [OK] ${label} → dial=${data.dialColor} bezel=${data.bezelColor} material=${data.caseMaterial} strap=${data.strapType} style=${data.watchStyle}`)
      success++
    } catch (err) {
      console.log(`  [ERR] ${label} — ${err.message}`)
      failed++
    }

    // Rate limit
    if (i < rows.length - 1) await sleep(DELAY_MS)
  }

  console.log(`\n=== Summary ===`)
  console.log(`Succeeded: ${success}`)
  console.log(`Failed: ${failed}`)
  console.log(`${DRY_RUN ? '(Dry run — no changes)' : 'Done.'}\n`)
}

main().catch((err) => {
  console.error('Fatal:', err)
  process.exit(1)
})
