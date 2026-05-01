/**
 * Buying guide content agent — powered by Gemini with Google Search grounding.
 *
 * Researches and writes a verified buying guide for a given price tier,
 * then updates lib/priceData.ts with the result.
 *
 * Usage:
 *   GEMINI_API_KEY="..." node scripts/generate-guide.mjs under-500
 *
 * Supported slugs:
 *   under-500 | 500-to-1000 | 1000-to-5000 | 5000-to-15000 | 15000-to-50000 | over-50000
 */

import { GoogleGenerativeAI } from '@google/generative-ai'
import { readFileSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

// --- Config -----------------------------------------------------------

const TIER_CONFIG = {
  'under-500': {
    slug: 'under-500',
    name: 'Best Watches Under $500',
    shortLabel: 'Under $500',
    dbValue: 'Under $500',
  },
  '500-to-1000': {
    slug: '500-to-1000',
    name: 'Best Watches $500–$1,000',
    shortLabel: '$500–$1,000',
    dbValue: '$500 – $1,000',
  },
  '1000-to-5000': {
    slug: '1000-to-5000',
    name: 'Best Watches $1,000–$5,000',
    shortLabel: '$1,000–$5,000',
    dbValue: '$1,000 – $5,000',
  },
  '5000-to-15000': {
    slug: '5000-to-15000',
    name: 'Best Watches $5,000–$15,000',
    shortLabel: '$5,000–$15,000',
    dbValue: '$5,000 – $15,000',
  },
  '15000-to-50000': {
    slug: '15000-to-50000',
    name: 'Best Watches $15,000–$50,000',
    shortLabel: '$15,000–$50,000',
    dbValue: '$15,000 – $50,000',
  },
  'over-50000': {
    slug: 'over-50000',
    name: 'Best Watches Over $50,000',
    shortLabel: 'Over $50,000',
    dbValue: '$50,000+',
  },
}

// --- Validation -------------------------------------------------------

if (!process.env.GEMINI_API_KEY) {
  console.error('❌  Missing GEMINI_API_KEY')
  process.exit(1)
}

const slug = process.argv[2]
if (!slug || !TIER_CONFIG[slug]) {
  console.error(`❌  Invalid slug. Supported: ${Object.keys(TIER_CONFIG).join(' | ')}`)
  process.exit(1)
}

const tier = TIER_CONFIG[slug]
console.log(`\n🔍  Generating guide: ${tier.name}`)
console.log('    Phase 1: Research (Google Search grounding enabled)')

// --- Phase 1: Research ------------------------------------------------

const instructions = readFileSync(join(__dirname, 'guide-instructions.md'), 'utf-8')
const client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

const researchModel = client.getGenerativeModel({
  model: 'gemini-2.5-flash',
  tools: [{ googleSearch: {} }],
})

const researchPrompt = `${instructions}

---

## Your task

Research and write a buying guide for: **${tier.name}**

Price range: ${tier.shortLabel}
dbValue (use exactly): "${tier.dbValue}"
slug (use exactly): "${tier.slug}"
name (use exactly): "${tier.name}"
shortLabel (use exactly): "${tier.shortLabel}"

Before writing anything:
1. Search for the top recommended watches in this price range from trusted watch publications (Hodinkee, Worn & Wound, WatchTime)
2. For each candidate model, search the brand's official website to verify current retail price and specs
3. Exclude any model whose verified price falls outside the ${tier.shortLabel} range
4. Only include models you have verified from a trusted source

Return ONLY the raw JSON object. No markdown, no code fences, no explanation.`

let researchText
try {
  const result = await researchModel.generateContent(researchPrompt)
  researchText = result.response.text()
} catch (err) {
  console.error('❌  Gemini research phase failed:', err.message)
  process.exit(1)
}

// --- Phase 2: Validate output shape -----------------------------------

console.log('    Phase 2: Validating output structure')

const jsonMatch = researchText.match(/\{[\s\S]*\}/)
if (!jsonMatch) {
  console.error('❌  Could not extract JSON from Gemini response.')
  console.error('    Raw response:\n', researchText.slice(0, 500))
  process.exit(1)
}

let parsed
try {
  parsed = JSON.parse(jsonMatch[0])
} catch (err) {
  console.error('❌  JSON parse failed:', err.message)
  console.error('    Raw JSON:\n', jsonMatch[0].slice(0, 500))
  process.exit(1)
}

// Required fields check
const required = ['slug', 'name', 'shortLabel', 'dbValue', 'lastUpdated', 'intro', 'heroFact', 'overview', 'notableModels', 'faq', 'internalLinks']
const missing = required.filter((k) => !(k in parsed))
if (missing.length > 0) {
  console.error('❌  Missing required fields:', missing.join(', '))
  process.exit(1)
}

if (!Array.isArray(parsed.notableModels) || parsed.notableModels.length < 3) {
  console.error('❌  notableModels must be an array with at least 3 entries')
  process.exit(1)
}

if (!Array.isArray(parsed.faq) || parsed.faq.length < 4) {
  console.error('❌  faq must be an array with at least 4 entries')
  process.exit(1)
}

// Force slug/name/shortLabel/dbValue to match config — never trust AI for these
parsed.slug = tier.slug
parsed.name = tier.name
parsed.shortLabel = tier.shortLabel
parsed.dbValue = tier.dbValue

console.log(`    ✓ Structure valid`)
console.log(`    ✓ ${parsed.notableModels.length} notable models`)
console.log(`    ✓ ${parsed.faq.length} FAQ entries`)

// --- Phase 3: Validate phase (self-check) -----------------------------

console.log('    Phase 3: Fact-checking output against research')

const validateModel = client.getGenerativeModel({
  model: 'gemini-2.5-flash',
  tools: [{ googleSearch: {} }],
})

const validatePrompt = `You are a fact-checker for a watch buying guide. Price range for this guide: ${tier.shortLabel}.

For each model below, search for its current retail price on the brand's official website and at least one major authorised retailer (Amazon, Jomashop, WatchBox, etc.).

Rules:
- A price is "matching" if the verified retail price is within 20% of the stated price OR if the stated price falls within the range found across retailers
- A price is "failing" only if the verified price is clearly outside the guide's price range (${tier.shortLabel}) — i.e. the model genuinely does not belong in this guide
- Minor spec wording differences (e.g. "Hardlex" vs "Flat Hardlex") are NOT issues — only flag outright contradictions
- Set passed: true if all models are genuinely available within the ${tier.shortLabel} price range, even if individual price fields have minor discrepancies

Guide content to check:
${JSON.stringify(parsed.notableModels, null, 2)}

Return a JSON object:
{
  "passed": boolean,
  "issues": [
    { "model": string, "field": string, "issue": string }
  ]
}

Only include in issues[] models that are genuinely outside the ${tier.shortLabel} price range and should be excluded.
No markdown, raw JSON only.`

let validationResult
try {
  const result = await validateModel.generateContent(validatePrompt)
  const valText = result.response.text()
  const valMatch = valText.match(/\{[\s\S]*\}/)
  if (valMatch) {
    validationResult = JSON.parse(valMatch[0])
  }
} catch (err) {
  console.warn('⚠️   Validation phase failed (non-fatal):', err.message)
}

if (validationResult) {
  if (validationResult.issues && validationResult.issues.length > 0) {
    console.log(`\n⚠️   Validation found ${validationResult.issues.length} issue(s):`)
    for (const issue of validationResult.issues) {
      console.log(`    • ${issue.model} — ${issue.field}: ${issue.issue}`)
    }
    if (!validationResult.passed) {
      console.error('\n❌  Validation failed. Guide not written. Fix the issues above and re-run.')
      process.exit(1)
    }
    console.log('    (Issues found but validator marked as passed — review before committing)')
  } else {
    console.log('    ✓ Validation passed — no issues found')
  }
}

// --- Phase 4: Write to priceData.ts -----------------------------------

console.log('\n    Phase 4: Writing to lib/priceData.ts')

const priceDataPath = join(ROOT, 'lib', 'priceData.ts')
const existing = readFileSync(priceDataPath, 'utf-8')

// Safe serialiser — uses JSON.stringify for all string values to avoid
// escaping issues with apostrophes, backslashes, and other special chars.
// Overview uses a template literal for readability.
function serialiseEntry(obj) {
  const lines = ['  {']

  for (const [key, val] of Object.entries(obj)) {
    if (key === 'overview' && typeof val === 'string') {
      // Backtick template literal — escape only backticks and ${
      const escaped = val
        .replace(/\\/g, '\\\\')
        .replace(/`/g, '\\`')
        .replace(/\$\{/g, '\\${')
      lines.push(`    ${key}: \`${escaped}\`,`)
    } else if (typeof val === 'string') {
      lines.push(`    ${key}: ${JSON.stringify(val)},`)
    } else if (Array.isArray(val)) {
      lines.push(`    ${key}: [`)
      for (const item of val) {
        if (typeof item === 'object' && item !== null) {
          lines.push('      {')
          for (const [k, v] of Object.entries(item)) {
            lines.push(`        ${k}: ${JSON.stringify(v)},`)
          }
          lines.push('      },')
        } else {
          lines.push(`      ${JSON.stringify(item)},`)
        }
      }
      lines.push('    ],')
    } else {
      lines.push(`    ${key}: ${JSON.stringify(val)},`)
    }
  }

  lines.push('  }')
  return lines.join('\n')
}

const newEntry = serialiseEntry(parsed)

// Read the existing file and find the prices array boundaries
// Strategy: find the export const prices array and rebuild it cleanly
const pricesArrayMatch = existing.match(/export const prices: PriceData\[\] = \[([\s\S]*)\]/)
if (!pricesArrayMatch) {
  console.error('❌  Could not locate prices array in priceData.ts')
  process.exit(1)
}

// Parse existing entries by slug — keep all entries except the one we're replacing
// We do this by splitting on the interface/function declarations boundary
const interfacesAndFunctions = existing.match(/^([\s\S]*?export const prices)/m)
const afterArray = existing.match(/\]\s*\nexport function/m)

if (!interfacesAndFunctions || !afterArray) {
  console.error('❌  Could not parse priceData.ts structure')
  process.exit(1)
}

const headerPart = existing.slice(0, existing.indexOf('export const prices'))
const footerPart = existing.slice(existing.lastIndexOf('\nexport function'))

// Check if slug already exists — if so, we need to reconstruct without it
// Simplest safe approach: reconstruct the entire prices array
// Extract all existing entries as raw text blocks, filter out current slug, add new one

// Find all top-level entries in the array (each starts with "  {" and ends with "  }")
const arrayContent = pricesArrayMatch[1]
const entryBlocks = []
let depth = 0
let start = -1

for (let i = 0; i < arrayContent.length; i++) {
  const ch = arrayContent[i]
  if (ch === '{') {
    if (depth === 0) start = i
    depth++
  } else if (ch === '}') {
    depth--
    if (depth === 0 && start !== -1) {
      entryBlocks.push(arrayContent.slice(start, i + 1).trim())
      start = -1
    }
  }
}

// Filter out the entry for the current slug
const filtered = entryBlocks.filter((block) => !block.includes(`"slug": "${tier.slug}"`) && !block.includes(`slug: '${tier.slug}'`) && !block.includes(`slug: "${tier.slug}"`))

// Build the new file
const allEntries = [...filtered.map(b => `  ${b}`), newEntry]
const newFile = headerPart +
  'export const prices: PriceData[] = [\n' +
  allEntries.join(',\n') + ',\n' +
  ']' +
  footerPart

writeFileSync(priceDataPath, newFile, 'utf-8')
console.log(`    ✓ Written entry for '${tier.slug}' (${filtered.length} existing entries preserved)`)

console.log(`\n✅  Done — ${tier.name} guide written to lib/priceData.ts`)
console.log('    Run: npx tsc --noEmit   to verify types')
console.log('    Then review, commit, and push.\n')
