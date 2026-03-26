'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface ReviewData {
  id: string
  watchSlug: string
  rating: number
  title: string
  body: string
  userName: string
  createdAt: string
}

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="text-yellow-400 text-sm">
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i}>{i < rating ? '★' : '☆'}</span>
      ))}
    </span>
  )
}

export default function RecentReviews() {
  const [reviews, setReviews] = useState<ReviewData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/reviews/recent?limit=4')
      .then((res) => res.json())
      .then((data) => setReviews(Array.isArray(data) ? data : []))
      .catch(() => setReviews([]))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-8">Recent Owner Reviews</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-zinc-900 rounded-xl p-5 animate-pulse h-48" />
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-white">Recent Owner Reviews</h2>
          <Link
            href="/watches"
            className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
          >
            See all reviews →
          </Link>
        </div>

        {reviews.length === 0 ? (
          <div className="text-center py-12 bg-zinc-900/50 rounded-xl border border-zinc-800">
            <p className="text-zinc-400 text-lg mb-2">No reviews yet</p>
            <p className="text-zinc-500">
              Be the first to share your experience. Upload a photo or write a review.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {reviews.map((review) => (
              <Link
                key={review.id}
                href={`/watches/${review.watchSlug}`}
                className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 hover:border-zinc-600 transition-colors group"
              >
                <div className="flex items-center justify-between mb-2">
                  <StarRating rating={review.rating} />
                  <span className="text-xs text-zinc-500">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {review.title && (
                  <h3 className="font-semibold text-white text-sm mb-1 group-hover:text-blue-400 transition-colors line-clamp-1">
                    {review.title}
                  </h3>
                )}
                {review.body && (
                  <p className="text-zinc-400 text-sm mb-3 line-clamp-3">
                    {review.body.length > 120 ? review.body.slice(0, 120) + '...' : review.body}
                  </p>
                )}
                <div className="text-xs text-zinc-500 mt-auto">
                  <span>{review.userName}</span>
                  {review.watchSlug && (
                    <span className="text-zinc-600"> · {review.watchSlug.replace(/-/g, ' ')}</span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
