import type { Metadata } from 'next'
import { watches } from '@/lib/watches'
import WatchesClient from './WatchesClient'

export const metadata: Metadata = {
  title: 'Find Your Watch — Search & Filter All Watches | WatchVsWatch',
  description: `Search and filter ${watches.length} watches from Rolex, Omega, Tudor, Seiko, Grand Seiko, and more. Compare prices, styles, and specs to find your next watch.`,
  alternates: {
    canonical: 'https://watchvswatch.com/watches',
  },
  openGraph: {
    title: 'Find Your Watch — Search & Filter All Watches',
    description: `Browse ${watches.length} watches. Filter by brand, price, style, and sort by score.`,
    url: 'https://watchvswatch.com/watches',
    type: 'website',
  },
}

export default function WatchesPage({ searchParams }: { searchParams: { search?: string; brand?: string; style?: string; price?: string; sort?: string } }) {
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
      />
    </>
  )
}
