'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface ComparisonStickyNavProps {
  slug1: string
  slug2: string
  watch1Name: string
  watch2Name: string
}

const sections = [
  { id: 'comparison-hero', label: 'Overview' },
  { id: 'comparison-verdict', label: 'Verdict' },
  { id: 'comparison-specs', label: 'Specs' },
  { id: 'comparison-ratings', label: 'Ratings' },
  { id: 'comparison-faq', label: 'FAQ' },
  { id: 'comparison-related', label: 'Related' },
  { id: 'comparison-guides', label: 'Guides' },
]

export default function ComparisonStickyNav({ slug1, slug2, watch1Name, watch2Name }: ComparisonStickyNavProps) {
  const [activeSection, setActiveSection] = useState<string>('comparison-hero')
  const [isVisible, setIsVisible] = useState<boolean>(true)
  const [lastScrollY, setLastScrollY] = useState<number>(0)

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY

      // Hide nav when scrolling up, show when scrolling down
      if (currentScrollY > lastScrollY && currentScrollY > 300) {
        setIsVisible(false)
      } else {
        setIsVisible(true)
      }
      setLastScrollY(currentScrollY)

      // Determine active section
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
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScrollY])

  const handleSectionClick = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#e2e8f0] transition-transform duration-300 ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Comparison title — compact for sticky nav */}
          <div className="min-w-0 flex-shrink-0">
            <div className="hidden sm:block text-sm font-bold text-[#0f172a]">
              <span className="text-[#b8860b]">{watch1Name}</span>
              <span className="mx-1 text-[#94a3b8]">vs</span>
              <span className="text-[#0f172a]">{watch2Name}</span>
            </div>
            <div className="sm:hidden text-xs font-bold text-[#0f172a]">Comparison</div>
          </div>

          {/* Section navigation — horizontal scroll on mobile */}
          <div className="flex-1 overflow-x-auto ml-4">
            <div className="flex gap-1 whitespace-nowrap">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => handleSectionClick(section.id)}
                  className={`px-3 py-2 text-xs font-semibold rounded-lg transition-all ${
                    activeSection === section.id
                      ? 'text-[#b8860b] bg-[#b8860b]/10'
                      : 'text-[#475569] hover:text-[#b8860b] hover:bg-[#b8860b]/5'
                  }`}
                >
                  {section.label}
                </button>
              ))}
            </div>
          </div>

          {/* View links — desktop only */}
          <div className="hidden md:flex gap-2 ml-4 flex-shrink-0">
            <Link
              href={`/watches/${slug1}`}
              className="px-3 py-2 text-xs font-semibold text-[#b8860b] hover:text-white hover:bg-[#b8860b] rounded-lg transition-colors"
            >
              {watch1Name}
            </Link>
            <Link
              href={`/watches/${slug2}`}
              className="px-3 py-2 text-xs font-semibold text-[#b8860b] hover:text-white hover:bg-[#b8860b] rounded-lg transition-colors"
            >
              {watch2Name}
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
