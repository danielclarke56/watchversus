import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import fs from 'fs'
import path from 'path'
import { isValidSlug } from '@/lib/validation'
import { checkAdmin } from '@/lib/admin'
import { db } from '@/lib/db'
import { photos } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

/** GET /api/admin/photos — list all pending photos */
export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!checkAdmin(userId)) {
    return NextResponse.json({ error: 'Forbidden', yourUserId: userId }, { status: 403 })
  }

  try {
    // Query all pending photos from Postgres
    const pendingPhotos = await db
      .select()
      .from(photos)
      .where(eq(photos.status, 'pending'))
      .orderBy((p) => p.createdAt)

    // Transform to API response format
    const result = pendingPhotos.map((p) => ({
      id: p.id,
      watchId: p.watchId,
      userId: p.userId,
      userName: p.userName,
      url: p.url,
      caption: p.caption,
      createdAt: p.createdAt.toISOString(),
      approved: false,
    }))

    // Sort by createdAt descending
    result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching pending photos:', error)
    return NextResponse.json({ error: 'Failed to fetch pending photos' }, { status: 500 })
  }
}

/** POST /api/admin/photos — approve or delete a pending photo */
export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!checkAdmin(userId)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = (await req.json()) as { action: 'approve' | 'delete' | 'reject'; watchId: string; photoId: string }
  const { action, watchId, photoId } = body

  if (!action || !watchId || !photoId) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }
  if (action !== 'approve' && action !== 'delete' && action !== 'reject') {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  }
  if (!isValidSlug(watchId)) {
    return NextResponse.json({ error: 'Invalid watch ID' }, { status: 400 })
  }

  try {
    // Find the pending photo
    const photo = await db
      .select()
      .from(photos)
      .where(and(eq(photos.id, photoId), eq(photos.status, 'pending')))
      .limit(1)

    if (!photo || photo.length === 0) {
      return NextResponse.json({ error: 'Photo not found' }, { status: 404 })
    }

    const photoRecord = photo[0]

    if (action === 'approve') {
      // Update photo status to approved
      await db.update(photos).set({ status: 'approved' }).where(eq(photos.id, photoId))
    } else if (action === 'delete' || action === 'reject') {
      // Delete photo from R2 or filesystem
      const url = photoRecord.url
      if (url.startsWith('/images/')) {
        // Local filesystem
        const filePath = path.join(process.cwd(), 'public', url)
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath)
        }
      } else {
        // Try to delete from R2
        try {
          const { deletePhotoFromR2, isR2Configured } = await import('@/lib/r2')
          if (isR2Configured) {
            await deletePhotoFromR2(url)
          }
        } catch (error) {
          console.error('Failed to delete from R2:', error)
          // Continue anyway
        }
      }

      // Update photo status to rejected
      await db.update(photos).set({ status: 'rejected' }).where(eq(photos.id, photoId))
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error processing photo action:', error)
    return NextResponse.json({ error: 'Failed to process photo' }, { status: 500 })
  }
}
