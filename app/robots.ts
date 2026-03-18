import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/compare',
          '/brand',
          '/brands',
          '/watches',
          '/guides',
          '/quiz',
          '/rankings',
          '/reviews',
          '/about',
        ],
        disallow: [
          '/api',
          '/admin',
          '/sign-in',
          '/sign-up',
          '/_next',
          '/private',
        ],
      },
      // AI training bots (explicit allow for key content)
      {
        userAgent: ['Googlebot', 'GPTBot', 'Claude-Web', 'Anthropic-AI', 'PerplexityBot', 'CCBot'],
        allow: '/',
      },
    ],
    sitemap: 'https://watchvswatch.com/sitemap.xml',
  }
}
