import { NextRequest, NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { put } from '@vercel/blob'
import sharp from 'sharp'
import fs from 'fs'
import path from 'path'
import type { PendingPhoto, ApprovedPhoto } from '@/lib/photos'
import { ACCEPTED_TYPES, MAX_FILE_SIZE } from '@/lib/photos'
import { isValidSlug, sanitizeText } from '@/lib/validation'
import { getRedis } from '@/lib/redis'
import { checkRateLimit } from '@/lib/ratelimit'

/** GET /api/photos/[watchId] — fetch approved photos */
export async function GET(
  _req: NextRequest,
  { params }: { params: { watchId: string } }
) {
  if (!isValidSlug(params.watchId)) {
    return NextResponse.json([], { status: 400 })
  }
  const redis = getRedis()
  if (redis) {
    const photos = (await redis.get(`photos:${params.watchId}`)) as ApprovedPhoto[] | null
    return NextResponse.json(photos ?? [])
  }
  // Local fallback: show approved photos from local JSON
  const approvedFile = path.join(process.cwd(), 'data', 'approved-photos.json')
  if (fs.existsSync(approvedFile)) {
    const all: ApprovedPhoto[] = JSON.parse(fs.readFileSync(approvedFile, 'utf8'))
    return NextResponse.json(all.filter((p) => p.watchId === params.watchId))
  }
  return NextResponse.json([])
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

  // Upload to Vercel Blob in production, local filesystem in dev
  const blobToken = process.env.BLOB_READ_WRITE_TOKEN
  if (blobToken) {
    const filename = `user-photos/${params.watchId}/${photoId}.webp`
    const blob = await put(filename, cleanBuffer, {
      access: 'public',
      contentType: 'image/webp',
      token: blobToken,
      addRandomSuffix: true,
    })
    photoUrl = blob.url
  } else {
    // Local fallback for development
    const dir = path.join(process.cwd(), 'public', 'images', 'user-uploads', params.watchId)
    fs.mkdirSync(dir, { recursive: true })
    const localFilename = `${photoId}.webp`
    fs.writeFileSync(path.join(dir, localFilename), cleanBuffer)
    photoUrl = `/images/user-uploads/${params.watchId}/${localFilename}`
  }

  // Read caption from formData
  const captionRaw = formData.get('caption') as string | null
  const caption = sanitizeText(captionRaw ?? '', 280)

  const photo: PendingPhoto = {
    id: photoId,
    watchId: params.watchId,
    userId,
    userName: sanitizeText(userName, 50),
    url: photoUrl,
    caption: caption ? caption : undefined,
    createdAt: new Date().toISOString(),
    approved: false,
  }

  // Store in Redis if available, otherwise use local JSON file
  const redis = getRedis()
  if (redis) {
    const existing = (await redis.get(`photos:pending:${params.watchId}`)) as PendingPhoto[] | null
    await redis.set(`photos:pending:${params.watchId}`, [...(existing ?? []), photo])
  } else {
    const pendingFile = path.join(process.cwd(), 'data', 'pending-photos.json')
    const existing: PendingPhoto[] = fs.existsSync(pendingFile)
      ? JSON.parse(fs.readFileSync(pendingFile, 'utf8'))
      : []
    existing.push(photo)
    fs.writeFileSync(pendingFile, JSON.stringify(existing, null, 2))
  }

  return NextResponse.json({ success: true, status: 'pending_review' }, { status: 201 })
}
