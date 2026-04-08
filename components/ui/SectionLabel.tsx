interface SectionLabelProps {
  children: React.ReactNode
  className?: string
}

export default function SectionLabel({ children, className = '' }: SectionLabelProps) {
  return (
    <p className={`text-[10px] uppercase tracking-wide text-gray-400 font-semibold ${className}`}>
      {children}
    </p>
  )
}
