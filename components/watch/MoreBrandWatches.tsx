import Link from 'next/link'
import Image from 'next/image'
import { watches } from '@/lib/watches'
import type { Watch } from '@/lib/types'

function fmt(usd: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(usd)
}

interface MoreBrandWatchesProps {
  watch: Watch
}

/**
 * Shows other watches from the same brand, excluding the current watch.
 * Displayed as a card grid on watch detail pages for internal linking.
 */
export default function MoreBrandWatches({ watch }: MoreBrandWatchesProps) {
  const siblings = watches.filter(
    (w) => w.brand === watch.brand && w.slug !== watch.slug
  )

  if (siblings.length === 0) return null

  // Show up to 6 siblings, sorted by score descending
  const display = [...siblings]
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
    .slice(0, 6)

  return (
    <section id="more-brand" className="pb-10 border-b border-border">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-textPrimary">
          More {watch.brand} Watches
        </h2>
        <Link
          href="/watches"
          className="text-sm text-accent hover:underline hidden sm:block"
        >
          All watches →
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {display.map((sibling) => (
          <Link
            key={sibling.slug}
            href={`/watches/${sibling.slug}`}
            className="card p-4 hover:border-accent transition-colors group flex gap-4 items-center"
          >
            {/* Thumbnail */}
            {sibling.image ? (
              <div className="relative w-16 h-16 bg-surfaceAlt rounded-sm overflow-hidden flex-shrink-0">
                <Image
                  src={sibling.image}
                  alt={`${sibling.brand} ${sibling.name}`}
                  fill
                  className="object-contain p-1"
                />
              </div>
            ) : (
              <div className="w-16 h-16 bg-surfaceAlt rounded-sm flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-6 h-6 text-borderStrong"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <circle cx="12" cy="12" r="9" strokeWidth="1.5" />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="M12 7v5l3 3"
                  />
                </svg>
              </div>
            )}

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-xs text-textMuted uppercase tracking-wide">
                {sibling.brand}
              </p>
              <p className="font-bold text-textPrimary group-hover:text-accent leading-tight truncate">
                {sibling.name}
              </p>
              <div className="flex items-center gap-2 mt-1.5 text-xs">
                <span className="text-textSecond">
                  {fmt(sibling.price_new_usd.min)}
                </span>
                {sibling.score > 0 && (
                  <span className="text-textMuted">
                    Score: {sibling.score.toFixed(1)}
                  </span>
                )}
              </div>
              <p className="text-xs font-semibold text-accent mt-1 group-hover:underline">
                View details →
              </p>
            </div>
          </Link>
        ))}
      </div>

      <Link
        href="/watches"
        className="block text-center text-sm text-accent hover:underline mt-4 sm:hidden"
      >
        All watches →
      </Link>
    </section>
  )
}
