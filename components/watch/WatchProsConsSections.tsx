import type { Watch } from '@/lib/types'

interface WatchProsCosnsProps {
  watch: Watch
}

/**
 * Pros/Cons Section - Two-column layout (stacks on mobile)
 * TODO: Pull from watch data once schema includes pros/cons arrays
 */
export default function WatchProsConsSections({ watch }: WatchProsCosnsProps) {
  // TODO: Pull from watch.pros and watch.cons once data schema is updated
  // For MVP: Using placeholder content for first watch (rolex-submariner-41)
  // Graceful stub for other watches
  
  const pros = watch.slug === 'rolex-submariner-41'
    ? [
        'Exceptional build quality and durability',
        'Excellent resale value and availability',
        'Iconic design with decades of heritage',
        'Reliable automatic movement',
        'Water resistant to 300m for everyday use',
      ]
    : [
        'Add pros here',
        'Item 2',
        'Item 3',
      ]

  const cons = watch.slug === 'rolex-submariner-41'
    ? [
        'Significant premium over competitors',
        'Long waitlists at authorized dealers',
        'Thick bracelet may feel heavy for some',
        'Service costs can be expensive',
      ]
    : [
        'Add cons here',
        'Item 2',
      ]

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
