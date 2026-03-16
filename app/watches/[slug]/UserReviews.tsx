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
        <span key={s} style={{ color: s <= rating ? '#b8860b' : '#e2e8f0' }}>★</span>
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
      <h2 className="text-xl font-bold text-[#0f172a] mb-4">
        User Reviews
        <span className="text-[#94a3b8] font-normal text-base ml-2">({reviews.length})</span>
      </h2>
      <div className="space-y-4">
        {reviews.map((r) => (
          <div key={r.id} className="card p-5">
            <div className="flex items-start justify-between gap-3 mb-2">
              <h4 className="font-semibold text-[#0f172a] text-sm leading-snug">{r.title}</h4>
              <StarRow rating={r.rating} />
            </div>
            <p className="text-[#475569] text-sm leading-relaxed mb-3">{r.body}</p>
            <div className="flex items-center gap-3 text-xs text-[#94a3b8]">
              {r.ownerFor && (
                <span className="text-[#475569]">Owned for {r.ownerFor}</span>
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
