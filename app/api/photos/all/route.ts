import { NextRequest, NextResponse } from 'next/server'
import { getWatchById } from '@/lib/watches'
import { db } from '@/lib/db'
import { photos } from '@/lib/db/schema'
import { eq, lt, and } from 'drizzle-orm'

/**
 * GET /api/photos/all?limit=50&cursor=<timestamp>&brand=rolex
 * Fetch ALL approved photos across ALL watches from Postgres
 * Supports cursor-based pagination and optional brand filtering
 */
export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '50'), 100)
  const cursor = searchParams.get('cursor')
  const brand = searchParams.get('brand')?.toLowerCase() ?? ''

  try {
    // Build where condition
    const conditions = [eq(photos.status, 'approved')]
    if (cursor) {
      const cursorTime = new Date(cursor)
      conditions.push(lt(photos.createdAt, cursorTime))
    }

    // Fetch photos sorted by createdAt ascending, then reverse
    const photoRecords = await db
      .select()
      .from(photos)
      .where(conditions.length > 1 ? and(...conditions) : conditions[0])
      .orderBy((p) => p.createdAt)
      .limit(limit + 1)

    // Reverse to get descending order
    photoRecords.reverse()

    // Enrich photos with watch data
    const enriched = photoRecords.map((p) => {
      const watch = getWatchById(p.watchId)
      return {
        id: p.id,
        watchId: p.watchId,
        userId: p.userId,
        userName: p.userName,
        url: p.url,
        caption: p.caption ?? undefined,
        createdAt: p.createdAt.toISOString(),
        approved: true,
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

    // Take limit and compute next cursor
    const result = filtered.slice(0, limit)
    const nextCursor = filtered.length > limit ? result[result.length - 1]?.createdAt ?? null : null

    return NextResponse.json({
      photos: result,
      nextCursor,
    })
  } catch (error) {
    console.error('Error fetching all photos:', error)
    // Return empty result on error
    return NextResponse.json({
      photos: [],
      nextCursor: null,
    })
  }
}
