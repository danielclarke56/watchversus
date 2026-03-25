import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { approveReview, rejectReview, getReview } from '@/lib/reviews'

interface ApprovalRequest {
  watchSlug: string
  action: 'approve' | 'reject'
}

/**
 * POST /api/admin/reviews/[id]
 * Approve or reject a review (admin only)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { userId } = await auth()
    const adminUserId = process.env.ADMIN_USER_ID

    if (!userId || userId !== adminUserId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    const { id } = await params
    const body: ApprovalRequest = await request.json()

    if (!body.watchSlug || !body.action) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (body.action !== 'approve' && body.action !== 'reject') {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      )
    }

    // Verify review exists
    const review = await getReview(body.watchSlug, id)
    if (!review) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      )
    }

    if (body.action === 'approve') {
      await approveReview(body.watchSlug, id)
    } else {
      await rejectReview(body.watchSlug, id)
    }

    return NextResponse.json({
      message: `Review ${body.action}d successfully`,
    })
  } catch (error) {
    console.error('Error processing review:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
