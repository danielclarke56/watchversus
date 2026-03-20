import Image from 'next/image'
import type { Watch } from '@/lib/types'
import { formatPrice, calcAverageRatings, calcOverallRating, getReviewsForWatch } from '@/lib/watches'
import StarRating from './StarRating'
import { Card } from './ui/Card'
import { Button } from './ui/Button'

interface Props {
  watch: Watch
  showCompareButton?: boolean
}

export default function WatchCard({ watch, showCompareButton = true }: Props) {
  const reviews = getReviewsForWatch(watch.id)
  const avgRatings = calcAverageRatings(reviews)
  const overallRating = avgRatings ? calcOverallRating(avgRatings) : null

  return (
    <Card hover className="group flex flex-col">
      {/* Watch image */}
      <div className="relative bg-surfaceAlt h-44 sm:h-56 flex items-center justify-center overflow-hidden">
        {watch.image ? (
          <Image
            src={watch.image}
            alt={watch.imageAlt ?? `${watch.brand} ${watch.name}`}
            fill
            className="object-contain p-2 transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="text-center px-4">
            <div className="w-16 h-16 mx-auto mb-2 rounded-full border-2 border-border flex items-center justify-center">
              <svg className="w-7 h-7 text-border" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="9" strokeWidth="1.5" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 7v5l3 3" />
              </svg>
            </div>
            <p className="text-[10px] text-textMuted uppercase tracking-widest">Image Coming Soon</p>
          </div>
        )}
        <div className="absolute top-2 left-2 flex flex-wrap gap-1">
          {watch.style.slice(0, 2).map((s) => (
            <span key={s} className="text-[10px] uppercase tracking-wider bg-white/80 text-accent px-2 py-0.5 rounded-full border border-borderStrong">
              {s}
            </span>
          ))}
        </div>
      </div>

      <div className="p-4 flex flex-col flex-1">
        <p className="text-xs text-accent font-semibold uppercase tracking-wider mb-1">{watch.brand}</p>
        <h3 className="text-textPrimary font-semibold text-base leading-tight mb-1 group-hover:text-accent transition-colors">
          {watch.name}
        </h3>
        <p className="text-textMuted text-xs mb-3">Ref. {watch.reference}</p>

        <div className="flex items-center gap-2 mb-3">
          {overallRating ? (
            <>
              <StarRating rating={overallRating} size="sm" />
              <span className="text-textSecond text-xs">({reviews.length} review{reviews.length !== 1 ? 's' : ''})</span>
            </>
          ) : (
            <span className="text-textMuted text-xs">No reviews yet</span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-1 mb-4 text-xs">
          <span className="text-textMuted">Case</span>
          <span className="text-textSecond">{watch.case_diameter_mm}mm</span>
          <span className="text-textMuted">Movement</span>
          <span className="text-textSecond capitalize">{watch.movement_type}</span>
          <span className="text-textMuted">WR</span>
          <span className="text-textSecond">{watch.water_resistance_m}m</span>
        </div>

        <div className="mt-auto flex items-center justify-between gap-2">
          <div>
            <p className="text-[10px] text-textMuted uppercase tracking-wider">New</p>
            <p className="text-accent font-semibold text-sm">{formatPrice(watch.price_new_usd)}</p>
          </div>
          <div className="flex gap-2">
            {showCompareButton && (
              <Button
                href={`/compare?a=${watch.slug}`}
                variant="outline"
                size="sm"
              >
                Compare
              </Button>
            )}
            <Button
              href={`/watches/${watch.slug}`}
              variant="primary"
              size="sm"
            >
              View
            </Button>
          </div>
        </div>
      </div>
      </Card>
  )
}
