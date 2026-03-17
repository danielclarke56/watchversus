import { NextRequest, NextResponse } from 'next/server'

/**
 * POST /api/photos/submit
 * MVP stub for photo submissions
 * 
 * Rules:
 * - Photos require manual approval before display
 * - No comments, no likes, no profiles
 * 
 * TODO: Integrate with actual image storage (S3, Vercel Blob, etc.)
 */
export async function POST(request: NextRequest) {
  try {
    const payload = await request.json()

    // Log submission to console (MVP stub)
    console.log('[Photo Submission] New submission received:', {
      timestamp: new Date().toISOString(),
      watch: payload.watch,
      watchName: payload.watchName,
      wristSize: payload.wristSize,
      strapBracelet: payload.strapBracelet,
      note: payload.note,
      requiresApproval: true,
      status: 'pending_review',
    })

    // Return success response
    return NextResponse.json(
      {
        success: true,
        message: 'Photo submission received. It will appear after review.',
        status: 'pending_review',
        submissionId: `photo_${Date.now()}`,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('[Photo Submission Error]', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process photo submission',
      },
      { status: 400 }
    )
  }
}
