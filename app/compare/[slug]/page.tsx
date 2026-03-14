import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getWatchBySlug, getReviewsForWatch, calcAverageRatings, calcOverallRating, formatPrice, popularComparisons } from '@/lib/watches'
import RatingBar from '@/components/RatingBar'
import StarRating from '@/components/StarRating'

export async function generateStaticParams() {
  return popularComparisons.map((c) => ({
    slug: `${c.slug1}-vs-${c.slug2}`,
  }))
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const parts = params.slug.split('-vs-')
  if (parts.length !== 2) return {}
  const w1 = getWatchBySlug(parts[0])
  const w2 = getWatchBySlug(parts[1])
  if (!w1 || !w2) return {}
  return {
    title: `${w1.brand} ${w1.name} vs ${w2.brand} ${w2.name}`,
    description: `Head-to-head comparison: ${w1.brand} ${w1.name} vs ${w2.brand} ${w2.name}. Full specs, community ratings, and pricing compared side-by-side.`,
    openGraph: {
      title: `${w1.name} vs ${w2.name} — WatchVersus`,
      description: `Which is better? Full head-to-head comparison with community ratings.`,
    },
  }
}

const SPEC_ROWS: Array<{ label: string; fn: (w: ReturnType<typeof getWatchBySlug>) => string }> = [
  { label: 'Case Diameter', fn: (w) => `${w!.case_diameter_mm}mm` },
  { label: 'Case Thickness', fn: (w) => `${w!.case_thickness_mm}mm` },
  { label: 'Lug Width', fn: (w) => `${w!.lug_width_mm}mm` },
  { label: 'Lug-to-Lug', fn: (w) => `${w!.lug_to_lug_mm}mm` },
  { label: 'Movement', fn: (w) => w!.movement_type },
  { label: 'Caliber', fn: (w) => w!.movement_caliber },
  { label: 'Power Reserve', fn: (w) => w!.power_reserve_hours ? `${w!.power_reserve_hours}h` : 'Quartz' },
  { label: 'Water Resistance', fn: (w) => `${w!.water_resistance_m}m` },
  { label: 'Crystal', fn: (w) => w!.crystal },
  { label: 'Case Material', fn: (w) => w!.case_material },
  { label: 'Bracelet/Strap', fn: (w) => w!.bracelet_material },
  { label: 'Price (New)', fn: (w) => formatPrice(w!.price_new_usd) },
  { label: 'Price (Pre-owned)', fn: (w) => formatPrice(w!.price_preowned_usd) },
  { label: 'Style', fn: (w) => w!.style.join(', ') },
]

const RATING_LABELS: Record<string, string> = {
  value_for_money: 'Value for Money',
  build_quality: 'Build Quality',
  movement_reliability: 'Movement Reliability',
  daily_wearability: 'Daily Wearability',
  resale_strength: 'Resale Strength',
}

export default function ComparisonPage({ params }: { params: { slug: string } }) {
  const vsIndex = params.slug.indexOf('-vs-')
  if (vsIndex === -1) notFound()

  const slug1 = params.slug.slice(0, vsIndex)
  const slug2 = params.slug.slice(vsIndex + 4)

  const w1 = getWatchBySlug(slug1)
  const w2 = getWatchBySlug(slug2)

  if (!w1 || !w2) notFound()

  const reviews1 = getReviewsForWatch(w1.id)
  const reviews2 = getReviewsForWatch(w2.id)
  const avg1 = calcAverageRatings(reviews1)
  const avg2 = calcAverageRatings(reviews2)
  const overall1 = avg1 ? calcOverallRating(avg1) : null
  const overall2 = avg2 ? calcOverallRating(avg2) : null

  const relatedComparisons = popularComparisons
    .filter((c) => `${c.slug1}-vs-${c.slug2}` !== params.slug && (c.slug1 === slug1 || c.slug2 === slug2 || c.slug1 === slug2 || c.slug2 === slug1))
    .slice(0, 4)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumb */}
      <nav className="text-sm text-slate-500 mb-6 flex items-center gap-2">
        <Link href="/compare" className="hover:text-[#d4a853] transition-colors">Compare</Link>
        <span>/</span>
        <span className="text-white">{w1.name} vs {w2.name}</span>
      </nav>

      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
          {w1.brand} {w1.name} <span className="text-[#d4a853]">vs</span> {w2.brand} {w2.name}
        </h1>
        <p className="text-slate-400">Head-to-head comparison · Community ratings · Pricing</p>
      </div>

      {/* Watch headers */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        {[w1, w2].map((w, i) => {
          const overall = i === 0 ? overall1 : overall2
          const revCount = i === 0 ? reviews1.length : reviews2.length
          return (
            <div key={w.id} className="card p-6 text-center">
              <div className="bg-gradient-to-br from-[#1e293b] to-[#0f172a] rounded-xl border border-[#334155] aspect-square max-w-32 mx-auto flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-[#334155]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="9" strokeWidth="1" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 7v5l3 3" />
                </svg>
              </div>
              <p className="text-xs text-[#d4a853] font-bold uppercase tracking-wider mb-1">{w.brand}</p>
              <h2 className="text-lg font-bold text-white mb-1">{w.name}</h2>
              <p className="text-slate-500 text-xs mb-3">Ref. {w.reference}</p>
              {overall ? (
                <div className="flex flex-col items-center gap-1">
                  <div className="text-2xl font-bold text-[#d4a853]">{overall.toFixed(1)}</div>
                  <StarRating rating={overall} size="sm" />
                  <span className="text-xs text-slate-500">{revCount} review{revCount !== 1 ? 's' : ''}</span>
                </div>
              ) : (
                <span className="text-xs text-slate-500">No reviews yet</span>
              )}
              <Link href={`/watches/${w.slug}`} className="text-xs text-[#d4a853] hover:underline block mt-3">
                Full specs →
              </Link>
            </div>
          )
        })}
      </div>

      {/* Spec comparison table */}
      <div className="card overflow-hidden mb-8">
        <div className="bg-[#1e293b] px-4 py-3 border-b border-[#334155]">
          <h2 className="text-white font-semibold">Specifications Compared</h2>
        </div>
        <div className="grid grid-cols-3 bg-[#0f172a] px-4 py-2 border-b border-[#334155] text-xs text-slate-500 uppercase tracking-wider">
          <div>Specification</div>
          <div>{w1.brand} {w1.name}</div>
          <div>{w2.brand} {w2.name}</div>
        </div>
        {SPEC_ROWS.map((row, i) => {
          const v1 = row.fn(w1)
          const v2 = row.fn(w2)
          const differ = v1 !== v2
          return (
            <div key={row.label} className={`grid grid-cols-3 px-4 py-3 text-sm border-b border-[#334155] last:border-0 ${i % 2 === 0 ? 'bg-[#1e293b]' : 'bg-[#0f172a]'}`}>
              <div className="text-slate-400 font-medium">{row.label}</div>
              <div className={`capitalize ${differ ? 'text-[#d4a853] font-semibold' : 'text-white'}`}>{v1}</div>
              <div className={`capitalize ${differ ? 'text-[#d4a853] font-semibold' : 'text-white'}`}>{v2}</div>
            </div>
          )
        })}
      </div>

      {/* Community ratings comparison */}
      {(avg1 || avg2) && (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-white mb-5">Community Ratings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[{ w: w1, avg: avg1, label: `${w1.brand} ${w1.name}` }, { w: w2, avg: avg2, label: `${w2.brand} ${w2.name}` }].map(({ w, avg, label }) => (
              <div key={w.id} className="card p-5">
                <h3 className="text-white font-semibold mb-4 text-sm">{label}</h3>
                {avg ? (
                  <div className="space-y-3">
                    {Object.entries(avg).map(([key, val]) => (
                      <RatingBar key={key} label={RATING_LABELS[key]} value={val} />
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 text-sm">No community ratings yet</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Buy links */}
      <div className="mb-10">
        <h2 className="text-xl font-bold text-white mb-5">Where to Buy</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[w1, w2].map((w) => (
            <div key={w.id} className="card p-5">
              <h3 className="text-white font-semibold mb-1">{w.brand} {w.name}</h3>
              <p className="text-slate-400 text-sm mb-4">New: {formatPrice(w.price_new_usd)} · Pre-owned: {formatPrice(w.price_preowned_usd)}</p>
              <div className="space-y-2">
                <a href={w.chrono24_url} className="block text-center text-sm bg-[#d4a853] text-[#0f172a] font-semibold px-4 py-2 rounded-lg hover:bg-[#e4c07a] transition-colors">
                  Chrono24 ↗
                </a>
                <a href={w.watchbox_url} className="block text-center text-sm border border-[#334155] text-slate-400 px-4 py-2 rounded-lg hover:border-[#d4a853]/40 hover:text-white transition-colors">
                  WatchBox ↗
                </a>
                <a href={w.jomashop_url} className="block text-center text-sm border border-[#334155] text-slate-400 px-4 py-2 rounded-lg hover:border-[#d4a853]/40 hover:text-white transition-colors">
                  Jomashop ↗
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Related comparisons */}
      {relatedComparisons.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-white mb-5">Related Comparisons</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {relatedComparisons.map((c) => {
              const wa = getWatchBySlug(c.slug1)
              const wb = getWatchBySlug(c.slug2)
              if (!wa || !wb) return null
              return (
                <Link key={`${c.slug1}-${c.slug2}`} href={`/compare/${c.slug1}-vs-${c.slug2}`} className="card p-4 hover:border-[#d4a853]/40 transition-colors group">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-slate-500 uppercase">{wa.brand}</p>
                      <p className="text-white text-xs font-semibold truncate">{wa.name}</p>
                    </div>
                    <div className="text-[#d4a853] font-bold text-xs shrink-0">VS</div>
                    <div className="flex-1 min-w-0 text-right">
                      <p className="text-[10px] text-slate-500 uppercase">{wb.brand}</p>
                      <p className="text-white text-xs font-semibold truncate">{wb.name}</p>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {/* Custom compare CTA */}
      <div className="mt-8 text-center bg-[#1e293b] border border-[#334155] rounded-xl p-8">
        <h3 className="text-white font-semibold text-lg mb-2">Build Your Own Comparison</h3>
        <p className="text-slate-400 text-sm mb-5">Pick any two watches from our database of 50</p>
        <Link href="/compare" className="btn-gold">
          Start a New Comparison
        </Link>
      </div>
    </div>
  )
}
