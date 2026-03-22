import { clerkMiddleware } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Only activate Clerk middleware when the keys are present (e.g. in production).
// Without this guard, every request fails with MIDDLEWARE_INVOCATION_FAILED when
// the Clerk env vars are not set.
const hasClerk =
  !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
  !!process.env.CLERK_SECRET_KEY

const clerkHandler = clerkMiddleware()

/**
 * Canonicalize /compare/ URLs so both slug orderings resolve to a single URL.
 * e.g. /compare/rolex-sub-vs-omega-sm → 301 → /compare/omega-sm-vs-rolex-sub
 * This prevents duplicate-content indexing issues in Google Search Console.
 */
function compareCanonicalRedirect(req: NextRequest): NextResponse | null {
  const { pathname } = req.nextUrl
  const match = pathname.match(/^\/compare\/(.+)$/)
  if (!match) return null

  const slug = match[1]
  const vsIdx = slug.indexOf('-vs-')
  if (vsIdx === -1) return null

  const slug1 = slug.slice(0, vsIdx)
  const slug2 = slug.slice(vsIdx + 4)

  // Sort the two slugs lexicographically — this is the canonical order
  const [canonical1, canonical2] = [slug1, slug2].sort()

  // Already canonical — no redirect needed
  if (slug1 === canonical1) return null

  const url = req.nextUrl.clone()
  url.pathname = `/compare/${canonical1}-vs-${canonical2}`
  return NextResponse.redirect(url, { status: 301 })
}

export default function middleware(req: NextRequest) {
  // 1. Comparison slug canonicalization (runs before Clerk so bots get clean 301s)
  const canonicalRedirect = compareCanonicalRedirect(req)
  if (canonicalRedirect) return canonicalRedirect

  // 2. Clerk auth
  if (!hasClerk) return NextResponse.next()
  // @ts-expect-error – clerkMiddleware returns a compatible handler
  return clerkHandler(req)
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
