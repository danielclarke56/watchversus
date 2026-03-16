import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'

export interface PendingReview {
  id: string
  watchId: string
  userId: string
  rating: number
  title: string
  body: string
  ownerFor?: string
  createdAt: string
  approved: false
}

export interface ApprovedReview {
  id: string
  watchId: string
  userId: string
  rating: number
  title: string
  body: string
  ownerFor?: string
  createdAt: string
  approved: true
}

function getRedis() {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) return null
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { Redis } = require('@upstash/redis')
  return new Redis({ url, token })
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { watchId: string } }
) {
  const redis = getRedis()
  if (!redis) return NextResponse.json([])
  const reviews = await redis.get(`reviews:${params.watchId}`) as ApprovedReview[] | null
  return NextResponse.json(reviews ?? [])
}

export async function POST(
  req: NextRequest,
  { params }: { params: { watchId: string } }
) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json() as { rating?: number; title?: string; body?: string; ownerFor?: string }
  const { rating, title, body: reviewBody, ownerFor } = body

  if (!rating || rating < 1 || rating > 5) {
    return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 })
  }
  if (!title || title.trim().length === 0 || title.length > 80) {
    return NextResponse.json({ error: 'Title is required (max 80 chars)' }, { status: 400 })
  }
  if (!reviewBody || reviewBody.length < 50 || reviewBody.length > 1000) {
    return NextResponse.json({ error: 'Review body must be 50–1000 characters' }, { status: 400 })
  }

  const review: PendingReview = {
    id: Date.now().toString(),
    watchId: params.watchId,
    userId,
    rating,
    title: title.trim(),
    body: reviewBody.trim(),
    ...(ownerFor ? { ownerFor } : {}),
    createdAt: new Date().toISOString(),
    approved: false,
  }

  const redis = getRedis()
  if (!redis) return NextResponse.json({ error: 'Storage unavailable' }, { status: 503 })

  const existing = await redis.get(`reviews:pending:${params.watchId}`) as PendingReview[] | null
  await redis.set(`reviews:pending:${params.watchId}`, [...(existing ?? []), review])

  return NextResponse.json({ success: true })
}
