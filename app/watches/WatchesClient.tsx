'use client'

import { useState, useMemo, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import type { Watch } from '@/lib/types'
import { formatPrice } from '@/lib/watches'

interface Props {
  watches: Watch[]
  initialSearch: string
  initialBrand: string
  initialStyle: string
  initialPrice: string
  initialSort: string
  initialPage: number
}

const PAGE_SIZE = 25

const PRICE_RANGES = [
  { label: 'All Prices', value: '' },
  { label: 'Under $500', value: 'u500' },
  { label: '$500 – $1,500', value: '500-1500' },
  { label: '$1,500 – $5,000', value: '1500-5000' },
  { label: '$5,000 – $15,000', value: '5000-15000' },
  { label: '$15,000+', value: '15000p' },
]

type SortKey = '' | 'score' | 'price-asc' | 'price-desc' | 'name' | 'brand' | 'size' | 'wr'

const SORT_OPTIONS: { label: string; value: SortKey }[] = [
  { label: 'Default', value: '' },
  { label: 'Top Rated', value: 'score' },
  { label: 'Price: Low → High', value: 'price-asc' },
  { label: 'Price: High → Low', value: 'price-desc' },
  { label: 'Name A–Z', value: 'name' },
  { label: 'Brand A–Z', value: 'brand' },
]

function matchesPrice(w: Watch, price: string): boolean {
  if (!price) return true
  const mid = (w.price_new_usd.min + w.price_new_usd.max) / 2
  switch (price) {
    case 'u500': return mid < 500
    case '500-1500': return mid >= 500 && mid <= 1500
    case '1500-5000': return mid >= 1500 && mid <= 5000
    case '5000-15000': return mid >= 5000 && mid <= 15000
    case '15000p': return mid >= 15000
    default: return true
  }
}

function sortWatches(watches: Watch[], sort: SortKey): Watch[] {
  if (!sort) return watches
  const sorted = [...watches]
  switch (sort) {
    case 'score': return sorted.sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
    case 'price-asc': return sorted.sort((a, b) => a.price_new_usd.min - b.price_new_usd.min)
    case 'price-desc': return sorted.sort((a, b) => b.price_new_usd.min - a.price_new_usd.min)
    case 'name': return sorted.sort((a, b) => a.name.localeCompare(b.name))
    case 'brand': return sorted.sort((a, b) => a.brand.localeCompare(b.brand) || a.name.localeCompare(b.name))
    case 'size': return sorted.sort((a, b) => a.case_diameter_mm - b.case_diameter_mm)
    case 'wr': return sorted.sort((a, b) => b.water_resistance_m - a.water_resistance_m)
    default: return sorted
  }
}

/* ── Column header (clickable to sort) ────────────────────── */
function SortHeader({ label, sortKey, currentSort, onSort, className = '' }: {
  label: string
  sortKey: SortKey
  currentSort: SortKey
  onSort: (key: SortKey) => void
  className?: string
}) {
  const active = currentSort === sortKey
  return (
    <button
      onClick={() => onSort(active ? '' : sortKey)}
      className={`text-left text-[10px] uppercase tracking-wider font-semibold transition-colors ${
        active ? 'text-accent' : 'text-textMuted hover:text-textSecond'
      } ${className}`}
    >
      {label}
      {active && <span className="ml-0.5">↓</span>}
    </button>
  )
}

/* ── Compact row for list view ────────────────────────────── */
function WatchRow({ watch }: { watch: Watch }) {
  return (
    <Link
      href={`/watches/${watch.slug}`}
      className="group grid grid-cols-[40px_1fr_60px_72px_70px_56px_80px] md:grid-cols-[48px_1fr_64px_80px_76px_60px_88px] items-center gap-x-2 md:gap-x-3 px-3 md:px-4 py-2.5 border-b border-border last:border-0 hover:bg-surfaceAlt/50 transition-colors"
    >
      <div className="w-10 h-10 md:w-12 md:h-12 rounded bg-surfaceAlt overflow-hidden shrink-0 flex items-center justify-center">
        {watch.image ? (
          <Image
            src={watch.image}
            alt={watch.imageAlt ?? `${watch.brand} ${watch.name}`}
            width={48}
            height={48}
            className="w-full h-full object-contain"
          />
        ) : (
          <svg className="w-5 h-5 text-border" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="9" strokeWidth="1.5" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 7v5l3 3" />
          </svg>
        )}
      </div>

      <div className="min-w-0">
        <p className="text-xs font-semibold text-textPrimary truncate group-hover:text-accent transition-colors">
          {watch.name}
        </p>
        <p className="text-[10px] text-textMuted truncate">{watch.brand}</p>
      </div>

      <div className="text-right">
        <span className="text-xs font-semibold text-textPrimary">{watch.score.toFixed(1)}</span>
        <span className="text-[10px] text-textMuted">/10</span>
      </div>

      <p className="text-xs font-medium text-textPrimary text-right tabular-nums">
        {formatPrice(watch.price_new_usd)}
      </p>

      <p className="text-xs text-textSecond text-right tabular-nums">{watch.case_diameter_mm}mm</p>
      <p className="text-xs text-textSecond text-right tabular-nums">{watch.water_resistance_m}m</p>
      <p className="text-xs text-textSecond text-right capitalize truncate">{watch.movement_type}</p>
    </Link>
  )
}

/* ── Mobile row (stacked layout) ──────────────────────────── */
function WatchRowMobile({ watch }: { watch: Watch }) {
  return (
    <Link
      href={`/watches/${watch.slug}`}
      className="group flex items-center gap-3 px-3 py-3 border-b border-border last:border-0 hover:bg-surfaceAlt/50 transition-colors"
    >
      <div className="w-11 h-11 rounded bg-surfaceAlt overflow-hidden shrink-0 flex items-center justify-center">
        {watch.image ? (
          <Image
            src={watch.image}
            alt={watch.imageAlt ?? `${watch.brand} ${watch.name}`}
            width={44}
            height={44}
            className="w-full h-full object-contain"
          />
        ) : (
          <svg className="w-5 h-5 text-border" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="9" strokeWidth="1.5" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 7v5l3 3" />
          </svg>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-textPrimary truncate group-hover:text-accent transition-colors">
          {watch.name}
        </p>
        <p className="text-[11px] text-textMuted truncate">
          {watch.brand} · {watch.case_diameter_mm}mm · {watch.movement_type}
        </p>
      </div>

      <div className="shrink-0 text-right">
        <p className="text-sm font-semibold text-textPrimary">{formatPrice(watch.price_new_usd)}</p>
        <p className="text-[11px] text-textMuted">{watch.score.toFixed(1)}/10</p>
      </div>
    </Link>
  )
}

/* ── Pagination ───────────────────────────────────────────── */
function Pagination({ current, total, onPage }: { current: number; total: number; onPage: (p: number) => void }) {
  if (total <= 1) return null

  // Build page number array with ellipsis
  const pages: (number | '...')[] = []
  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i)
  } else {
    pages.push(1)
    if (current > 3) pages.push('...')
    for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
      pages.push(i)
    }
    if (current < total - 2) pages.push('...')
    pages.push(total)
  }

  return (
    <div className="flex items-center justify-center gap-1 pt-4 pb-2">
      <button
        onClick={() => onPage(current - 1)}
        disabled={current === 1}
        className="px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-textSecond hover:text-textPrimary hover:bg-surfaceAlt"
      >
        Prev
      </button>

      {pages.map((p, i) =>
        p === '...' ? (
          <span key={`ellipsis-${i}`} className="px-1 text-xs text-textMuted">...</span>
        ) : (
          <button
            key={p}
            onClick={() => onPage(p)}
            className={`min-w-[32px] py-1.5 text-xs font-medium rounded-md transition-colors ${
              p === current
                ? 'bg-accent text-white'
                : 'text-textSecond hover:text-textPrimary hover:bg-surfaceAlt'
            }`}
          >
            {p}
          </button>
        )
      )}

      <button
        onClick={() => onPage(current + 1)}
        disabled={current === total}
        className="px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-textSecond hover:text-textPrimary hover:bg-surfaceAlt"
      >
        Next
      </button>
    </div>
  )
}

/* ── Main component ───────────────────────────────────────── */
export default function WatchesClient({ watches, initialSearch, initialBrand, initialStyle, initialPrice, initialSort, initialPage }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [search, setSearch] = useState(initialSearch)
  const [brand, setBrand] = useState(initialBrand)
  const [style, setStyle] = useState(initialStyle)
  const [price, setPrice] = useState(initialPrice)
  const [sort, setSort] = useState<SortKey>((initialSort as SortKey) || '')
  const [page, setPage] = useState(initialPage)

  const brands = useMemo(() => {
    const set = new Set(watches.map((w) => w.brand))
    return ['All Brands', ...Array.from(set).sort()]
  }, [watches])

  const styles = useMemo(() => {
    const set = new Set(watches.flatMap((w) => w.style))
    return ['All Styles', ...Array.from(set).sort()]
  }, [watches])

  const filtered = useMemo(() => {
    const result = watches.filter((w) => {
      if (search) {
        const q = search.toLowerCase()
        if (
          !w.name.toLowerCase().includes(q) &&
          !w.brand.toLowerCase().includes(q) &&
          !w.reference.toLowerCase().includes(q)
        ) return false
      }
      if (brand && brand !== 'All Brands' && w.brand !== brand) return false
      if (style && style !== 'All Styles' && !w.style.includes(style)) return false
      if (!matchesPrice(w, price)) return false
      return true
    })
    return sortWatches(result, sort)
  }, [watches, search, brand, style, price, sort])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const startIdx = (safePage - 1) * PAGE_SIZE
  const visible = filtered.slice(startIdx, startIdx + PAGE_SIZE)
  const hasFilters = search || brand || style || price || sort

  // Sync URL when page/filters change
  const updateUrl = useCallback((newPage: number) => {
    const params = new URLSearchParams(searchParams.toString())
    if (newPage > 1) params.set('page', String(newPage))
    else params.delete('page')
    if (search) params.set('search', search); else params.delete('search')
    if (brand) params.set('brand', brand); else params.delete('brand')
    if (style) params.set('style', style); else params.delete('style')
    if (price) params.set('price', price); else params.delete('price')
    if (sort) params.set('sort', sort); else params.delete('sort')
    const qs = params.toString()
    router.replace(`/watches${qs ? `?${qs}` : ''}`, { scroll: false })
  }, [router, searchParams, search, brand, style, price, sort])

  // Reset to page 1 when filters change, and sync URL
  const handleFilterChange = useCallback(<T,>(setter: (v: T) => void, value: T) => {
    setter(value)
    setPage(1)
    // URL sync happens on next render via the page change handler
    setTimeout(() => {
      const params = new URLSearchParams()
      // We can't read the new state here, so we update URL in the goToPage function
    }, 0)
  }, [])

  const goToPage = useCallback((p: number) => {
    const clamped = Math.max(1, Math.min(p, totalPages))
    setPage(clamped)
    updateUrl(clamped)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [totalPages, updateUrl])

  const clearAll = useCallback(() => {
    setSearch('')
    setBrand('')
    setStyle('')
    setPrice('')
    setSort('')
    setPage(1)
    router.replace('/watches', { scroll: false })
  }, [router])

  const handleSort = useCallback((key: SortKey) => {
    setSort(key)
    setPage(1)
  }, [])

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-textPrimary mb-1">Watches</h1>
        <p className="text-textSecond text-sm">{watches.length} watches — search, filter, and sort</p>
      </div>

      {/* Filters */}
      <div className="bg-surface border border-border rounded-lg p-3 mb-6 flex flex-wrap gap-2">
        <input
          type="text"
          placeholder="Search name, brand, ref..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          className="flex-1 min-w-[180px] bg-surfaceAlt border border-border rounded-md px-3 py-1.5 text-sm text-textPrimary placeholder-textMuted focus:outline-none focus:border-accent transition-colors"
        />
        <select
          value={brand}
          onChange={(e) => { setBrand(e.target.value); setPage(1) }}
          className="bg-surfaceAlt border border-border rounded-md px-2.5 py-1.5 text-sm text-textPrimary focus:outline-none focus:border-accent transition-colors"
        >
          {brands.map((b) => (
            <option key={b} value={b === 'All Brands' ? '' : b}>{b}</option>
          ))}
        </select>
        <select
          value={style}
          onChange={(e) => { setStyle(e.target.value); setPage(1) }}
          className="bg-surfaceAlt border border-border rounded-md px-2.5 py-1.5 text-sm text-textPrimary focus:outline-none focus:border-accent transition-colors capitalize"
        >
          {styles.map((s) => (
            <option key={s} value={s === 'All Styles' ? '' : s} className="capitalize">{s}</option>
          ))}
        </select>
        <select
          value={price}
          onChange={(e) => { setPrice(e.target.value); setPage(1) }}
          className="bg-surfaceAlt border border-border rounded-md px-2.5 py-1.5 text-sm text-textPrimary focus:outline-none focus:border-accent transition-colors"
        >
          {PRICE_RANGES.map((p) => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
        </select>
        {/* Sort dropdown visible on mobile only — desktop uses column headers */}
        <select
          value={sort}
          onChange={(e) => { setSort(e.target.value as SortKey); setPage(1) }}
          className="md:hidden bg-surfaceAlt border border-border rounded-md px-2.5 py-1.5 text-sm text-textPrimary focus:outline-none focus:border-accent transition-colors"
        >
          {SORT_OPTIONS.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
        {hasFilters && (
          <button
            onClick={clearAll}
            className="text-xs text-textMuted hover:text-textPrimary transition-colors px-2 py-1.5"
          >
            Clear
          </button>
        )}
      </div>

      {/* Results count + range */}
      <div className="flex items-baseline justify-between mb-2">
        <p className="text-textMuted text-xs">
          {filtered.length === watches.length
            ? `${watches.length} watches`
            : `${filtered.length} of ${watches.length} watches`}
        </p>
        {filtered.length > PAGE_SIZE && (
          <p className="text-textMuted text-xs">
            {startIdx + 1}–{Math.min(startIdx + PAGE_SIZE, filtered.length)}
          </p>
        )}
      </div>

      {/* Table */}
      {filtered.length > 0 ? (
        <div className="bg-surface border border-border rounded-lg overflow-hidden">
          {/* Column headers — desktop */}
          <div className="hidden md:grid grid-cols-[48px_1fr_64px_80px_76px_60px_88px] items-center gap-x-3 px-4 py-2 bg-surfaceAlt border-b border-border">
            <span />
            <SortHeader label="Watch" sortKey="name" currentSort={sort} onSort={handleSort} />
            <SortHeader label="Score" sortKey="score" currentSort={sort} onSort={handleSort} className="text-right" />
            <SortHeader label="Price" sortKey="price-asc" currentSort={sort} onSort={handleSort} className="text-right" />
            <SortHeader label="Size" sortKey="size" currentSort={sort} onSort={handleSort} className="text-right" />
            <SortHeader label="WR" sortKey="wr" currentSort={sort} onSort={handleSort} className="text-right" />
            <span className="text-[10px] uppercase tracking-wider font-semibold text-textMuted text-right">Movement</span>
          </div>

          {/* Rows — desktop */}
          <div className="hidden md:block">
            {visible.map((w) => (
              <WatchRow key={w.id} watch={w} />
            ))}
          </div>

          {/* Rows — mobile */}
          <div className="md:hidden">
            {visible.map((w) => (
              <WatchRowMobile key={w.id} watch={w} />
            ))}
          </div>

          {/* Pagination */}
          <Pagination current={safePage} total={totalPages} onPage={goToPage} />
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-textSecond text-sm mb-3">No watches match your filters</p>
          <button onClick={clearAll} className="btn-gold text-xs px-4 py-2">
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  )
}
