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

interface WatchBrowseSimilarProps {
  watch: Watch
  limit?: number
}

/**
 * Shows watches from different brands in the same style/category.
 * Complements MoreBrandWatches by enabling cross-brand discovery.
 * Displayed on watch detail pages for internal linking.
 */
export default function WatchBrowseSimilar({
  watch,
  limit = 6,
}: WatchBrowseSimilarProps) {
  // Find watches that share at least one style with the current watch
  // Exclude: the watch itself and watches from the same brand
  const similar = watches.filter((w) => {
    // Skip the watch itself
    if (w.slug === watch.slug) return false

    // Skip same brand (MoreBrandWatches handles that)
    if (w.brand === watch.brand) return false

    // Check for shared styles
    const watchStyles = watch.style || []
    const wStyles = w.style || []
    const hasSharedStyle = watchStyles.some((style) =>
      wStyles.includes(style)
    )

    return hasSharedStyle
  })

  // Return null if fewer than 2 matches
  if (similar.length < 2) return null

  // Sort by score descending and take top `limit`
  const display = [...similar]
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
    .slice(0, limit)

  return (
    <section id="similar-watches" className="pb-10 border-b border-border">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-textPrimary">
          Similar Watches Worth Comparing
        </h2>
        <Link
          href="/watches"
          className="text-sm text-accent hover:underline hidden sm:block"
        >
          All watches →
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {display.map((similar_watch) => (
          <Link
            key={similar_watch.slug}
            href={`/watches/${similar_watch.slug}`}
            className="card p-4 hover:border-accent transition-colors group flex gap-4 items-center"
          >
            {/* Thumbnail */}
            {similar_watch.image ? (
              <div className="relative w-16 h-16 bg-surfaceAlt rounded-sm overflow-hidden flex-shrink-0">
                <Image
                  src={similar_watch.image}
                  alt={`${similar_watch.brand} ${similar_watch.name}`}
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
                {similar_watch.brand}
              </p>
              <p className="font-bold text-textPrimary group-hover:text-accent leading-tight truncate">
                {similar_watch.name}
              </p>
              <div className="flex items-center gap-2 mt-1.5 text-xs">
                <span className="text-textSecond">
                  {fmt(similar_watch.price_new_usd.min)}
                </span>
                {similar_watch.score > 0 && (
                  <span className="text-textMuted">
                    Score: {similar_watch.score.toFixed(1)}
                  </span>
                )}
              </div>
              <p className="text-xs font-semibold text-accent mt-1 group-hover:underline">
                Compare →
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
