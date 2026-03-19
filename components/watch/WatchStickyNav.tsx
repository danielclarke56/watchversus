'use client'

import { useEffect, useState } from 'react'

const sections = [
  { id: 'overview', label: 'Overview' },
  { id: 'verdict', label: 'Verdict' },
  { id: 'specs', label: 'Specs' },
  { id: 'reviews', label: 'Reviews' },
  { id: 'compare', label: 'Compare' },
]

export default function WatchStickyNav() {
  const [active, setActive] = useState('overview')

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActive(entry.target.id)
          }
        }
      },
      { rootMargin: '-80px 0px -60% 0px', threshold: 0 }
    )

    for (const { id } of sections) {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <nav className="sticky top-0 z-40 bg-surface/95 backdrop-blur-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex gap-1 overflow-x-auto scrollbar-hide -mb-px">
          {sections.map(({ id, label }) => (
            <a
              key={id}
              href={`#${id}`}
              className={`shrink-0 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                active === id
                  ? 'border-accent text-accent'
                  : 'border-transparent text-textMuted hover:text-textPrimary hover:border-borderStrong'
              }`}
            >
              {label}
            </a>
          ))}
        </div>
      </div>
    </nav>
  )
}
