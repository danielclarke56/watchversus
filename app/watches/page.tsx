import type { Metadata } from 'next'
import { watches } from '@/lib/watches'
import WatchesClient from './WatchesClient'

export const metadata: Metadata = {
  title: 'Find Your Watch — Search & Filter All Watches',
  description: `Search and filter ${watches.length} watches from Rolex, Omega, Tudor, Seiko, Grand Seiko, and more. Compare prices, styles, and specs to find your next watch.`,
  alternates: {
    canonical: 'https://watchvswatch.com/watches',
  },
  openGraph: {
    title: 'Find Your Watch — Search & Filter All Watches',
    description: `Browse ${watches.length} watches. Filter by brand, price, style, and sort by score.`,
    url: 'https://watchvswatch.com/watches',
    type: 'website',
    images: [{ url: `https://watchvswatch.com/api/og?title=Watch+Database&subtitle=${encodeURIComponent(watches.length + ' watches — search by brand, price, style & specs')}`, width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Find Your Watch — Search & Filter All Watches',
    description: `Browse ${watches.length} watches. Filter by brand, price, style, and sort by score.`,
    images: [`https://watchvswatch.com/api/og?title=Watch+Database&subtitle=${encodeURIComponent(watches.length + ' watches — search by brand, price, style & specs')}`],
  },
}

export default function WatchesPage({ searchParams }: { searchParams: { search?: string; brand?: string; style?: string; price?: string; sort?: string; page?: string } }) {
  // JSON-LD ItemList for the full collection
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Watch Database',
    description: `Browse ${watches.length} watches with prices, specs, and community scores.`,
    numberOfItems: watches.length,
    itemListElement: watches.slice(0, 20).map((w, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `https://watchvswatch.com/watches/${w.slug}`,
      name: `${w.brand} ${w.name}`,
    })),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <WatchesClient
        watches={watches}
        initialSearch={searchParams.search || ''}
        initialBrand={searchParams.brand || ''}
        initialStyle={searchParams.style || ''}
        initialPrice={searchParams.price || ''}
        initialSort={searchParams.sort || ''}
        initialPage={Math.max(1, parseInt(searchParams.page || '1', 10) || 1)}
      />
    </>
  )
}
