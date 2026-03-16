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

export default function middleware(req: NextRequest) {
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
