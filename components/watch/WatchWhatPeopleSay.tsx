/**
 * "What People Say" Section - Tag-cloud style list of most common pros/cons
 * For MVP, this is fully static/manual
 * TODO: Pull from aggregated review sentiment or watch.pros/cons fields once available
 */

export default function WatchWhatPeopleSay() {
  // TODO: Aggregate from reviews table or computed field
  // For MVP: static content
  
  const commonPros = [
    'Build Quality',
    'Resale Value',
    'Reliability',
    'Design',
    'Water Resistant',
  ]

  const commonCons = [
    'Expensive',
    'Difficult to Buy',
    'Heavy',
    'Service Costs',
  ]

  return (
    <section className="py-8 border-b border-[#e2e8f0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-[#0f172a] mb-6">What People Say</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Common Pros */}
          <div>
            <h3 className="text-lg font-bold text-[#0f172a] mb-3">Top Strengths</h3>
            <div className="flex flex-wrap gap-2">
              {commonPros.map((pro, i) => (
                <span
                  key={i}
                  className="px-3 py-1 bg-[#dbeafe] text-[#0c4a6e] rounded-full text-sm font-semibold"
                >
                  {pro}
                </span>
              ))}
            </div>
          </div>

          {/* Common Cons */}
          <div>
            <h3 className="text-lg font-bold text-[#0f172a] mb-3">Common Concerns</h3>
            <div className="flex flex-wrap gap-2">
              {commonCons.map((con, i) => (
                <span
                  key={i}
                  className="px-3 py-1 bg-[#fee2e2] text-[#7f1d1d] rounded-full text-sm font-semibold"
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
