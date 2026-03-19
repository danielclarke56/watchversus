import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { del } from '@vercel/blob'
import type { PendingPhoto, ApprovedPhoto } from '@/lib/photos'
import { isValidSlug } from '@/lib/validation'
import { getRedis } from '@/lib/redis'
import { checkAdmin } from '@/lib/admin'

/** GET /api/admin/photos — list all pending photos */
export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!checkAdmin(userId)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const redis = getRedis()
  if (!redis) return NextResponse.json([])

  const allPhotos: PendingPhoto[] = []
  let cursor = 0

  do {
    const [nextCursor, keys] = (await redis.scan(cursor, {
      match: 'photos:pending:*',
      count: 100,
    })) as unknown as [number, string[]]
    cursor = nextCursor
    for (const key of keys) {
      const photos = (await redis.get(key)) as PendingPhoto[] | null
      if (photos && photos.length > 0) {
        const watchId = key.replace('photos:pending:', '')
        allPhotos.push(...photos.map((p) => ({ ...p, watchId })))
      }
    }
  } while (cursor !== 0)

  return NextResponse.json(
    allPhotos.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  )
}

/** POST /api/admin/photos — approve or delete a pending photo */
export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!checkAdmin(userId)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = (await req.json()) as { action: 'approve' | 'delete'; watchId: string; photoId: string }
  const { action, watchId, photoId } = body

  if (!action || !watchId || !photoId) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }
  if (action !== 'approve' && action !== 'delete') {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  }
  if (!isValidSlug(watchId)) {
    return NextResponse.json({ error: 'Invalid watch ID' }, { status: 400 })
  }

  const redis = getRedis()
  if (!redis) return NextResponse.json({ error: 'Storage unavailable' }, { status: 503 })

  const pending = (await redis.get(`photos:pending:${watchId}`)) as PendingPhoto[] | null
  const photo = pending?.find((p) => p.id === photoId)
  if (!photo) return NextResponse.json({ error: 'Photo not found' }, { status: 404 })

  const newPending = (pending ?? []).filter((p) => p.id !== photoId)
  await redis.set(`photos:pending:${watchId}`, newPending)

  if (action === 'approve') {
    const approved = (await redis.get(`photos:${watchId}`)) as ApprovedPhoto[] | null
    await redis.set(`photos:${watchId}`, [...(approved ?? []), { ...photo, approved: true }])
  } else if (action === 'delete') {
    // Delete the blob file
    try {
      await del(photo.url, { token: process.env.BLOB_READ_WRITE_TOKEN })
    } catch {
      // Blob may already be deleted
    }
  }

  return NextResponse.json({ success: true })
}
