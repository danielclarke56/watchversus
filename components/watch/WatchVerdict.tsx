import type { Watch } from '@/lib/types'

interface WatchVerdictProps {
  watch: Watch
}

/**
 * Quick Verdict - Three subsections for quick decision-making
 * TODO: Pull from watch data once schema includes these fields
 */
export default function WatchVerdict({ watch }: WatchVerdictProps) {
  // TODO: Pull from watch.verdict object once schema is updated
  // For MVP: Using placeholder content for first watch
  
  const verdict = watch.slug === 'rolex-submariner-41'
    ? {
        forWho: 'Anyone seeking a luxury sports watch that blends heritage with modern engineering. Perfect for professionals wanting a versatile tool watch.',
        skipWho: 'Budget-conscious buyers should look at Seiko Prospex or Tudor alternatives. Those preferring thinner cases may find the thickness challenging.',
        finalTake: 'The Rolex Submariner remains the gold standard for a reason. It&apos;s not just a watch&mdash;it&apos;s an investment piece that will hold value and turn heads for decades. The asking price is steep, but few watches deliver the same confidence and durability.',
      }
    : {
        forWho: 'Placeholder: Add who this watch is for.',
        skipWho: 'Placeholder: Add who should skip this watch.',
        finalTake: 'Placeholder: Add final take here.',
      }

  return (
    <section className="py-8 border-b border-[#e2e8f0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="card p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Who It&apos;s For */}
            <div>
              <h3 className="text-lg font-bold text-[#0f172a] mb-2">Who it&apos;s for</h3>
              <p className="text-[#475569]">{verdict.forWho}</p>
            </div>

            {/* Who Should Skip */}
            <div>
              <h3 className="text-lg font-bold text-[#0f172a] mb-2">Who should skip</h3>
              <p className="text-[#475569]">{verdict.skipWho}</p>
            </div>

            {/* Final Take */}
            <div>
              <h3 className="text-lg font-bold text-[#0f172a] mb-2">Final take</h3>
              <p className="text-[#475569]">{verdict.finalTake}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
