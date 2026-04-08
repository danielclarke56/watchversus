import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { photos } from '@/lib/db/schema'
import { eq, and, desc, ilike, inArray } from 'drizzle-orm'
import { getWatchById, watches } from '@/lib/watches'
import { getSuggestedComparisons } from '@/lib/comparisons'
import { checkAdmin } from '@/lib/admin'
import { checkReadRateLimit } from '@/lib/ratelimit'

const MAX_PER_WATCH = 3 // Limit photos per watch for diversity

/**
 * GET /api/photos/related?watchId=...&model=...&brand=...&excludeId=...
 * Smart related photos endpoint using:
 * - Tier 1: Same watch (other users' photos)
 * - Tier 2: Curated alternatives + comparison pairs (from watches.json + comparison-tiers.json)
 * - Tier 3: Same category + similar price range
 * - Tier 4: Same brand (different category/price)
 * - Tier 5: Fallback (trending from matching style/category, then recent)
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

  if (!watchId) {
    return NextResponse.json(
      { sameWatch: [], related: [] },
      { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } }
    )
  }

  try {
    // Look up the current watch in the static library for smart matching
    const currentWatch = watches.find((w) => w.id === watchId) ?? null

    // Build ranked list of related watch IDs using the comparison scoring algorithm
    // This leverages: alternatives[], comparison-tiers, category, price, brand, score
    const rankedRelated = currentWatch
      ? getSuggestedComparisons(currentWatch, 20)
      : []

    // Split ranked watches into tiers for query prioritization
    const alternativeIds = rankedRelated.slice(0, 6).map((w) => w.id)  // Top 6: alternatives + curated pairs
    const categoryIds = rankedRelated.slice(6, 14).map((w) => w.id)     // Next 8: same category/price
    const remainingIds = rankedRelated.slice(14).map((w) => w.id)        // Rest: same brand etc.

    // Same-category watches NOT already in rankedRelated (for broader discovery)
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

    // Collect all watch IDs we want photos for (deduplicated)
    const allRelatedIds = Array.from(new Set([
      ...alternativeIds,
      ...categoryIds,
      ...remainingIds,
      ...categoryFallbackIds,
    ]))

    // Run queries in parallel
    const [sameWatchPhotos, relatedPhotos, brandPhotos, fallbackPhotos] = await Promise.all([
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
        : Promise.resolve([]),

      // Brand fallback: same brand photos not in the ranked list (for model name matching)
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
        : Promise.resolve([]),

      // Final fallback: recent approved photos
      db
        .select()
        .from(photos)
        .where(eq(photos.status, 'approved'))
        .orderBy(desc(photos.createdAt))
        .limit(24),
    ])

    const unslugify = (slug: string): string =>
      slug.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')

    const enrich = (p: typeof sameWatchPhotos[number]) => {
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

    // Deduplicate and enforce per-watch diversity limit
    const seenIds = new Set<string>()
    const watchPhotoCount = new Map<string, number>()
    if (excludeId) seenIds.add(excludeId)

    const dedupeWithLimit = (items: typeof sameWatchPhotos, perWatchLimit: number = MAX_PER_WATCH) =>
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

    // Tiers 2-4: Sort related photos by their rank in the scoring algorithm
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

    // Brand photos not already included
    const brandRelated = dedupeWithLimit(
      brandPhotos.filter((p) => p.watchId !== watchId)
    )

    // Fallback — only if we don't have enough diversity
    const uniqueWatches = new Set([...related, ...brandRelated].map((p) => p.watchId))
    const fallback = uniqueWatches.size < 6
      ? dedupeWithLimit(fallbackPhotos.filter((p) => p.watchId !== watchId))
      : []

    return NextResponse.json(
      {
        sameWatch,
        related: [...related, ...brandRelated, ...fallback],
      },
      { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } }
    )
  } catch (error) {
    console.error('[/api/photos/related] Query failed:', error)
    return NextResponse.json(
      { sameWatch: [], related: [] },
      { status: 500 }
    )
  }
}
