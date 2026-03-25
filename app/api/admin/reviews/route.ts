import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getPendingReviews } from '@/lib/reviews'

/**
 * GET /api/admin/reviews
 * Get all pending reviews (admin only)
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { userId } = await auth()
    const adminUserId = process.env.ADMIN_USER_ID

    if (!userId || userId !== adminUserId) {
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
