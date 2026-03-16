import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { watches } from '@/lib/watches'
import AdminReviewList, { type PendingReviewRow } from './AdminReviewList'

function getRedis() {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) return null
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { Redis } = require('@upstash/redis')
  return new Redis({ url, token })
}

async function getPendingReviews(): Promise<PendingReviewRow[]> {
  const redis = getRedis()
  if (!redis) return []

  const allReviews: PendingReviewRow[] = []
  let cursor = 0

  do {
    const [nextCursor, keys] = await redis.scan(cursor, { match: 'reviews:pending:*', count: 100 }) as [number, string[]]
    cursor = nextCursor
    for (const key of keys) {
      const reviews = await redis.get(key) as PendingReviewRow[] | null
      if (reviews && reviews.length > 0) {
        const watchId = key.replace('reviews:pending:', '')
        allReviews.push(...reviews.map((r) => ({ ...r, watchId })))
      }
    }
  } while (cursor !== 0)

  return allReviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export default async function AdminReviewsPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const adminUserId = process.env.ADMIN_USER_ID
  if (adminUserId && userId !== adminUserId) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <p className="text-red-400">Access denied.</p>
      </div>
    )
  }

  const pending = await getPendingReviews()

  const watchNames: Record<string, string> = {}
  for (const w of watches) {
    watchNames[w.id] = `${w.brand} ${w.name}`
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#0f172a] mb-1">Pending Reviews</h1>
        <p className="text-[#475569] text-sm">{pending.length} review{pending.length !== 1 ? 's' : ''} awaiting moderation</p>
      </div>
      <AdminReviewList initialReviews={pending} watchNames={watchNames} />
    </div>
  )
}
