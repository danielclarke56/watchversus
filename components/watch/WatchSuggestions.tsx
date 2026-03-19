import Link from 'next/link'
import Image from 'next/image'
import { getSuggestedComparisons, makeComparisonSlug } from '@/lib/comparisons'
import { calcOverallRating, calcAverageRatings, getReviewsForWatch } from '@/lib/watches'
import type { Watch } from '@/lib/types'

interface WatchSuggestionsProps {
  watch: Watch
}

/**
 * Suggestion Engine Card Section
 * Displays 4-6 suggested comparison watches below the main content
 * Uses getSuggestedComparisons() to intelligently rank alternatives
 */
export default function WatchSuggestions({ watch }: WatchSuggestionsProps) {
  // Get 6 suggested comparisons ranked by relevance
  const suggestedWatches = getSuggestedComparisons(watch, 6)

  // Return null if no suggestions available
  if (suggestedWatches.length === 0) {
    return null
  }

  return (
    <section className="py-8 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-textPrimary mb-6">Compare This Watch With...</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {suggestedWatches.map((suggestion) => {
            const reviews = getReviewsForWatch(suggestion.id)
            const avgRatings = reviews.length > 0 ? calcAverageRatings(reviews) : null
            const overallScore = avgRatings ? calcOverallRating(avgRatings) : null
            const compareSlug = makeComparisonSlug(watch.slug, suggestion.slug)

            return (
              <div key={suggestion.slug} className="card p-4 flex flex-col gap-3">
                {/* Watch image */}
                {suggestion.image && (
                  <Link href={`/watches/${suggestion.slug}`} className="group relative w-full h-40 bg-neutral rounded-sm overflow-hidden">
                    <Image
                      src={suggestion.image}
                      alt={`${suggestion.brand} ${suggestion.name}`}
                      fill
                      className="object-contain group-hover:scale-105 transition-transform"
                    />
                  </Link>
                )}

                {/* Brand + Name */}
                <Link href={`/watches/${suggestion.slug}`} className="group">
                  <p className="text-xs text-textMuted mb-0.5 uppercase tracking-wide">{suggestion.brand}</p>
                  <p className="font-bold text-textPrimary group-hover:text-accent leading-tight text-sm">
                    {suggestion.name}
                  </p>
                </Link>

                {/* Rating */}
                {overallScore && (
                  <div className="flex items-center gap-1">
                    <span className="text-sm">⭐</span>
                    <span className="font-semibold text-textPrimary text-sm">
                      {overallScore.toFixed(1)}
                    </span>
                    <span className="text-xs text-textMuted">/ 10</span>
                  </div>
                )}

                {/* Review count */}
                <p className="text-xs text-textMuted">
                  {reviews.length} review{reviews.length !== 1 ? 's' : ''}
                </p>

                {/* Compare link */}
                <Link
                  href={`/compare/${compareSlug}`}
                  className="mt-auto text-xs font-semibold text-accent hover:underline"
                >
                  Compare Now →
                </Link>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
