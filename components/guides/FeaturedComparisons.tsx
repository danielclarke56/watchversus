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
    <section id="compare-head-to-head" className="mb-12 scroll-mt-24">
      <h2 className="text-xl font-heading font-bold text-textPrimary mb-2">Featured Comparisons</h2>
      <p className="text-sm text-textSecond mb-5">Side-by-side specs, community votes, and expert scores</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {curatedComparisons.map((c) => {
          const wa = watches.find((w) => w.slug === c.slug1)
          const wb = watches.find((w) => w.slug === c.slug2)
          if (!wa || !wb) return null

          return (
            <Link
              key={`${c.slug1}-${c.slug2}`}
              href={`/compare/${c.slug1}-vs-${c.slug2}`}
              className="card p-4 hover:border-borderStrong hover:-translate-y-0.5 hover:shadow-md transition-all group"
            >
              <div className="flex items-center gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-textMuted uppercase">{wa.brand}</p>
                  <p className="text-textPrimary text-xs font-semibold truncate">{wa.name}</p>
                </div>
                <div className="text-accent font-bold text-xs shrink-0">VS</div>
                <div className="flex-1 min-w-0 text-right">
                  <p className="text-[10px] text-textMuted uppercase">{wb.brand}</p>
                  <p className="text-textPrimary text-xs font-semibold truncate">{wb.name}</p>
                </div>
              </div>
              <p className="text-[10px] text-accent font-medium mt-2">Compare →</p>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
