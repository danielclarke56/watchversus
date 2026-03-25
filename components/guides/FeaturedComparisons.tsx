'use client'

import Link from 'next/link'
import { guides, Guide } from '@/lib/guideData'
import { watches, popularComparisons } from '@/lib/watches'

interface FeaturedComparisonsProps {
  guide: Guide
}

export default function FeaturedComparisons({ guide }: FeaturedComparisonsProps) {
  // Compute all pairs between recommended watches that exist in popularComparisons
  const recSlugList = guide.recommendations.map((r) => r.slug).filter(Boolean) as string[]
  const internalComparisons: typeof popularComparisons = []
  for (let i = 0; i < recSlugList.length; i++) {
    for (let j = i + 1; j < recSlugList.length; j++) {
      const found = popularComparisons.find(
        (c) =>
          (c.slug1 === recSlugList[i] && c.slug2 === recSlugList[j]) ||
          (c.slug1 === recSlugList[j] && c.slug2 === recSlugList[i])
      )
      if (found) internalComparisons.push(found)
    }
  }

  // Find comparisons that involve any recommended watch slug
  const relatedSlugs = new Set(guide.recommendations.map((r) => r.slug).filter(Boolean) as string[])
  const relatedComparisons = popularComparisons.filter(
    (c) => relatedSlugs.has(c.slug1) || relatedSlugs.has(c.slug2)
  )

  // Merge internal pairs first, then other related — dedupe, max 6
  const seenComps = new Set<string>()
  const topComparisons = [...internalComparisons, ...relatedComparisons]
    .filter((c) => {
      const key = `${c.slug1}-${c.slug2}`
      if (seenComps.has(key)) return false
      seenComps.add(key)
      return true
    })
    .slice(0, 6)

  // Prioritize cross-brand comparisons, limit to 4
  const crossBrandComps = topComparisons.filter((c) => {
    const wa = watches.find((w) => w.slug === c.slug1)
    const wb = watches.find((w) => w.slug === c.slug2)
    return wa && wb && wa.brand !== wb.brand
  })
  const sameBrandComps = topComparisons.filter((c) => {
    const wa = watches.find((w) => w.slug === c.slug1)
    const wb = watches.find((w) => w.slug === c.slug2)
    return wa && wb && wa.brand === wb.brand
  })
  const curatedComparisons = [...crossBrandComps, ...sameBrandComps].slice(0, 4)

  if (curatedComparisons.length === 0) {
    return null
  }

  return (
    <section id="featured-comparisons" className="mb-12 scroll-mt-24">
      <h2 className="text-xl font-heading font-bold text-textPrimary mb-5">Featured Comparisons</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {curatedComparisons.map((c) => {
          const watch1 = watches.find((w) => w.slug === c.slug1)
          const watch2 = watches.find((w) => w.slug === c.slug2)
          if (!watch1 || !watch2) return null

          const compSlug = [c.slug1, c.slug2].sort().join('-vs-')
          return (
            <Link
              key={`${c.slug1}-${c.slug2}`}
              href={`/compare/${compSlug}`}
              className="card p-5 hover:border-borderStrong hover:-translate-y-0.5 hover:shadow-md transition-all group"
            >
              <p className="text-xs uppercase text-textMuted font-semibold mb-2">Comparison</p>
              <h3 className="text-sm font-bold text-textPrimary group-hover:text-accent transition-colors">
                {watch1.name} vs {watch2.name}
              </h3>
              <p className="text-xs text-textSecond mt-3">
                Compare {watch1.brand} and {watch2.brand} directly.
              </p>
              <p className="text-xs text-accent font-medium mt-4 inline-block">Compare →</p>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
