import { Ratelimit } from '@upstash/ratelimit'
import { getRedis } from '@/lib/redis'

export async function checkRateLimit(userId: string) {
  const redis = getRedis()
  if (!redis) return { success: true as const }
  const limiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, '1 h'),
    prefix: 'ratelimit:submit',
  })
  return limiter.limit(userId)
}
