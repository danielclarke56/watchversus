'use client'

import { useState } from 'react'
import type { Review } from '@/lib/types'
import ReviewCard from '@/components/ReviewCard'

interface WatchReviewsSectionProps {
  watchName: string
  watchSlug: string
  reviews: Review[]
}

/**
 * Unified reviews section: seed reviews + user reviews + quick vote + review form.
 * Replaces the old separate Community Reviews, UserReviews, QuickActions, and ReviewForm.
 */
export default function WatchReviewsSection({
  watchName,
  watchSlug,
  reviews,
}: WatchReviewsSectionProps) {
  const [rateVote, setRateVote] = useState<'up' | 'down' | null>(null)
  const [showThank, setShowThank] = useState(false)

  const handleVote = (vote: 'up' | 'down') => {
    setRateVote(vote)
    setShowThank(true)
    console.log(`Voted ${vote} on ${watchSlug}`)
    setTimeout(() => setShowThank(false), 3000)
  }

  return (
    <section id="reviews" className="pb-10 border-b border-border">
        <h2 className="text-2xl font-bold text-textPrimary mb-6">
          Reviews
          {reviews.length > 0 && (
            <span className="text-textMuted font-normal text-base ml-2">({reviews.length})</span>
          )}
        </h2>

        {/* Quick Vote — lightweight, contextual */}
        <div className="card p-5 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <p className="text-sm font-semibold text-textPrimary shrink-0">
              Quick take — would you recommend the {watchName}?
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => handleVote('up')}
                className={`px-5 py-2 rounded-md font-semibold text-sm transition-all ${
                  rateVote === 'up'
                    ? 'bg-accent text-white'
                    : 'bg-surfaceAlt text-textPrimary hover:bg-accentLight'
                }`}
              >
                👍 Yes
              </button>
              <button
                onClick={() => handleVote('down')}
                className={`px-5 py-2 rounded-md font-semibold text-sm transition-all ${
                  rateVote === 'down'
                    ? 'bg-red-400 text-white'
                    : 'bg-surfaceAlt text-textPrimary hover:bg-red-50'
                }`}
              >
                👎 No
              </button>
            </div>
            {showThank && (
              <p className="text-sm text-winner animate-pulse">Thanks for voting!</p>
            )}
          </div>
        </div>

        {/* Reviews list */}
        {reviews.length === 0 ? (
          <div className="card p-6 text-center text-textSecond mb-6">
            No reviews yet — be the first to share your experience.
          </div>
        ) : (
          <div className="space-y-4 mb-6">
            {reviews.map((r) => (
              <ReviewCard key={r.id} review={r} showWatch={false} />
            ))}
          </div>
        )}
    </section>
  )
}
