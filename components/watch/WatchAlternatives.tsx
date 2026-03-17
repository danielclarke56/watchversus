import Link from 'next/link'
import { watches } from '@/lib/watches'
import { calcOverallRating, calcAverageRatings, getReviewsForWatch } from '@/lib/watches'
import type { Watch } from '@/lib/types'

interface WatchAlternativesProps {
  watch: Watch
}

/**
 * Alternatives Section - Show recommended alternatives based on watch data
 * Uses the watch.alternatives array (array of watch slugs) to find recommended watches
 */
export default function WatchAlternatives({ watch }: WatchAlternativesProps) {
  // Get watches from the alternatives array by slug lookup
  const similarWatches = watch.alternatives
    .map((slug) => watches.find((w) => w.slug === slug))
    .filter((w) => w !== undefined)
    .slice(0, 5)

  // If no watches in same brand, stub gracefully
  if (similarWatches.length === 0) {
    return null
  }

  return (
    <section className="py-8 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-textPrimary mb-6">Similar Watches</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {similarWatches.map((alt) => {
            const reviews = getReviewsForWatch(alt.id)
            const avgRatings = reviews.length > 0 ? calcAverageRatings(reviews) : null
            const overallScore = avgRatings ? calcOverallRating(avgRatings) : null

            const slugs = [watch.slug, alt.slug].sort()
            const compareSlug = `${slugs[0]}-vs-${slugs[1]}`
            return (
              <div key={alt.slug} className="card p-4 flex flex-col gap-2">
                <Link href={`/watches/${alt.slug}`} className="group">
                  <p className="text-sm text-textMuted mb-0.5">{alt.brand}</p>
                  <p className="font-bold text-textPrimary group-hover:text-accent leading-tight">
                    {alt.name}
                  </p>
                </Link>

                {overallScore && (
                  <div className="flex items-center gap-1">
                    <span className="text-sm">⭐</span>
                    <span className="font-semibold text-textPrimary text-sm">
                      {overallScore.toFixed(1)}
                    </span>
                    <span className="text-xs text-textMuted">/ 10</span>
                  </div>
                )}

                <p className="text-xs text-borderStrong">
                  {reviews.length} review{reviews.length !== 1 ? 's' : ''}
                </p>

                <Link
                  href={`/compare/${compareSlug}`}
                  className="mt-auto text-xs font-semibold text-accent hover:underline"
                >
                  Compare vs {watch.name} →
                </Link>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
