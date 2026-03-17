import type { Watch } from '@/lib/types'

interface WatchSpecsProps {
  watch: Watch
}

/**
 * Key Specs - Simple table/grid of 5 essential fields
 * Pulls from existing watch data schema
 */
export default function WatchSpecs({ watch }: WatchSpecsProps) {
  const specs = [
    {
      label: 'Case size',
      value: `${watch.case_diameter_mm}mm`,
    },
    {
      label: 'Thickness',
      value: `${watch.case_thickness_mm}mm`,
    },
    {
      label: 'Movement',
      value: watch.movement_type.charAt(0).toUpperCase() + watch.movement_type.slice(1),
    },
    {
      label: 'Water resistance',
      value: `${watch.water_resistance_m}m`,
    },
    {
      label: 'Crystal',
      value: watch.crystal.charAt(0).toUpperCase() + watch.crystal.slice(1),
    },
  ]

  return (
    <section className="py-8 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-textPrimary mb-6">Key Specs</h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {specs.map((spec, i) => (
            <div key={i} className="card p-4 text-center">
              <p className="text-xs font-semibold text-textMuted uppercase tracking-wide mb-1">
                {spec.label}
              </p>
              <p className="text-lg font-bold text-textPrimary">{spec.value}</p>
            </div>
          ))}
        </div>

        {/* Extended Specs Reference */}
        <div className="mt-6 p-4 bg-surfaceAlt rounded-lg border border-border">
          <p className="text-xs text-textMuted font-semibold mb-2">Additional specs:</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-textMuted">Reference:</span>
              <span className="ml-2 font-semibold text-textPrimary">{watch.reference}</span>
            </div>
            <div>
              <span className="text-textMuted">Case material:</span>
              <span className="ml-2 font-semibold text-textPrimary">{watch.case_material}</span>
            </div>
            <div>
              <span className="text-textMuted">Bracelet:</span>
              <span className="ml-2 font-semibold text-textPrimary">{watch.bracelet_material}</span>
            </div>
            <div>
              <span className="text-textMuted">Movement:</span>
              <span className="ml-2 font-semibold text-textPrimary">{watch.movement_caliber}</span>
            </div>
            <div>
              <span className="text-textMuted">Power reserve:</span>
              <span className="ml-2 font-semibold text-textPrimary">{watch.power_reserve_hours}h</span>
            </div>
            <div>
              <span className="text-textMuted">Introduced:</span>
              <span className="ml-2 font-semibold text-textPrimary">{watch.year_introduced}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
