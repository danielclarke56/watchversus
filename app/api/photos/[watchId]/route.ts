import { NextRequest, NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { put } from '@vercel/blob'
import type { PendingPhoto, ApprovedPhoto } from '@/lib/photos'
import { ACCEPTED_TYPES, MAX_FILE_SIZE } from '@/lib/photos'
import { isValidSlug, sanitizeText } from '@/lib/validation'

// JPEG: FF D8 FF, PNG: 89 50 4E 47, WebP: 52 49 46 46 ... 57 45 42 50
const MAGIC_BYTES: Record<string, number[]> = {
  'image/jpeg': [0xFF, 0xD8, 0xFF],
  'image/png': [0x89, 0x50, 0x4E, 0x47],
  'image/webp': [0x52, 0x49, 0x46, 0x46],
}

async function verifyMagicBytes(file: File): Promise<boolean> {
  const expected = MAGIC_BYTES[file.type]
  if (!expected) return false
  const buffer = await file.slice(0, 12).arrayBuffer()
  const bytes = new Uint8Array(buffer)
  return expected.every((b, i) => bytes[i] === b)
}

function getRedis() {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) return null
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { Redis } = require('@upstash/redis')
  return new Redis({ url, token })
}

/** GET /api/photos/[watchId] — fetch approved photos */
export async function GET(
  _req: NextRequest,
  { params }: { params: { watchId: string } }
) {
  if (!isValidSlug(params.watchId)) {
    return NextResponse.json([], { status: 400 })
  }
  const redis = getRedis()
  if (!redis) return NextResponse.json([])
  const photos = (await redis.get(`photos:${params.watchId}`)) as ApprovedPhoto[] | null
  return NextResponse.json(photos ?? [])
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

  const user = await currentUser()
  const userName = user?.firstName
    ? `${user.firstName}${user.lastName ? ' ' + user.lastName.charAt(0) + '.' : ''}`
    : 'Anonymous'

  const formData = await req.formData()
  const file = formData.get('photo') as File | null
  const caption = (formData.get('caption') as string)?.trim() || undefined
  const wristSize = (formData.get('wristSize') as string)?.trim() || undefined
  const strapBracelet = (formData.get('strapBracelet') as string)?.trim() || undefined

  if (!file) {
    return NextResponse.json({ error: 'No photo provided' }, { status: 400 })
  }

  if (!ACCEPTED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: 'Only JPEG, PNG, and WebP images are accepted' }, { status: 400 })
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: 'Photo must be under 5 MB' }, { status: 400 })
  }

  // Verify file content matches declared MIME type
  const validContent = await verifyMagicBytes(file)
  if (!validContent) {
    return NextResponse.json({ error: 'File content does not match declared type' }, { status: 400 })
  }

  // Upload to Vercel Blob
  const blobToken = process.env.BLOB_READ_WRITE_TOKEN
  if (!blobToken) {
    return NextResponse.json({ error: 'Image storage not configured' }, { status: 503 })
  }

  const ext = file.type.split('/')[1] === 'jpeg' ? 'jpg' : file.type.split('/')[1]
  const filename = `user-photos/${params.watchId}/${Date.now()}.${ext}`

  const blob = await put(filename, file, {
    access: 'public',
    token: blobToken,
    addRandomSuffix: true,
  })

  const photo: PendingPhoto = {
    id: Date.now().toString(),
    watchId: params.watchId,
    userId,
    userName: sanitizeText(userName, 50),
    url: blob.url,
    caption: caption ? sanitizeText(caption, 120) : undefined,
    wristSize: wristSize ? sanitizeText(wristSize, 30) : undefined,
    strapBracelet: strapBracelet ? sanitizeText(strapBracelet, 50) : undefined,
    createdAt: new Date().toISOString(),
    approved: false,
  }

  const redis = getRedis()
  if (!redis) {
    return NextResponse.json({ error: 'Storage unavailable' }, { status: 503 })
  }

  const existing = (await redis.get(`photos:pending:${params.watchId}`)) as PendingPhoto[] | null
  await redis.set(`photos:pending:${params.watchId}`, [...(existing ?? []), photo])

  return NextResponse.json({ success: true, status: 'pending_review' }, { status: 201 })
}
