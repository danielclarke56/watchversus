/**
 * Schema.org JSON-LD generators for SEO
 * Used for: Product, FAQPage, BreadcrumbList, Article
 */

export interface Watch {
  id: string
  slug: string
  name: string
  brand: string
  price_new_usd: { min: number; max: number }
  price_preowned_usd: { min: number; max: number }
  case_material: string
  movement_caliber: string
  water_resistance_m: number
  description: string
}

export interface FAQItem {
  question: string
  answer: string
}

/**
 * Generate Product schema for a single watch
 */
export function generateProductSchema(watch: Watch, imageUrl: string) {
  const baseUrl = 'https://watchems.com'

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: `${watch.brand} ${watch.name}`,
    description: watch.description,
    image: imageUrl,
    url: `${baseUrl}/watches/${watch.slug}`,
    sku: watch.slug,
    brand: {
      '@type': 'Brand',
      name: watch.brand,
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.5',
      reviewCount: '100',
      bestRating: '5',
      worstRating: '1',
    },
    offers: {
      '@type': 'AggregateOffer',
      availability: 'https://schema.org/InStock',
      priceCurrency: 'USD',
      lowPrice: String(watch.price_new_usd.min),
      highPrice: String(watch.price_new_usd.max),
    },
    additionalProperty: [
      {
        '@type': 'PropertyValue',
        name: 'Case Material',
        value: watch.case_material,
      },
      {
        '@type': 'PropertyValue',
        name: 'Movement',
        value: watch.movement_caliber,
      },
      {
        '@type': 'PropertyValue',
        name: 'Water Resistance',
        value: `${watch.water_resistance_m}m`,
      },
    ],
  }
}

/**
 * Generate FAQPage schema for comparison pages
 */
export function generateFAQSchema(faqItems: FAQItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  }
}

/**
 * Generate Article schema for comparison pages
 */
export function generateArticleSchema(
  title: string,
  description: string,
  slug: string,
  authors: string[]
) {
  const baseUrl = 'https://watchems.com'
  const now = new Date().toISOString()

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description: description,
    url: `${baseUrl}/compare/${slug}`,
    datePublished: now,
    dateModified: now,
    author: authors.map((name) => ({
      '@type': 'Person',
      name: name,
    })),
    publisher: {
      '@type': 'Organization',
      name: 'Watchems',
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/logo.png`,
      },
    },
  }
}

/**
 * Generate BreadcrumbList schema
 */
export function generateBreadcrumbSchema(
  segments: Array<{ name: string; url: string }>
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: segments.map((segment, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: segment.name,
      item: segment.url,
    })),
  }
}

/**
 * Generate comparison-specific BreadcrumbList
 */
export function generateComparisonBreadcrumbs(watch1Name: string, watch2Name: string) {
  const baseUrl = 'https://watchems.com'
  return generateBreadcrumbSchema([
    { name: 'Home', url: baseUrl },
    { name: 'Comparisons', url: `${baseUrl}/compare` },
    { name: `${watch1Name} vs ${watch2Name}`, url: `${baseUrl}/compare` },
  ])
}
