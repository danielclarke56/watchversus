'use client'

import { useEffect, useState } from 'react'

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

interface Props {
  watchId: string
}

function StarRow({ rating }: { rating: number }) {
  return (
    <span className="text-sm">
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} style={{ color: s <= rating ? 'var(--accent)' : 'var(--border)' }}>★</span>
      ))}
    </span>
  )
}

export default function UserReviews({ watchId }: Props) {
  const [reviews, setReviews] = useState<UserReview[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/reviews/${watchId}`)
      .then((r) => r.json())
      .then((data: UserReview[]) => setReviews(data))
      .catch(() => setReviews([]))
      .finally(() => setLoading(false))
  }, [watchId])

  if (loading || reviews.length === 0) return null

  return (
    <div>
      <h2 className="text-xl font-bold text-textPrimary mb-4">
        User Reviews
        <span className="text-textMuted font-normal text-base ml-2">({reviews.length})</span>
      </h2>
      <div className="space-y-4">
        {reviews.map((r) => (
          <div key={r.id} className="card p-5">
            <div className="flex items-start justify-between gap-3 mb-2">
              <h4 className="font-semibold text-textPrimary text-sm leading-snug">{r.title}</h4>
              <StarRow rating={r.rating} />
            </div>
            <p className="text-textSecond text-sm leading-relaxed mb-3">{r.body}</p>
            <div className="flex items-center gap-3 text-xs text-textMuted">
              {r.ownerFor && (
                <span className="text-textSecond">Owned for {r.ownerFor}</span>
              )}
              <span>
                {new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
