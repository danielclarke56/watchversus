import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/photo/',
          '/w/',
          '/brand/',
          '/brands',
          '/style/',
          '/styles',
          '/watches',
          '/upload',
          '/about',
          '/profile',
        ],
        disallow: [
          '/api',
          '/admin',
          '/dashboard',
          '/sign-in',
          '/sign-up',
          '/_next',
          '/private',
          '/watches/*',
          '/quiz',
        ],
      },
      // AI training bots (explicit allow for key content)
      {
        userAgent: ['Googlebot', 'GPTBot', 'Claude-Web', 'Anthropic-AI', 'PerplexityBot', 'CCBot'],
        allow: '/',
      },
    ],
    sitemap: [
      'https://watchems.com/sitemap.xml',
      'https://watchems.com/image-sitemap.xml',
    ],
  }
}
