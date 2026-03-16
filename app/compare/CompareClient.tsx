'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import type { Watch } from '@/lib/types'
import { calcAverageRatings, calcOverallRating, getReviewsForWatch, formatPrice, popularComparisons, getWatchBySlug } from '@/lib/watches'
import RatingBar from '@/components/RatingBar'
import Link from 'next/link'

interface Props {
  watches: Watch[]
  initialA: string
  initialB: string
}

const RATING_LABELS: Record<string, string> = {
  value_for_money: 'Value for Money',
  build_quality: 'Build Quality',
  movement_reliability: 'Movement Reliability',
  daily_wearability: 'Daily Wearability',
  resale_strength: 'Resale Strength',
}

function WatchSelector({ watches, value, onChange, label }: { watches: Watch[]; value: string; onChange: (v: string) => void; label: string }) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)

  const selected = watches.find((w) => w.slug === value)
  const filtered = useMemo(() => {
    if (!query) return watches
    const q = query.toLowerCase()
    return watches.filter((w) => w.name.toLowerCase().includes(q) || w.brand.toLowerCase().includes(q))
  }, [watches, query])

  return (
    <div className="relative">
      <label className="text-xs text-[#475569] uppercase tracking-wider block mb-2">{label}</label>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-xl px-4 py-3 text-left flex items-center justify-between hover:border-[#b8860b]/40 transition-colors focus:outline-none focus:border-[#b8860b]"
      >
        {selected ? (
          <div>
            <p className="text-xs text-[#b8860b] font-semibold">{selected.brand}</p>
            <p className="text-[#0f172a] font-medium">{selected.name}</p>
          </div>
        ) : (
          <span className="text-[#94a3b8]">Select a watch...</span>
        )}
        <svg className={`w-4 h-4 text-[#475569] transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-[#e2e8f0] rounded-xl shadow-lg overflow-hidden">
          <div className="p-2 border-b border-[#e2e8f0]">
            <input
              type="text"
              placeholder="Search watches..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
              className="w-full bg-[#f8fafc] rounded-lg px-3 py-2 text-sm text-[#0f172a] placeholder-[#94a3b8] focus:outline-none"
            />
          </div>
          <div className="max-h-64 overflow-y-auto">
            {filtered.map((w) => (
              <button
                key={w.slug}
                type="button"
                onClick={() => { onChange(w.slug); setOpen(false); setQuery('') }}
                className={`w-full px-4 py-2.5 text-left hover:bg-[#f8fafc] transition-colors flex items-center justify-between ${value === w.slug ? 'bg-[#b8860b]/10' : ''}`}
              >
                <div>
                  <p className="text-xs text-[#b8860b]">{w.brand}</p>
                  <p className="text-sm text-[#0f172a]">{w.name}</p>
                </div>
                <span className="text-xs text-[#94a3b8]">{formatPrice(w.price_new_usd)}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function WatchColumn({ watch }: { watch: Watch }) {
  const reviews = getReviewsForWatch(watch.id)
  const avgRatings = calcAverageRatings(reviews)
  const overall = avgRatings ? calcOverallRating(avgRatings) : null

  return (
    <div>
      <div className="text-center mb-6">
        <div className="bg-[#f8fafc] rounded-xl border border-[#e2e8f0] aspect-square max-w-48 mx-auto flex items-center justify-center mb-4 overflow-hidden">
          {watch.image ? (
            <img
              src={watch.image}
              alt={watch.imageAlt ?? `${watch.brand} ${watch.name}`}
              className="w-full h-full object-contain p-3"
              loading="lazy"
            />
          ) : (
            <svg className="w-12 h-12 text-[#e2e8f0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="9" strokeWidth="1" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 7v5l3 3" />
            </svg>
          )}
        </div>
        <p className="text-xs text-[#b8860b] font-bold uppercase tracking-wider mb-1">{watch.brand}</p>
        <h2 className="text-xl font-bold text-[#0f172a] mb-1">{watch.name}</h2>
        <p className="text-[#94a3b8] text-xs mb-3">Ref. {watch.reference}</p>
        {overall && (
          <div className="text-2xl font-bold text-[#b8860b]">{overall.toFixed(1)}<span className="text-sm text-[#475569] font-normal">/5</span></div>
        )}
      </div>

      {/* Community ratings */}
      {avgRatings && (
        <div className="space-y-2">
          {Object.entries(avgRatings).map(([key, val]) => (
            <RatingBar key={key} label={RATING_LABELS[key]} value={val} />
          ))}
        </div>
      )}
    </div>
  )
}

const SPEC_ROWS: Array<{ label: string; key: (w: Watch) => string }> = [
  { label: 'Case Diameter', key: (w) => `${w.case_diameter_mm}mm` },
  { label: 'Case Thickness', key: (w) => `${w.case_thickness_mm}mm` },
  { label: 'Lug Width', key: (w) => `${w.lug_width_mm}mm` },
  { label: 'Lug-to-Lug', key: (w) => `${w.lug_to_lug_mm}mm` },
  { label: 'Movement', key: (w) => w.movement_type },
  { label: 'Caliber', key: (w) => w.movement_caliber },
  { label: 'Power Reserve', key: (w) => w.power_reserve_hours ? `${w.power_reserve_hours}h` : 'Quartz' },
  { label: 'Water Resistance', key: (w) => `${w.water_resistance_m}m` },
  { label: 'Crystal', key: (w) => w.crystal },
  { label: 'Case Material', key: (w) => w.case_material },
  { label: 'Bracelet/Strap', key: (w) => w.bracelet_material },
  { label: 'Price (New)', key: (w) => formatPrice(w.price_new_usd) },
  { label: 'Price (Pre-owned)', key: (w) => formatPrice(w.price_preowned_usd) },
]

export default function CompareClient({ watches, initialA, initialB }: Props) {
  const router = useRouter()
  const [slugA, setSlugA] = useState(initialA)
  const [slugB, setSlugB] = useState(initialB)

  const watchA = watches.find((w) => w.slug === slugA)
  const watchB = watches.find((w) => w.slug === slugB)

  const handleCompare = () => {
    if (watchA && watchB) {
      router.push(`/compare/${watchA.slug}-vs-${watchB.slug}`)
    }
  }

  const topComparisons = popularComparisons.slice(0, 8)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#0f172a] mb-2">Compare Watches</h1>
        <p className="text-[#475569]">Select two watches to see them side-by-side</p>
      </div>

      {/* Selectors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <WatchSelector watches={watches} value={slugA} onChange={setSlugA} label="Watch A" />
        <WatchSelector watches={watches} value={slugB} onChange={setSlugB} label="Watch B" />
      </div>

      {watchA && watchB && (
        <div className="text-center mb-8">
          <button onClick={handleCompare} className="btn-gold text-base px-8 py-3">
            View Full Comparison →
          </button>
        </div>
      )}

      {/* Comparison preview */}
      {watchA && watchB && (
        <>
          {/* Spec table */}
          <div className="card overflow-hidden mb-8">
            <div className="grid grid-cols-3 bg-[#f8fafc] px-4 py-3 border-b border-[#e2e8f0]">
              <div className="text-[#475569] text-sm font-medium">Specification</div>
              <div className="text-[#0f172a] font-semibold text-sm">{watchA.brand} {watchA.name}</div>
              <div className="text-[#0f172a] font-semibold text-sm">{watchB.brand} {watchB.name}</div>
            </div>
            {SPEC_ROWS.map((row, i) => {
              const valA = row.key(watchA)
              const valB = row.key(watchB)
              const differ = valA !== valB
              return (
                <div key={row.label} className={`grid grid-cols-3 px-4 py-3 text-sm border-b border-[#e2e8f0] last:border-0 ${i % 2 === 0 ? 'bg-white' : 'bg-[#f8fafc]'}`}>
                  <div className="text-[#475569]">{row.label}</div>
                  <div className={`capitalize ${differ ? 'text-[#b8860b] font-medium' : 'text-[#0f172a]'}`}>{valA}</div>
                  <div className={`capitalize ${differ ? 'text-[#b8860b] font-medium' : 'text-[#0f172a]'}`}>{valB}</div>
                </div>
              )
            })}
          </div>

          {/* Ratings columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card p-6">
              <WatchColumn watch={watchA} />
            </div>
            <div className="card p-6">
              <WatchColumn watch={watchB} />
            </div>
          </div>
        </>
      )}

      {/* Popular comparisons */}
      <div className="mt-14">
        <h2 className="text-xl font-bold text-[#0f172a] mb-5">Popular Comparisons</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {topComparisons.map((c) => {
            const wa = getWatchBySlug(c.slug1)
            const wb = getWatchBySlug(c.slug2)
            if (!wa || !wb) return null
            return (
              <Link
                key={`${c.slug1}-${c.slug2}`}
                href={`/compare/${c.slug1}-vs-${c.slug2}`}
                className="card p-4 hover:border-[#b8860b]/40 transition-colors group"
              >
                <div className="flex items-center gap-1.5">
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-[#94a3b8] uppercase">{wa.brand}</p>
                    <p className="text-[#0f172a] text-xs font-semibold truncate">{wa.name}</p>
                  </div>
                  <div className="text-[#b8860b] font-bold text-xs shrink-0">VS</div>
                  <div className="flex-1 min-w-0 text-right">
                    <p className="text-[10px] text-[#94a3b8] uppercase">{wb.brand}</p>
                    <p className="text-[#0f172a] text-xs font-semibold truncate">{wb.name}</p>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
