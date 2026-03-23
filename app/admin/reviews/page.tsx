import { redirect } from 'next/navigation'
import { watches } from '@/lib/watches'
import AdminReviewList, { type PendingReviewRow } from './AdminReviewList'
import AdminPhotoList from './AdminPhotoList'
import type { PendingPhoto } from '@/lib/photos'
import { getRedis } from '@/lib/redis'
import { checkAdmin } from '@/lib/admin'

async function getPendingReviews(): Promise<PendingReviewRow[]> {
  const redis = getRedis()
  if (!redis) return []

  const allReviews: PendingReviewRow[] = []
  let cursor = 0

  do {
    const [nextCursor, keys] = await redis.scan(cursor, { match: 'reviews:pending:*', count: 100 }) as unknown as [number, string[]]
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

async function getPendingPhotos(): Promise<PendingPhoto[]> {
  const redis = getRedis()
  if (!redis) return []

  const allPhotos: PendingPhoto[] = []
  let cursor = 0

  do {
    const [nextCursor, keys] = await redis.scan(cursor, { match: 'photos:pending:*', count: 100 }) as unknown as [number, string[]]
    cursor = nextCursor
    for (const key of keys) {
      const photos = await redis.get(key) as PendingPhoto[] | null
      if (photos && photos.length > 0) {
        const watchId = key.replace('photos:pending:', '')
        allPhotos.push(...photos.map((p) => ({ ...p, watchId })))
      }
    }
  } while (cursor !== 0)

  return allPhotos.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export default async function AdminReviewsPage() {
  let userId: string | null = null

  try {
    const { auth } = await import('@clerk/nextjs/server')
    const session = await auth()
    userId = session.userId
  } catch {
    // Clerk not configured — block access
  }

  if (!userId) redirect('/')

  if (!checkAdmin(userId)) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <p className="text-red-400">Access denied.</p>
      </div>
    )
  }

  const [pending, pendingPhotos] = await Promise.all([
    getPendingReviews(),
    getPendingPhotos(),
  ])

  const watchNames: Record<string, string> = {}
  for (const w of watches) {
    watchNames[w.id] = `${w.brand} ${w.name}`
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Reviews Section */}
      <div className="mb-12">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-textPrimary mb-1">Pending Reviews</h1>
          <p className="text-textSecond text-sm">
            {pending.length} review{pending.length !== 1 ? 's' : ''} awaiting moderation
          </p>
        </div>
        <AdminReviewList initialReviews={pending} watchNames={watchNames} />
      </div>

      {/* Photos Section */}
      <div>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-textPrimary mb-1">Pending Photos</h2>
          <p className="text-textSecond text-sm">
            {pendingPhotos.length} photo{pendingPhotos.length !== 1 ? 's' : ''} awaiting moderation
          </p>
        </div>
        <AdminPhotoList initialPhotos={pendingPhotos} watchNames={watchNames} />
      </div>
    </div>
  )
}
