import { guides, Guide } from './guideData'
import { brands, BrandData } from './brandData'
import { watches } from './watches'

/**
 * Find guides that recommend watches from a specific brand
 */
export function getGuidesByBrand(brandName: string): Guide[] {
  return guides.filter((guide) => {
    return guide.recommendations.some((rec) => {
      const watch = watches.find((w) => w.slug === rec.slug)
      return watch && watch.brand.toLowerCase() === brandName.toLowerCase()
    })
  }).slice(0, 3)
}

/**
 * Find guides that recommend specific watches
 */
export function getGuidesByWatches(watchSlugs: string[]): Guide[] {
  const guidesSet = new Set<Guide>()
  watchSlugs.forEach((slug) => {
    guides.forEach((guide) => {
      guide.recommendations.forEach((rec) => {
        if (rec.slug === slug) guidesSet.add(guide)
      })
    })
  })
  return Array.from(guidesSet).slice(0, 3)
}

/**
 * Find brands mentioned in a guide's recommendations
 */
export function getBrandsInGuide(guide: Guide): BrandData[] {
  const brandSet = new Set<string>()
  guide.recommendations.forEach((rec) => {
    const watch = watches.find((w) => w.slug === rec.slug)
    if (watch) brandSet.add(watch.brand)
  })
  return Array.from(brandSet)
    .map((brandName) => brands.find((b) => b.name === brandName))
    .filter((b): b is BrandData => !!b)
}

/**
 * Find other guides that share brands with the given guide
 */
export function getRelatedGuidesByBrand(guideSlug: string, excludeSlug?: string): Guide[] {
  const guide = guides.find((g) => g.slug === guideSlug)
  if (!guide) return []

  const brandsInGuide = getBrandsInGuide(guide)
  const brandNames = brandsInGuide.map((b) => b.name)

  const relatedGuides = guides.filter((g) => {
    if (g.slug === guideSlug || (excludeSlug && g.slug === excludeSlug)) return false
    const gBrands = getBrandsInGuide(g)
    return gBrands.some((b) => brandNames.includes(b.name))
  })

  // Sort by number of shared brands
  return relatedGuides.sort((a, b) => {
    const aBrands = getBrandsInGuide(a)
    const bBrands = getBrandsInGuide(b)
    const aShared = aBrands.filter((b) => brandNames.includes(b.name)).length
    const bShared = bBrands.filter((b) => brandNames.includes(b.name)).length
    return bShared - aShared
  }).slice(0, 4)
}

/**
 * Find guides relevant to watches in a comparison
 */
export function getGuidesForComparison(slug1: string, slug2: string): Guide[] {
  const watch1 = watches.find((w) => w.slug === slug1)
  const watch2 = watches.find((w) => w.slug === slug2)
  if (!watch1 || !watch2) return []

  // Find guides that mention either watch or their brands
  const relatedGuides = guides.filter((guide) => {
    return (
      guide.recommendations.some((rec) => rec.slug === slug1 || rec.slug === slug2) ||
      guide.recommendations.some((rec) => {
        const w = watches.find((wt) => wt.slug === rec.slug)
        return w && (w.brand === watch1.brand || w.brand === watch2.brand)
      })
    )
  })

  return relatedGuides.slice(0, 3)
}

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
 * Find guides relevant to a specific brand
 */
export function getGuidesForBrand(brandName: string): Guide[] {
  return guides.filter((guide) => {
    return guide.recommendations.some((rec) => {
      const watch = watches.find((w) => w.slug === rec.slug)
      return watch && watch.brand === brandName
    })
  }).slice(0, 3)
}

/**
 * Find other brands mentioned alongside a given brand in guides
 */
export function getRelatedBrandsByContext(brandName: string): BrandData[] {
  const guidesWithBrand = guides.filter((guide) => {
    return guide.recommendations.some((rec) => {
      const watch = watches.find((w) => w.slug === rec.slug)
      return watch && watch.brand === brandName
    })
  })

  const relatedBrandSet = new Set<string>()
  guidesWithBrand.forEach((guide) => {
    guide.recommendations.forEach((rec) => {
      const watch = watches.find((w) => w.slug === rec.slug)
      if (watch && watch.brand !== brandName) {
        relatedBrandSet.add(watch.brand)
      }
    })
  })

  return Array.from(relatedBrandSet)
    .map((brandName) => brands.find((b) => b.name === brandName))
    .filter((b): b is BrandData => !!b)
    .slice(0, 4)
}
