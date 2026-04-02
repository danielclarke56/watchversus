import { MetadataRoute } from 'next'
import { db } from '@/lib/db'
import { photos } from '@/lib/db/schema'
import { eq, sql, and, desc } from 'drizzle-orm'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = 'https://watchvswatch.com'

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: base,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 1,
    },
    {
      url: `${base}/upload`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${base}/quiz`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${base}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${base}/terms`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${base}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.2,
    },
  ]

  // All approved photos — our SEO moat
  const allPhotos = await db
    .select({ id: photos.id, createdAt: photos.createdAt })
    .from(photos)
    .where(eq(photos.status, 'approved'))
    .orderBy(desc(photos.createdAt))

  const photoPages: MetadataRoute.Sitemap = allPhotos.map((photo) => ({
    url: `${base}/photo/${photo.id}`,
    lastModified: photo.createdAt,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  // All watches (distinct watchIds from approved photos)
  const watchIds = await db
    .selectDistinct({ watchId: photos.watchId })
    .from(photos)
    .where(eq(photos.status, 'approved'))

  const watchPages: MetadataRoute.Sitemap = watchIds.map((row) => ({
    url: `${base}/w/${row.watchId}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  // All brands (distinct brands from approved photos)
  const allBrands = await db
    .selectDistinct({
      brand: sql<string>`LOWER(TRIM(${photos.brandName}))`,
    })
    .from(photos)
    .where(and(eq(photos.status, 'approved'), sql`${photos.brandName} IS NOT NULL`))

  const brandPages: MetadataRoute.Sitemap = allBrands.map((row) => ({
    url: `${base}/brand/${encodeURIComponent(row.brand)}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }))

  return [...staticPages, ...photoPages, ...watchPages, ...brandPages]
}
