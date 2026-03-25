import { NextRequest, NextResponse } from 'next/server'
import { getRedis } from '@/lib/redis'

interface SubscribeBody {
  email: string
}

/**
 * POST /api/quiz/subscribe
 * Store user email from quiz completion
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body: SubscribeBody = await request.json()

    if (!body.email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    const redis = getRedis()
    if (!redis) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      )
    }

    // Store email in Redis set
    await redis.sadd('quiz:emails', body.email)

    return NextResponse.json(
      { success: true, message: 'Email saved' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error subscribing email:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
