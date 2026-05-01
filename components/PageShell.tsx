import { l } from '@/lib/styles'

interface Props {
  children: React.ReactNode
  width?: 'sm' | 'md' | 'lg' | 'full'
  className?: string
}

const widths = {
  sm:   l.prose,         // max-w-2xl — tight reading column
  md:   l.page,          // max-w-3xl — standard page
  lg:   l.pageWide,      // max-w-5xl — wide content
  full: l.pageFull,      // max-w-7xl — full-width
}

export function PageShell({ children, width = 'md', className = '' }: Props) {
  return (
    <div className={`${widths[width]} py-10 ${className}`}>
      {children}
    </div>
  )
}
