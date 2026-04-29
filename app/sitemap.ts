import { MetadataRoute } from 'next'
import { db } from '@/lib/db'
import { photos } from '@/lib/db/schema'
import { eq, desc, sql, isNotNull, and } from 'drizzle-orm'
import { getStyleByDbValue } from '@/lib/styleData'

const MIN_PHOTOS_FOR_HUB = 3
const MIN_PHOTOS_FOR_STYLE_HUB = 5

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

  // Brand hub pages — one per distinct brand with approved photos
  const brandGroups = await db
    .select({
      brandName: photos.brandName,
      lastModified: sql<Date>`max(${photos.createdAt})`,
    })
    .from(photos)
    .where(and(eq(photos.status, 'approved'), isNotNull(photos.brandName)))
    .groupBy(photos.brandName)

  const brandPages: MetadataRoute.Sitemap = brandGroups
    .filter((b) => b.brandName)
    .map((b) => ({
      url: `${base}/brand/${encodeURIComponent(b.brandName!.toLowerCase())}`,
      lastModified: b.lastModified,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))

  // Brands index
  const brandsIndex: MetadataRoute.Sitemap = [
    {
      url: `${base}/brands`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
  ]

  // Style hub pages
  const styleHubGroups = await db
    .select({
      watchStyle: photos.watchStyle,
      lastModified: sql<Date>`max(${photos.createdAt})`,
    })
    .from(photos)
    .where(and(eq(photos.status, 'approved'), isNotNull(photos.watchStyle)))
    .groupBy(photos.watchStyle)
    .having(sql`count(*) >= ${MIN_PHOTOS_FOR_STYLE_HUB}`)

  const stylePages: MetadataRoute.Sitemap = styleHubGroups
    .filter((s) => s.watchStyle && getStyleByDbValue(s.watchStyle))
    .map((s) => ({
      url: `${base}/style/${getStyleByDbValue(s.watchStyle!)!.slug}`,
      lastModified: s.lastModified,
      changeFrequency: 'weekly' as const,
      priority: 0.75,
    }))

  // Styles index
  const stylesIndex: MetadataRoute.Sitemap = [
    {
      url: `${base}/styles`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.85,
    },
  ]

  return [...staticPages, ...brandsIndex, ...brandPages, ...stylesIndex, ...stylePages, ...watchPages, ...photoPages]
}
