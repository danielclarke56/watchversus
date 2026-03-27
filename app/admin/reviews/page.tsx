import { redirect } from 'next/navigation'
import { checkAdmin } from '@/lib/admin'
import { getPendingReviews } from '@/lib/reviews'
import { db } from '@/lib/db'
import { photos } from '@/lib/db/schema'

import type { PendingPhoto, ApprovedPhoto } from '@/lib/photos'
import AdminReviewList from './AdminReviewList'

export default async function AdminReviewsPage() {
  let userId: string | null = null

  try {
    const { auth } = await import('@clerk/nextjs/server')
    const session = await auth()
    userId = session.userId
  } catch {
    // Clerk not configured - block access
  }

  if (!userId) redirect('/')

  if (!checkAdmin(userId)) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <p className="text-red-400">Access denied.</p>
      </div>
    )
  }

  // Fetch all three data sources in parallel
  const [reviews, allPhotos] = await Promise.all([
    getPendingReviews(),
    db.select().from(photos).orderBy(photos.createdAt),
  ])

  const pendingPhotos: PendingPhoto[] = allPhotos
    .filter((p) => p.status === 'pending')
    .map((p) => ({
      id: p.id,
      watchId: p.watchId,
      url: p.url,
      caption: p.caption ?? undefined,
      userName: p.userName,
      userId: p.userId,
      approved: false as const,
      createdAt: p.createdAt.toISOString(),
    }))

  const approvedPhotos: ApprovedPhoto[] = allPhotos
    .filter((p) => p.status === 'approved')
    .map((p) => ({
      id: p.id,
      watchId: p.watchId,
      url: p.url,
      caption: p.caption ?? undefined,
      userName: p.userName,
      userId: p.userId,
      approved: true as const,
      createdAt: p.createdAt.toISOString(),
    }))

  return (
    <AdminReviewList
      initialReviews={reviews}
      initialPendingPhotos={pendingPhotos}
      initialApprovedPhotos={approvedPhotos}
    />
  )
}
