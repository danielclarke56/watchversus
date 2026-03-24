import { NextRequest, NextResponse } from 'next/server'
import { getRedis } from '@/lib/redis'
import { sanitizeText } from '@/lib/validation'

const REDIS_KEY = 'comparison-requests'

export interface ComparisonRequest {
  id: string
  watch1: string
  watch2: string
  email?: string
  createdAt: string
}

export async function GET(req: NextRequest) {
  // Admin-only: check via query param secret or rely on admin page auth
  const secret = req.nextUrl.searchParams.get('secret')
  if (secret !== process.env.ADMIN_API_SECRET && !req.headers.get('x-admin')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const redis = getRedis()
  if (!redis) return NextResponse.json({ requests: [] })

  try {
    const raw = (await redis.lrange(REDIS_KEY, 0, -1)) as string[]
    const requests: ComparisonRequest[] = raw.map((r) =>
      typeof r === 'string' ? JSON.parse(r) : r
    )
    return NextResponse.json({ requests })
  } catch {
    return NextResponse.json({ requests: [] })
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const watch1 = sanitizeText(body.watch1 ?? '', 100)
  const watch2 = sanitizeText(body.watch2 ?? '', 100)

  if (!watch1 || !watch2) {
    return NextResponse.json({ error: 'Both watch fields are required' }, { status: 400 })
  }

  if (watch1.length < 2 || watch2.length < 2) {
    return NextResponse.json({ error: 'Watch names must be at least 2 characters' }, { status: 400 })
  }

  const email = body.email ? sanitizeText(body.email, 200) : undefined

  // Rate limit by IP: max 5 requests per hour
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  const redis = getRedis()

  if (redis && ip !== 'unknown') {
    const rateKey = `req-limit:${ip}`
    const count = await redis.incr(rateKey)
    if (count === 1) await redis.expire(rateKey, 3600)
    if (count > 5) {
      return NextResponse.json({ error: 'Too many requests. Try again later.' }, { status: 429 })
    }
  }

  const request: ComparisonRequest = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    watch1,
    watch2,
    email,
    createdAt: new Date().toISOString(),
  }

  if (redis) {
    try {
      await redis.lpush(REDIS_KEY, JSON.stringify(request))
    } catch {
      return NextResponse.json({ error: 'Failed to save request' }, { status: 500 })
    }
  }

  return NextResponse.json({ success: true, id: request.id })
}
