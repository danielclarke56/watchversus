'use client'

import { useState, useMemo } from 'react'
import type { Watch } from '@/lib/types'
import WatchCard from '@/components/WatchCard'

interface Props {
  watches: Watch[]
  initialSearch: string
  initialBrand: string
  initialStyle: string
  initialPrice: string
}

const PRICE_RANGES = [
  { label: 'All Prices', value: '' },
  { label: 'Under $500', value: 'u500' },
  { label: '$500 – $1,500', value: '500-1500' },
  { label: '$1,500 – $5,000', value: '1500-5000' },
  { label: '$5,000 – $15,000', value: '5000-15000' },
  { label: '$15,000+', value: '15000p' },
]

export default function WatchesClient({ watches, initialSearch, initialBrand, initialStyle, initialPrice }: Props) {
  const [search, setSearch] = useState(initialSearch)
  const [brand, setBrand] = useState(initialBrand)
  const [style, setStyle] = useState(initialStyle)
  const [price, setPrice] = useState(initialPrice)

  const brands = useMemo(() => {
    const set = new Set(watches.map((w) => w.brand))
    return ['All Brands', ...Array.from(set).sort()]
  }, [watches])

  const styles = useMemo(() => {
    const set = new Set(watches.flatMap((w) => w.style))
    return ['All Styles', ...Array.from(set).sort()]
  }, [watches])

  const filtered = useMemo(() => {
    return watches.filter((w) => {
      if (search) {
        const q = search.toLowerCase()
        if (!w.name.toLowerCase().includes(q) && !w.brand.toLowerCase().includes(q) && !w.reference.toLowerCase().includes(q)) return false
      }
      if (brand && brand !== 'All Brands' && w.brand !== brand) return false
      if (style && style !== 'All Styles' && !w.style.includes(style)) return false
      if (price) {
        const mid = (w.price_new_usd.min + w.price_new_usd.max) / 2
        if (price === 'u500' && mid >= 500) return false
        if (price === '500-1500' && (mid < 500 || mid > 1500)) return false
        if (price === '1500-5000' && (mid < 1500 || mid > 5000)) return false
        if (price === '5000-15000' && (mid < 5000 || mid > 15000)) return false
        if (price === '15000p' && mid < 15000) return false
      }
      return true
    })
  }, [watches, search, brand, style, price])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#0f172a] mb-2">Watch Index</h1>
        <p className="text-[#475569]">Browse {watches.length} watches — filter by brand, style, or price</p>
      </div>

      {/* Filters */}
      <div className="bg-white border border-[#e2e8f0] rounded-xl p-4 mb-8 flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Search by name or brand..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-48 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg px-4 py-2 text-sm text-[#0f172a] placeholder-[#94a3b8] focus:outline-none focus:border-[#b8860b] transition-colors"
        />
        <select
          value={brand}
          onChange={(e) => setBrand(e.target.value)}
          className="bg-[#f8fafc] border border-[#e2e8f0] rounded-lg px-3 py-2 text-sm text-[#0f172a] focus:outline-none focus:border-[#b8860b] transition-colors"
        >
          {brands.map((b) => (
            <option key={b} value={b === 'All Brands' ? '' : b}>{b}</option>
          ))}
        </select>
        <select
          value={style}
          onChange={(e) => setStyle(e.target.value)}
          className="bg-[#f8fafc] border border-[#e2e8f0] rounded-lg px-3 py-2 text-sm text-[#0f172a] focus:outline-none focus:border-[#b8860b] transition-colors capitalize"
        >
          {styles.map((s) => (
            <option key={s} value={s === 'All Styles' ? '' : s} className="capitalize">{s}</option>
          ))}
        </select>
        <select
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="bg-[#f8fafc] border border-[#e2e8f0] rounded-lg px-3 py-2 text-sm text-[#0f172a] focus:outline-none focus:border-[#b8860b] transition-colors"
        >
          {PRICE_RANGES.map((p) => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
        </select>
        {(search || brand || style || price) && (
          <button
            onClick={() => { setSearch(''); setBrand(''); setStyle(''); setPrice('') }}
            className="text-sm text-[#475569] hover:text-[#0f172a] transition-colors px-3 py-2"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Results count */}
      <p className="text-[#475569] text-sm mb-5">
        Showing <span className="text-[#0f172a] font-semibold">{filtered.length}</span> of {watches.length} watches
      </p>

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((w) => (
            <WatchCard key={w.id} watch={w} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <p className="text-[#475569] text-lg mb-3">No watches match your filters</p>
          <button
            onClick={() => { setSearch(''); setBrand(''); setStyle(''); setPrice('') }}
            className="btn-gold"
          >
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  )
}
