'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import dynamic from 'next/dynamic'

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
                <UserButton appearance={avatarSize ? { elements: { avatarBox: avatarSize } } : undefined} />
              </SignedIn>
            </>
          ),
        }
      }),
      { ssr: false }
    )
  : () => null

const navLinks = [
  { href: '/watches', label: 'Watches' },
  { href: '/compare', label: 'Compare' },
  { href: '/explore', label: 'Explore' },
  { href: '/guides', label: 'Guides' },
  { href: '/quiz', label: 'Quiz' },
]

export default function Navigation() {
  const pathname = usePathname()
  const isQuiz = pathname === '/quiz'
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-border drop-shadow-sm">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">

        {/* Logo */}
        <Link href="/" className="shrink-0 flex items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="WatchVsWatch" className="h-8 w-auto" />
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-textSecond hover:text-accent transition-colors font-medium"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right side: CTA + auth */}
        <div className="hidden md:flex items-center gap-4 shrink-0">
          {isQuiz ? (
            <Link
              href="/guides"
              className="text-sm text-textSecond hover:text-accent transition-colors font-medium"
            >
              Need help? Read our guides
            </Link>
          ) : (
            <Link
              href="/compare"
              className="btn-gold text-xs px-4 py-2 rounded-md font-semibold"
            >
              Compare Now
            </Link>
          )}
          <ClerkAuth avatarSize="w-8 h-8" />
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden text-textSecond hover:text-textPrimary p-3 -mr-2 ml-auto"
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
        <div className="md:hidden bg-surface border-t border-border px-4 pt-2 pb-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="block py-4 border-b border-border last:border-0 text-base font-medium text-textPrimary hover:text-accent transition-colors"
            >
              {link.label}
            </Link>
          ))}

          <div className="mt-5 pt-5 border-t border-border flex items-center justify-between">
            {isQuiz ? (
              <Link href="/guides" className="text-sm text-textSecond hover:text-accent transition-colors font-medium">
                Read our guides
              </Link>
            ) : (
              <Link href="/compare" className="btn-gold text-xs px-4 py-2 rounded-md font-semibold">
                Compare Now
              </Link>
            )}
            <ClerkAuth />
          </div>
        </div>
      )}
    </header>
  )
}
