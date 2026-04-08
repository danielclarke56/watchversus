import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { photos } from '@/lib/db/schema'
import { eq, and, desc, ilike, ne } from 'drizzle-orm'
import { getWatchById } from '@/lib/watches'
import { checkAdmin } from '@/lib/admin'

/**
 * GET /api/photos/related?watchId=...&model=...&brand=...&excludeId=...
 * Batch endpoint: returns same-watch, same-model, same-brand, and fallback photos
 * in a single request instead of 3-4 sequential calls.
 */
export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams
  const watchId = searchParams.get('watchId') ?? ''
  const model = searchParams.get('model') ?? ''
  const brand = searchParams.get('brand') ?? ''
  const excludeId = searchParams.get('excludeId') ?? ''

  if (!watchId) {
    return NextResponse.json(
      { sameWatch: [], sameModel: [], sameBrand: [], fallback: [] },
      { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } }
    )
  }

  try {
    // Run all queries in parallel
    const [watchPhotos, modelPhotos, brandPhotos, fallbackPhotos] = await Promise.all([
      // Same watch
      db
        .select()
        .from(photos)
        .where(and(eq(photos.watchId, watchId), eq(photos.status, 'approved')))
        .orderBy(desc(photos.createdAt))
        .limit(12),

      // Same model (fuzzy match on model name)
      model
        ? db
            .select()
            .from(photos)
            .where(
              and(
                eq(photos.status, 'approved'),
                ne(photos.watchId, watchId),
                ilike(photos.modelName, `%${model}%`)
              )
            )
            .orderBy(desc(photos.createdAt))
            .limit(20)
        : Promise.resolve([]),

      // Same brand
      brand
        ? db
            .select()
            .from(photos)
            .where(
              and(
                eq(photos.status, 'approved'),
                ne(photos.watchId, watchId),
                ilike(photos.brandName, `%${brand}%`)
              )
            )
            .orderBy(desc(photos.createdAt))
            .limit(20)
        : Promise.resolve([]),

      // Fallback (trending)
      db
        .select()
        .from(photos)
        .where(eq(photos.status, 'approved'))
        .orderBy(desc(photos.createdAt))
        .limit(24),
    ])

    const unslugify = (slug: string): string =>
      slug.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')

    const enrich = (p: typeof watchPhotos[number]) => {
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

    // Deduplicate across tiers
    const seenIds = new Set<string>()
    if (excludeId) seenIds.add(excludeId)

    const dedupe = (items: typeof watchPhotos) =>
      items
        .filter((p) => {
          if (seenIds.has(p.id)) return false
          seenIds.add(p.id)
          return true
        })
        .map(enrich)

    const sameWatch = dedupe(watchPhotos)
    const sameModel = dedupe(modelPhotos)
    const sameBrand = dedupe(brandPhotos)

    // Only include fallback if we don't have enough diverse results
    const differentWatchCount = [...sameModel, ...sameBrand].filter((p) => p.watchId !== watchId).length
    const fallback = differentWatchCount < 8 ? dedupe(fallbackPhotos) : []

    return NextResponse.json(
      { sameWatch, sameModel, sameBrand, fallback },
      { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } }
    )
  } catch (error) {
    console.error('[/api/photos/related] Query failed:', error)
    return NextResponse.json(
      { sameWatch: [], sameModel: [], sameBrand: [], fallback: [] },
      { status: 500 }
    )
  }
}
