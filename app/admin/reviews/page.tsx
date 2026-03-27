import { redirect } from 'next/navigation'
import { checkAdmin } from '@/lib/admin'
import { getPendingReviews } from '@/lib/reviews'
import AdminReviewList from './AdminReviewList'

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

  const reviews = await getPendingReviews()

  return <AdminReviewList initialReviews={reviews} />
}
