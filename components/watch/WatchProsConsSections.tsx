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
    <section className="py-8 border-b border-[#e2e8f0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Pros */}
          <div className="card p-6">
            <h2 className="text-xl font-bold text-[#0f172a] mb-4">Pros</h2>
            <ul className="space-y-3">
              {pros.map((pro, i) => (
                <li key={i} className="flex gap-3">
                  <span className="text-[#059669] text-xl flex-shrink-0">✓</span>
                  <span className="text-[#475569]">{pro}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Cons */}
          <div className="card p-6">
            <h2 className="text-xl font-bold text-[#0f172a] mb-4">Cons</h2>
            <ul className="space-y-3">
              {cons.map((con, i) => (
                <li key={i} className="flex gap-3">
                  <span className="text-[#ef4444] text-xl flex-shrink-0">✕</span>
                  <span className="text-[#475569]">{con}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
