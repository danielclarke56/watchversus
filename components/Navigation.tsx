'use client'

import { Suspense, useState, useCallback } from 'react'
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
                    className="hidden sm:inline text-sm text-textSecond hover:text-accent transition-colors font-medium"
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
  const handleExpandChange = useCallback((expanded: boolean) => setSearchExpanded(expanded), [])

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-border max-w-[100vw] overflow-x-hidden">
      <nav className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center gap-2 sm:gap-5">

        {/* Logo — hidden on mobile when search expanded, always visible on sm+ */}
        <Link href="/" className={`shrink-0 flex items-center ${searchExpanded ? 'hidden sm:flex' : ''}`}>
          <span className="sm:hidden text-lg font-bold text-gray-900">W</span>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="Watchems" className="hidden sm:block h-6 w-auto" />
        </Link>

        {/* Search bar — only on homepage */}
        {isHomePage && (
          <div className="flex-1 min-w-0 overflow-hidden">
            <Suspense>
              <GallerySearch onExpandChange={handleExpandChange} />
            </Suspense>
          </div>
        )}

        {/* Spacer when search not shown */}
        {!isHomePage && <div className="flex-1" />}

        {/* Right side: CTA + auth — hidden on mobile when search expanded, always visible on sm+ */}
        <div className={`flex items-center gap-2 sm:gap-4 shrink-0 ${searchExpanded ? 'hidden sm:flex' : ''}`}>
          <Link
            href="/upload"
            className="btn-gold text-xs sm:text-sm px-3 sm:px-5 h-9 sm:h-10 rounded-lg font-semibold flex items-center whitespace-nowrap"
          >
            <span className="sm:hidden">Upload</span>
            <span className="hidden sm:inline">Upload a Photo</span>
          </Link>
          <ClerkAuth avatarSize="w-7 h-7" />
        </div>
      </nav>
    </header>
  )
}
