import { i } from '@/lib/styles'

interface Props {
  label: string
}

export function GuideSpecBadge({ label }: Props) {
  return <span className={i.badge}>{label}</span>
}
