import Link from 'next/link'
import Image from 'next/image'
import { watches, popularComparisons } from '@/lib/watches'
import { getSuggestedComparisons } from '@/lib/comparisons'
import type { Watch } from '@/lib/types'

function fmt(usd: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(usd)
}

function makeSlug(a: string, b: string): string {
  const sorted = [a, b].sort()
  return `${sorted[0]}-vs-${sorted[1]}`
}

interface CompareEntry {
  watch: Watch
  compareSlug: string
  priceDelta: number
  source: 'popular' | 'alternative' | 'suggested'
}

interface WatchCompareSectionProps {
  watch: Watch
}

/**
 * Unified Compare & Alternatives section.
 * Merges popular comparisons, alternatives, and suggestion engine into one deduplicated grid.
 * Max 6 entries.
 */
export default function WatchCompareSection({ watch }: WatchCompareSectionProps) {
  const seen = new Set<string>([watch.slug])
  const entries: CompareEntry[] = []

  // 1. Popular comparisons (highest priority — editorial picks)
  const fromPopular = popularComparisons
    .filter(({ slug1, slug2 }) => slug1 === watch.slug || slug2 === watch.slug)
    .map(({ slug1, slug2 }) => (slug1 === watch.slug ? slug2 : slug1))

  for (const slug of fromPopular) {
    if (seen.has(slug)) continue
    const other = watches.find((w) => w.slug === slug)
    if (!other) continue
    seen.add(slug)
    entries.push({
      watch: other,
      compareSlug: makeSlug(watch.slug, slug),
      priceDelta: other.price_new_usd.min - watch.price_new_usd.min,
      source: 'popular',
    })
    if (entries.length >= 6) break
  }

  // 2. Explicit alternatives
  if (entries.length < 6) {
    for (const slug of watch.alternatives ?? []) {
      if (seen.has(slug)) continue
      const other = watches.find((w) => w.slug === slug)
      if (!other) continue
      seen.add(slug)
      entries.push({
        watch: other,
        compareSlug: makeSlug(watch.slug, slug),
        priceDelta: other.price_new_usd.min - watch.price_new_usd.min,
        source: 'alternative',
      })
      if (entries.length >= 6) break
    }
  }

  // 3. Suggestion engine fills remaining slots
  if (entries.length < 6) {
    const suggestions = getSuggestedComparisons(watch, 6)
    for (const other of suggestions) {
      if (seen.has(other.slug)) continue
      seen.add(other.slug)
      entries.push({
        watch: other,
        compareSlug: makeSlug(watch.slug, other.slug),
        priceDelta: other.price_new_usd.min - watch.price_new_usd.min,
        source: 'suggested',
      })
      if (entries.length >= 6) break
    }
  }

  if (entries.length === 0) return null

  return (
    <section id="compare" className="pb-10 border-b border-border">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-textPrimary">Compare & Alternatives</h2>
          <Link
            href="/compare"
            className="text-sm text-accent hover:underline hidden sm:block"
          >
            All comparisons →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {entries.map(({ watch: other, compareSlug, priceDelta }) => {
            const deltaLabel =
              priceDelta === 0
                ? 'Same price'
                : priceDelta > 0
                  ? `+${fmt(Math.abs(priceDelta))}`
                  : `-${fmt(Math.abs(priceDelta))}`

            return (
              <Link
                key={compareSlug}
                href={`/compare/${compareSlug}`}
                className="card p-4 hover:border-accent transition-colors group flex gap-4 items-center"
              >
                {/* Thumbnail */}
                {other.image ? (
                  <div className="relative w-16 h-16 bg-surfaceAlt rounded-sm overflow-hidden flex-shrink-0">
                    <Image
                      src={other.image}
                      alt={`${other.brand} ${other.name}`}
                      fill
                      className="object-contain p-1"
                    />
                  </div>
                ) : (
                  <div className="w-16 h-16 bg-surfaceAlt rounded-sm flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-borderStrong" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="9" strokeWidth="1.5" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 7v5l3 3" />
                    </svg>
                  </div>
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-textMuted uppercase tracking-wide">{other.brand}</p>
                  <p className="font-bold text-textPrimary group-hover:text-accent leading-tight truncate">
                    {other.name}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5 text-xs">
                    <span className="text-textSecond">{fmt(other.price_new_usd.min)}</span>
                    <span className={`font-semibold ${priceDelta > 0 ? 'text-loser' : priceDelta < 0 ? 'text-winner' : 'text-textMuted'}`}>
                      {deltaLabel}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-accent mt-1 group-hover:underline">
                    Compare head-to-head →
                  </p>
                </div>
              </Link>
            )
          })}
        </div>

        <Link
          href="/compare"
          className="block text-center text-sm text-accent hover:underline mt-4 sm:hidden"
        >
          All comparisons →
        </Link>
    </section>
  )
}
