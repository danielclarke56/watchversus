interface Props {
  label: string
  value: number
  max?: number
}

export default function RatingBar({ label, value, max = 5 }: Props) {
  const pct = (value / max) * 100

  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-slate-400 w-36 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-[#334155] rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[#d4a853] to-[#e4c07a] rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs font-semibold text-[#d4a853] w-8 text-right">{value.toFixed(1)}</span>
    </div>
  )
}
