/**
 * Content Integrity Validator
 * Validates all cross-references in the Watchems codebase.
 * Run: npm run validate
 * Exits with code 1 if any violations found, 0 if clean.
 */

import * as fs from 'fs'
import * as path from 'path'

const ROOT = path.resolve(__dirname, '..')
const errors: string[] = []

// ── Load data ──────────────────────────────────────────────────────

// watches.json — canonical watch slugs
const watchesPath = path.join(ROOT, 'data', 'watches.json')
const watches: { slug: string }[] = JSON.parse(fs.readFileSync(watchesPath, 'utf-8'))
const watchSlugs = new Set(watches.map(w => w.slug))

// comparison-tiers.json — single source of truth for comparisons
const tiersPath = path.join(ROOT, 'data', 'comparison-tiers.json')
const tiersData: { comparisons: { slug1: string; slug2: string; tier: number; priority: number; tags: string[]; reason: string }[] } = JSON.parse(fs.readFileSync(tiersPath, 'utf-8'))

// comparison-overrides.json — promoted pairs with SEO overrides
const overridesPath = path.join(ROOT, 'data', 'comparison-overrides.json')
const overrides: { slug: string; promoted: boolean }[] = JSON.parse(fs.readFileSync(overridesPath, 'utf-8'))

// comparisons.ts
const comparisonsPath = path.join(ROOT, 'data', 'comparisons.ts')
const comparisonsSource = fs.readFileSync(comparisonsPath, 'utf-8')

// ── Helper: extract comparison meta description keys ──

function extractComparisonKeys(source: string): string[] {
  const keys: string[] = []
  const re = /['"]([a-z0-9-]+-vs-[a-z0-9-]+)['"]\s*:/g
  let m: RegExpExecArray | null
  while ((m = re.exec(source)) !== null) {
    keys.push(m[1])
  }
  return keys
}

// ══════════════════════════════════════════════════════════════════════
// CHECK 1: Watch slug references in comparison-tiers.json
// ══════════════════════════════════════════════════════════════════════

console.log('\n🔍 Check 1: Watch slug references in comparison-tiers.json')
const check1ErrorsBefore = errors.length

if (tiersData.comparisons.length === 0) {
  errors.push('❌ BROKEN: No comparisons found in data/comparison-tiers.json')
} else {
  console.log(`   Found ${tiersData.comparisons.length} comparison pair(s)`)
  for (const pair of tiersData.comparisons) {
    if (!watchSlugs.has(pair.slug1)) {
      errors.push(`❌ BROKEN: comparison '${pair.slug1}-vs-${pair.slug2}' references unknown watch slug '${pair.slug1}'`)
    }
    if (!watchSlugs.has(pair.slug2)) {
      errors.push(`❌ BROKEN: comparison '${pair.slug1}-vs-${pair.slug2}' references unknown watch slug '${pair.slug2}'`)
    }
  }
  if (errors.length === check1ErrorsBefore) {
    console.log('   ✅ All comparison watch slugs exist in watches.json')
  }
}

// ══════════════════════════════════════════════════════════════════════
// CHECK 2: Comparison-tiers integrity
// - No duplicate pairs (A-vs-B and B-vs-A)
// - Valid tier values (1, 2, or 3)
// - Priority within expected range
// - All Tier 1 promoted pairs have overrides
// ══════════════════════════════════════════════════════════════════════

console.log('\n🔍 Check 2: Comparison-tiers integrity')
const check2ErrorsBefore = errors.length

// Check for duplicates (both same-order and reversed)
const seenPairs = new Set<string>()
for (const pair of tiersData.comparisons) {
  const canonical = pair.slug1 < pair.slug2
    ? `${pair.slug1}|${pair.slug2}`
    : `${pair.slug2}|${pair.slug1}`
  if (seenPairs.has(canonical)) {
    errors.push(`❌ BROKEN: duplicate comparison pair '${pair.slug1}-vs-${pair.slug2}' in comparison-tiers.json`)
  }
  seenPairs.add(canonical)
}

// Check valid tiers and priorities
for (const pair of tiersData.comparisons) {
  if (![1, 2, 3].includes(pair.tier)) {
    errors.push(`❌ BROKEN: comparison '${pair.slug1}-vs-${pair.slug2}' has invalid tier ${pair.tier}`)
  }
  if (pair.priority < 0 || pair.priority > 100) {
    errors.push(`❌ BROKEN: comparison '${pair.slug1}-vs-${pair.slug2}' has priority ${pair.priority} outside range 0-100`)
  }
}

// Check that promoted overrides have matching tier entries
const tierSlugs = new Set(tiersData.comparisons.map(c => `${c.slug1}-vs-${c.slug2}`))
const promotedOverrides = overrides.filter(o => o.promoted)
for (const o of promotedOverrides) {
  if (!tierSlugs.has(o.slug)) {
    // Also check reversed order
    const parts = o.slug.split('-vs-')
    const reversed = parts.length === 2 ? `${parts[1]}-vs-${parts[0]}` : ''
    if (!tierSlugs.has(reversed)) {
      errors.push(`❌ BROKEN: promoted override '${o.slug}' has no matching entry in comparison-tiers.json`)
    }
  }
}

// Tier distribution info
const tierCounts = { 1: 0, 2: 0, 3: 0 }
for (const pair of tiersData.comparisons) {
  if (pair.tier in tierCounts) tierCounts[pair.tier as 1 | 2 | 3]++
}
console.log(`   Tier distribution: T1=${tierCounts[1]}, T2=${tierCounts[2]}, T3=${tierCounts[3]} (total: ${tiersData.comparisons.length})`)

// Check meta descriptions reference valid comparisons
const metaKeys = extractComparisonKeys(comparisonsSource)
console.log(`   Found ${metaKeys.length} comparison meta description(s) in comparisons.ts`)

for (const key of metaKeys) {
  if (!tierSlugs.has(key)) {
    const parts = key.split('-vs-')
    const reversed = parts.length === 2 ? `${parts[1]}-vs-${parts[0]}` : ''
    if (!tierSlugs.has(reversed)) {
      errors.push(`❌ BROKEN: comparisonMetaDescriptions has key '${key}' with no matching comparison-tiers.json entry`)
    }
  }
}

if (errors.length === check2ErrorsBefore) {
  console.log('   ✅ All comparison-tiers integrity checks passed')
}

// ══════════════════════════════════════════════════════════════════════
// RESULTS
// ══════════════════════════════════════════════════════════════════════

console.log('\n' + '═'.repeat(60))
if (errors.length > 0) {
  console.log(`\n❌ VALIDATION FAILED — ${errors.length} violation(s) found:\n`)
  for (const err of errors) {
    console.log(`  ${err}`)
  }
  console.log('')
  process.exit(1)
} else {
  console.log('\n✅ ALL CHECKS PASSED — content integrity verified\n')
  process.exit(0)
}
