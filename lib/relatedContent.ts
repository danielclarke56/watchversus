import { brands, BrandData } from './brandData'
import { watches, popularComparisons } from './watches'

/**
 * Find brands relevant to a comparison
 */
export function getBrandsForComparison(slug1: string, slug2: string): BrandData[] {
  const watch1 = watches.find((w) => w.slug === slug1)
  const watch2 = watches.find((w) => w.slug === slug2)
  if (!watch1 || !watch2) return []

  const relevantBrands = brands.filter(
    (b) => b.name !== watch1.brand && b.name !== watch2.brand
  )

  // Get brand popularity by filtering to those that have other watches in popular comparisons
  return relevantBrands.slice(0, 4)
}

/**
 * Find ALL comparisons involving a specific watch slug (for deep internal linking)
 */
export function getAllComparisonsForWatch(watchSlug: string): Array<[string, string]> {
  const comparisons: Array<[string, string]> = []
  
  popularComparisons.forEach(({ slug1, slug2 }: { slug1: string; slug2: string }) => {
    if (slug1 === watchSlug) {
      comparisons.push([slug1, slug2])
    } else if (slug2 === watchSlug) {
      comparisons.push([slug2, slug1])
    }
  })
  
  return comparisons
}

/**
 * Get comparison slug from two watch slugs
 */
export function getComparisonSlug(slug1: string, slug2: string): string {
  return [slug1, slug2].sort().join('-vs-')
}

/**
 * Find top comparisons for a watch (max 5)
 */
export function getTopComparisonsForWatch(watchSlug: string, limit: number = 5): Array<[string, string]> {
  return getAllComparisonsForWatch(watchSlug).slice(0, limit)
}



/**
 * Get ALL watches for a specific brand (pillar page support)
 */
export function getWatchesForBrand(brandName: string) {
  return watches.filter((w) => w.brand === brandName)
}

/**
 * Get ALL comparisons featuring a specific brand
 */
export function getComparisonsForBrand(brandName: string): Array<[string, string]> {
  const comparisons: Array<[string, string]> = []
  const brandWatches = new Set(getWatchesForBrand(brandName).map((w) => w.slug))

  popularComparisons.forEach(({ slug1, slug2 }: { slug1: string; slug2: string }) => {
    if (brandWatches.has(slug1) || brandWatches.has(slug2)) {
      comparisons.push([slug1, slug2])
    }
  })

  return comparisons
}

/**
 * Get watches from the same brand as a given watch (excluding the watch itself)
 */
export function getWatchesFromSameBrand(watchSlug: string, limit: number = 4): typeof watches {
  const watch = watches.find((w) => w.slug === watchSlug)
  if (!watch) return []

  return watches
    .filter((w) => w.brand === watch.brand && w.slug !== watchSlug)
    .slice(0, limit)
}

/**
 * Get the most consolidated related content for a watch (for footer linking)
 */
export function getMostRelevantContentForWatch(watchSlug: string) {
  const watch = watches.find((w) => w.slug === watchSlug)
  if (!watch) return { comparisons: [], brand: null, relatedWatches: [] }

  const comparisons = getTopComparisonsForWatch(watchSlug, 5)
  const brand = brands.find((b) => b.name === watch.brand)
  const relatedWatches = getWatchesFromSameBrand(watchSlug, 3)

  return { comparisons, brand, relatedWatches }
}
