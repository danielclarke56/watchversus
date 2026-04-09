export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getWatchById, watches } from '@/lib/watches'
import { db } from '@/lib/db'
import { photos } from '@/lib/db/schema'
import { eq, lt, and, desc, or, ilike, inArray, sql as drizzleSql } from 'drizzle-orm'
import { checkAdmin } from '@/lib/admin'
import { checkReadRateLimit } from '@/lib/ratelimit'

/**
 * GET /api/photos/all?limit=50&cursor=<timestamp>&brand=rolex&movement=automatic&priceMin=500&priceMax=2000&caseSizeMin=38&caseSizeMax=42
 * Fetch ALL approved photos across ALL watches from Postgres
 * Supports cursor-based pagination, text search, and filter chips
 */
export async function GET(req: NextRequest) {
  const { success } = await checkReadRateLimit(req)
  if (!success) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
  }
  const searchParams = req.nextUrl.searchParams
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '50'), 100)
  const cursor = searchParams.get('cursor')
  const brand = searchParams.get('brand')?.toLowerCase() ?? ''
  const watchId = searchParams.get('watchId') ?? ''
  const userId = searchParams.get('userId') ?? ''
  const q = searchParams.get('q')?.toLowerCase() ?? ''

  // New filter params
  const filterMovement = searchParams.get('movement')?.toLowerCase() ?? ''
  const priceMin = searchParams.get('priceMin') ? parseInt(searchParams.get('priceMin')!) : null
  const priceMax = searchParams.get('priceMax') ? parseInt(searchParams.get('priceMax')!) : null
  const caseSizeMin = searchParams.get('caseSizeMin') ? parseInt(searchParams.get('caseSizeMin')!) : null
  const caseSizeMax = searchParams.get('caseSizeMax') ? parseInt(searchParams.get('caseSizeMax')!) : null

  try {
    // Pre-filter static watch library by chip filters to get matching watchIds
    let chipFilteredWatchIds: string[] | null = null
    if (filterMovement || priceMin !== null || priceMax !== null || caseSizeMin !== null || caseSizeMax !== null || brand) {
      const filtered = watches.filter((w) => {
        if (brand && w.brand.toLowerCase() !== brand) return false
        if (filterMovement && w.movement_type !== filterMovement) return false
        if (priceMin !== null && w.price_new_usd.max < priceMin) return false
        if (priceMax !== null && w.price_new_usd.min > priceMax) return false
        if (caseSizeMin !== null && w.case_diameter_mm < caseSizeMin) return false
        if (caseSizeMax !== null && w.case_diameter_mm > caseSizeMax) return false
        return true
      })
      chipFilteredWatchIds = filtered.map((w) => w.id)
    }

    // Build where condition
    const conditions = [eq(photos.status, 'approved')]
    if (cursor) {
      const cursorTime = new Date(cursor)
      conditions.push(lt(photos.createdAt, cursorTime))
    }
    if (watchId) {
      conditions.push(eq(photos.watchId, watchId))
    }
    if (userId) {
      conditions.push(eq(photos.userId, userId))
    }

    // Apply chip filters via watchId IN (...)
    if (chipFilteredWatchIds !== null && !watchId) {
      if (chipFilteredWatchIds.length === 0) {
        // No watches match filters — return empty
        return NextResponse.json(
          { photos: [], nextCursor: null, totalCount: 0 },
          { headers: { 'Cache-Control': 'no-store' } }
        )
      }

      // Also match photos whose DB-level fields match the filters (user-submitted photos
      // that may not be in the static watch library)
      const dbFilterConditions: ReturnType<typeof ilike>[] = []

      if (filterMovement) {
        dbFilterConditions.push(ilike(photos.movement, `%${filterMovement}%`))
      }

      // Combine static library match + DB field match
      if (dbFilterConditions.length > 0) {
        conditions.push(
          or(
            inArray(photos.watchId, chipFilteredWatchIds),
            ...dbFilterConditions
          )!
        )
      } else {
        conditions.push(inArray(photos.watchId, chipFilteredWatchIds))
      }
    }

    // Push search query to DB level (fixes pagination + filter mismatch)
    if (q && !watchId) {
      // Split into tokens so "rolex sub 41" matches all three fields independently
      const tokens = q.split(/\s+/).filter(Boolean)

      // Static watch library pre-filter: a watchId is included if ALL tokens match
      // Also check movement_type, water_resistance_m, and price fields
      const matchingWatchIds = watches
        .filter((w) => {
          const haystack = [
            w.name,
            w.brand,
            w.reference,
            w.id,
            w.movement_type,
            w.water_resistance_m ? `${w.water_resistance_m}m` : '',
            w.case_diameter_mm ? `${w.case_diameter_mm}mm` : '',
            w.primary_category,
          ].join(' ').toLowerCase()
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
          // Extend search to match specs
          ilike(photos.movement, `%${token}%`),
          ilike(photos.waterResistance, `%${token}%`),
          ilike(photos.estimatedPrice, `%${token}%`),
          ilike(photos.caseSize, `%${token}%`),
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

    const whereClause = conditions.length > 1 ? and(...conditions) : conditions[0]

    const hasActiveFilter = !!(q || brand || filterMovement || priceMin !== null || priceMax !== null || caseSizeMin !== null || caseSizeMax !== null)

    // Run count query in parallel with the data query
    const [photoRecords, countResult] = await Promise.all([
      db
        .select({
          id: photos.id,
          watchId: photos.watchId,
          userId: photos.userId,
          userName: photos.userName,
          url: photos.url,
          thumbnailUrl: photos.thumbnailUrl,
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
        .where(whereClause)
        .orderBy(desc(photos.createdAt))
        .limit(limit + 1),
      hasActiveFilter
        ? db
            .select({ count: drizzleSql<number>`count(*)::int` })
            .from(photos)
            .where(whereClause)
            .then((r) => r[0]?.count ?? 0)
        : Promise.resolve(null),
    ])

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
        thumbnailUrl: p.thumbnailUrl ?? null,
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

    // Take limit and compute next cursor
    const result = enriched.slice(0, limit)
    const nextCursor = enriched.length > limit ? result[result.length - 1]?.createdAt ?? null : null

    return NextResponse.json(
      { photos: result, nextCursor, totalCount: countResult },
      { headers: { 'Cache-Control': 'no-store' } }
    )
  } catch (error) {
    console.error('[/api/photos/all] Query failed:', error)
    return NextResponse.json(
      { error: 'Failed to fetch photos', photos: [], nextCursor: null, totalCount: 0 },
      { status: 500 }
    )
  }
}
