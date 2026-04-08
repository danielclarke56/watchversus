export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getRecentApprovedReviews } from '@/lib/reviews'
import { checkReadRateLimit } from '@/lib/ratelimit'

/**
 * GET /api/reviews/all?limit=4
 * Fetch recent approved reviews across all watches
 */
export async function GET(request: NextRequest) {
  const { success } = await checkReadRateLimit(request)
  if (!success) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
  }
  try {
    const { searchParams } = new URL(request.url)
    const limit = Math.min(parseInt(searchParams.get('limit') || '4'), 20)
    const reviews = await getRecentApprovedReviews(limit)
    return NextResponse.json({ reviews })
  } catch {
    return NextResponse.json({ reviews: [] }, { status: 200 })
  }
}
