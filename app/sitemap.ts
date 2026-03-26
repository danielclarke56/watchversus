import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://watchvswatch.com'
  const lastMod = new Date()

  return [
    {
      url: base,
      lastModified: lastMod,
      changeFrequency: 'daily' as const,
      priority: 1.0,
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
}
