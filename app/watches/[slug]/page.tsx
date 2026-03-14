import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { watches, getWatchBySlug, getReviewsForWatch, calcAverageRatings, calcOverallRating, formatPrice, popularComparisons } from '@/lib/watches'
import RatingBar from '@/components/RatingBar'
import StarRating from '@/components/StarRating'
import ReviewCard from '@/components/ReviewCard'
import ReviewForm from './ReviewForm'

export async function generateStaticParams() {
  return watches.map((w) => ({ slug: w.slug }))
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const watch = getWatchBySlug(params.slug)
  if (!watch) return {}
  return {
    title: `${watch.brand} ${watch.name} Review & Specs`,
    description: `Read community reviews, full specs, and pricing for the ${watch.brand} ${watch.name} (${watch.reference}). ${watch.description.slice(0, 120)}...`,
    openGraph: {
      title: `${watch.brand} ${watch.name} — WatchVersus`,
      description: watch.description,
    },
  }
}

const RATING_LABELS: Record<string, string> = {
  value_for_money: 'Value for Money',
  build_quality: 'Build Quality',
  movement_reliability: 'Movement Reliability',
  daily_wearability: 'Daily Wearability',
  resale_strength: 'Resale Strength',
}

export default function WatchPage({ params }: { params: { slug: string } }) {
  const watch = getWatchBySlug(params.slug)
  if (!watch) notFound()

  const reviews = getReviewsForWatch(watch.id)
  const avgRatings = calcAverageRatings(reviews)
  const overallRating = avgRatings ? calcOverallRating(avgRatings) : null

  const relatedComparisons = popularComparisons
    .filter((c) => c.slug1 === watch.slug || c.slug2 === watch.slug)
    .slice(0, 4)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumb */}
      <nav className="text-sm text-slate-500 mb-6 flex items-center gap-2">
        <Link href="/watches" className="hover:text-[#d4a853] transition-colors">Watches</Link>
        <span>/</span>
        <span className="text-white">{watch.brand} {watch.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Header */}
          <div>
            <div className="flex flex-wrap gap-2 mb-3">
              {watch.style.map((s) => (
                <span key={s} className="text-xs uppercase tracking-wider bg-[#d4a853]/10 text-[#d4a853] px-3 py-1 rounded-full border border-[#d4a853]/20 capitalize">
                  {s}
                </span>
              ))}
            </div>
            <p className="text-[#d4a853] font-bold uppercase tracking-widest text-sm mb-1">{watch.brand}</p>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{watch.name}</h1>
            <p className="text-slate-400 mb-4">Ref. {watch.reference} · Introduced {watch.year_introduced}</p>
            <p className="text-slate-300 leading-relaxed">{watch.description}</p>
          </div>

          {/* Image placeholder */}
          <div className="bg-gradient-to-br from-[#1e293b] to-[#0f172a] rounded-xl border border-[#334155] aspect-video flex items-center justify-center">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-3 rounded-full border-2 border-[#334155] flex items-center justify-center">
                <svg className="w-10 h-10 text-[#334155]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="9" strokeWidth="1.5" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 7v5l3 3" />
                </svg>
              </div>
              <p className="text-slate-600 text-sm">Watch image coming soon</p>
            </div>
          </div>

          {/* Specs table */}
          <div>
            <h2 className="text-xl font-bold text-white mb-4">Full Specifications</h2>
            <div className="card overflow-hidden">
              <table className="w-full text-sm">
                <tbody>
                  {[
                    ['Case Diameter', `${watch.case_diameter_mm}mm`],
                    ['Case Thickness', `${watch.case_thickness_mm}mm`],
                    ['Lug Width', `${watch.lug_width_mm}mm`],
                    ['Lug-to-Lug', `${watch.lug_to_lug_mm}mm`],
                    ['Movement Type', watch.movement_type],
                    ['Caliber', watch.movement_caliber],
                    ['Power Reserve', watch.power_reserve_hours ? `${watch.power_reserve_hours}h` : 'N/A (quartz)'],
                    ['Water Resistance', `${watch.water_resistance_m}m`],
                    ['Crystal', watch.crystal],
                    ['Case Material', watch.case_material],
                    ['Bracelet/Strap', watch.bracelet_material],
                    ['Price (New)', formatPrice(watch.price_new_usd)],
                    ['Price (Pre-owned)', formatPrice(watch.price_preowned_usd)],
                  ].map(([label, value], i) => (
                    <tr key={label} className={i % 2 === 0 ? 'bg-[#1e293b]' : 'bg-[#0f172a]'}>
                      <td className="px-4 py-3 text-slate-400 font-medium w-1/2">{label}</td>
                      <td className="px-4 py-3 text-white capitalize">{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Community ratings */}
          {avgRatings && (
            <div>
              <h2 className="text-xl font-bold text-white mb-4">Community Ratings</h2>
              <div className="card p-5 space-y-3">
                {Object.entries(avgRatings).map(([key, val]) => (
                  <RatingBar key={key} label={RATING_LABELS[key] || key} value={val} />
                ))}
              </div>
            </div>
          )}

          {/* Reviews */}
          <div>
            <h2 className="text-xl font-bold text-white mb-4">
              Community Reviews
              {reviews.length > 0 && (
                <span className="text-slate-500 font-normal text-base ml-2">({reviews.length})</span>
              )}
            </h2>
            {reviews.length === 0 ? (
              <div className="card p-6 text-center text-slate-400">
                No reviews yet — be the first!
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map((r) => (
                  <ReviewCard key={r.id} review={r} showWatch={false} />
                ))}
              </div>
            )}
          </div>

          {/* Review form */}
          <ReviewForm watchId={watch.id} watchName={`${watch.brand} ${watch.name}`} />
        </div>

        {/* Right sidebar */}
        <div className="space-y-5">
          {/* Overall rating */}
          {overallRating && (
            <div className="card p-5 text-center">
              <p className="text-slate-400 text-xs uppercase tracking-wider mb-2">Community Score</p>
              <div className="text-5xl font-bold text-[#d4a853] mb-2">{overallRating.toFixed(1)}</div>
              <StarRating rating={overallRating} size="md" />
              <p className="text-slate-500 text-xs mt-2">Based on {reviews.length} review{reviews.length !== 1 ? 's' : ''}</p>
            </div>
          )}

          {/* Buy buttons */}
          <div className="card p-5">
            <h3 className="text-white font-semibold mb-4">Buy This Watch</h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-slate-500 mb-1">New: {formatPrice(watch.price_new_usd)}</p>
                <p className="text-xs text-slate-500 mb-3">Pre-owned: {formatPrice(watch.price_preowned_usd)}</p>
              </div>
              <a
                href={watch.chrono24_url}
                className="block w-full text-center bg-[#d4a853] text-[#0f172a] font-semibold px-4 py-2.5 rounded-lg hover:bg-[#e4c07a] transition-colors text-sm"
              >
                Buy on Chrono24 ↗
              </a>
              <a
                href={watch.watchbox_url}
                className="block w-full text-center border border-[#334155] text-slate-300 font-medium px-4 py-2.5 rounded-lg hover:border-[#d4a853]/40 hover:text-white transition-colors text-sm"
              >
                Buy on WatchBox ↗
              </a>
              <a
                href={watch.jomashop_url}
                className="block w-full text-center border border-[#334155] text-slate-300 font-medium px-4 py-2.5 rounded-lg hover:border-[#d4a853]/40 hover:text-white transition-colors text-sm"
              >
                Buy on Jomashop ↗
              </a>
              <p className="text-xs text-slate-600 text-center pt-1">Affiliate links — we may earn a commission</p>
            </div>
          </div>

          {/* Compare CTA */}
          <div className="card p-5">
            <h3 className="text-white font-semibold mb-3">Compare with Another Watch</h3>
            <Link
              href={`/compare?a=${watch.slug}`}
              className="block w-full text-center btn-outline"
            >
              Start Comparison
            </Link>
          </div>

          {/* Related comparisons */}
          {relatedComparisons.length > 0 && (
            <div className="card p-5">
              <h3 className="text-white font-semibold mb-4">Related Comparisons</h3>
              <div className="space-y-2">
                {relatedComparisons.map((c) => {
                  const other = c.slug1 === watch.slug ? c.slug2 : c.slug1
                  const otherSlug = other
                  return (
                    <Link
                      key={`${c.slug1}-${c.slug2}`}
                      href={`/compare/${c.slug1}-vs-${c.slug2}`}
                      className="block text-sm text-slate-400 hover:text-[#d4a853] transition-colors py-1 border-b border-[#334155] last:border-0"
                    >
                      vs {otherSlug.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                    </Link>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
