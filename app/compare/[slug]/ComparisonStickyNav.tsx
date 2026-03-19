'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Section {
  id: string
  label: string
}

interface ComparisonStickyNavProps {
  slug1: string
  slug2: string
  watch1Name: string
  watch2Name: string
  verdict?: string | null
  sections: Section[]
}

export default function ComparisonStickyNav({ slug1, slug2, watch1Name, watch2Name, verdict, sections }: ComparisonStickyNavProps) {
  const [activeSection, setActiveSection] = useState<string>(sections[0]?.id || '')
  const [isVisible, setIsVisible] = useState<boolean>(false)

  useEffect(() => {
    const heroEl = document.getElementById(sections[0]?.id || '')
    if (!heroEl) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(!entry.isIntersecting)
      },
      { threshold: 0, rootMargin: '-80px 0px 0px 0px' }
    )

    observer.observe(heroEl)

    const handleScroll = () => {
      for (const section of sections) {
        const element = document.getElementById(section.id)
        if (element) {
          const rect = element.getBoundingClientRect()
          if (rect.top <= 120) {
            setActiveSection(section.id)
          }
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => {
      observer.disconnect()
      window.removeEventListener('scroll', handleScroll)
    }
  }, [sections])

  const handleSectionClick = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-b border-border transition-all duration-300 ${
        isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
      }`}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-12 sm:h-14">
          <div className="min-w-0 flex-1">
            <div className="text-sm sm:text-sm font-bold text-textPrimary leading-tight">
              <span className="text-accent">{watch1Name}</span>
              <span className="mx-1 text-textMuted">vs</span>
              <span className="text-textPrimary">{watch2Name}</span>
            </div>
            {verdict && (
              <div className="text-[10px] sm:text-xs text-winner font-semibold leading-tight mt-0.5 truncate">
                {verdict}
              </div>
            )}
          </div>

          <div className="flex-1 overflow-x-auto ml-4 hidden sm:block">
            <div className="flex gap-1 whitespace-nowrap">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => handleSectionClick(section.id)}
                  className={`px-3 py-2 text-xs font-semibold rounded-sm transition-all ${
                    activeSection === section.id
                      ? 'text-accent bg-accentLight'
                      : 'text-textSecond hover:text-accent hover:bg-neutral'
                  }`}
                >
                  {section.label}
                </button>
              ))}
            </div>
          </div>

          <div className="hidden lg:flex gap-2 ml-4 flex-shrink-0">
            <Link
              href={`/watches/${slug1}`}
              className="px-3 py-2 text-xs font-semibold text-accent hover:text-white hover:bg-accent rounded-sm transition-colors"
            >
              {watch1Name}
            </Link>
            <Link
              href={`/watches/${slug2}`}
              className="px-3 py-2 text-xs font-semibold text-accent hover:text-white hover:bg-accent rounded-sm transition-colors"
            >
              {watch2Name}
            </Link>
          </div>
        </div>

        <div className="sm:hidden -mx-3 px-3 pb-2 overflow-x-auto scrollbar-hide">
          <div className="flex gap-1 whitespace-nowrap">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => handleSectionClick(section.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-all min-h-[32px] ${
                  activeSection === section.id
                    ? 'text-white bg-accent'
                    : 'text-textSecond bg-surfaceAlt hover:text-accent'
                }`}
              >
                {section.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  )
}
