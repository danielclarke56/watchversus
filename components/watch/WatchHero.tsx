import Image from 'next/image'
import type { Watch } from '@/lib/types'

interface WatchHeroProps {
  watch: Watch
  reviewCount: number
}

function fmt(usd: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(usd)
}

export default function WatchHero({ watch, reviewCount }: WatchHeroProps) {
  return (
    <section className="py-10 md:py-14 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 md:gap-12 items-center">
          {/* Watch Image */}
          <div className="md:col-span-2">
            {watch.image ? (
              <div className="relative w-full h-80 md:h-96 bg-surfaceAlt rounded-xl border border-border flex items-center justify-center overflow-hidden">
                <Image
                  src={watch.image}
                  alt={watch.imageAlt ?? `${watch.brand} ${watch.name}`}
                  fill
                  className="object-contain p-6"
                  priority
                />
              </div>
            ) : (
              <div className="w-full h-80 md:h-96 bg-surfaceAlt rounded-xl border border-border flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-2 rounded-full border-2 border-border flex items-center justify-center">
                    <svg className="w-8 h-8 text-borderStrong" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="9" strokeWidth="1.5" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 7v5l3 3" />
                    </svg>
                  </div>
                  <p className="text-textMuted text-sm">Image coming soon</p>
                </div>
              </div>
            )}
          </div>

          {/* Headline, Price & Metrics */}
          <div className="md:col-span-3 space-y-5">
            {/* Brand overline */}
            <p className="text-sm font-semibold text-textMuted uppercase tracking-widest">
              {watch.brand}
            </p>

            {/* Watch Name (H1) */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-textPrimary -mt-2">
              {watch.name}
            </h1>

            {/* Price block */}
            <div className="space-y-1">
              <p className="text-xl md:text-2xl font-bold text-textPrimary">
                {fmt(watch.price_new_usd.min)} – {fmt(watch.price_new_usd.max)}{' '}
                <span className="text-sm font-normal text-textMuted">new</span>
              </p>
              <p className="text-sm text-textSecond">
                {fmt(watch.price_preowned_usd.min)} – {fmt(watch.price_preowned_usd.max)} pre-owned
              </p>
            </div>

            {/* Score + buy again + votes — single row */}
            <div className="flex flex-wrap items-center gap-4 text-sm md:text-base">
              <div className="flex items-center gap-1.5 bg-surfaceAlt px-3 py-1.5 rounded-full border border-border">
                <span className="text-base">⭐</span>
                <span className="font-bold text-textPrimary">{watch.score.toFixed(1)}</span>
                <span className="text-textMuted text-xs">/10</span>
              </div>

              <div className="flex items-center gap-1.5 bg-surfaceAlt px-3 py-1.5 rounded-full border border-border">
                <span className="text-base">👍</span>
                <span className="font-bold text-textPrimary">{watch.buy_again_pct}%</span>
                <span className="text-textMuted text-xs">would buy again</span>
              </div>

              {reviewCount > 0 && (
                <span className="text-textMuted text-sm">
                  {reviewCount} review{reviewCount !== 1 ? 's' : ''}
                </span>
              )}
            </div>

            {/* Tagline */}
            <p className="text-lg text-textSecond italic border-l-2 border-accent pl-4">
              &quot;{watch.tagline}&quot;
            </p>

            {/* Reference + year */}
            <p className="text-sm text-textMuted">
              Ref. {watch.reference} · Introduced {watch.year_introduced}
            </p>

          </div>
        </div>
      </div>
    </section>
  )
}
