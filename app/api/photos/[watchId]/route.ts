import { NextRequest, NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { put } from '@vercel/blob'
import type { PendingPhoto, ApprovedPhoto } from '@/lib/photos'
import { ACCEPTED_TYPES, MAX_FILE_SIZE } from '@/lib/photos'

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

  // Upload to Vercel Blob
  const blobToken = process.env.BLOB_READ_WRITE_TOKEN
  if (!blobToken) {
    return NextResponse.json({ error: 'Image storage not configured' }, { status: 503 })
  }

  const ext = file.type.split('/')[1] === 'jpeg' ? 'jpg' : file.type.split('/')[1]
  const filename = `user-photos/${params.watchId}/${Date.now()}-${userId.slice(-6)}.${ext}`

  const blob = await put(filename, file, {
    access: 'public',
    token: blobToken,
    addRandomSuffix: false,
  })

  const photo: PendingPhoto = {
    id: Date.now().toString(),
    watchId: params.watchId,
    userId,
    userName,
    url: blob.url,
    caption,
    wristSize,
    strapBracelet,
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
