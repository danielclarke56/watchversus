import Link from 'next/link'
import type { Watch } from '@/lib/types'
import { formatPrice, calcAverageRatings, calcOverallRating, getReviewsForWatch } from '@/lib/watches'
import StarRating from './StarRating'

interface Props {
  watch: Watch
  showCompareButton?: boolean
}

export default function WatchCard({ watch, showCompareButton = true }: Props) {
  const reviews = getReviewsForWatch(watch.id)
  const avgRatings = calcAverageRatings(reviews)
  const overallRating = avgRatings ? calcOverallRating(avgRatings) : null

  return (
    <div className="card hover:border-[#b8860b]/40 transition-colors group flex flex-col">
      {/* Watch image */}
      <div className="relative bg-[#f8fafc] h-56 flex items-center justify-center overflow-hidden">
        {watch.image ? (
          <img
            src={watch.image}
            alt={watch.imageAlt ?? `${watch.brand} ${watch.name}`}
            className="w-full h-full object-contain p-2 transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="text-center px-4">
            <div className="w-16 h-16 mx-auto mb-2 rounded-full border-2 border-[#e2e8f0] flex items-center justify-center">
              <svg className="w-7 h-7 text-[#e2e8f0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="9" strokeWidth="1.5" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 7v5l3 3" />
              </svg>
            </div>
            <p className="text-[10px] text-[#94a3b8] uppercase tracking-widest">Image Coming Soon</p>
          </div>
        )}
        <div className="absolute top-2 left-2 flex flex-wrap gap-1">
          {watch.style.slice(0, 2).map((s) => (
            <span key={s} className="text-[10px] uppercase tracking-wider bg-white/80 text-[#b8860b] px-2 py-0.5 rounded-full border border-[#b8860b]/30">
              {s}
            </span>
          ))}
        </div>
      </div>

      <div className="p-4 flex flex-col flex-1">
        <p className="text-xs text-[#b8860b] font-semibold uppercase tracking-wider mb-1">{watch.brand}</p>
        <h3 className="text-[#0f172a] font-semibold text-base leading-tight mb-1 group-hover:text-[#b8860b] transition-colors">
          {watch.name}
        </h3>
        <p className="text-[#94a3b8] text-xs mb-3">Ref. {watch.reference}</p>

        <div className="flex items-center gap-2 mb-3">
          {overallRating ? (
            <>
              <StarRating rating={overallRating} size="sm" />
              <span className="text-[#475569] text-xs">({reviews.length} review{reviews.length !== 1 ? 's' : ''})</span>
            </>
          ) : (
            <span className="text-[#94a3b8] text-xs">No reviews yet</span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-1 mb-4 text-xs">
          <span className="text-[#94a3b8]">Case</span>
          <span className="text-[#475569]">{watch.case_diameter_mm}mm</span>
          <span className="text-[#94a3b8]">Movement</span>
          <span className="text-[#475569] capitalize">{watch.movement_type}</span>
          <span className="text-[#94a3b8]">WR</span>
          <span className="text-[#475569]">{watch.water_resistance_m}m</span>
        </div>

        <div className="mt-auto flex items-center justify-between gap-2">
          <div>
            <p className="text-[10px] text-[#94a3b8] uppercase tracking-wider">New</p>
            <p className="text-[#b8860b] font-semibold text-sm">{formatPrice(watch.price_new_usd)}</p>
          </div>
          <div className="flex gap-2">
            {showCompareButton && (
              <Link
                href={`/compare?a=${watch.slug}`}
                className="text-xs text-[#475569] hover:text-[#b8860b] border border-[#e2e8f0] hover:border-[#b8860b]/40 px-3 py-1.5 rounded-lg transition-colors"
              >
                Compare
              </Link>
            )}
            <Link
              href={`/watches/${watch.slug}`}
              className="text-xs bg-[#b8860b] text-white font-semibold px-3 py-1.5 rounded-lg hover:bg-[#d4a853] transition-colors"
            >
              View
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
