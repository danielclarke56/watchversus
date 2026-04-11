import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { checkAdmin } from '@/lib/admin'
import { db } from '@/lib/db'
import { photos } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import sharp from 'sharp'

export const dynamic = 'force-dynamic'

/**
 * POST /api/admin/crop — replace a photo with a cropped version.
 * Accepts multipart form: photoId + cropped image file.
 * Re-processes with sharp and re-uploads to R2 at the same key.
 */
export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!checkAdmin(userId)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const formData = await req.formData()
  const photoId = formData.get('photoId') as string
  const file = formData.get('photo') as File

  if (!photoId || !file) {
    return NextResponse.json({ error: 'Missing photoId or photo' }, { status: 400 })
  }

  try {
    // Look up the photo record
    const [photo] = await db.select().from(photos).where(eq(photos.id, photoId)).limit(1)
    if (!photo) {
      return NextResponse.json({ error: 'Photo not found' }, { status: 404 })
    }

    // Process the cropped image with sharp
    const rawBuffer = Buffer.from(await file.arrayBuffer())
    const rotated = sharp(rawBuffer).rotate()

    const [cleanBuffer, thumbBuffer] = await Promise.all([
      rotated.clone()
        .resize(2400, 2400, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 85 })
        .toBuffer(),
      rotated.clone()
        .resize(600, 600, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 75 })
        .toBuffer(),
    ])

    // Re-upload to R2 at the same keys
    const { uploadPhotoToR2, uploadThumbnailToR2, isR2Configured } = await import('@/lib/r2')
    if (!isR2Configured) {
      return NextResponse.json({ error: 'R2 not configured' }, { status: 500 })
    }

    const [newUrl, newThumbUrl] = await Promise.all([
      uploadPhotoToR2(photo.watchId, photo.id, cleanBuffer),
      uploadThumbnailToR2(photo.watchId, photo.id, thumbBuffer),
    ])

    // Update DB URLs (in case watchId changed and keys differ)
    await db.update(photos).set({
      url: newUrl,
      thumbnailUrl: newThumbUrl,
    }).where(eq(photos.id, photoId))

    return NextResponse.json({
      success: true,
      url: newUrl,
      thumbnailUrl: newThumbUrl,
    })
  } catch (error) {
    console.error('[Admin crop] Error:', error)
    return NextResponse.json({ error: 'Crop failed' }, { status: 500 })
  }
}
