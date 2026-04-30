import type { Metadata } from 'next'
import Link from 'next/link'
import { prices } from '@/lib/priceData'

export const metadata: Metadata = {
  title: 'Watch Buying Guides by Price | Watchems',
  description: 'Expert buying guides for watches at every price point — from the best watches under $500 to luxury pieces over $50,000.',
  alternates: {
    canonical: 'https://watchems.com/prices',
  },
  openGraph: {
    title: 'Watch Buying Guides by Price | Watchems',
    description: 'Expert buying guides for watches at every price point — from the best watches under $500 to luxury pieces over $50,000.',
    url: 'https://watchems.com/prices',
    type: 'website',
    siteName: 'Watchems',
  },
}

export default function PricesPage() {
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://watchems.com' },
      { '@type': 'ListItem', position: 2, name: 'Price Guides', item: 'https://watchems.com/prices' },
    ],
  }

  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Watch Buying Guides by Price',
    itemListElement: prices.map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: p.name,
      url: `https://watchems.com/price/${p.slug}`,
    })),
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }} />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">

        {/* Breadcrumb */}
        <nav className="text-xs text-gray-400 mb-6 flex items-center gap-1.5">
          <Link href="/" className="hover:text-gray-600 transition-colors">Home</Link>
          <span>/</span>
          <span className="text-gray-600">Price Guides</span>
        </nav>

        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">
            Watch Buying Guides by Price
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            What to expect, which models stand out, and honest trade-offs — at every budget.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {prices.map((entry) => (
            <Link
              key={entry.slug}
              href={`/price/${entry.slug}`}
              className="group block rounded-xl border border-gray-100 hover:border-gray-300 bg-white p-5 transition-colors"
            >
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">
                {entry.shortLabel}
              </p>
              <h2 className="text-base font-semibold text-gray-900 group-hover:text-accent transition-colors mb-2">
                {entry.name}
              </h2>
              <p className="text-xs text-gray-500 leading-relaxed line-clamp-3">
                {entry.overview.split('\n\n')[0].trim()}
              </p>
              <p className="text-xs font-medium text-gray-400 mt-3 group-hover:text-gray-600 transition-colors">
                Read guide →
              </p>
            </Link>
          ))}
        </div>

      </main>
    </>
  )
}
