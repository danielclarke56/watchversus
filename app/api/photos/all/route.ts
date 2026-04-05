import { NextRequest, NextResponse } from 'next/server'
import { getWatchById, watches } from '@/lib/watches'
import { db } from '@/lib/db'
import { photos } from '@/lib/db/schema'
import { eq, lt, and, desc, or, ilike, inArray } from 'drizzle-orm'
import { checkAdmin } from '@/lib/admin'

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
    // Push search query to DB level (fixes pagination + filter mismatch)
    if (q && !watchId) {
      // Search against static watch library (name, brand, reference)
      const matchingWatchIds = watches
        .filter(
          (w) =>
            w.name?.toLowerCase().includes(q) ||
            w.brand?.toLowerCase().includes(q) ||
            w.reference?.toLowerCase().includes(q)
        )
        .map((w) => w.id)

      const searchConditions = [
        ilike(photos.brandName, `%${q}%`),
        ilike(photos.modelName, `%${q}%`),
        ilike(photos.referenceNumber, `%${q}%`),
        ilike(photos.watchId, `%${q}%`),
      ]

      // Only add inArray if we found matching watch IDs (inArray with empty array throws)
      if (matchingWatchIds.length > 0) {
        searchConditions.push(inArray(photos.watchId, matchingWatchIds))
      }

      conditions.push(or(...searchConditions)!)
    }

    // Fetch photos sorted by createdAt ascending, then reverse
    const photoRecords = await db
      .select({
        id: photos.id,
        watchId: photos.watchId,
        userId: photos.userId,
        userName: photos.userName,
        url: photos.url,
        status: photos.status,
        createdAt: photos.createdAt,
        brandName: photos.brandName,
        modelName: photos.modelName,
        referenceNumber: photos.referenceNumber,
        movement: photos.movement,
        caseSize: photos.caseSize,
        wristSize: photos.wristSize,
        estimatedPrice: photos.estimatedPrice,
        productionYear: photos.productionYear,
        lugToLug: photos.lugToLug,
        betweenLugs: photos.betweenLugs,
        thickness: photos.thickness,
        waterResistance: photos.waterResistance,
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
      return {
        id: p.id,
        watchId: p.watchId,
        userId: p.userId,
        userName: p.userName,
        isOfficial: p.userId ? checkAdmin(p.userId) : false,
        url: p.url,
        createdAt: p.createdAt.toISOString(),
        approved: true,
        watchSlug: watch?.slug ?? p.watchId,
        watchName: watch?.name ?? unslugify(p.watchId),
        watchBrand: watch?.brand ?? null,
        watchReference: watch?.reference ?? null,
        brandName: p.brandName ?? null,
        modelName: p.modelName ?? null,
        referenceNumber: p.referenceNumber ?? null,
        movement: p.movement ?? null,
        caseSize: p.caseSize ?? null,
        wristSize: p.wristSize ?? null,
        estimatedPrice: p.estimatedPrice ?? null,
        productionYear: p.productionYear ?? null,
        lugToLug: p.lugToLug ?? null,
        betweenLugs: p.betweenLugs ?? null,
        thickness: p.thickness ?? null,
        waterResistance: p.waterResistance ?? null,
      }
    })

    // Filter by brand if provided (only applies if watchId is not set)
    let filtered = enriched
    if (brand && !watchId) {
      filtered = enriched.filter((p) => p.watchBrand?.toLowerCase() === brand)
    }

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
