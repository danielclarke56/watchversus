'use client'

import Link from 'next/link'
import { useState } from 'react'

const navLinks = [
  { href: '/watches', label: 'Watches' },
  { href: '/compare', label: 'Compare' },
  { href: '/reviews', label: 'Reviews' },
  { href: '/quiz', label: 'Find My Watch' },
  { href: '/about', label: 'About' },
]

export default function Navigation() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-[#0f172a]/95 backdrop-blur border-b border-[#334155]">
      {/* Affiliate banner */}
      <div className="bg-[#1e293b] text-center py-1.5 px-4 text-xs text-slate-400">
        This site uses affiliate links. We may earn a commission at no extra cost to you.
      </div>

      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="text-[#d4a853] text-xl font-bold tracking-tight">Watch</span><span className="text-white text-xl font-bold tracking-tight">Vs</span><span className="text-[#d4a853] text-xl font-bold tracking-tight">Watch</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-7">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-slate-300 hover:text-[#d4a853] transition-colors font-medium"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Link href="/compare" className="btn-gold text-xs px-4 py-2">
            Compare Watches
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden text-slate-300 hover:text-white p-2"
          aria-label="Toggle menu"
        >
          <div className="w-5 space-y-1.5">
            <span
              className={`block h-0.5 bg-current transition-all ${menuOpen ? 'rotate-45 translate-y-2' : ''}`}
            />
            <span
              className={`block h-0.5 bg-current transition-opacity ${menuOpen ? 'opacity-0' : ''}`}
            />
            <span
              className={`block h-0.5 bg-current transition-all ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`}
            />
          </div>
        </button>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-[#1e293b] border-t border-[#334155] px-4 pb-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="block py-3 text-slate-300 hover:text-[#d4a853] font-medium border-b border-[#334155] last:border-0"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/compare"
            onClick={() => setMenuOpen(false)}
            className="btn-gold mt-4 text-center block"
          >
            Compare Watches
          </Link>
        </div>
      )}
    </header>
  )
}
