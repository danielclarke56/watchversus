import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { submitReview } from '@/lib/reviews'

export const dynamic = 'force-dynamic'

interface SubmitReviewBody {
  watchSlug: string
  rating: number
  title: string
  body: string
  pros: string[]
  cons: string[]
}

/**
 * POST /api/reviews
 * Submit a new review (authenticated users only)
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body: SubmitReviewBody = await request.json()

    // Validation
    if (!body.watchSlug || !body.rating || !body.title || !body.body || !body.pros || !body.cons) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (typeof body.rating !== 'number' || body.rating < 1 || body.rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      )
    }

    if (typeof body.title !== 'string' || body.title.length < 3 || body.title.length > 100) {
      return NextResponse.json(
        { error: 'Title must be between 3 and 100 characters' },
        { status: 400 }
      )
    }

    if (typeof body.body !== 'string' || body.body.length < 10 || body.body.length > 2000) {
      return NextResponse.json(
        { error: 'Body must be between 10 and 2000 characters' },
        { status: 400 }
      )
    }

    if (!Array.isArray(body.pros) || body.pros.length === 0 || body.pros.length > 10) {
      return NextResponse.json(
        { error: 'Pros must be an array with 1-10 items' },
        { status: 400 }
      )
    }

    if (!Array.isArray(body.cons) || body.cons.length === 0 || body.cons.length > 10) {
      return NextResponse.json(
        { error: 'Cons must be an array with 1-10 items' },
        { status: 400 }
      )
    }

    // Check for affiliate links
    const affiliateDomains = ['amazon.com', 'amazon.co.uk', 'amzn.to', 'ref=']
    const content = `${body.title} ${body.body} ${body.pros.join(' ')} ${body.cons.join(' ')}`
    for (const domain of affiliateDomains) {
      if (content.toLowerCase().includes(domain.toLowerCase())) {
        return NextResponse.json(
          { error: 'Affiliate links are not allowed in reviews' },
          { status: 400 }
        )
      }
    }

    const review = await submitReview({
      watchSlug: body.watchSlug,
      userId,
      rating: body.rating,
      title: body.title,
      body: body.body,
      pros: body.pros,
      cons: body.cons,
    })

    return NextResponse.json(
      { review, message: 'Review submitted for moderation' },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error submitting review:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
