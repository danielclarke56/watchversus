import { MetadataRoute } from 'next'
import { db } from '@/lib/db'
import { photos } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { getAllGuides } from '@/lib/buyingGuides'

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
    lastModified: new Date(photo.createdAt),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  // Excluded from sitemap — all disallowed in robots.txt
  const brandsIndex: MetadataRoute.Sitemap = []
  const brandPages: MetadataRoute.Sitemap = []
  const watchesIndex: MetadataRoute.Sitemap = []
  const watchPages: MetadataRoute.Sitemap = []
  const stylesIndex: MetadataRoute.Sitemap = []
  const stylePages: MetadataRoute.Sitemap = []

  // Buying guide pages — static, no DB query needed
  const buyingGuidesIndex: MetadataRoute.Sitemap = [
    {
      url: `${base}/buying-guides`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.85,
    },
  ]

  const buyingGuidePages: MetadataRoute.Sitemap = [
    ...getAllGuides().map((p) => ({
      url: `${base}/buying-guide/${p.slug}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.80,
    })),
    {
      url: `${base}/buying-guide/under-100`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.80,
    },
    {
      url: `${base}/buying-guide/under-1000`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.80,
    },
  ]

  return [...staticPages, ...brandsIndex, ...watchesIndex, ...brandPages, ...stylesIndex, ...stylePages, ...buyingGuidesIndex, ...buyingGuidePages, ...watchPages, ...photoPages]
}
