import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { photos } from '@/lib/db/schema'
import { eq, and, desc, ilike, lt } from 'drizzle-orm'
import { checkAdmin } from '@/lib/admin'
import { checkReadRateLimit } from '@/lib/ratelimit'

const FALLBACK_PAGE_SIZE = 50

type PhotoRow = typeof photos.$inferSelect

const unslugify = (slug: string): string =>
  slug.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')

const enrich = (p: PhotoRow) => ({
  id: p.id,
  watchId: p.watchId,
  userId: p.userId,
  userName: p.userName,
  isOfficial: p.userId ? checkAdmin(p.userId) : false,
  url: p.url,
  createdAt: p.createdAt.toISOString(),
  watchSlug: p.watchId,
  watchName: [p.brandName, p.modelName].filter(Boolean).join(' ') || unslugify(p.watchId),
  watchBrand: p.brandName ?? null,
  watchReference: p.referenceNumber ?? null,
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
})

/**
 * GET /api/photos/related?watchId=...&brand=...&excludeId=...
 *      [&loadMore=1&cursor=<ISO timestamp>]
 *
 * Tiers:
 * - Tier 1: Same watch (other users' photos)
 * - Tier 2: Same brand (different watch)
 * - Tier 3: Recent approved photos (paginated fallback)
 */
export async function GET(req: NextRequest) {
  const { success } = await checkReadRateLimit(req)
  if (!success) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
  }
  const searchParams = req.nextUrl.searchParams
  const watchId = searchParams.get('watchId') ?? ''
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

    // ── First-page mode: tiered DB queries ───────────────────────────────────
    const [sameWatchPhotos, brandPhotos, fallbackRows] = await Promise.all([
      // Tier 1: Same watch
      db
        .select()
        .from(photos)
        .where(and(eq(photos.watchId, watchId), eq(photos.status, 'approved')))
        .orderBy(desc(photos.createdAt))
        .limit(12),

      // Tier 2: Same brand (different watch)
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

      // Tier 3: Recent approved photos (fallback)
      db
        .select()
        .from(photos)
        .where(eq(photos.status, 'approved'))
        .orderBy(desc(photos.createdAt))
        .limit(FALLBACK_PAGE_SIZE + 1),
    ])

    const seenIds = new Set<string>()
    if (excludeId) seenIds.add(excludeId)

    // Tier 1
    const sameWatch = sameWatchPhotos
      .filter((p) => { if (seenIds.has(p.id)) return false; seenIds.add(p.id); return true })
      .map(enrich)

    // Tier 2
    const brandRelated = brandPhotos
      .filter((p) => p.watchId !== watchId && !seenIds.has(p.id))
      .map((p) => { seenIds.add(p.id); return enrich(p) })

    // Tier 3
    const fallbackHasMore = fallbackRows.length > FALLBACK_PAGE_SIZE
    const fallbackPage = fallbackHasMore ? fallbackRows.slice(0, FALLBACK_PAGE_SIZE) : fallbackRows
    const fallback = fallbackPage
      .filter((p) => p.watchId !== watchId && !seenIds.has(p.id))
      .map((p) => { seenIds.add(p.id); return enrich(p) })

    const nextCursor = fallbackHasMore
      ? fallbackPage[fallbackPage.length - 1].createdAt.toISOString()
      : null

    return NextResponse.json(
      {
        sameWatch,
        related: [...brandRelated, ...fallback],
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
