import { MetadataRoute } from 'next'
import { db } from '@/lib/db'
import { photos } from '@/lib/db/schema'
import { eq, desc, sql } from 'drizzle-orm'

const MIN_PHOTOS_FOR_HUB = 3

export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = 'https://watchems.com'

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: base,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 1,
    },
    {
      url: `${base}/about`,
      lastModified: new Date('2025-01-01'),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${base}/terms`,
      lastModified: new Date('2025-01-01'),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${base}/privacy`,
      lastModified: new Date('2025-01-01'),
      changeFrequency: 'yearly',
      priority: 0.2,
    },
  ]

  // All approved photos — our SEO moat
  const allPhotos = await db
    .select({ id: photos.id, slug: photos.slug, createdAt: photos.createdAt })
    .from(photos)
    .where(eq(photos.status, 'approved'))
    .orderBy(desc(photos.createdAt))

  const photoPages: MetadataRoute.Sitemap = allPhotos.map((photo) => ({
    url: `${base}/photo/${photo.slug ?? photo.id}`,
    lastModified: photo.createdAt,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  // Watch hub pages — only those with enough photos to be useful
  const watchGroups = await db
    .select({
      watchId: photos.watchId,
      photoCount: sql<number>`count(*)::int`,
      lastModified: sql<Date>`max(${photos.createdAt})`,
    })
    .from(photos)
    .where(eq(photos.status, 'approved'))
    .groupBy(photos.watchId)
    .having(sql`count(*) >= ${MIN_PHOTOS_FOR_HUB}`)

  const watchPages: MetadataRoute.Sitemap = watchGroups.map((w) => ({
    url: `${base}/w/${w.watchId}`,
    lastModified: w.lastModified,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  return [...staticPages, ...watchPages, ...photoPages]
}
