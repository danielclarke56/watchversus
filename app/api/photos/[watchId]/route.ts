import { NextRequest, NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import sharp from 'sharp'
import crypto from 'crypto'
import fs from 'fs'
import path from 'path'
import type { ApprovedPhoto } from '@/lib/photos'
import { ACCEPTED_TYPES, MAX_FILE_SIZE } from '@/lib/photos'
import { isValidSlug, sanitizeText } from '@/lib/validation'
import { checkRateLimit } from '@/lib/ratelimit'
import { db } from '@/lib/db'
import { photos } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

function auditLog(event: string, data: Record<string, unknown>) {
  console.log(JSON.stringify({ ts: new Date().toISOString(), event, ...data }))
}

function validateMagicBytes(buf: Buffer): boolean {
  if (buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return true
  if (buf.length >= 4 && buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return true
  if (buf.length >= 12 && buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x46 &&
      buf[8] === 0x57 && buf[9] === 0x45 && buf[10] === 0x42 && buf[11] === 0x50) return true
  return false
}

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
      brandName: p.brandName ?? undefined,
      modelName: p.modelName ?? undefined,
      referenceNumber: p.referenceNumber ?? undefined,
      movement: p.movement ?? undefined,
      caseSize: p.caseSize ?? undefined,
      wristSize: p.wristSize ?? undefined,
      estimatedPrice: p.estimatedPrice ?? undefined,
      approved: true,
      createdAt: p.createdAt.toISOString(),
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

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? req.headers.get('x-real-ip') ?? 'unknown'

  const { userId } = await auth()
  if (!userId) {
    auditLog('upload.auth_rejected', { ip, watchId: params.watchId })
    return NextResponse.json({ error: 'Sign in to submit photos' }, { status: 401 })
  }

  const { success } = await checkRateLimit(userId)
  if (!success) {
    auditLog('upload.rate_limited', { userId, ip })
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
    auditLog('upload.validation_failed', { reason: 'mime_type', userId, ip, mime: file.type })
    return NextResponse.json({ error: 'Only JPEG, PNG, and WebP images are accepted' }, { status: 400 })
  }

  if (file.size > MAX_FILE_SIZE) {
    auditLog('upload.validation_failed', { reason: 'file_too_large', userId, ip, size: file.size })
    return NextResponse.json({ error: 'Photo must be under 5 MB' }, { status: 400 })
  }

  // Re-encode through sharp: validates real image, strips all EXIF/metadata (default, not calling withMetadata()),
  // neutralizes polyglot payloads, caps dimensions, outputs clean WebP.
  const rawBuffer = Buffer.from(await file.arrayBuffer())

  if (!validateMagicBytes(rawBuffer)) {
    auditLog('upload.validation_failed', { reason: 'invalid_magic_bytes', userId, ip, size: file.size, mime: file.type })
    return NextResponse.json({ error: 'Invalid image file' }, { status: 400 })
  }

  let cleanBuffer: Buffer
  try {
    cleanBuffer = await sharp(rawBuffer)
      .rotate() // auto-rotate based on EXIF before stripping
      .resize(2400, 2400, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 85 })
      .toBuffer()
  } catch {
    auditLog('upload.validation_failed', { reason: 'sharp_decode', userId, ip, size: file.size })
    return NextResponse.json({ error: 'Invalid image file' }, { status: 400 })
  }

  const photoId = crypto.randomUUID()
  let photoUrl: string

  const { isR2Configured } = await import('@/lib/r2')
  if (isR2Configured) {
    try {
      const { uploadPhotoToR2 } = await import('@/lib/r2')
      photoUrl = await uploadPhotoToR2(params.watchId, photoId, cleanBuffer)
    } catch (error) {
      auditLog('upload.storage_failed', { userId, ip, photoId, error: String(error) })
      return NextResponse.json({ error: 'Storage unavailable. Please try again later.' }, { status: 503 })
    }
  } else {
    console.warn('[upload] R2 not configured — using local filesystem fallback (dev only)')
    const dir = path.join(process.cwd(), 'public', 'images', 'user-uploads', params.watchId)
    fs.mkdirSync(dir, { recursive: true })
    const localFilename = `${photoId}.webp`
    fs.writeFileSync(path.join(dir, localFilename), cleanBuffer)
    photoUrl = `/images/user-uploads/${params.watchId}/${localFilename}`
  }

  // Read metadata fields from formData
  const wristSize = formData.get('wristSize') as string | null
  const brandName = formData.get('brandName') as string | null
  const modelName = formData.get('modelName') as string | null
  const referenceNumber = formData.get('referenceNumber') as string | null
  const movement = formData.get('movement') as string | null
  const caseSize = formData.get('caseSize') as string | null
  const estimatedPrice = formData.get('estimatedPrice') as string | null

  // Store in Postgres with pending status
  try {
    await db.insert(photos).values({
      id: photoId,
      watchId: params.watchId,
      userId,
      userName: sanitizeText(userName, 50),
      url: photoUrl,
      brandName: brandName || undefined,
      modelName: modelName || undefined,
      referenceNumber: referenceNumber || undefined,
      movement: movement || undefined,
      caseSize: caseSize || undefined,
      wristSize: wristSize || undefined,
      estimatedPrice: estimatedPrice || undefined,
      status: 'pending',
      createdAt: new Date(),
    })
  } catch (error) {
    auditLog('upload.db_failed', { userId, ip, photoId, error: String(error) })
    return NextResponse.json({ error: 'Failed to save photo' }, { status: 500 })
  }

  auditLog('upload.success', { userId, ip, photoId, watchId: params.watchId, size: file.size })
  return NextResponse.json({ success: true, status: 'pending_review' }, { status: 201 })
}
