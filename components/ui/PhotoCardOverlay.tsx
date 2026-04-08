interface PhotoCardOverlayProps {
  label?: string | null
  sublabel?: string | null
  alwaysVisible?: boolean
}

export default function PhotoCardOverlay({ label, sublabel, alwaysVisible = false }: PhotoCardOverlayProps) {
  if (!label && !sublabel) return null

  return (
    <div
      className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-2 transition-opacity ${
        alwaysVisible ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
      }`}
    >
      {label && <p className="text-white text-xs font-medium truncate">{label}</p>}
      {sublabel && <p className="text-white/70 text-[10px] truncate">{sublabel}</p>}
    </div>
  )
}
