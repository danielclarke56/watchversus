import Link from 'next/link'
import { watches, popularComparisons } from '@/lib/watches'
import type { Watch } from '@/lib/types'

function fmt(usd: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(usd)
}

interface WatchComparisonsProps {
  watch: Watch
}

/**
 * Comparison Section - Shows popular + comparison_slugs comparisons for this watch.
 * Pulls from popularComparisons first, then falls back to comparison_slugs + alternatives.
 * Shows up to 6 compare cards with price delta hint.
 */
export default function WatchComparisons({ watch }: WatchComparisonsProps) {
  // 1. From popularComparisons
  const fromPopular = popularComparisons
    .filter(({ slug1, slug2 }) => slug1 === watch.slug || slug2 === watch.slug)
    .map(({ slug1, slug2 }) => (slug1 === watch.slug ? slug2 : slug1))

  // 2. From comparison_slugs field (parse other slug out of "a-vs-b" format)
  const fromCompSlugs = (watch.comparison_slugs ?? []).flatMap((cs) => {
    const parts = cs.replace('-vs-', '|vs|').split('|vs|')
    return parts.filter((p) => p !== watch.slug)
  })

  // 3. From alternatives as fallback
  const fromAlts = watch.alternatives ?? []

  // Merge + dedupe, watch itself excluded, cap at 6
  const seen = new Set<string>()
  const otherSlugs: string[] = []
  for (const s of [...fromPopular, ...fromCompSlugs, ...fromAlts]) {
    if (s && s !== watch.slug && !seen.has(s)) {
      seen.add(s)
      otherSlugs.push(s)
    }
    if (otherSlugs.length === 6) break
  }

  const compareData = otherSlugs
    .map((otherSlug) => {
      const otherWatch = watches.find((w) => w.slug === otherSlug)
      if (!otherWatch) return null
      const slugs = [watch.slug, otherSlug].sort()
      return { otherWatch, compareSlug: `${slugs[0]}-vs-${slugs[1]}` }
    })
    .filter((x): x is NonNullable<typeof x> => x !== null)

  if (compareData.length === 0) return null

  return (
    <section className="py-8 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-2xl font-bold text-textPrimary">Compare {watch.name} With...</h2>
          <span className="text-xs text-textMuted hidden sm:block">Side-by-side specs &amp; votes</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {compareData.map(({ otherWatch, compareSlug }) => {
            const priceDelta = otherWatch.price_new_usd.min - watch.price_new_usd.min
            const deltaLabel =
              priceDelta === 0
                ? 'Same price'
                : priceDelta > 0
                ? `+${fmt(Math.abs(priceDelta))} more`
                : `${fmt(Math.abs(priceDelta))} less`
            return (
              <Link
                key={compareSlug}
                href={`/compare/${compareSlug}`}
                className="card p-4 hover:border-accent transition-colors group flex flex-col gap-2"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-textMuted">{otherWatch.brand}</p>
                    <p className="font-bold text-textPrimary group-hover:text-accent leading-tight">
                      {otherWatch.name}
                    </p>
                  </div>
                  <span className="text-accent text-lg leading-none mt-0.5">→</span>
                </div>
                <div className="flex items-center justify-between text-xs text-textSecond">
                  <span>{fmt(otherWatch.price_new_usd.min)}</span>
                  <span className={priceDelta > 0 ? 'text-red-600' : priceDelta < 0 ? 'text-winner' : 'text-textMuted'}>
                    {deltaLabel}
                  </span>
                </div>
                <p className="text-xs font-semibold text-accent group-hover:underline">Compare head-to-head →</p>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
