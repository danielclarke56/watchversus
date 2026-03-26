import { NextRequest, NextResponse } from 'next/server'
import type { ApprovedPhoto } from '@/lib/photos'
import { getRedis } from '@/lib/redis'
import { getWatchById } from '@/lib/watches'
import fs from 'fs'
import path from 'path'

/**
 * GET /api/photos/all?limit=50&cursor=<timestamp>&brand=rolex
 * Fetch ALL approved photos across ALL watches from Redis
 * Supports cursor-based pagination and optional brand filtering
 */
export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '50'), 100)
  const cursor = searchParams.get('cursor')
  const brand = searchParams.get('brand')?.toLowerCase() ?? ''

  const redis = getRedis()
  let allPhotos: ApprovedPhoto[] = []

  if (redis) {
    const keys = await redis.keys('photos:*')
    const watchKeys = keys.filter((k) => !k.startsWith('photos:pending:'))

    for (const key of watchKeys) {
      const photos = (await redis.get(key)) as ApprovedPhoto[] | null
      if (photos && Array.isArray(photos)) {
        allPhotos.push(...photos)
      }
    }
  } else {
    const approvedFile = path.join(process.cwd(), 'data', 'approved-photos.json')
    if (fs.existsSync(approvedFile)) {
      allPhotos = JSON.parse(fs.readFileSync(approvedFile, 'utf8')) as ApprovedPhoto[]
    }
  }

  // Enrich photos with watch data
  const enriched = allPhotos.map((p) => {
    const watch = getWatchById(p.watchId)
    return {
      ...p,
      watchSlug: watch?.slug,
      watchName: watch?.name,
      watchBrand: watch?.brand,
    }
  })

  // Filter by brand if provided
  let filtered = enriched
  if (brand) {
    filtered = enriched.filter((p) => p.watchBrand?.toLowerCase() === brand)
  }

  // Sort by createdAt descending
  filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  // Apply cursor-based pagination
  if (cursor) {
    const cursorTime = new Date(cursor).getTime()
    filtered = filtered.filter((p) => new Date(p.createdAt).getTime() < cursorTime)
  }

  const photos = filtered.slice(0, limit)
  const nextCursor = photos.length >= limit ? photos[photos.length - 1]?.createdAt ?? null : null

  return NextResponse.json({
    photos,
    nextCursor,
  })
}
