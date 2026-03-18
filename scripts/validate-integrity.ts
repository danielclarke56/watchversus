/**
 * Content Integrity Validator
 * Validates all cross-references in the WatchVsWatch codebase.
 * Run: npm run validate
 * Exits with code 1 if any violations found, 0 if clean.
 */

import * as fs from 'fs'
import * as path from 'path'

const ROOT = path.resolve(__dirname, '..')
let errors: string[] = []

// ── Load data ──────────────────────────────────────────────────────

// watches.json — canonical watch slugs
const watchesPath = path.join(ROOT, 'data', 'watches.json')
const watches: { slug: string }[] = JSON.parse(fs.readFileSync(watchesPath, 'utf-8'))
const watchSlugs = new Set(watches.map(w => w.slug))

// guideData.ts — parse guides via dynamic import workaround
// We'll use a regex approach to extract slugs since we can't easily import TS with path aliases
const guideDataPath = path.join(ROOT, 'lib', 'guideData.ts')
const guideDataSource = fs.readFileSync(guideDataPath, 'utf-8')

// comparisons.ts
const comparisonsPath = path.join(ROOT, 'data', 'comparisons.ts')
const comparisonsSource = fs.readFileSync(comparisonsPath, 'utf-8')

// watches.ts (popularComparisons)
const watchesTsPath = path.join(ROOT, 'lib', 'watches.ts')
const watchesTsSource = fs.readFileSync(watchesTsPath, 'utf-8')

// ── Helper: extract all comparison slug pairs from popularComparisons ──

function extractPopularComparisons(source: string): { slug1: string; slug2: string }[] {
  const pairs: { slug1: string; slug2: string }[] = []
  const re = /{\s*slug1:\s*['"]([^'"]+)['"]\s*,\s*slug2:\s*['"]([^'"]+)['"]\s*}/g
  let m: RegExpExecArray | null
  while ((m = re.exec(source)) !== null) {
    pairs.push({ slug1: m[1], slug2: m[2] })
  }
  return pairs
}

// ── Helper: extract guide slugs from guideData ──

function extractGuideSlugs(source: string): string[] {
  const slugs: string[] = []
  // Match slug: "some-slug" at the guide level (indented 4 spaces typically)
  const re = /^\s{4}slug:\s*["']([^"']+)["']/gm
  let m: RegExpExecArray | null
  while ((m = re.exec(source)) !== null) {
    slugs.push(m[1])
  }
  return slugs
}

// ── Helper: extract recommendation watch slugs from guideData ──

function extractRecommendationSlugs(source: string): { guideName: string; watchSlug: string }[] {
  const results: { guideName: string; watchSlug: string }[] = []
  
  // Find all guide blocks: look for slug: "guide-slug" followed by recommendations
  const guideRegex = /slug:\s*["']([^"']+)["'][\s\S]*?recommendations:\s*\[([\s\S]*?)\]\s*,\s*\n\s*buyingGuide/g
  let guideMatch: RegExpExecArray | null
  
  while ((guideMatch = guideRegex.exec(source)) !== null) {
    const guideSlug = guideMatch[1]
    const recsBlock = guideMatch[2]
    
    // Extract watch slugs from recommendations block
    const slugRe = /slug:\s*["']([^"']+)["']/g
    let slugMatch: RegExpExecArray | null
    while ((slugMatch = slugRe.exec(recsBlock)) !== null) {
      results.push({ guideName: guideSlug, watchSlug: slugMatch[1] })
    }
  }
  
  return results
}

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

// ── Build comparison lookup from popularComparisons ──

function makeComparisonSlug(slug1: string, slug2: string): string {
  // Comparisons are slug1-vs-slug2 (order matters based on the pair)
  return `${slug1}-vs-${slug2}`
}

// ══════════════════════════════════════════════════════════════════════
// CHECK 1: Guides index completeness
// Every guide slug in guideData.ts should be a valid slug
// (Since guides are auto-derived from the array, this checks for empty/invalid slugs)
// ══════════════════════════════════════════════════════════════════════

console.log('\n🔍 Check 1: Guides index completeness')
const guideSlugs = extractGuideSlugs(guideDataSource)

if (guideSlugs.length === 0) {
  errors.push('❌ BROKEN: No guide slugs found in lib/guideData.ts — parsing may be broken')
} else {
  console.log(`   Found ${guideSlugs.length} guide(s)`)
  const slugPattern = /^[a-z0-9-]+$/
  for (const slug of guideSlugs) {
    if (!slugPattern.test(slug)) {
      errors.push(`❌ BROKEN: guide slug '${slug}' contains invalid characters`)
    }
    if (slug.length === 0) {
      errors.push(`❌ BROKEN: empty guide slug found in guideData.ts`)
    }
  }
  // Check for duplicates
  const seen = new Set<string>()
  for (const slug of guideSlugs) {
    if (seen.has(slug)) {
      errors.push(`❌ BROKEN: duplicate guide slug '${slug}' in guideData.ts`)
    }
    seen.add(slug)
  }
  if (errors.length === 0) {
    console.log('   ✅ All guide slugs are valid and unique')
  }
}

// ══════════════════════════════════════════════════════════════════════
// CHECK 2: Watch slug references in comparisons
// Every watchA/watchB (slug1/slug2) in popularComparisons must exist in watches.json
// ══════════════════════════════════════════════════════════════════════

console.log('\n🔍 Check 2: Watch slug references in comparisons')
const popComparisons = extractPopularComparisons(watchesTsSource)
const check2ErrorsBefore = errors.length

if (popComparisons.length === 0) {
  errors.push('❌ BROKEN: No popularComparisons found in lib/watches.ts — parsing may be broken')
} else {
  console.log(`   Found ${popComparisons.length} comparison pair(s)`)
  for (const pair of popComparisons) {
    if (!watchSlugs.has(pair.slug1)) {
      errors.push(`❌ BROKEN: comparison '${pair.slug1}-vs-${pair.slug2}' references unknown watch slug '${pair.slug1}'`)
    }
    if (!watchSlugs.has(pair.slug2)) {
      errors.push(`❌ BROKEN: comparison '${pair.slug1}-vs-${pair.slug2}' references unknown watch slug '${pair.slug2}'`)
    }
  }
  if (errors.length === check2ErrorsBefore) {
    console.log('   ✅ All comparison watch slugs exist in watches.json')
  }
}

// ══════════════════════════════════════════════════════════════════════
// CHECK 3: Watch slug references in guides
// Every watch slug in guide recommendations must exist in watches.json
// ══════════════════════════════════════════════════════════════════════

console.log('\n🔍 Check 3: Watch slug references in guides')
const recSlugs = extractRecommendationSlugs(guideDataSource)
const check3ErrorsBefore = errors.length

if (recSlugs.length === 0) {
  errors.push('❌ BROKEN: No recommendation slugs found in lib/guideData.ts — parsing may be broken')
} else {
  console.log(`   Found ${recSlugs.length} recommendation(s) across guides`)
  for (const rec of recSlugs) {
    if (!watchSlugs.has(rec.watchSlug)) {
      errors.push(`❌ BROKEN: guide '${rec.guideName}' recommends unknown watch slug '${rec.watchSlug}'`)
    }
  }
  if (errors.length === check3ErrorsBefore) {
    console.log('   ✅ All guide recommendation watch slugs exist in watches.json')
  }
}

// ══════════════════════════════════════════════════════════════════════
// CHECK 4: PopularComparisons integrity
// Every comparison slug in comparisonMetaDescriptions must correspond to
// a popularComparisons entry (or vice versa check)
// ══════════════════════════════════════════════════════════════════════

console.log('\n🔍 Check 4: PopularComparisons integrity')
const check4ErrorsBefore = errors.length

// Build set of valid comparison slugs from popularComparisons
const validComparisonSlugs = new Set<string>()
for (const pair of popComparisons) {
  validComparisonSlugs.add(makeComparisonSlug(pair.slug1, pair.slug2))
}

// Check comparisonMetaDescriptions keys reference valid comparisons
const metaKeys = extractComparisonKeys(comparisonsSource)
console.log(`   Found ${metaKeys.length} comparison meta description(s)`)
console.log(`   Found ${validComparisonSlugs.size} popularComparison pair(s)`)

for (const key of metaKeys) {
  if (!validComparisonSlugs.has(key)) {
    errors.push(`❌ BROKEN: comparisonMetaDescriptions has key '${key}' with no matching popularComparisons entry`)
  }
}

// Info only: how many comparisons lack meta descriptions (not an error)
const missingMeta = Array.from(validComparisonSlugs).filter(s => !metaKeys.includes(s))
if (missingMeta.length > 0) {
  console.log(`   ℹ️  ${missingMeta.length} comparison(s) have no custom meta description (not an error)`)
}

if (errors.length === check4ErrorsBefore) {
  console.log('   ✅ All meta description keys reference valid comparisons')
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
