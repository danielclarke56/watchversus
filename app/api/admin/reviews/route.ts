import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getPendingReviews } from '@/lib/reviews'
import { checkAdmin } from '@/lib/admin'

export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/reviews
 * Get all pending reviews (admin only)
 */
export async function GET(): Promise<NextResponse> {
  try {
    const { userId } = await auth()

    if (!userId || !checkAdmin(userId)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    const reviews = await getPendingReviews()

    return NextResponse.json({ reviews })
  } catch (error) {
    console.error('Error fetching pending reviews:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
