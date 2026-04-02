'use client'

import Link from 'next/link'
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
  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-border drop-shadow-sm overflow-x-hidden">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="shrink-0 flex items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="Watchems" className="w-auto" style={{ height: '1.5rem' }} />
        </Link>

        {/* Right side: CTA + auth */}
        <div className="flex items-center gap-4 shrink-0">
          <Link
            href="/upload"
            className="btn-gold text-xs px-4 py-2 rounded-md font-semibold"
          >
            <span className="sm:hidden">Upload</span>
            <span className="hidden sm:inline">Upload a Photo</span>
          </Link>
          <ClerkAuth avatarSize="w-8 h-8" />
        </div>
      </nav>
    </header>
  )
}
