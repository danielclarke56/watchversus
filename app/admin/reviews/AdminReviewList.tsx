'use client'

import { useState } from 'react'

export interface PendingReviewRow {
  id: string
  watchId: string
  userId: string
  rating: number
  title: string
  body: string
  ownerFor?: string
  createdAt: string
}

interface Props {
  initialReviews: PendingReviewRow[]
  watchNames: Record<string, string>
}

function StarRow({ rating }: { rating: number }) {
  return (
    <span>
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} style={{ color: s <= rating ? '#b8860b' : '#e2e8f0' }}>★</span>
      ))}
    </span>
  )
}

export default function AdminReviewList({ initialReviews, watchNames }: Props) {
  const [reviews, setReviews] = useState(initialReviews)
  const [loading, setLoading] = useState<string | null>(null)
  const [msg, setMsg] = useState('')

  async function act(action: 'approve' | 'delete', watchId: string, reviewId: string) {
    setLoading(reviewId)
    setMsg('')
    try {
      const res = await fetch('/api/admin/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, watchId, reviewId }),
      })
      const data = await res.json() as { error?: string }
      if (!res.ok) {
        setMsg(data.error ?? 'Error')
      } else {
        setReviews((prev) => prev.filter((r) => r.id !== reviewId))
        setMsg(action === 'approve' ? 'Review approved.' : 'Review deleted.')
      }
    } catch {
      setMsg('Network error.')
    } finally {
      setLoading(null)
    }
  }

  if (reviews.length === 0) {
    return (
      <div className="card p-8 text-center text-[#475569]">
        No pending reviews.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {msg && <p className="text-sm text-[#b8860b]">{msg}</p>}
      {reviews.map((r) => (
        <div key={r.id} className="card p-5">
          <div className="flex items-start justify-between gap-4 mb-3">
            <div>
              <p className="text-[#b8860b] text-xs font-semibold uppercase tracking-wider mb-1">
                {watchNames[r.watchId] ?? r.watchId}
              </p>
              <h3 className="text-[#0f172a] font-semibold">{r.title}</h3>
              <div className="flex items-center gap-3 mt-1">
                <StarRow rating={r.rating} />
                <span className="text-[#94a3b8] text-xs">
                  {new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => act('approve', r.watchId, r.id)}
                disabled={loading === r.id}
                className="px-3 py-1.5 text-xs rounded-lg bg-[#b8860b] text-white font-semibold hover:bg-[#d4a853] transition-colors disabled:opacity-50"
              >
                Approve
              </button>
              <button
                onClick={() => act('delete', r.watchId, r.id)}
                disabled={loading === r.id}
                className="px-3 py-1.5 text-xs rounded-lg bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-colors disabled:opacity-50"
              >
                Delete
              </button>
            </div>
          </div>

          <p className="text-[#475569] text-sm leading-relaxed mb-3">{r.body}</p>

          <div className="flex flex-wrap gap-4 text-xs text-[#94a3b8] border-t border-[#e2e8f0] pt-3">
            <span>User: <span className="text-[#475569] font-mono">{r.userId}</span></span>
            {r.ownerFor && <span>Owned for: <span className="text-[#475569]">{r.ownerFor}</span></span>}
            <span>ID: <span className="text-[#94a3b8] font-mono">{r.id}</span></span>
          </div>
        </div>
      ))}
    </div>
  )
}
