'use client'

import { useState, useEffect, useMemo } from 'react'
import type { Review, ReviewRatings } from '@/lib/types'
import { calcOverallRating } from '@/lib/watches'
import ReviewForm from '@/app/watches/[slug]/ReviewForm'

/* ── Types ─────────────────────────────────────────────── */

interface UserReview {
  id: string
  watchId: string
  userId: string
  rating: number
  title: string
  body: string
  ownerFor?: string
  createdAt: string
  approved: true
}

/** Flattened review used for sort / filter / display */
interface NormalizedReview {
  id: string
  type: 'seed' | 'user'
  rating: number // 1–5 overall
  title: string
  body: string
  author: string
  date: string
  helpfulCount: number
  ownerFor?: string
  subRatings?: ReviewRatings
}

type SortKey = 'helpful' | 'newest' | 'highest' | 'lowest'

const REVIEWS_PER_PAGE = 5

/* ── Props ─────────────────────────────────────────────── */

interface Props {
  watchName: string
  watchSlug: string
  watchId: string
  reviews: Review[] // seed reviews from data/reviews.json
}

/* ── Helpers ───────────────────────────────────────────── */

function normalizeSeed(r: Review): NormalizedReview {
  return {
    id: r.id,
    type: 'seed',
    rating: calcOverallRating(r.ratings),
    title: r.title,
    body: r.body,
    author: r.reviewer_name,
    date: r.date,
    helpfulCount: r.helpful_count,
    subRatings: r.ratings,
  }
}

function normalizeUser(r: UserReview): NormalizedReview {
  return {
    id: r.id,
    type: 'user',
    rating: r.rating,
    title: r.title,
    body: r.body,
    author: 'Community Member',
    date: r.createdAt,
    helpfulCount: 0,
    ownerFor: r.ownerFor,
  }
}

function starBucket(rating: number): number {
  return Math.round(rating)
}

/* ── Sub-components ────────────────────────────────────── */

function StarIcon({ filled, className = '' }: { filled: boolean; className?: string }) {
  return (
    <svg
      className={`w-4 h-4 ${filled ? 'text-accent' : 'text-border'} fill-current ${className}`}
      viewBox="0 0 24 24"
    >
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  )
}

function StarsRow({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' }) {
  const sizeClass = size === 'md' ? 'w-5 h-5' : 'w-4 h-4'
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg
          key={s}
          className={`${sizeClass} ${s <= Math.round(rating) ? 'text-accent' : 'text-border'} fill-current`}
          viewBox="0 0 24 24"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  )
}

function StarDistribution({
  reviews,
  filterStar,
  onFilter,
}: {
  reviews: NormalizedReview[]
  filterStar: number | null
  onFilter: (star: number | null) => void
}) {
  const total = reviews.length
  const counts = [5, 4, 3, 2, 1].map((s) => ({
    star: s,
    count: reviews.filter((r) => starBucket(r.rating) === s).length,
  }))

  return (
    <div className="space-y-1.5">
      {counts.map(({ star, count }) => {
        const pct = total > 0 ? (count / total) * 100 : 0
        const active = filterStar === star
        return (
          <button
            key={star}
            onClick={() => onFilter(active ? null : star)}
            className={`w-full flex items-center gap-2 group text-left py-0.5 transition-opacity ${
              filterStar !== null && !active ? 'opacity-40' : ''
            }`}
          >
            <span className="text-xs text-textSecond w-4 text-right shrink-0">{star}</span>
            <StarIcon filled className="shrink-0 !w-3 !h-3" />
            <div className="flex-1 h-2 bg-surfaceAlt rounded-full overflow-hidden">
              <div
                className="h-full bg-accent rounded-full transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="text-xs text-textMuted w-6 text-right shrink-0">{count}</span>
          </button>
        )
      })}
    </div>
  )
}

function ReviewItem({ review }: { review: NormalizedReview }) {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between gap-3 mb-2">
        <h4 className="font-semibold text-textPrimary text-sm leading-snug">{review.title}</h4>
        <div className="flex items-center gap-1.5 shrink-0">
          <StarsRow rating={review.rating} />
          <span className="text-sm text-textSecond">{review.rating.toFixed(1)}</span>
        </div>
      </div>

      <p className="text-textSecond text-sm leading-relaxed mb-3">{review.body}</p>

      {/* Sub-ratings for seed reviews */}
      {review.subRatings && (
        <div className="flex flex-wrap gap-x-4 gap-y-1 mb-3">
          {(Object.entries(review.subRatings) as [keyof ReviewRatings, number][]).map(([key, val]) => (
            <span key={key} className="text-xs text-textMuted">
              <span className="capitalize">{key.replace(/_/g, ' ')}</span>{' '}
              <span className="text-textSecond font-medium">{val}/5</span>
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between text-xs text-textMuted">
        <span>
          <span className="text-textPrimary font-medium">{review.author}</span>
          {review.ownerFor && <span className="text-textMuted"> · Owned for {review.ownerFor}</span>}
          {' · '}
          {new Date(review.date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </span>
        {review.helpfulCount > 0 && (
          <span>{review.helpfulCount} found helpful</span>
        )}
      </div>
    </div>
  )
}

/* ── Main Component ────────────────────────────────────── */

export default function WatchReviewsSection({
  watchName,
  watchSlug,
  watchId,
  reviews: seedReviews,
}: Props) {
  const [showForm, setShowForm] = useState(false)
  const [sortBy, setSortBy] = useState<SortKey>('helpful')
  const [filterStar, setFilterStar] = useState<number | null>(null)
  const [visibleCount, setVisibleCount] = useState(REVIEWS_PER_PAGE)
  const [userReviews, setUserReviews] = useState<UserReview[]>([])
  const [rateVote, setRateVote] = useState<'up' | 'down' | null>(null)
  const [showThank, setShowThank] = useState(false)
  const [formKey, setFormKey] = useState(0)

  // Fetch user-submitted reviews (gracefully handles missing API)
  useEffect(() => {
    fetch(`/api/reviews/${watchId}`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data: UserReview[]) => setUserReviews(data))
      .catch(() => {})
  }, [watchId, formKey])

  // Normalize all reviews into one list
  const allReviews = useMemo<NormalizedReview[]>(() => {
    const seeds = seedReviews.map(normalizeSeed)
    const users = userReviews.map(normalizeUser)
    return [...seeds, ...users]
  }, [seedReviews, userReviews])

  // Avg rating
  const avgRating = useMemo(() => {
    if (allReviews.length === 0) return 0
    return allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
  }, [allReviews])

  // Filter + sort pipeline
  const filtered = useMemo(() => {
    let list = allReviews
    if (filterStar !== null) {
      list = list.filter((r) => starBucket(r.rating) === filterStar)
    }
    switch (sortBy) {
      case 'helpful':
        list = [...list].sort((a, b) => b.helpfulCount - a.helpfulCount)
        break
      case 'newest':
        list = [...list].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        break
      case 'highest':
        list = [...list].sort((a, b) => b.rating - a.rating)
        break
      case 'lowest':
        list = [...list].sort((a, b) => a.rating - b.rating)
        break
    }
    return list
  }, [allReviews, filterStar, sortBy])

  const visible = filtered.slice(0, visibleCount)
  const hasMore = visibleCount < filtered.length

  const handleVote = (vote: 'up' | 'down') => {
    setRateVote(vote)
    setShowThank(true)
    setTimeout(() => setShowThank(false), 3000)
  }

  const handleFormSuccess = () => {
    setShowForm(false)
    setFormKey((k) => k + 1) // re-fetch user reviews
  }

  // Reset visible count when filter changes
  const handleFilterStar = (star: number | null) => {
    setFilterStar(star)
    setVisibleCount(REVIEWS_PER_PAGE)
  }

  return (
    <section id="reviews" className="pb-10 border-b border-border">
      <h2 className="text-2xl font-bold text-textPrimary mb-6">
        Reviews
        {allReviews.length > 0 && (
          <span className="text-textMuted font-normal text-base ml-2">
            ({allReviews.length})
          </span>
        )}
      </h2>

      {/* ── Rating Summary ──────────────────────────── */}
      {allReviews.length > 0 ? (
        <div className="card p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-6">
            {/* Left: big average */}
            <div className="flex flex-col items-center justify-center sm:pr-6 sm:border-r sm:border-border">
              <span className="text-4xl font-bold text-textPrimary">{avgRating.toFixed(1)}</span>
              <StarsRow rating={avgRating} size="md" />
              <span className="text-xs text-textMuted mt-1">
                {allReviews.length} review{allReviews.length !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Right: distribution bars */}
            <div className="flex-1 min-w-0">
              <StarDistribution
                reviews={allReviews}
                filterStar={filterStar}
                onFilter={handleFilterStar}
              />
            </div>

            {/* CTA */}
            <div className="flex items-center sm:pl-6 sm:border-l sm:border-border">
              <button
                onClick={() => setShowForm(!showForm)}
                className="btn-gold text-sm px-5 py-2.5 rounded-md font-semibold whitespace-nowrap"
              >
                Write a Review
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="card p-8 text-center mb-6">
          <p className="text-textSecond text-sm mb-4">
            No reviews yet — be the first to share your experience with the {watchName}.
          </p>
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn-gold text-sm px-5 py-2.5 rounded-md font-semibold"
          >
            Write the First Review
          </button>
        </div>
      )}

      {/* ── Review Form (toggled) ───────────────────── */}
      {showForm && (
        <div className="mb-6 animate-in">
          <ReviewForm watchId={watchId} watchName={watchName} onSuccess={handleFormSuccess} />
        </div>
      )}

      {/* ── Controls: sort + active filter ──────────── */}
      {allReviews.length > 0 && (
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            {filterStar !== null && (
              <button
                onClick={() => handleFilterStar(null)}
                className="flex items-center gap-1 text-xs bg-accent/10 text-accent px-2.5 py-1 rounded-full font-medium"
              >
                {filterStar} star{filterStar !== 1 ? 's' : ''}
                <span className="ml-0.5">&times;</span>
              </button>
            )}
            <span className="text-xs text-textMuted">
              {filtered.length} review{filtered.length !== 1 ? 's' : ''}
              {filterStar !== null ? ' matching' : ''}
            </span>
          </div>

          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value as SortKey)
              setVisibleCount(REVIEWS_PER_PAGE)
            }}
            className="text-xs bg-surface border border-border rounded-md px-2.5 py-1.5 text-textSecond focus:outline-none focus:border-accent"
          >
            <option value="helpful">Most Helpful</option>
            <option value="newest">Newest First</option>
            <option value="highest">Highest Rated</option>
            <option value="lowest">Lowest Rated</option>
          </select>
        </div>
      )}

      {/* ── Review List ─────────────────────────────── */}
      {visible.length > 0 && (
        <div className="space-y-3">
          {visible.map((r) => (
            <ReviewItem key={r.id} review={r} />
          ))}
        </div>
      )}

      {/* Show More */}
      {hasMore && (
        <div className="mt-4 text-center">
          <button
            onClick={() => setVisibleCount((c) => c + REVIEWS_PER_PAGE)}
            className="btn-outline text-sm px-6 py-2 rounded-md font-medium"
          >
            Show More Reviews ({filtered.length - visibleCount} remaining)
          </button>
        </div>
      )}

      {/* ── Quick Vote ──────────────────────────────── */}
      <div className="card p-5 mt-6">
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
              Yes
            </button>
            <button
              onClick={() => handleVote('down')}
              className={`px-5 py-2 rounded-md font-semibold text-sm transition-all ${
                rateVote === 'down'
                  ? 'bg-red-400 text-white'
                  : 'bg-surfaceAlt text-textPrimary hover:bg-red-50'
              }`}
            >
              No
            </button>
          </div>
          {showThank && (
            <p className="text-sm text-winner animate-pulse">Thanks for voting!</p>
          )}
        </div>
      </div>
    </section>
  )
}
