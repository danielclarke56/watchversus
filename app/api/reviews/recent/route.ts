export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getRecentApprovedReviews } from '@/lib/reviews'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Math.min(parseInt(searchParams.get('limit') || '4'), 20)
    const reviews = await getRecentApprovedReviews(limit)
    return NextResponse.json(reviews)
  } catch {
    return NextResponse.json([], { status: 200 })
  }
}
