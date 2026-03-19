/**
 * Comparison Pair Generator
 *
 * Scores every possible watch pair and assigns tiers.
 * Migrates existing popularComparisons and discovers new high-value pairs.
 *
 * Usage:
 *   npx tsx scripts/generate-pairs.ts              # preview candidates
 *   npx tsx scripts/generate-pairs.ts --write       # write comparison-tiers.json
 *   npx tsx scripts/generate-pairs.ts --fill        # include all above-threshold new pairs
 *   npx tsx scripts/generate-pairs.ts --stats       # summary statistics only
 */

import * as fs from 'fs'
import * as path from 'path'

// ── Types ────────────────────────────────────────────────────────────

interface WatchRecord {
  slug: string
  brand: string
  name: string
  primary_category: string
  style: string[]
  movement_type: 'automatic' | 'manual' | 'quartz'
  case_diameter_mm: number
  price_new_usd: { min: number; max: number }
  alternatives: string[]
}

interface ComparisonTier {
  slug1: string
  slug2: string
  tier: 1 | 2 | 3
  priority: number
  tags: string[]
  reason: string
}

interface ComparisonOverride {
  slug: string
  meta_description: string
  hook_line: string
  promoted: boolean
}

// ── Config ───────────────────────────────────────────────────────────

const TOP_5_BRANDS = ['Rolex', 'Omega', 'Tudor', 'Seiko', 'TAG Heuer']
const TOP_10_BRANDS = [
  ...TOP_5_BRANDS,
  'Breitling',
  'Cartier',
  'IWC',
  'Grand Seiko',
  'Longines',
]

const TIER_THRESHOLDS = { tier1: 88, tier2: 65, tier3: 45 }
const TIER_MAX = { tier1: 50, tier2: 120, tier3: 100 } // target caps per tier

// ── Load data ────────────────────────────────────────────────────────

const ROOT = path.resolve(__dirname, '..')
const watches: WatchRecord[] = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'data', 'watches.json'), 'utf-8')
)
const overrides: ComparisonOverride[] = JSON.parse(
  fs.readFileSync(
    path.join(ROOT, 'data', 'comparison-overrides.json'),
    'utf-8'
  )
)

// Parse existing popularComparisons from watches.ts
const watchesTsSource = fs.readFileSync(
  path.join(ROOT, 'lib', 'watches.ts'),
  'utf-8'
)
function extractExistingPairs(): { slug1: string; slug2: string }[] {
  const pairs: { slug1: string; slug2: string }[] = []
  const re =
    /{\s*slug1:\s*['"]([^'"]+)['"]\s*,\s*slug2:\s*['"]([^'"]+)['"]\s*}/g
  let m: RegExpExecArray | null
  while ((m = re.exec(watchesTsSource)) !== null) {
    pairs.push({ slug1: m[1], slug2: m[2] })
  }
  return pairs
}

// ── Scoring ──────────────────────────────────────────────────────────

function avgPrice(w: WatchRecord): number {
  return (w.price_new_usd.min + w.price_new_usd.max) / 2
}

function priceRatio(a: WatchRecord, b: WatchRecord): number {
  const pa = avgPrice(a)
  const pb = avgPrice(b)
  if (pa === 0 || pb === 0) return Infinity
  return Math.max(pa, pb) / Math.min(pa, pb)
}

function styleOverlap(a: WatchRecord, b: WatchRecord): string[] {
  return a.style.filter((s) => b.style.includes(s))
}

function scorePair(a: WatchRecord, b: WatchRecord): { score: number; tags: string[]; reason: string } {
  let score = 0
  const tags: string[] = []
  const reasons: string[] = []

  // Brand popularity (both in top-5 = +30, top-10 = +20, one in top-10 = +10)
  const aTop5 = TOP_5_BRANDS.includes(a.brand)
  const bTop5 = TOP_5_BRANDS.includes(b.brand)
  const aTop10 = TOP_10_BRANDS.includes(a.brand)
  const bTop10 = TOP_10_BRANDS.includes(b.brand)

  if (aTop5 && bTop5) {
    score += 30
    reasons.push('Both top-5 brands')
  } else if (aTop10 && bTop10) {
    score += 20
    reasons.push('Both top-10 brands')
  } else if (aTop10 || bTop10) {
    score += 10
  }

  // Price proximity (within 50% = +20, within 2x = +10, within 3x = +5)
  const ratio = priceRatio(a, b)
  if (ratio <= 1.5) {
    score += 20
    tags.push('price-match')
    reasons.push('Similar price range')
  } else if (ratio <= 2) {
    score += 10
    tags.push('price-adjacent')
  } else if (ratio <= 3) {
    score += 5
  }

  // Category match (+15)
  if (a.primary_category === b.primary_category) {
    score += 15
    tags.push(a.primary_category)
    reasons.push(`Both ${a.primary_category} watches`)
  }

  // Style overlap (+10 per shared tag, max +20)
  const shared = styleOverlap(a, b)
  const styleBonus = Math.min(shared.length * 10, 20)
  score += styleBonus
  if (shared.length > 0) {
    tags.push(...shared.filter((s) => !tags.includes(s)))
  }

  // Alternatives cross-reference (+15 if mutual, +8 if one-way)
  const aMentionsB = a.alternatives.includes(b.slug)
  const bMentionsA = b.alternatives.includes(a.slug)
  if (aMentionsB && bMentionsA) {
    score += 15
    reasons.push('Mutual alternatives')
  } else if (aMentionsB || bMentionsA) {
    score += 8
    reasons.push('Listed as alternative')
  }

  // Cross-brand bonus (+5) — same brand gets 0
  if (a.brand !== b.brand) {
    score += 5
    tags.push('cross-brand')
  } else {
    tags.push('same-brand')
    reasons.push(`Same brand (${a.brand})`)
  }

  // Movement type contrast bonus (+5 if different)
  if (a.movement_type !== b.movement_type) {
    score += 5
    tags.push('movement-contrast')
  }

  // Size similarity bonus (+5 if within 3mm)
  if (Math.abs(a.case_diameter_mm - b.case_diameter_mm) <= 3) {
    score += 5
  }

  // Cross-tier pricing discovery bonus (+8 if price ratio > 3x, both interesting brands)
  if (ratio > 3 && (aTop10 || bTop10)) {
    score += 8
    tags.push('cross-tier')
    reasons.push('Cross-tier price comparison')
  }

  const reason = reasons.slice(0, 3).join('; ') || 'Algorithmically matched'

  return { score: Math.min(score, 100), tags, reason }
}

// ── Canonical pair key (always alphabetical to prevent A-vs-B / B-vs-A dupes) ──

function canonicalKey(s1: string, s2: string): string {
  return s1 < s2 ? `${s1}|${s2}` : `${s2}|${s1}`
}

// ── Main ─────────────────────────────────────────────────────────────

function main() {
  const args = process.argv.slice(2)
  const doWrite = args.includes('--write')
  const doFill = args.includes('--fill')
  const statsOnly = args.includes('--stats')

  const watchMap = new Map(watches.map((w) => [w.slug, w]))

  // 1. Score all possible pairs
  const allPairs: (ComparisonTier & { isExisting: boolean })[] = []
  const seenKeys = new Set<string>()

  // First, score existing pairs (preserve their slug order)
  const existing = extractExistingPairs()
  const promotedSlugs = new Set(
    overrides.filter((o) => o.promoted).map((o) => o.slug)
  )

  for (const { slug1, slug2 } of existing) {
    const key = canonicalKey(slug1, slug2)
    if (seenKeys.has(key)) continue
    seenKeys.add(key)

    const w1 = watchMap.get(slug1)
    const w2 = watchMap.get(slug2)
    if (!w1 || !w2) {
      console.warn(`⚠ Skipping ${slug1}-vs-${slug2}: watch not found`)
      continue
    }

    const { score, tags, reason } = scorePair(w1, w2)
    const compSlug = `${slug1}-vs-${slug2}`
    const isPromoted = promotedSlugs.has(compSlug)

    // Promoted pairs are always Tier 1; otherwise use score thresholds
    let tier: 1 | 2 | 3
    if (isPromoted || score >= TIER_THRESHOLDS.tier1) {
      tier = 1
    } else if (score >= TIER_THRESHOLDS.tier2) {
      tier = 2
    } else {
      tier = 3
    }

    // Boost score for promoted pairs if needed
    const finalScore = isPromoted ? Math.max(score, 70) : score

    allPairs.push({
      slug1,
      slug2,
      tier,
      priority: finalScore,
      tags,
      reason: isPromoted ? `Promoted: ${reason}` : reason,
      isExisting: true,
    })
  }

  // 2. Score all remaining possible pairs (new discoveries)
  const slugs = watches.map((w) => w.slug)
  let newCandidates = 0

  for (let i = 0; i < slugs.length; i++) {
    for (let j = i + 1; j < slugs.length; j++) {
      const s1 = slugs[i]
      const s2 = slugs[j]
      const key = canonicalKey(s1, s2)
      if (seenKeys.has(key)) continue
      seenKeys.add(key)

      const w1 = watchMap.get(s1)!
      const w2 = watchMap.get(s2)!
      const { score, tags, reason } = scorePair(w1, w2)

      if (score < TIER_THRESHOLDS.tier3) continue // Below minimum threshold

      let tier: 1 | 2 | 3
      if (score >= TIER_THRESHOLDS.tier1) {
        tier = 1
      } else if (score >= TIER_THRESHOLDS.tier2) {
        tier = 2
      } else {
        tier = 3
      }

      allPairs.push({
        slug1: s1,
        slug2: s2,
        tier,
        priority: score,
        tags,
        reason,
        isExisting: false,
      })
      newCandidates++
    }
  }

  // 3. Sort: existing first (by priority desc), then new (by priority desc)
  allPairs.sort((a, b) => {
    if (a.isExisting !== b.isExisting) return a.isExisting ? -1 : 1
    if (a.tier !== b.tier) return a.tier - b.tier
    return b.priority - a.priority
  })

  // 4. Stats
  const existingCount = allPairs.filter((p) => p.isExisting).length
  const newCount = allPairs.filter((p) => !p.isExisting).length
  const tier1 = allPairs.filter((p) => p.tier === 1)
  const tier2 = allPairs.filter((p) => p.tier === 2)
  const tier3 = allPairs.filter((p) => p.tier === 3)

  console.log('\n=== Comparison Pair Generator ===\n')
  console.log(`Watches in database: ${watches.length}`)
  console.log(`Possible pairs: ${(watches.length * (watches.length - 1)) / 2}`)
  console.log(`Existing pairs (migrated): ${existingCount}`)
  console.log(`New candidates (above threshold): ${newCount}`)
  console.log(`\nTier breakdown:`)
  console.log(`  Tier 1 (Trophy):    ${tier1.length} pairs (threshold: ${TIER_THRESHOLDS.tier1}+)`)
  console.log(`  Tier 2 (Cross-shop): ${tier2.length} pairs (threshold: ${TIER_THRESHOLDS.tier2}+)`)
  console.log(`  Tier 3 (Discovery): ${tier3.length} pairs (threshold: ${TIER_THRESHOLDS.tier3}+)`)
  console.log(`  Total:              ${allPairs.length} pairs`)

  if (statsOnly) {
    // Show top new candidates
    const topNew = allPairs
      .filter((p) => !p.isExisting)
      .slice(0, 20)
    if (topNew.length > 0) {
      console.log(`\nTop 20 new candidates:`)
      for (const p of topNew) {
        console.log(
          `  [T${p.tier}] ${p.slug1}-vs-${p.slug2} (score: ${p.priority}) — ${p.reason}`
        )
      }
    }
    return
  }

  // 5. Decide what to include
  const output: ComparisonTier[] = []

  if (doFill) {
    // Include all pairs above threshold, respecting tier caps
    // Existing pairs always included; new pairs fill remaining slots per tier
    const existingByTier = { 1: 0, 2: 0, 3: 0 }
    const newByTier: { 1: ComparisonTier[]; 2: ComparisonTier[]; 3: ComparisonTier[] } = { 1: [], 2: [], 3: [] }

    for (const p of allPairs) {
      const { isExisting, ...rest } = p
      if (isExisting) {
        existingByTier[rest.tier]++
        output.push(rest)
      } else {
        newByTier[rest.tier].push(rest)
      }
    }

    // Fill remaining capacity per tier with highest-scoring new pairs
    for (const t of [1, 2, 3] as const) {
      const remaining = TIER_MAX[`tier${t}`] - existingByTier[t]
      if (remaining > 0) {
        const sorted = newByTier[t].sort((a, b) => b.priority - a.priority)
        output.push(...sorted.slice(0, remaining))
      }
    }

    // Re-sort output
    output.sort((a, b) => {
      if (a.tier !== b.tier) return a.tier - b.tier
      return b.priority - a.priority
    })
  } else {
    // Only include existing pairs (migration mode)
    output.push(
      ...allPairs
        .filter((p) => p.isExisting)
        .map(({ isExisting, ...rest }) => rest)
    )

    // Show new candidates for review
    const topNew = allPairs
      .filter((p) => !p.isExisting)
      .sort((a, b) => b.priority - a.priority)
      .slice(0, 30)
    if (topNew.length > 0) {
      console.log(`\nTop 30 new candidates (run with --fill to include all):`)
      for (const p of topNew) {
        console.log(
          `  [T${p.tier}] ${p.slug1}-vs-${p.slug2} (score: ${p.priority}) — ${p.reason}`
        )
      }
    }
  }

  if (doWrite) {
    const outPath = path.join(ROOT, 'data', 'comparison-tiers.json')
    const data = { comparisons: output }
    fs.writeFileSync(outPath, JSON.stringify(data, null, 2) + '\n')
    console.log(`\n✅ Wrote ${output.length} pairs to ${outPath}`)
  } else {
    console.log(
      `\nDry run — ${output.length} pairs would be written. Use --write to save.`
    )
  }
}

main()
