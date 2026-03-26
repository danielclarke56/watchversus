import { NextRequest, NextResponse } from 'next/server'
import type { ApprovedPhoto } from '@/lib/photos'
import { getRedis } from '@/lib/redis'
import fs from 'fs'
import path from 'path'

/**
 * GET /api/photos/all?limit=50&cursor=<timestamp>
 * Fetch ALL approved photos across ALL watches from Redis
 * Supports cursor-based pagination
 */
export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '50'), 100)
  const cursor = searchParams.get('cursor')

  const redis = getRedis()
  let allPhotos: ApprovedPhoto[] = []

  if (redis) {
    // Get all watch keys (exclude pending keys)
    const keys = await redis.keys('photos:*')
    const watchKeys = keys.filter((k) => !k.startsWith('photos:pending:'))

    // Fetch all photos from each watch
    for (const key of watchKeys) {
      const photos = (await redis.get(key)) as ApprovedPhoto[] | null
      if (photos && Array.isArray(photos)) {
        allPhotos.push(...photos)
      }
    }
  } else {
    // Local fallback: read from approved-photos.json
    const approvedFile = path.join(process.cwd(), 'data', 'approved-photos.json')
    if (fs.existsSync(approvedFile)) {
      allPhotos = JSON.parse(fs.readFileSync(approvedFile, 'utf8')) as ApprovedPhoto[]
    }
  }

  // Sort by createdAt descending
  allPhotos.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  // Apply cursor-based pagination
  let filtered = allPhotos
  if (cursor) {
    const cursorTime = new Date(cursor).getTime()
    filtered = allPhotos.filter((p) => new Date(p.createdAt).getTime() < cursorTime)
  }

  // Slice to limit
  const photos = filtered.slice(0, limit)
  const nextCursor = photos.length >= limit ? photos[photos.length - 1]?.createdAt ?? null : null

  return NextResponse.json({
    photos,
    nextCursor,
  })
}
