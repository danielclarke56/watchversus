import { Ratelimit } from '@upstash/ratelimit'
import { getRedis } from '@/lib/redis'

// 5 submissions per hour per user (reviews or photos)
let limiter: Ratelimit | null = null

function getLimiter() {
  if (limiter) return limiter
  const redis = getRedis()
  if (!redis) return null
  limiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, '1 h'),
    prefix: 'ratelimit:submit',
  })
  return limiter
}

/** Returns { success: true } if allowed, or a NextResponse-ready error if blocked */
export async function checkRateLimit(userId: string) {
  const rl = getLimiter()
  if (!rl) return { success: true as const }
  const result = await rl.limit(userId)
  return result
}
