import { MetadataRoute } from 'next'
import { watches, comparisonTiers } from '@/lib/watches'
import { guides } from '@/lib/guideData'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://watchvswatch.com'
  // Use build date so timestamps are fresh on each deploy
  const lastMod = new Date()

  const staticPages = [
    { url: base, priority: 1.0 },
    { url: `${base}/watches`, priority: 0.9 },
    { url: `${base}/compare`, priority: 0.9 },
    { url: `${base}/guides`, priority: 0.9 },
    { url: `${base}/quiz`, priority: 0.7 },
    { url: `${base}/stats`, priority: 0.8 },
    { url: `${base}/request-comparison`, priority: 0.6 },
    { url: `${base}/about`, priority: 0.3 },
    { url: `${base}/privacy`, priority: 0.2 },
    { url: `${base}/terms`, priority: 0.2 },
  ].map((p) => ({
    ...p,
    lastModified: lastMod,
    changeFrequency: 'weekly' as const,
  }))

const guidePages = guides.map((g) => ({
    url: `${base}/guides/${g.slug}`,
    lastModified: lastMod,
    changeFrequency: 'weekly' as const,
    priority: 0.85,
  }))

  const watchPages = watches.map((w) => ({
    url: `${base}/watches/${w.slug}`,
    lastModified: lastMod,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  // Build comparison pages from tier data with tier-based priority
  const tierPriorityMap = { 1: 0.80, 2: 0.70, 3: 0.60 } as const
  const comparisonSlugs = new Set<string>()
  const comparisonPages: MetadataRoute.Sitemap = []

  for (const c of comparisonTiers) {
    const slug = `${c.slug1}-vs-${c.slug2}`
    if (!comparisonSlugs.has(slug)) {
      comparisonSlugs.add(slug)
      comparisonPages.push({
        url: `${base}/compare/${slug}`,
        lastModified: lastMod,
        changeFrequency: 'weekly' as const,
        priority: tierPriorityMap[c.tier],
      })
    }
  }

  return [...staticPages, ...guidePages, ...watchPages, ...comparisonPages]
}
