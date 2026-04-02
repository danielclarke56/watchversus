import { MetadataRoute } from 'next'
import { db } from '@/lib/db'
import { photos } from '@/lib/db/schema'
import { eq, sql, and } from 'drizzle-orm'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = 'https://watchvswatch.com'
  const lastMod = new Date()

  // Fetch all distinct watchIds with approved photos
  const watchIds = await db
    .selectDistinct({ watchId: photos.watchId })
    .from(photos)
    .where(eq(photos.status, 'approved'))

  // Fetch all distinct brands with approved photos
  const brands = await db
    .selectDistinct({
      brand: sql<string>`LOWER(TRIM(${photos.brandName}))`,
    })
    .from(photos)
    .where(and(eq(photos.status, 'approved'), sql`${photos.brandName} IS NOT NULL`))

  // Fetch all approved photo IDs
  const photoIds = await db
    .select({ id: photos.id })
    .from(photos)
    .where(eq(photos.status, 'approved'))

  const watchPages = watchIds.map((row) => ({
    url: `${base}/w/${row.watchId}`,
    lastModified: lastMod,
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }))

  const brandPages = brands.map((row) => ({
    url: `${base}/brand/${encodeURIComponent(row.brand)}`,
    lastModified: lastMod,
    changeFrequency: 'daily' as const,
    priority: 0.7,
  }))

  const photoPages = photoIds.map((row) => ({
    url: `${base}/photo/${row.id}`,
    lastModified: lastMod,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  const staticPages = [
    {
      url: base,
      lastModified: lastMod,
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    {
      url: `${base}/explore`,
      lastModified: lastMod,
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${base}/upload`,
      lastModified: lastMod,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${base}/about`,
      lastModified: lastMod,
      changeFrequency: 'monthly' as const,
      priority: 0.3,
    },
    {
      url: `${base}/privacy`,
      lastModified: lastMod,
      changeFrequency: 'yearly' as const,
      priority: 0.2,
    },
    {
      url: `${base}/terms`,
      lastModified: lastMod,
      changeFrequency: 'yearly' as const,
      priority: 0.2,
    },
  ]

  return [...staticPages, ...brandPages, ...watchPages, ...photoPages]
}
