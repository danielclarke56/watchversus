'use client'

import { Suspense, useState, useCallback, useRef, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import dynamic from 'next/dynamic'
import GallerySearch from '@/components/home/GallerySearch'

/* Clerk is only rendered when the publishable key is configured in Vercel env vars */
const clerkEnabled = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY

const ClerkAuth = clerkEnabled
  ? dynamic(() =>
      import('@clerk/nextjs').then((mod) => {
        const { SignedIn, SignedOut, SignInButton, UserButton } = mod
        return {
          default: ({ avatarSize }: { avatarSize?: string }) => (
            <>
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="text-sm text-textSecond hover:text-accent transition-colors font-medium">
                    Sign In
                  </button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <div className="flex items-center gap-4">
                  <Link
                    href="/dashboard"
                    className="text-sm text-textSecond hover:text-accent transition-colors font-medium"
                  >
                    Dashboard
                  </Link>
                  <UserButton appearance={avatarSize ? { elements: { avatarBox: avatarSize } } : undefined} />
                </div>
              </SignedIn>
            </>
          ),
        }
      }),
      { ssr: false }
    )
  : () => null

export default function Navigation() {
  const pathname = usePathname()
  const isHomePage = pathname === '/'
  const [searchExpanded, setSearchExpanded] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const handleExpandChange = useCallback((expanded: boolean) => setSearchExpanded(expanded), [])

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return
    const handler = (e: PointerEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    window.addEventListener('pointerdown', handler)
    return () => window.removeEventListener('pointerdown', handler)
  }, [menuOpen])

  // Close menu on route change
  useEffect(() => { setMenuOpen(false) }, [pathname])

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-border">
      <nav className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center gap-2 sm:gap-5">

        {/* Logo */}
        <Link href="/" className={`shrink-0 flex items-center ${searchExpanded ? 'hidden sm:flex' : ''}`}>
          <span className="sm:hidden text-lg font-bold text-gray-900">W</span>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="Watchems" className="hidden sm:block h-6 w-auto" />
        </Link>

        {/* Search bar — only on homepage */}
        {isHomePage && (
          <div className="flex-1 min-w-0">
            <Suspense>
              <GallerySearch onExpandChange={handleExpandChange} />
            </Suspense>
          </div>
        )}

        {/* Spacer when search not shown */}
        {!isHomePage && <div className="flex-1" />}

        {/* Desktop: full buttons */}
        <div className="hidden sm:flex items-center gap-4 shrink-0">
          <Link
            href="/upload"
            className="btn-gold text-sm px-5 h-10 rounded-lg font-semibold flex items-center whitespace-nowrap"
          >
            Upload a Photo
          </Link>
          <ClerkAuth avatarSize="w-7 h-7" />
        </div>

        {/* Mobile: hamburger menu */}
        <div ref={menuRef} className={`relative sm:hidden shrink-0 ${searchExpanded ? 'hidden' : ''}`}>
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center justify-center w-9 h-9 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label="Menu"
          >
            {menuOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>

          {/* Dropdown */}
          {menuOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
              <Link
                href="/upload"
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Upload a Photo
              </Link>
              <Link
                href="/about"
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                About
              </Link>
              <div className="border-t border-gray-100 my-1" />
              <div className="px-4 py-2.5">
                <ClerkAuth avatarSize="w-6 h-6" />
              </div>
            </div>
          )}
        </div>
      </nav>
    </header>
  )
}
