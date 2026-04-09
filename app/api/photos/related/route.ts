import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { photos } from '@/lib/db/schema'
import { eq, and, desc, ilike, inArray, lt } from 'drizzle-orm'
import { getWatchById, watches } from '@/lib/watches'
import { getSuggestedComparisons } from '@/lib/comparisons'
import { checkAdmin } from '@/lib/admin'
import { checkReadRateLimit } from '@/lib/ratelimit'

const MAX_PER_WATCH = 3 // Limit photos per watch for diversity (smart-ranked tiers only)
const FALLBACK_PAGE_SIZE = 50

type PhotoRow = typeof photos.$inferSelect

const unslugify = (slug: string): string =>
  slug.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')

const enrich = (p: PhotoRow) => {
  const watch = getWatchById(p.watchId)
  return {
    id: p.id,
    watchId: p.watchId,
    userId: p.userId,
    userName: p.userName,
    isOfficial: p.userId ? checkAdmin(p.userId) : false,
    url: p.url,
    createdAt: p.createdAt.toISOString(),
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
}

/**
 * GET /api/photos/related?watchId=...&model=...&brand=...&excludeId=...
 *      [&loadMore=1&cursor=<ISO timestamp>]
 *
 * First-page request returns smart-ranked photos + first page of fallback + nextCursor.
 * Subsequent requests with `loadMore=1` skip the smart tiers and return only the next
 * page of fallback (recent approved photos), enabling Pinterest-style infinite scroll.
 *
 * Smart tiers (first page only):
 * - Tier 1: Same watch (other users' photos)
 * - Tier 2: Curated alternatives + comparison pairs
 * - Tier 3: Same category + similar price range
 * - Tier 4: Same brand (different category/price)
 * - Tier 5: Recent fallback (paginated via cursor on every page)
 */
export async function GET(req: NextRequest) {
  const { success } = await checkReadRateLimit(req)
  if (!success) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
  }
  const searchParams = req.nextUrl.searchParams
  const watchId = searchParams.get('watchId') ?? ''
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const model = searchParams.get('model') ?? ''
  const brand = searchParams.get('brand') ?? ''
  const excludeId = searchParams.get('excludeId') ?? ''
  const loadMore = searchParams.get('loadMore') === '1'
  const cursor = searchParams.get('cursor')

  if (!watchId) {
    return NextResponse.json(
      { sameWatch: [], related: [], nextCursor: null },
      { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } }
    )
  }

  const cacheHeaders = { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' }

  try {
    // ── Load-more mode: only paginate the recent-photos fallback ─────────────
    if (loadMore) {
      const cursorTime = cursor ? new Date(cursor) : null
      const conditions = [eq(photos.status, 'approved')]
      if (cursorTime && !isNaN(cursorTime.getTime())) {
        conditions.push(lt(photos.createdAt, cursorTime))
      }

      const rows = await db
        .select()
        .from(photos)
        .where(and(...conditions))
        .orderBy(desc(photos.createdAt))
        .limit(FALLBACK_PAGE_SIZE + 1)

      const hasMore = rows.length > FALLBACK_PAGE_SIZE
      const pageRows = hasMore ? rows.slice(0, FALLBACK_PAGE_SIZE) : rows
      const filtered = pageRows.filter((p) => p.id !== excludeId && p.watchId !== watchId)
      const related = filtered.map(enrich)
      const nextCursor = hasMore ? pageRows[pageRows.length - 1].createdAt.toISOString() : null

      return NextResponse.json(
        { sameWatch: [], related, nextCursor },
        { headers: cacheHeaders }
      )
    }

    // ── First-page mode: smart tiers + first fallback page ───────────────────
    const currentWatch = watches.find((w) => w.id === watchId) ?? null

    // Build ranked list of related watch IDs using the comparison scoring algorithm
    const rankedRelated = currentWatch
      ? getSuggestedComparisons(currentWatch, 20)
      : []

    const alternativeIds = rankedRelated.slice(0, 6).map((w) => w.id)
    const categoryIds = rankedRelated.slice(6, 14).map((w) => w.id)
    const remainingIds = rankedRelated.slice(14).map((w) => w.id)

    const categoryFallbackIds = currentWatch
      ? watches
          .filter((w) =>
            w.id !== watchId &&
            w.primary_category === currentWatch.primary_category &&
            !rankedRelated.some((r) => r.id === w.id)
          )
          .slice(0, 10)
          .map((w) => w.id)
      : []

    const allRelatedIds = Array.from(new Set([
      ...alternativeIds,
      ...categoryIds,
      ...remainingIds,
      ...categoryFallbackIds,
    ]))

    const [sameWatchPhotos, relatedPhotos, brandPhotos, fallbackRows] = await Promise.all([
      // Tier 1: Same watch
      db
        .select()
        .from(photos)
        .where(and(eq(photos.watchId, watchId), eq(photos.status, 'approved')))
        .orderBy(desc(photos.createdAt))
        .limit(12),

      // Tiers 2-4: All ranked related watches in one query
      allRelatedIds.length > 0
        ? db
            .select()
            .from(photos)
            .where(and(
              eq(photos.status, 'approved'),
              inArray(photos.watchId, allRelatedIds)
            ))
            .orderBy(desc(photos.createdAt))
            .limit(80)
        : Promise.resolve([] as PhotoRow[]),

      // Brand fallback: same brand photos not in the ranked list
      brand
        ? db
            .select()
            .from(photos)
            .where(and(
              eq(photos.status, 'approved'),
              ilike(photos.brandName, `%${brand}%`)
            ))
            .orderBy(desc(photos.createdAt))
            .limit(30)
        : Promise.resolve([] as PhotoRow[]),

      // Tier 5: First page of recent approved photos (paginated)
      db
        .select()
        .from(photos)
        .where(eq(photos.status, 'approved'))
        .orderBy(desc(photos.createdAt))
        .limit(FALLBACK_PAGE_SIZE + 1),
    ])

    // Deduplicate and enforce per-watch diversity limit (smart tiers only)
    const seenIds = new Set<string>()
    const watchPhotoCount = new Map<string, number>()
    if (excludeId) seenIds.add(excludeId)

    const dedupeWithLimit = (items: PhotoRow[], perWatchLimit: number = MAX_PER_WATCH) =>
      items
        .filter((p) => {
          if (seenIds.has(p.id)) return false
          const count = watchPhotoCount.get(p.watchId) ?? 0
          if (p.watchId !== watchId && count >= perWatchLimit) return false
          seenIds.add(p.id)
          watchPhotoCount.set(p.watchId, count + 1)
          return true
        })
        .map(enrich)

    // Tier 1: Same watch (no per-watch limit — show all angles)
    const sameWatch = sameWatchPhotos
      .filter((p) => {
        if (seenIds.has(p.id)) return false
        seenIds.add(p.id)
        return true
      })
      .map(enrich)

    // Tiers 2-4: Sort by rank
    const rankMap = new Map<string, number>()
    alternativeIds.forEach((id, i) => rankMap.set(id, i))
    categoryIds.forEach((id, i) => rankMap.set(id, 100 + i))
    remainingIds.forEach((id, i) => rankMap.set(id, 200 + i))
    categoryFallbackIds.forEach((id, i) => rankMap.set(id, 300 + i))

    const sortedRelated = relatedPhotos.sort((a, b) => {
      const rankA = rankMap.get(a.watchId) ?? 999
      const rankB = rankMap.get(b.watchId) ?? 999
      return rankA - rankB
    })

    const related = dedupeWithLimit(sortedRelated)

    const brandRelated = dedupeWithLimit(
      brandPhotos.filter((p) => p.watchId !== watchId)
    )

    // Tier 5 fallback: no per-watch cap — we want full discovery breadth here.
    // Still dedupe by photo id against everything seen above so we don't repeat smart matches.
    const fallbackHasMore = fallbackRows.length > FALLBACK_PAGE_SIZE
    const fallbackPage = fallbackHasMore ? fallbackRows.slice(0, FALLBACK_PAGE_SIZE) : fallbackRows
    const fallback = fallbackPage
      .filter((p) => {
        if (seenIds.has(p.id)) return false
        if (p.watchId === watchId) return false
        seenIds.add(p.id)
        return true
      })
      .map(enrich)

    const nextCursor = fallbackHasMore
      ? fallbackPage[fallbackPage.length - 1].createdAt.toISOString()
      : null

    return NextResponse.json(
      {
        sameWatch,
        related: [...related, ...brandRelated, ...fallback],
        nextCursor,
      },
      { headers: cacheHeaders }
    )
  } catch (error) {
    console.error('[/api/photos/related] Query failed:', error)
    return NextResponse.json(
      { sameWatch: [], related: [], nextCursor: null },
      { status: 500 }
    )
  }
}
