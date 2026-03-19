'use client'

import { useState, useMemo } from 'react'
import type { Watch } from '@/lib/types'
import { formatPrice, popularComparisons, getWatchBySlug } from '@/lib/watches'
import Link from 'next/link'

interface Props {
  watches: Watch[]
  initialA: string
  initialB: string
}

const CATEGORIES = [
  'All',
  'Dive',
  'Dress',
  'Chronograph',
  'GMT & Travel',
  'Field',
  'Sports',
  'Budget & Mid-Range',
  'Microbrand',
] as const

type Category = (typeof CATEGORIES)[number]

const MICROBRAND_BRANDS = ['Baltic', 'Halios', 'Christopher Ward']

function deriveCategory(wa: Watch, wb: Watch): Category {
  // Microbrand check
  if (MICROBRAND_BRANDS.includes(wa.brand) || MICROBRAND_BRANDS.includes(wb.brand)) {
    return 'Microbrand'
  }
  // Budget check
  if (wa.price_new_usd.max < 3000 && wb.price_new_usd.max < 3000) {
    return 'Budget & Mid-Range'
  }
  // Category from watches
  const catMap: Record<string, Category> = {
    dive: 'Dive',
    dress: 'Dress',
    chronograph: 'Chronograph',
    gmt: 'GMT & Travel',
    field: 'Field',
    sport: 'Sports',
  }
  if (catMap[wa.primary_category]) return catMap[wa.primary_category]
  if (catMap[wb.primary_category]) return catMap[wb.primary_category]
  return 'All'
}

interface ComparisonCard {
  slug1: string
  slug2: string
  watchA: Watch
  watchB: Watch
  category: Category
}

function WatchSelector({
  watches,
  value,
  onChange,
  label,
}: {
  watches: Watch[]
  value: string
  onChange: (v: string) => void
  label: string
}) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)

  const selected = watches.find((w) => w.slug === value)

  // Group watches by brand, sorted alphabetically
  const grouped = useMemo(() => {
    const q = query.toLowerCase()
    const filtered = query
      ? watches.filter((w) => w.name.toLowerCase().includes(q) || w.brand.toLowerCase().includes(q))
      : watches

    const groups: Record<string, Watch[]> = {}
    filtered.forEach((w) => {
      if (!groups[w.brand]) groups[w.brand] = []
      groups[w.brand].push(w)
    })

    // Sort brands alphabetically, models within each brand alphabetically
    return Object.entries(groups)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([brand, models]) => ({
        brand,
        models: models.sort((a, b) => a.name.localeCompare(b.name)),
      }))
  }, [watches, query])

  return (
    <div className="relative">
      <label className="text-xs text-[var(--text-secondary)] uppercase tracking-wider block mb-2">
        {label}
      </label>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full bg-[var(--bg-subtle)] border border-[var(--border-strong)] rounded-xl px-4 py-3 text-left flex items-center justify-between hover:border-[var(--accent)]/40 transition-colors focus:outline-none focus:border-[var(--accent)]"
      >
        {selected ? (
          <div>
            <p className="text-xs text-[var(--accent)] font-semibold">{selected.brand}</p>
            <p className="text-[var(--text-primary)] font-medium">{selected.name}</p>
          </div>
        ) : (
          <span className="text-[var(--text-muted)]">Select a watch...</span>
        )}
        <svg
          className={`w-4 h-4 text-[var(--text-secondary)] transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-[var(--border-strong)] rounded-xl shadow-lg overflow-hidden">
          <div className="p-2 border-b border-[var(--border-strong)]">
            <input
              type="text"
              placeholder="Search watches..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
              className="w-full bg-[var(--bg-subtle)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none"
            />
          </div>
          <div className="max-h-64 overflow-y-auto">
            {grouped.map((group) => (
              <div key={group.brand}>
                <div className="px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] bg-[var(--bg-subtle)] sticky top-0">
                  {group.brand}
                </div>
                {group.models.map((w) => (
                  <button
                    key={w.slug}
                    type="button"
                    onClick={() => {
                      onChange(w.slug)
                      setOpen(false)
                      setQuery('')
                    }}
                    className={`w-full px-4 py-2.5 text-left hover:bg-[var(--bg-subtle)] transition-colors flex items-center justify-between ${
                      value === w.slug ? 'bg-[var(--accent)]/10' : ''
                    }`}
                  >
                    <div>
                      <p className="text-sm text-[var(--text-primary)]">{w.name}</p>
                    </div>
                    <span className="text-xs text-[var(--text-muted)]">{formatPrice(w.price_new_usd)}</span>
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function CompareClient({ watches, initialA, initialB }: Props) {
  const [slugA, setSlugA] = useState(initialA)
  const [slugB, setSlugB] = useState(initialB)
  const [activeCategory, setActiveCategory] = useState<Category>('All')
  const [showCount, setShowCount] = useState(12)

  const watchA = watches.find((w) => w.slug === slugA)
  const watchB = watches.find((w) => w.slug === slugB)

  // Build comparison cards with categories
  const allComparisons = useMemo(() => {
    const seen = new Set<string>()
    const cards: ComparisonCard[] = []

    for (const c of popularComparisons) {
      const key = [c.slug1, c.slug2].sort().join('|')
      if (seen.has(key)) continue
      seen.add(key)

      const wa = getWatchBySlug(c.slug1)
      const wb = getWatchBySlug(c.slug2)
      if (!wa || !wb) continue

      cards.push({
        slug1: c.slug1,
        slug2: c.slug2,
        watchA: wa,
        watchB: wb,
        category: deriveCategory(wa, wb),
      })
    }
    return cards
  }, [])

  const filteredComparisons = useMemo(() => {
    if (activeCategory === 'All') return allComparisons
    return allComparisons.filter((c) => c.category === activeCategory)
  }, [allComparisons, activeCategory])

  const visibleComparisons = filteredComparisons.slice(0, showCount)

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] mb-3">
          Compare Any Two Watches
        </h1>
        <p className="text-[var(--text-secondary)] text-lg max-w-2xl mx-auto">
          160+ side-by-side matchups with specs, community ratings, and honest differences.
        </p>
      </div>

      {/* Selectors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <WatchSelector watches={watches} value={slugA} onChange={setSlugA} label="Watch A" />
        <WatchSelector watches={watches} value={slugB} onChange={setSlugB} label="Watch B" />
      </div>

      {/* CTA when both selected */}
      {watchA && watchB && (
        <div className="text-center mb-8">
          <Link
            href={`/compare/${watchA.slug}-vs-${watchB.slug}`}
            className="inline-block bg-[var(--accent)] text-white font-semibold text-base px-8 py-3 rounded-xl hover:opacity-90 transition-opacity"
          >
            View Full Comparison →
          </Link>
        </div>
      )}

      {/* Trust line */}
      <p className="text-center text-sm text-[var(--text-muted)] mb-12">
        56 watches · 160+ comparisons · Specs, ratings &amp; community votes · No sponsored content
      </p>

      {/* Browse Comparisons */}
      <div>
        <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-5">Browse Comparisons</h2>

        {/* Category pills */}
        <div className="flex flex-wrap gap-2 mb-8">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => {
                setActiveCategory(cat)
                setShowCount(12)
              }}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                activeCategory === cat
                  ? 'bg-[var(--accent)] text-white border-[var(--accent)]'
                  : 'bg-[var(--bg-subtle)] text-[var(--text-secondary)] border-[var(--border-strong)] hover:border-[var(--accent)]/40'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Comparison grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {visibleComparisons.map((c) => (
            <Link
              key={`${c.slug1}-${c.slug2}`}
              href={`/compare/${c.slug1}-vs-${c.slug2}`}
              className="block border border-[var(--border-strong)] rounded-xl p-5 hover:border-[var(--accent)]/40 transition-colors group bg-white"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  {/* Watch A */}
                  <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider">
                    {c.watchA.brand}
                  </p>
                  <p className="text-[var(--text-primary)] font-semibold truncate group-hover:text-[var(--accent)] transition-colors">
                    {c.watchA.name}
                  </p>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">
                    {formatPrice(c.watchA.price_new_usd)}
                  </p>
                </div>

                <span className="text-[var(--accent)] font-bold text-xs shrink-0 mt-2">VS</span>

                <div className="flex-1 min-w-0 text-right">
                  {/* Watch B */}
                  <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider">
                    {c.watchB.brand}
                  </p>
                  <p className="text-[var(--text-primary)] font-semibold truncate group-hover:text-[var(--accent)] transition-colors">
                    {c.watchB.name}
                  </p>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">
                    {formatPrice(c.watchB.price_new_usd)}
                  </p>
                </div>
              </div>

              {/* Category badge */}
              <div className="mt-3">
                <span className="inline-block text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded-full bg-[var(--bg-subtle)] text-[var(--text-muted)] border border-[var(--border-strong)]">
                  {c.category === 'All' ? 'General' : c.category}
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* Show More */}
        {showCount < filteredComparisons.length && (
          <div className="text-center mt-8">
            <button
              type="button"
              onClick={() => setShowCount((prev) => prev + 12)}
              className="px-6 py-2.5 rounded-xl border border-[var(--border-strong)] text-[var(--text-secondary)] font-medium hover:border-[var(--accent)]/40 hover:text-[var(--accent)] transition-colors"
            >
              Show More ({filteredComparisons.length - showCount} remaining)
            </button>
          </div>
        )}
      </div>

      {/* SEO paragraph */}
      <div className="mt-16 max-w-3xl mx-auto text-center">
        <p className="text-sm text-[var(--text-muted)] leading-relaxed">
          WatchVsWatch compares luxury, sport, and everyday watches side by side — specs, pricing,
          community ratings, and real differences. Every comparison is built on structured data, not
          opinion. Pick a matchup above or build your own.
        </p>
      </div>
    </div>
  )
}
