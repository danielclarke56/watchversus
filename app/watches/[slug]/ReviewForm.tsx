'use client'

import { useState } from 'react'

interface Props {
  watchId: string
  watchName: string
}

const RATING_LABELS = [
  { key: 'value_for_money', label: 'Value for Money' },
  { key: 'build_quality', label: 'Build Quality' },
  { key: 'movement_reliability', label: 'Movement Reliability' },
  { key: 'daily_wearability', label: 'Daily Wearability' },
  { key: 'resale_strength', label: 'Resale Strength' },
]

type Ratings = Record<string, number>

export default function ReviewForm({ watchId, watchName }: Props) {
  const [open, setOpen] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [name, setName] = useState('')
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [ratings, setRatings] = useState<Ratings>({
    value_for_money: 3,
    build_quality: 3,
    movement_reliability: 3,
    daily_wearability: 3,
    resale_strength: 3,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const review = {
      id: `local-${Date.now()}`,
      watch_id: watchId,
      reviewer_name: name,
      date: new Date().toISOString().split('T')[0],
      ratings,
      title,
      body,
      helpful_count: 0,
    }
    // Save to localStorage
    const key = `wv_reviews_${watchId}`
    const existing = JSON.parse(localStorage.getItem(key) || '[]')
    localStorage.setItem(key, JSON.stringify([review, ...existing]))
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="card p-6 border-[#d4a853]/30 bg-[#d4a853]/5 text-center">
        <div className="text-[#d4a853] text-2xl mb-2">✓</div>
        <h3 className="text-white font-semibold mb-1">Review Submitted!</h3>
        <p className="text-slate-400 text-sm">Thanks for sharing your experience with the {watchName}. Your review has been saved.</p>
      </div>
    )
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="btn-outline w-full"
      >
        Write a Review
      </button>
    )
  }

  return (
    <div className="card p-6">
      <h3 className="text-white font-semibold text-lg mb-5">Write a Review — {watchName}</h3>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="text-sm text-slate-400 block mb-1">Your Name *</label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. John D."
            className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#d4a853] transition-colors"
          />
        </div>

        <div>
          <label className="text-sm text-slate-400 block mb-3">Ratings *</label>
          <div className="space-y-3">
            {RATING_LABELS.map(({ key, label }) => (
              <div key={key} className="flex items-center gap-3">
                <span className="text-sm text-slate-400 w-40 shrink-0">{label}</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setRatings((r) => ({ ...r, [key]: n }))}
                      className={`w-7 h-7 rounded text-sm transition-colors ${
                        ratings[key] >= n
                          ? 'bg-[#d4a853] text-[#0f172a] font-bold'
                          : 'bg-[#334155] text-slate-400 hover:bg-[#d4a853]/30'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm text-slate-400 block mb-1">Review Title *</label>
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Best dive watch at any price"
            className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#d4a853] transition-colors"
          />
        </div>

        <div>
          <label className="text-sm text-slate-400 block mb-1">Your Review *</label>
          <textarea
            required
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={5}
            placeholder="Share your honest experience as an owner. What do you love? Any downsides? Who would you recommend it to?"
            className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#d4a853] transition-colors resize-none"
          />
        </div>

        <div className="flex gap-3">
          <button type="submit" className="btn-gold">
            Submit Review
          </button>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="text-sm text-slate-400 hover:text-white transition-colors px-4 py-2"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
