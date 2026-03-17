import type { Watch } from '@/lib/types'

interface WatchWhatPeopleSayProps {
  watch: Watch
}

/**
 * "What People Say" Section - Tag-cloud style list of most common pros/cons
 * Pulls from watch.pros and watch.cons fields
 */

export default function WatchWhatPeopleSay({ watch }: WatchWhatPeopleSayProps) {
  const commonPros = watch.pros
  const commonCons = watch.cons

  return (
    <section className="py-8 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-textPrimary mb-6">What People Say</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Common Pros */}
          <div>
            <h3 className="text-lg font-bold text-textPrimary mb-3">Top Strengths</h3>
            <div className="flex flex-wrap gap-2">
              {commonPros.map((pro, i) => (
                <span
                  key={i}
                  className="px-3 py-1 bg-winnerBg text-winner rounded-full text-sm font-semibold"
                >
                  {pro}
                </span>
              ))}
            </div>
          </div>

          {/* Common Cons */}
          <div>
            <h3 className="text-lg font-bold text-textPrimary mb-3">Common Concerns</h3>
            <div className="flex flex-wrap gap-2">
              {commonCons.map((con, i) => (
                <span
                  key={i}
                  className="px-3 py-1 bg-surfaceAlt text-textMuted rounded-full text-sm font-semibold"
                >
                  {con}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
