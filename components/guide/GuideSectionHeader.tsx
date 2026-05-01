import { t, l } from '@/lib/styles'

interface Props {
  label: string
  children?: React.ReactNode
  id?: string
}

export function GuideSectionHeader({ label, children, id }: Props) {
  const headingId = id ?? label.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  return (
    <header className={l.sectionHeader}>
      <h2 className={t.h2} id={headingId}>{label}</h2>
      {children}
    </header>
  )
}
