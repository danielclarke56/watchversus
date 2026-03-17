import { MetadataRoute } from 'next'
import { watches, popularComparisons } from '@/lib/watches'
import { brands } from '@/lib/brandData'
import { guides } from '@/lib/guideData'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://watchvswatch.com'

  const staticPages = [
    { url: base, priority: 1.0 },
    { url: `${base}/watches`, priority: 0.9 },
    { url: `${base}/compare`, priority: 0.9 },
    { url: `${base}/brands`, priority: 0.85 },
    { url: `${base}/guides`, priority: 0.85 },
    { url: `${base}/reviews`, priority: 0.8 },
    { url: `${base}/quiz`, priority: 0.8 },
    { url: `${base}/about`, priority: 0.5 },
  ].map((p) => ({
    ...p,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
  }))

  const brandPages = brands.map((b) => ({
    url: `${base}/brands/${b.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.75,
  }))

  const guidePages = guides.map((g) => ({
    url: `${base}/guides/${g.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  const watchPages = watches.map((w) => ({
    url: `${base}/watches/${w.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  const comparisonPages = popularComparisons.map((c) => ({
    url: `${base}/compare/${c.slug1}-vs-${c.slug2}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  return [...staticPages, ...brandPages, ...guidePages, ...watchPages, ...comparisonPages]
}
