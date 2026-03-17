import type { Watch } from '@/lib/types'

interface WatchVerdictProps {
  watch: Watch
}

/**
 * Quick Verdict - Three subsections for quick decision-making
 */
export default function WatchVerdict({ watch }: WatchVerdictProps) {
  const verdict = watch.verdict

  return (
    <section className="py-8 border-b border-[#e2e8f0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="card p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Who It&apos;s For */}
            <div>
              <h3 className="text-lg font-bold text-[#0f172a] mb-2">Who it&apos;s for</h3>
              <p className="text-[#475569]">{verdict.who_its_for}</p>
            </div>

            {/* Who Should Skip */}
            <div>
              <h3 className="text-lg font-bold text-[#0f172a] mb-2">Who should skip</h3>
              <p className="text-[#475569]">{verdict.who_should_skip}</p>
            </div>

            {/* Final Take */}
            <div>
              <h3 className="text-lg font-bold text-[#0f172a] mb-2">Final take</h3>
              <p className="text-[#475569]">{verdict.final_take}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
