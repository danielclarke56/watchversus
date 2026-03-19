import type { Watch } from '@/lib/types'

interface WatchSpecsProps {
  watch: Watch
}

/**
 * Full Specs — single consolidated table with all watch specifications.
 * No more split between "key" and "additional" specs.
 */
export default function WatchSpecs({ watch }: WatchSpecsProps) {
  const specs: { label: string; value: string }[] = [
    { label: 'Case diameter', value: `${watch.case_diameter_mm}mm` },
    { label: 'Case thickness', value: `${watch.case_thickness_mm}mm` },
    { label: 'Lug-to-lug', value: `${watch.lug_to_lug_mm}mm` },
    { label: 'Lug width', value: `${watch.lug_width_mm}mm` },
    { label: 'Case material', value: watch.case_material },
    { label: 'Crystal', value: watch.crystal.charAt(0).toUpperCase() + watch.crystal.slice(1) },
    { label: 'Movement', value: `${watch.movement_type.charAt(0).toUpperCase() + watch.movement_type.slice(1)} — ${watch.movement_caliber}` },
    { label: 'Power reserve', value: `${watch.power_reserve_hours} hours` },
    { label: 'Water resistance', value: `${watch.water_resistance_m}m` },
    { label: 'Bracelet / strap', value: watch.bracelet_material },
    { label: 'Reference', value: watch.reference },
    { label: 'Year introduced', value: String(watch.year_introduced) },
  ]

  return (
    <section id="specs" className="pb-10 border-b border-border">
        <h2 className="text-2xl font-bold text-textPrimary mb-6">Full Specifications</h2>

        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <tbody>
              {specs.map((spec, i) => (
                <tr
                  key={spec.label}
                  className={i % 2 === 0 ? 'bg-surface' : 'bg-surfaceAlt'}
                >
                  <td className="px-5 py-3.5 font-medium text-textMuted w-2/5 sm:w-1/3">
                    {spec.label}
                  </td>
                  <td className="px-5 py-3.5 font-semibold text-textPrimary">
                    {spec.value}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
    </section>
  )
}
