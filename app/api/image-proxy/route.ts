import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { checkAdmin } from '@/lib/admin'

export const dynamic = 'force-dynamic'

const ALLOWED_HOST = 'pub-5454588e96dd48eea58ff55965bbe8f5.r2.dev'

/**
 * GET /api/image-proxy?url=<R2 URL>
 * Proxies R2 images through same-origin so canvas operations work
 * without CORS. Admin-only to prevent abuse.
 */
export async function GET(req: NextRequest) {
  const { userId } = await auth()
  if (!userId || !checkAdmin(userId)) {
    return new NextResponse('Forbidden', { status: 403 })
  }

  const url = req.nextUrl.searchParams.get('url')
  if (!url) return new NextResponse('Missing url', { status: 400 })

  try {
    const parsed = new URL(url)
    if (parsed.hostname !== ALLOWED_HOST) {
      return new NextResponse('Invalid host', { status: 400 })
    }

    const res = await fetch(url)
    if (!res.ok) return new NextResponse('Upstream error', { status: 502 })

    const contentType = res.headers.get('content-type') || 'image/webp'
    const body = await res.arrayBuffer()

    return new NextResponse(body, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'private, max-age=300',
      },
    })
  } catch {
    return new NextResponse('Proxy error', { status: 500 })
  }
}
