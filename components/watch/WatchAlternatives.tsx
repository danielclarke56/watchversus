import Link from 'next/link'
import { watches } from '@/lib/watches'
import { calcOverallRating, calcAverageRatings, getReviewsForWatch } from '@/lib/watches'
import type { Watch } from '@/lib/types'

interface WatchAlternativesProps {
  watch: Watch
}

/**
 * Alternatives Section - Show 3–5 similar watches
 * Logic: Find watches in the same brand (category) 
 * TODO: If no category field exists, pull watches from same brand family
 */
export default function WatchAlternatives({ watch }: WatchAlternativesProps) {
  // Get watches from the same brand, excluding current watch
  const similarWatches = watches
    .filter((w) => w.brand === watch.brand && w.slug !== watch.slug)
    .slice(0, 5)

  // If no watches in same brand, stub gracefully
  if (similarWatches.length === 0) {
    return null
  }

  return (
    <section className="py-8 border-b border-[#e2e8f0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-[#0f172a] mb-6">Similar Watches</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {similarWatches.map((alt) => {
            const reviews = getReviewsForWatch(alt.id)
            const avgRatings = reviews.length > 0 ? calcAverageRatings(reviews) : null
            const overallScore = avgRatings ? calcOverallRating(avgRatings) : null

            return (
              <Link
                key={alt.slug}
                href={`/watches/${alt.slug}`}
                className="card p-4 hover:border-[#b8860b] transition-colors group"
              >
                <p className="text-sm text-[#94a3b8] mb-1">{alt.brand}</p>
                <p className="font-bold text-[#0f172a] mb-2 group-hover:text-[#b8860b]">
                  {alt.name}
                </p>

                {overallScore && (
                  <div className="flex items-center gap-1 mb-2">
                    <span className="text-sm">⭐</span>
                    <span className="font-semibold text-[#0f172a]">
                      {overallScore.toFixed(1)}
                    </span>
                    <span className="text-xs text-[#94a3b8]">/ 10</span>
                  </div>
                )}

                <p className="text-xs text-[#cbd5e1]">
                  {reviews.length} review{reviews.length !== 1 ? 's' : ''}
                </p>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
