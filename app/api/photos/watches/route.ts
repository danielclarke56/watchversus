import { NextResponse } from 'next/server'
import { getWatchById } from '@/lib/watches'
import { db } from '@/lib/db'
import { photos } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { count } from 'drizzle-orm'

/**
 * GET /api/photos/watches
 * Fetch all distinct watches that have at least 1 approved photo
 * Returns watches enriched with metadata, sorted by photo count (descending)
 */
export async function GET() {
  try {
    // Query for distinct watchIds with approved photos, grouped with count
    const photosByWatch = await db
      .select({
        watchId: photos.watchId,
        photoCount: count(photos.id),
      })
      .from(photos)
      .where(eq(photos.status, 'approved'))
      .groupBy(photos.watchId)

    // Un-slugify a watchId as a display fallback (e.g. "tudor-black-bay-54" → "Tudor Black Bay 54")
    const unslugify = (slug: string): string =>
      slug.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')

    // Enrich with watch data from static library
    const enrichedWatches = photosByWatch
      .map((item) => {
        const watch = getWatchById(item.watchId)
        return {
          watchId: item.watchId,
          watchName: watch?.name ?? unslugify(item.watchId),
          watchBrand: watch?.brand ?? null,
          watchReference: watch?.reference ?? null,
          count: item.photoCount,
        }
      })
      // Sort by count descending (most-photographed first)
      .sort((a, b) => b.count - a.count)

    return NextResponse.json({
      watches: enrichedWatches,
    })
  } catch (error) {
    console.error('Error fetching watches with photos:', error)
    return NextResponse.json(
      { watches: [] },
      { status: 500 }
    )
  }
}
