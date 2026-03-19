import type { Watch } from './types'
import { watches, popularComparisons } from './watches'

/**
 * Get suggested comparison watches for a given watch.
 * Priority: explicit alternatives > same category + similar price > same brand
 */
export function getSuggestedComparisons(watch: Watch, limit: number = 6): Watch[] {
  const candidates: Array<{ watch: Watch; score: number }> = []

  for (const w of watches) {
    if (w.slug === watch.slug) continue
    let score = 0

    // Explicit alternatives (highest priority)
    if (watch.alternatives?.includes(w.slug)) score += 100
    if (w.alternatives?.includes(watch.slug)) score += 80

    // Same primary category
    if (w.primary_category === watch.primary_category) score += 30

    // Similar price range (within ±40%)
    const priceRatio = w.price_new_usd.min / watch.price_new_usd.min
    if (priceRatio >= 0.6 && priceRatio <= 1.4) score += 25
    if (priceRatio >= 0.8 && priceRatio <= 1.2) score += 10 // bonus for very close

    // Same brand, different model
    if (w.brand === watch.brand) score += 15

    // Similar overall score (within ±1 point)
    if (Math.abs(w.score - watch.score) <= 1) score += 10

    // Has existing curated comparison (bonus for established pairs)
    const hasCurated = popularComparisons.some(
      (c) =>
        (c.slug1 === watch.slug && c.slug2 === w.slug) ||
        (c.slug1 === w.slug && c.slug2 === watch.slug)
    )
    if (hasCurated) score += 20

    if (score > 0) candidates.push({ watch: w, score })
  }

  return candidates
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((c) => c.watch)
}

/**
 * Check if a comparison pair has a curated override
 */
export function isPromotedComparison(slug1: string, slug2: string): boolean {
  return popularComparisons.some(
    (c) =>
      (c.slug1 === slug1 && c.slug2 === slug2) ||
      (c.slug1 === slug2 && c.slug2 === slug1)
  )
}

/**
 * Generate a comparison slug from two watch slugs
 */
export function makeComparisonSlug(slug1: string, slug2: string): string {
  return `${slug1}-vs-${slug2}`
}
