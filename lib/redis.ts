let redisInstance: ReturnType<typeof createRedis> | null = null

function createRedis() {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) return null
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { Redis } = require('@upstash/redis')
  return new Redis({ url, token }) as import('@upstash/redis').Redis
}

export function getRedis() {
  if (!redisInstance) redisInstance = createRedis()
  return redisInstance
}
