import { NextRequest, NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import sharp from 'sharp'
import fs from 'fs'
import path from 'path'
import type { ApprovedPhoto } from '@/lib/photos'
import { ACCEPTED_TYPES, MAX_FILE_SIZE } from '@/lib/photos'
import { isValidSlug, sanitizeText } from '@/lib/validation'
import { checkRateLimit } from '@/lib/ratelimit'
import { db } from '@/lib/db'
import { photos } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

/** GET /api/photos/[watchId] — fetch approved photos */
export async function GET(
  _req: NextRequest,
  { params }: { params: { watchId: string } }
) {
  if (!isValidSlug(params.watchId)) {
    return NextResponse.json([], { status: 400 })
  }

  try {
    // Query Postgres for approved photos
    const photoRecords = await db
      .select()
      .from(photos)
      .where(and(eq(photos.watchId, params.watchId), eq(photos.status, 'approved')))

    // Transform DB records to ApprovedPhoto format
    const approved: ApprovedPhoto[] = photoRecords.map((p) => ({
      id: p.id,
      watchId: p.watchId,
      userId: p.userId,
      userName: p.userName,
      url: p.url,
      caption: p.caption ?? undefined,
      createdAt: p.createdAt.toISOString(),
      approved: true,
    }))

    return NextResponse.json(approved)
  } catch (error) {
    console.error('Error fetching photos:', error)
    // Fallback: return empty array if DB is unavailable
    return NextResponse.json([])
  }
}

/** POST /api/photos/[watchId] — upload a photo (requires auth) */
export async function POST(
  req: NextRequest,
  { params }: { params: { watchId: string } }
) {
  if (!isValidSlug(params.watchId)) {
    return NextResponse.json({ error: 'Invalid watch ID' }, { status: 400 })
  }

  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Sign in to submit photos' }, { status: 401 })
  }

  const { success } = await checkRateLimit(userId)
  if (!success) {
    return NextResponse.json({ error: 'Too many submissions. Try again later.' }, { status: 429 })
  }

  const user = await currentUser()
  const userName = user?.firstName
    ? `${user.firstName}${user.lastName ? ' ' + user.lastName.charAt(0) + '.' : ''}`
    : 'Anonymous'

  const formData = await req.formData()
  const file = formData.get('photo') as File | null

  if (!file) {
    return NextResponse.json({ error: 'No photo provided' }, { status: 400 })
  }

  if (!ACCEPTED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: 'Only JPEG, PNG, and WebP images are accepted' }, { status: 400 })
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: 'Photo must be under 5 MB' }, { status: 400 })
  }

  // Re-encode through sharp — this validates the file is a real image,
  // strips all metadata/EXIF/embedded scripts, and neutralizes polyglot payloads
  const rawBuffer = Buffer.from(await file.arrayBuffer())
  let cleanBuffer: Buffer
  try {
    cleanBuffer = await sharp(rawBuffer)
      .rotate() // auto-rotate based on EXIF before stripping
      .resize(2400, 2400, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 85 })
      .toBuffer()
  } catch {
    return NextResponse.json({ error: 'Invalid image file' }, { status: 400 })
  }

  const photoId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  let photoUrl: string

  // Try R2 first, fall back to local filesystem
  const { isR2Configured } = await import('@/lib/r2')
  if (isR2Configured) {
    try {
      const { uploadPhotoToR2 } = await import('@/lib/r2')
      photoUrl = await uploadPhotoToR2(params.watchId, photoId, cleanBuffer)
    } catch (error) {
      console.error('R2 upload failed:', error)
      // Fall back to local filesystem
      const dir = path.join(process.cwd(), 'public', 'images', 'user-uploads', params.watchId)
      fs.mkdirSync(dir, { recursive: true })
      const localFilename = `${photoId}.webp`
      fs.writeFileSync(path.join(dir, localFilename), cleanBuffer)
      photoUrl = `/images/user-uploads/${params.watchId}/${localFilename}`
    }
  } else {
    // Local fallback for development
    const dir = path.join(process.cwd(), 'public', 'images', 'user-uploads', params.watchId)
    fs.mkdirSync(dir, { recursive: true })
    const localFilename = `${photoId}.webp`
    fs.writeFileSync(path.join(dir, localFilename), cleanBuffer)
    photoUrl = `/images/user-uploads/${params.watchId}/${localFilename}`
  }

  // Read caption and wrist size from formData
  const captionRaw = formData.get('caption') as string | null
  const wristSize = formData.get('wristSize') as string | null
  const sanitizedCaption = sanitizeText(captionRaw ?? '', 280)
  const caption = wristSize
    ? `[Wrist: ${sanitizeText(wristSize, 20)}] ${sanitizedCaption}`.trim()
    : sanitizedCaption

  // Store in Postgres with pending status
  try {
    await db.insert(photos).values({
      id: photoId,
      watchId: params.watchId,
      userId,
      userName: sanitizeText(userName, 50),
      url: photoUrl,
      caption: caption || undefined,
      status: 'pending',
      createdAt: new Date(),
    })
  } catch (error) {
    console.error('Failed to insert photo into database:', error)
    return NextResponse.json({ error: 'Failed to save photo' }, { status: 500 })
  }

  return NextResponse.json({ success: true, status: 'pending_review' }, { status: 201 })
}
