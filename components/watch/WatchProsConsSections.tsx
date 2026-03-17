import type { Watch } from '@/lib/types'

interface WatchProsCosnsProps {
  watch: Watch
}

/**
 * Pros/Cons Section - Two-column layout (stacks on mobile)
 */
export default function WatchProsConsSections({ watch }: WatchProsCosnsProps) {
  const pros = watch.pros
  const cons = watch.cons

  return (
    <section className="py-8 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Pros */}
          <div className="card p-6">
            <h2 className="text-xl font-bold text-textPrimary mb-4">Pros</h2>
            <ul className="space-y-3">
              {pros.map((pro, i) => (
                <li key={i} className="flex gap-3">
                  <span className="text-winner text-xl flex-shrink-0">✓</span>
                  <span className="text-textSecond">{pro}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Cons */}
          <div className="card p-6">
            <h2 className="text-xl font-bold text-textPrimary mb-4">Cons</h2>
            <ul className="space-y-3">
              {cons.map((con, i) => (
                <li key={i} className="flex gap-3">
                  <span className="text-red-400 text-xl flex-shrink-0">✕</span>
                  <span className="text-textSecond">{con}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
