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
  initialSort: string
}

const PRICE_RANGES = [
  { label: 'All Prices', value: '' },
  { label: 'Under $500', value: 'u500' },
  { label: '$500 – $1,500', value: '500-1500' },
  { label: '$1,500 – $5,000', value: '1500-5000' },
  { label: '$5,000 – $15,000', value: '5000-15000' },
  { label: '$15,000+', value: '15000p' },
]

const SORT_OPTIONS = [
  { label: 'Default', value: '' },
  { label: 'Top Rated', value: 'score' },
  { label: 'Price: Low → High', value: 'price-asc' },
  { label: 'Price: High → Low', value: 'price-desc' },
]

export default function WatchesClient({ watches, initialSearch, initialBrand, initialStyle, initialPrice, initialSort }: Props) {
  const [search, setSearch] = useState(initialSearch)
  const [brand, setBrand] = useState(initialBrand)
  const [style, setStyle] = useState(initialStyle)
  const [price, setPrice] = useState(initialPrice)
  const [sort, setSort] = useState(initialSort)

  const brands = useMemo(() => {
    const set = new Set(watches.map((w) => w.brand))
    return ['All Brands', ...Array.from(set).sort()]
  }, [watches])

  const styles = useMemo(() => {
    const set = new Set(watches.flatMap((w) => w.style))
    return ['All Styles', ...Array.from(set).sort()]
  }, [watches])

  const filtered = useMemo(() => {
    let result = watches.filter((w) => {
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

    if (sort === 'score') {
      result = [...result].sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
    } else if (sort === 'price-asc') {
      result = [...result].sort((a, b) => a.price_new_usd.min - b.price_new_usd.min)
    } else if (sort === 'price-desc') {
      result = [...result].sort((a, b) => b.price_new_usd.min - a.price_new_usd.min)
    }

    return result
  }, [watches, search, brand, style, price, sort])

  const hasFilters = search || brand || style || price || sort

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#0f172a] mb-2">Find Your Watch</h1>
        <p className="text-[#475569]">Search and filter {watches.length} watches by brand, style, price, or score</p>
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
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="bg-[#f8fafc] border border-[#e2e8f0] rounded-lg px-3 py-2 text-sm text-[#0f172a] focus:outline-none focus:border-[#b8860b] transition-colors"
        >
          {SORT_OPTIONS.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
        {hasFilters && (
          <button
            onClick={() => { setSearch(''); setBrand(''); setStyle(''); setPrice(''); setSort('') }}
            className="text-sm text-[#475569] hover:text-[#0f172a] transition-colors px-3 py-2"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Results count */}
      <p className="text-[#475569] text-sm mb-5">
        Showing <span className="text-[#0f172a] font-semibold">{filtered.length}</span> of {watches.length} watches
        {sort === 'score' && ' — sorted by score'}
        {sort === 'price-asc' && ' — lowest price first'}
        {sort === 'price-desc' && ' — highest price first'}
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
            onClick={() => { setSearch(''); setBrand(''); setStyle(''); setPrice(''); setSort('') }}
            className="btn-gold"
          >
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  )
}
