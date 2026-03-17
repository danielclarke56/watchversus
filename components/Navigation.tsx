'use client'

import Link from 'next/link'
import { useState, useRef, useEffect } from 'react'
import dynamic from 'next/dynamic'

const hasClerk = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY

/* Lazy-load Clerk components only when the key is present */
const ClerkAuth = hasClerk
  ? dynamic(() =>
      import('@clerk/nextjs').then((mod) => {
        const { SignedIn, SignedOut, SignInButton, UserButton } = mod
        return {
          default: ({ avatarSize }: { avatarSize?: string }) => (
            <>
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="text-sm text-[#475569] hover:text-[#b8860b] transition-colors font-medium">
                    Sign In
                  </button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <UserButton appearance={avatarSize ? { elements: { avatarBox: avatarSize } } : undefined} />
              </SignedIn>
            </>
          ),
        }
      }),
      { ssr: false }
    )
  : () => null

type DropdownItem = { href: string; label: string; desc: string }
type NavGroup = { label: string; items: DropdownItem[] }

const navGroups: NavGroup[] = [
  {
    label: 'Watches',
    items: [
      { href: '/watches', label: 'All Watches', desc: 'Browse our full catalogue' },
      { href: '/brands', label: 'By Brand', desc: 'Rolex, Tudor, Seiko & more' },
      { href: '/compare', label: 'Compare', desc: 'Head-to-head showdowns' },
      { href: '/rankings', label: 'Rankings', desc: 'Ranked by score & category' },
    ],
  },
  {
    label: 'Find Your Watch',
    items: [
      { href: '/quiz', label: 'Watch Quiz', desc: 'Answer 5 questions, get your match' },
      { href: '/guides', label: 'Buying Guides', desc: 'Expert advice by category' },
    ],
  },
  {
    label: 'Community',
    items: [
      { href: '/blog', label: 'Blog', desc: 'Guides, reviews & watch advice' },
      { href: '/reviews', label: 'Owner Reviews', desc: 'Real insights from real owners' },
      { href: '/about', label: 'About', desc: 'Our mission & methodology' },
    ],
  },
]

function DropdownMenu({ label, items }: NavGroup) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 text-sm text-[#475569] hover:text-[#b8860b] transition-colors font-medium py-1"
      >
        {label}
        <svg
          className={`w-3.5 h-3.5 transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-2 w-56 bg-white border border-[#e2e8f0] rounded-xl shadow-lg overflow-hidden z-50">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="flex items-start gap-3 px-4 py-3 hover:bg-[#f8fafc] transition-colors group border-b border-[#e2e8f0] last:border-0"
            >
              <div>
                <div className="text-sm font-medium text-[#0f172a] group-hover:text-[#b8860b] transition-colors">
                  {item.label}
                </div>
                <div className="text-xs text-[#94a3b8] mt-0.5">{item.desc}</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export default function Navigation() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-[#e2e8f0] drop-shadow-sm">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">

        {/* Logo */}
        <Link href="/" className="shrink-0 flex items-center">
          <span className="text-[#b8860b] text-xl font-bold tracking-tight">Watch</span>
          <span className="text-[#0f172a] text-xl font-bold tracking-tight">Vs</span>
          <span className="text-[#b8860b] text-xl font-bold tracking-tight">Watch</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          {navGroups.map((g) => (
            <DropdownMenu key={g.label} {...g} />
          ))}
        </div>

        {/* Right side: CTA + auth */}
        <div className="hidden md:flex items-center gap-4 shrink-0">
          <Link
            href="/compare"
            className="btn-gold text-xs px-4 py-2 rounded-lg font-semibold"
          >
            Compare Now
          </Link>
          <ClerkAuth avatarSize="w-8 h-8" />
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden text-[#475569] hover:text-[#0f172a] p-2 ml-auto"
          aria-label="Toggle menu"
        >
          <div className="w-5 space-y-1.5">
            <span className={`block h-0.5 bg-current transition-all duration-200 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`block h-0.5 bg-current transition-opacity duration-200 ${menuOpen ? 'opacity-0' : ''}`} />
            <span className={`block h-0.5 bg-current transition-all duration-200 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
          </div>
        </button>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-[#e2e8f0] px-4 pt-2 pb-6">
          {navGroups.map((g) => (
            <div key={g.label}>
              <p className="text-[10px] uppercase tracking-widest text-[#94a3b8] mt-5 mb-1 font-semibold">
                {g.label}
              </p>
              {g.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="flex justify-between items-center py-2.5 border-b border-[#e2e8f0] last:border-0 group"
                >
                  <span className="text-sm font-medium text-[#0f172a] group-hover:text-[#b8860b] transition-colors">
                    {item.label}
                  </span>
                  <span className="text-xs text-[#94a3b8]">{item.desc}</span>
                </Link>
              ))}
            </div>
          ))}

          <div className="mt-5 pt-5 border-t border-[#e2e8f0] flex items-center justify-between">
            <Link href="/compare" className="btn-gold text-xs px-4 py-2 rounded-lg font-semibold">
              Compare Now
            </Link>
            <ClerkAuth />
          </div>
        </div>
      )}
    </header>
  )
}
