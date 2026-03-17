import Link from 'next/link'
import { watches, popularComparisons } from '@/lib/watches'
import type { Watch } from '@/lib/types'

interface WatchComparisonsProps {
  watch: Watch
}

/**
 * Comparison Section - Shows 2–3 comparisons involving this watch
 * Pulls from popularComparisons and finds all matches for this watch slug
 * Renders as clean cards with "Compare →" links
 */
export default function WatchComparisons({ watch }: WatchComparisonsProps) {
  // Find all comparisons that include this watch
  const comparisonsWithWatch = popularComparisons.filter(
    ({ slug1, slug2 }) => slug1 === watch.slug || slug2 === watch.slug
  )

  // Get the other watch in each comparison
  const compareData = comparisonsWithWatch.slice(0, 3).map(({ slug1, slug2 }) => {
    const otherSlug = slug1 === watch.slug ? slug2 : slug1
    const otherWatch = watches.find((w) => w.slug === otherSlug)
    return {
      otherWatch,
      otherSlug,
      compareSlug: [watch.slug, otherSlug].sort().join('-vs-'),
    }
  })

  // If no comparisons found, show fallback
  if (compareData.length === 0) {
    return (
      <section className="py-8 border-b border-[#e2e8f0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-[#0f172a] mb-6">
            Compare {watch.name} With...
          </h2>
          <div className="card p-8 text-center">
            <p className="text-[#94a3b8]">
              No comparisons yet. Check back soon.
            </p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-8 border-b border-[#e2e8f0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-[#0f172a] mb-6">
          Compare {watch.name} With...
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {compareData.map(({ otherWatch, compareSlug }) => {
            if (!otherWatch) return null
            return (
              <Link
                key={compareSlug}
                href={`/compare/${compareSlug}`}
                className="card p-4 hover:border-[#b8860b] transition-colors group"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-sm text-[#94a3b8]">{otherWatch.brand}</p>
                    <p className="font-bold text-[#0f172a] group-hover:text-[#b8860b]">
                      {otherWatch.name}
                    </p>
                  </div>
                  <span className="text-xl text-[#94a3b8] group-hover:text-[#b8860b]">→</span>
                </div>
                <p className="text-xs text-[#cbd5e1]">
                  Ref. {otherWatch.reference}
                </p>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
