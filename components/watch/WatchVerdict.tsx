import type { Watch } from '@/lib/types'

interface WatchVerdictProps {
  watch: Watch
}

/**
 * The Verdict — unified section combining final take, who it's for/skip, and pros/cons.
 * Replaces the old separate WatchVerdict + WatchProsConsSections + WatchWhatPeopleSay.
 */
export default function WatchVerdict({ watch }: WatchVerdictProps) {
  const { verdict, pros, cons } = watch

  return (
    <section id="verdict" className="pb-10 border-b border-border">
        <h2 className="text-2xl font-bold text-textPrimary mb-8">The Verdict</h2>

        {/* Final Take — lead with the most important content */}
        <div className="card p-6 md:p-8 mb-8">
          <p className="text-lg md:text-xl text-textPrimary leading-relaxed">
            {verdict.final_take}
          </p>
        </div>

        {/* Who it's for / Who should skip — side by side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-8 h-8 rounded-full bg-winnerBg flex items-center justify-center text-winner text-sm font-bold">✓</span>
              <h3 className="text-lg font-bold text-textPrimary">Who it&apos;s for</h3>
            </div>
            <p className="text-textSecond leading-relaxed">{verdict.who_its_for}</p>
          </div>

          <div className="card p-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-8 h-8 rounded-full bg-surfaceAlt flex items-center justify-center text-loser text-sm font-bold">✕</span>
              <h3 className="text-lg font-bold text-textPrimary">Who should skip</h3>
            </div>
            <p className="text-textSecond leading-relaxed">{verdict.who_should_skip}</p>
          </div>
        </div>

        {/* Pros & Cons — supporting evidence */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card p-6">
            <h3 className="text-lg font-bold text-textPrimary mb-4">Pros</h3>
            <ul className="space-y-3">
              {pros.map((pro, i) => (
                <li key={i} className="flex gap-3">
                  <span className="text-winner text-lg flex-shrink-0 mt-0.5">✓</span>
                  <span className="text-textSecond">{pro}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="card p-6">
            <h3 className="text-lg font-bold text-textPrimary mb-4">Cons</h3>
            <ul className="space-y-3">
              {cons.map((con, i) => (
                <li key={i} className="flex gap-3">
                  <span className="text-loser text-lg flex-shrink-0 mt-0.5">✕</span>
                  <span className="text-textSecond">{con}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
    </section>
  )
}
