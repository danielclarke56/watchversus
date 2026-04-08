interface PhotoCountBadgeProps {
  count: number
  variant?: 'pill' | 'badge'
  showIcon?: boolean
}

export default function PhotoCountBadge({ count, variant = 'pill', showIcon = false }: PhotoCountBadgeProps) {
  if (count <= 1) return null

  const base = 'absolute top-1.5 right-1.5 bg-black/60 text-white font-semibold px-1.5 py-0.5'
  const cls = variant === 'badge'
    ? `${base} text-xs rounded-md flex items-center gap-1 top-2 right-2`
    : `${base} text-[10px] rounded-full`

  return (
    <span className={cls}>
      {showIcon && <span>🖼</span>}
      <span>{count}</span>
    </span>
  )
}
