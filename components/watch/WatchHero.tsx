import Image from 'next/image'
import type { Watch } from '@/lib/types'

interface WatchHeroProps {
  watch: Watch
  reviewCount: number
}

/**
 * Hero Section - First impression with key metrics
 * Shows: watch image, name (H1), score, would-buy-again %, vote count, one-line verdict
 */
export default function WatchHero({ watch, reviewCount }: WatchHeroProps) {
  return (
    <section className="py-8 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 items-start">
          {/* Watch Image */}
          <div className="md:col-span-2">
            {watch.image ? (
              <div className="relative w-full h-80 bg-surfaceAlt rounded-lg border border-border flex items-center justify-center overflow-hidden">
                <Image
                  src={watch.image}
                  alt={watch.imageAlt ?? `${watch.brand} ${watch.name}`}
                  fill
                  className="object-contain p-4"
                  priority
                />
              </div>
            ) : (
              <div className="w-full h-80 bg-surfaceAlt rounded-lg border border-border flex items-center justify-center">
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

          {/* Headline & Metrics */}
          <div className="md:col-span-3 space-y-4">
            {/* Watch Name (H1 - only one on page) */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-textPrimary">
              {watch.brand} {watch.name}
            </h1>

            {/* Key Metrics Row */}
            <div className="flex flex-wrap gap-3 text-sm md:text-base">
              <div className="flex items-center gap-2">
                <span className="text-lg">⭐</span>
                <span className="font-semibold text-textPrimary">{watch.score.toFixed(1)}</span>
                <span className="text-textMuted">/ 10</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-lg">👍</span>
                <span className="font-semibold text-textPrimary">{watch.buy_again_pct}%</span>
                <span className="text-textMuted">would buy again</span>
              </div>

              <div className="flex items-center gap-2 text-textMuted">
                <span>{reviewCount}</span>
                <span>vote{reviewCount !== 1 ? 's' : ''}</span>
              </div>
            </div>

            {/* One-line Verdict */}
            <p className="text-lg text-textSecond italic">
              &quot;{watch.tagline}&quot;
            </p>

            {/* Watch Reference & Year */}
            <p className="text-sm text-textMuted">
              Ref. {watch.reference} · Introduced {watch.year_introduced}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
