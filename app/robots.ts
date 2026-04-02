import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/upload',
          '/about',
        ],
        disallow: [
          '/api',
          '/admin',
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
    sitemap: 'https://watchvswatch.com/sitemap.xml',
  }
}
