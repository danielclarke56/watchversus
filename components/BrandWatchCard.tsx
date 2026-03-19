import Image from 'next/image'
import Link from 'next/link'
import type { Watch } from '@/lib/types'
import { formatPrice } from '@/lib/watches'

interface Props {
  watch: Watch
}

const categoryLabels: Record<string, string> = {
  dive: 'Dive',
  dress: 'Dress',
  sport: 'Sport',
  gmt: 'GMT',
  field: 'Field',
  casual: 'Casual',
  chronograph: 'Chronograph',
}

export default function BrandWatchCard({ watch }: Props) {
  return (
    <Link
      href={`/watches/${watch.slug}`}
      className="group bg-surface border border-border rounded-sm overflow-hidden hover:border-borderStrong hover:shadow-md transition-all duration-200 flex flex-col"
    >
      {/* Image area */}
      <div className="relative bg-surfaceAlt aspect-square flex items-center justify-center overflow-hidden">
        {watch.image ? (
          <Image
            src={watch.image}
            alt={watch.imageAlt ?? `${watch.brand} ${watch.name}`}
            fill
            className="object-contain p-4 transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="text-center px-4">
            <div className="w-14 h-14 mx-auto mb-2 rounded-full border-2 border-border flex items-center justify-center">
              <svg className="w-6 h-6 text-textMuted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="9" strokeWidth="1.5" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 7v5l3 3" />
              </svg>
            </div>
            <p className="text-[10px] text-textMuted uppercase tracking-widest">Image Coming Soon</p>
          </div>
        )}

        {/* Category badge */}
        {watch.primary_category && (
          <span className="absolute top-3 left-3 text-[10px] uppercase tracking-wider bg-white/90 text-accent font-semibold px-2.5 py-1 rounded-full border border-accent/20">
            {categoryLabels[watch.primary_category] ?? watch.primary_category}
          </span>
        )}

        {/* Score badge */}
        {watch.score > 0 && (
          <span className="absolute top-3 right-3 text-xs font-bold bg-accent text-white w-8 h-8 rounded-full flex items-center justify-center shadow-sm">
            {watch.score.toFixed(1)}
          </span>
        )}
      </div>

      {/* Content area */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="text-textPrimary font-semibold text-sm leading-tight mb-1.5 group-hover:text-accent transition-colors line-clamp-2">
          {watch.name}
        </h3>
        <p className="text-textMuted text-xs mb-3">Ref. {watch.reference}</p>

        {/* Specs row */}
        <div className="flex items-center gap-2 text-[11px] text-textSecond mb-3 flex-wrap">
          <span className="bg-neutral px-2 py-0.5 rounded">{watch.case_diameter_mm}mm</span>
          <span className="bg-neutral px-2 py-0.5 rounded capitalize">{watch.movement_type}</span>
          <span className="bg-neutral px-2 py-0.5 rounded">{watch.water_resistance_m}m WR</span>
        </div>

        {/* Price */}
        <div className="mt-auto pt-3 border-t border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] text-textMuted uppercase tracking-wider">From</p>
              <p className="text-accent font-bold text-sm">{formatPrice(watch.price_new_usd)}</p>
            </div>
            <span className="text-xs text-accent font-medium opacity-0 group-hover:opacity-100 transition-opacity">
              View Details →
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
