import { NextRequest, NextResponse } from 'next/server'
import type { ApprovedPhoto } from '@/lib/photos'
import { getRedis } from '@/lib/redis'
import fs from 'fs'
import path from 'path'

/**
 * GET /api/profile/[userId]/photos
 * Fetch all approved photos for a specific user
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: { userId: string } }
) {
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

  // Filter by userId and sort by createdAt descending
  const userPhotos = allPhotos
    .filter((p) => p.userId === params.userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  return NextResponse.json(userPhotos)
}
