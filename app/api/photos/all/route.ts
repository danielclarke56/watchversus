import { NextRequest, NextResponse } from 'next/server'
import { getWatchById, watches } from '@/lib/watches'
import { db } from '@/lib/db'
import { photos } from '@/lib/db/schema'
import { eq, lt, and, desc, or, ilike, inArray } from 'drizzle-orm'
import { checkAdmin } from '@/lib/admin'

/**
 * GET /api/photos/all?limit=50&cursor=<timestamp>&brand=rolex&q=seiko
 * Fetch ALL approved photos across ALL watches from Postgres
 * Supports cursor-based pagination, brand filtering, and full-text search
 * Search filters are applied at the database level to find all matching photos, not just recent ones
 */
export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '50'), 100)
  const cursor = searchParams.get('cursor')
  const brand = searchParams.get('brand')?.toLowerCase() ?? ''
  const watchId = searchParams.get('watchId') ?? ''
  const q = searchParams.get('q')?.toLowerCase() ?? ''

  try {
    // Build where condition
    const conditions = [eq(photos.status, 'approved')]
    if (cursor) {
      const cursorTime = new Date(cursor)
      conditions.push(lt(photos.createdAt, cursorTime))
    }
    if (watchId) {
      conditions.push(eq(photos.watchId, watchId))
    }

    // If q (search query) is provided and no watchId, filter at DB level
    if (q && !watchId) {
      // Find watchIds from static library that match the query
      const matchingWatchIds = watches
        .filter((w) => {
          const name = (w.name ?? '').toLowerCase()
          const b = (w.brand ?? '').toLowerCase()
          return name.includes(q) || b.includes(q)
        })
        .map((w) => w.id)

      // Build search conditions array
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const photoFieldConditions: any[] = [
        ilike(photos.brandName, `%${q}%`),
        ilike(photos.modelName, `%${q}%`),
        ilike(photos.referenceNumber, `%${q}%`),
      ]

      // Add watchId condition if there are matches from the static library
      if (matchingWatchIds.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        photoFieldConditions.push(inArray(photos.watchId, matchingWatchIds) as any)
      }

      // Combine all search conditions with OR
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      conditions.push(or(...photoFieldConditions) as any)
    }

    // Fetch photos sorted by createdAt ascending, then reverse
    // Only select columns used by the gallery — avoids pulling spec fields over the wire
    const photoRecords = await db
      .select({
        id: photos.id,
        watchId: photos.watchId,
        userId: photos.userId,
        userName: photos.userName,
        url: photos.url,
        caption: photos.caption,
        status: photos.status,
        createdAt: photos.createdAt,
        brandName: photos.brandName,
        modelName: photos.modelName,
        referenceNumber: photos.referenceNumber,
      })
      .from(photos)
      .where(conditions.length > 1 ? and(...conditions) : conditions[0])
      .orderBy(desc(photos.createdAt))
      .limit(limit + 1)

    // Un-slugify a watchId as a display fallback (e.g. "tudor-black-bay-54" → "Tudor Black Bay 54")
    const unslugify = (slug: string): string =>
      slug.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')

    // Enrich photos with watch data
    const enriched = photoRecords.map((p) => {
      const watch = getWatchById(p.watchId)
      const isAdmin = checkAdmin(p.userId)
      return {
        id: p.id,
        watchId: p.watchId,
        userId: p.userId,
        userName: p.userName,
        url: p.url,
        caption: p.caption ?? undefined,
        createdAt: p.createdAt.toISOString(),
        approved: true,
        isOfficial: isAdmin,
        watchSlug: watch?.slug ?? p.watchId,
        watchName: watch?.name ?? unslugify(p.watchId),
        watchBrand: watch?.brand ?? null,
        watchReference: watch?.reference ?? null,
        brandName: p.brandName ?? null,
        modelName: p.modelName ?? null,
        referenceNumber: p.referenceNumber ?? null,
      }
    })

    // Filter by brand if provided (only applies if watchId is not set)
    let filtered = enriched
    if (brand && !watchId) {
      filtered = enriched.filter((p) => p.watchBrand?.toLowerCase() === brand)
    }

    // Note: free-text query filtering is now applied at the database level (see conditions above)
    // No client-side filtering needed

    // Take limit and compute next cursor
    const result = filtered.slice(0, limit)
    const nextCursor = filtered.length > limit ? result[result.length - 1]?.createdAt ?? null : null

    return NextResponse.json(
      { photos: result, nextCursor },
      { headers: { 'Cache-Control': 'no-store' } }
    )
  } catch (error) {
    console.error('[/api/photos/all] Query failed:', error)
    return NextResponse.json(
      { error: 'Failed to fetch photos', photos: [], nextCursor: null },
      { status: 500 }
    )
  }
}
