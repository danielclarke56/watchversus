'use client'

import { useEffect, useRef, useState } from 'react'

interface NavItem {
  id: string
  label: string
}

interface Props {
  items: NavItem[]
}

export function GuideSubnav({ items }: Props) {
  const [active, setActive] = useState<string>(items[0]?.id ?? '')
  const navRef = useRef<HTMLElement>(null)

  useEffect(() => {
    function onScroll() {
      const mainNavHeight = window.innerWidth >= 640 ? 64 : 56
      const subNavHeight = navRef.current?.offsetHeight ?? 44
      const scrollY = window.scrollY + mainNavHeight + subNavHeight + 16
      let current = items[0]?.id ?? ''
      for (const { id } of items) {
        const el = document.getElementById(id)
        if (el && el.getBoundingClientRect().top + window.scrollY <= scrollY) {
          current = id
        }
      }
      setActive(current)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [items])

  function scrollTo(id: string) {
    const el = document.getElementById(id)
    if (!el) return
    const mainNavHeight = window.innerWidth >= 640 ? 64 : 56 // sm:h-16 / h-14
    const subNavHeight = navRef.current?.offsetHeight ?? 44
    const y = el.getBoundingClientRect().top + window.scrollY - mainNavHeight - subNavHeight - 8
    window.scrollTo({ top: y, behavior: 'smooth' })
  }

  return (
    <nav
      ref={navRef}
      className="sticky top-14 sm:top-16 z-20 border-b border-border bg-surface overflow-x-auto scrollbar-hide"
    >
      <div className="max-w-3xl mx-auto px-4 sm:px-6 flex items-center gap-1 py-2 min-w-max">
        {items.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => scrollTo(id)}
            className={[
              'text-xs font-medium rounded-full px-3 py-1 whitespace-nowrap transition-colors',
              active === id
                ? 'text-textPrimary bg-surfaceAlt border border-borderStrong'
                : 'text-textMuted hover:text-textSecond border border-transparent hover:border-border',
            ].join(' ')}
          >
            {label}
          </button>
        ))}
      </div>
    </nav>
  )
}
