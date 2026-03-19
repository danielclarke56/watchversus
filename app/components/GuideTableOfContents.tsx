'use client'

import { useEffect, useState } from 'react'

interface TocSection {
  id: string
  label: string
}

export default function GuideTableOfContents({ sections }: { sections: TocSection[] }) {
  const [activeId, setActiveId] = useState<string>('')

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting)
        if (visible.length > 0) {
          setActiveId(visible[0].target.id)
        }
      },
      { rootMargin: '-80px 0px -60% 0px', threshold: 0.1 }
    )

    sections.forEach((s) => {
      const el = document.getElementById(s.id)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [sections])

  if (sections.length <= 3) return null

  return (
    <nav className="hidden lg:block sticky top-24 self-start w-56 shrink-0">
      <p className="text-xs font-bold uppercase tracking-widest text-textMuted mb-3">On this page</p>
      <ul className="space-y-1.5 border-l border-border pl-3">
        {sections.map((s) => (
          <li key={s.id}>
            <a
              href={`#${s.id}`}
              onClick={(e) => {
                e.preventDefault()
                document.getElementById(s.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
              }}
              className={`block text-xs leading-snug py-1 transition-colors ${
                activeId === s.id
                  ? 'text-accent font-semibold border-l-2 border-accent -ml-[13px] pl-[11px]'
                  : 'text-textSecond hover:text-textPrimary'
              }`}
            >
              {s.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
