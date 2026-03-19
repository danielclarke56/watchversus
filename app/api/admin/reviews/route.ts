import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { isValidSlug } from '@/lib/validation'

function getRedis() {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) return null
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { Redis } = require('@upstash/redis')
  return new Redis({ url, token })
}

function checkAdmin(userId: string): boolean {
  const adminUserId = process.env.ADMIN_USER_ID
  if (!adminUserId) return false
  return userId === adminUserId
}

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!checkAdmin(userId)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const redis = getRedis()
  if (!redis) return NextResponse.json([])

  const allReviews: unknown[] = []
  let cursor = 0

  do {
    const [nextCursor, keys] = await redis.scan(cursor, { match: 'reviews:pending:*', count: 100 }) as [number, string[]]
    cursor = nextCursor
    for (const key of keys) {
      const reviews = await redis.get(key) as unknown[] | null
      if (reviews && reviews.length > 0) {
        const watchId = key.replace('reviews:pending:', '')
        allReviews.push(...reviews.map((r) => ({ ...(r as object), watchId })))
      }
    }
  } while (cursor !== 0)

  return NextResponse.json(allReviews)
}

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!checkAdmin(userId)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json() as { action: 'approve' | 'delete'; watchId: string; reviewId: string }
  const { action, watchId, reviewId } = body

  if (!action || !watchId || !reviewId) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }
  if (action !== 'approve' && action !== 'delete') {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  }
  if (!isValidSlug(watchId)) {
    return NextResponse.json({ error: 'Invalid watch ID' }, { status: 400 })
  }

  const redis = getRedis()
  if (!redis) return NextResponse.json({ error: 'Storage unavailable' }, { status: 503 })

  const pending = await redis.get(`reviews:pending:${watchId}`) as { id: string }[] | null
  const review = pending?.find((r) => r.id === reviewId)
  if (!review) return NextResponse.json({ error: 'Review not found' }, { status: 404 })

  const newPending = (pending ?? []).filter((r) => r.id !== reviewId)
  await redis.set(`reviews:pending:${watchId}`, newPending)

  if (action === 'approve') {
    const approved = await redis.get(`reviews:${watchId}`) as unknown[] | null
    await redis.set(`reviews:${watchId}`, [...(approved ?? []), { ...review, approved: true }])
  }

  return NextResponse.json({ success: true })
}
