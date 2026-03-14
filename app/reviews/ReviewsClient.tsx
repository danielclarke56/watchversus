'use client'

import { useState, useMemo } from 'react'
import type { Review, Watch } from '@/lib/types'
import ReviewCard from '@/components/ReviewCard'

interface Props {
  reviews: Review[]
  watches: Watch[]
}

export default function ReviewsClient({ reviews, watches }: Props) {
  const [brand, setBrand] = useState('')
  const [minRating, setMinRating] = useState(0)

  const brands = useMemo(() => {
    const brandIds = new Set(reviews.map((r) => r.watch_id))
    const brandSet = new Set<string>()
    watches.filter((w) => brandIds.has(w.id)).forEach((w) => brandSet.add(w.brand))
    return Array.from(brandSet).sort()
  }, [reviews, watches])

  const filtered = useMemo(() => {
    return reviews.filter((r) => {
      const watch = watches.find((w) => w.id === r.watch_id)
      if (brand && watch?.brand !== brand) return false
      if (minRating > 0) {
        const avg = Object.values(r.ratings).reduce((a, b) => a + b, 0) / Object.values(r.ratings).length
        if (avg < minRating) return false
      }
      return true
    })
  }, [reviews, watches, brand, minRating])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Community Reviews</h1>
        <p className="text-slate-400">Real owners, honest opinions — {reviews.length} reviews and growing</p>
      </div>

      {/* Filters */}
      <div className="bg-[#1e293b] border border-[#334155] rounded-xl p-4 mb-8 flex flex-wrap gap-3 items-center">
        <select
          value={brand}
          onChange={(e) => setBrand(e.target.value)}
          className="bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#d4a853] transition-colors"
        >
          <option value="">All Brands</option>
          {brands.map((b) => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>

        <select
          value={minRating}
          onChange={(e) => setMinRating(Number(e.target.value))}
          className="bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#d4a853] transition-colors"
        >
          <option value={0}>All Ratings</option>
          <option value={4}>4+ Stars</option>
          <option value={4.5}>4.5+ Stars</option>
        </select>

        {(brand || minRating > 0) && (
          <button
            onClick={() => { setBrand(''); setMinRating(0) }}
            className="text-sm text-slate-400 hover:text-white transition-colors"
          >
            Clear
          </button>
        )}

        <span className="ml-auto text-slate-500 text-sm">
          Showing <span className="text-white">{filtered.length}</span> reviews
        </span>
      </div>

      {/* Reviews grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((r) => (
            <ReviewCard key={r.id} review={r} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-slate-400">
          No reviews match your filters.
        </div>
      )}
    </div>
  )
}
