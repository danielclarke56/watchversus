export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getWatchById, watches } from '@/lib/watches'
import { db } from '@/lib/db'
import { photos } from '@/lib/db/schema'
import { eq, lt, and, desc, or, ilike, inArray, sql as drizzleSql } from 'drizzle-orm'
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
      // Split into tokens so "rolex sub 41" matches all three fields independently
      const tokens = q.split(/\s+/).filter(Boolean)

      // Static watch library pre-filter: a watchId is included if ALL tokens match
      const matchingWatchIds = watches
        .filter((w) => {
          const haystack = [w.name, w.brand, w.reference, w.id].join(' ').toLowerCase()
          return tokens.every((t) => haystack.includes(t))
        })
        .map((w) => w.id)

      // Similarity threshold for typo tolerance — 0.25 is permissive enough for
      // "Rollex"→"Rolex" or "Submairner"→"Submariner" without too many false positives
      const SIMILARITY_THRESHOLD = 0.25

      // Each token must match at least one column (AND across tokens, OR across columns)
      // For tokens >= 4 chars, also try trigram similarity for typo tolerance
      for (const token of tokens) {
        const tokenConditions: ReturnType<typeof ilike>[] = [
          ilike(photos.brandName, `%${token}%`),
          ilike(photos.modelName, `%${token}%`),
          ilike(photos.referenceNumber, `%${token}%`),
          ilike(photos.watchId, `%${token}%`),
        ]

        // Add similarity() fuzzy match for longer tokens (avoids noise on short ones like "41")
        if (token.length >= 4) {
          tokenConditions.push(
            drizzleSql`similarity(${photos.brandName}, ${token}) > ${SIMILARITY_THRESHOLD}` as ReturnType<typeof ilike>
          )
          tokenConditions.push(
            drizzleSql`similarity(${photos.modelName}, ${token}) > ${SIMILARITY_THRESHOLD}` as ReturnType<typeof ilike>
          )
        }

        if (matchingWatchIds.length > 0) {
          tokenConditions.push(inArray(photos.watchId, matchingWatchIds) as unknown as ReturnType<typeof ilike>)
        }
        conditions.push(or(...tokenConditions)!)
      }
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
        sortOrder: photos.sortOrder,
        slug: photos.slug,
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
        sortOrder: p.sortOrder,
        slug: p.slug ?? null,
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

    const cacheHeader = 'no-store'

    return NextResponse.json(
      { photos: result, nextCursor },
      { headers: { 'Cache-Control': cacheHeader } }
    )
  } catch (error) {
    console.error('[/api/photos/all] Query failed:', error)
    return NextResponse.json(
      { error: 'Failed to fetch photos', photos: [], nextCursor: null },
      { status: 500 }
    )
  }
}
