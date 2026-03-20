import type { Metadata } from 'next'
import { watches } from '@/lib/watches'
import CompareClient from './CompareClient'

export const metadata: Metadata = {
  title: 'Compare Watches Side-by-Side | 130+ Matchups',
  description: 'Compare any two watches head-to-head across specs, community ratings, and pricing. 130+ side-by-side matchups with honest differences. Find out which watch is right for you.',
  alternates: {
    canonical: 'https://watchvswatch.com/compare',
  },
  openGraph: {
    title: 'Compare Watches Side-by-Side | WatchVsWatch',
    description: 'Compare any two watches head-to-head across specs, ratings, and pricing. 130+ matchups.',
    url: 'https://watchvswatch.com/compare',
    type: 'website',
    images: [{ url: 'https://watchvswatch.com/api/og?title=Compare+Watches+Side-by-Side&subtitle=130%2B+head-to-head+matchups+with+specs%2C+ratings+%26+verdicts', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Compare Watches Side-by-Side | 130+ Matchups',
    description: 'Compare any two watches head-to-head across specs, ratings, and pricing.',
    images: ['https://watchvswatch.com/api/og?title=Compare+Watches+Side-by-Side&subtitle=130%2B+head-to-head+matchups+with+specs%2C+ratings+%26+verdicts'],
  },
}

export default function ComparePage({ searchParams }: { searchParams: { a?: string; b?: string } }) {
  return <CompareClient watches={watches} initialA={searchParams.a || ''} initialB={searchParams.b || ''} />
}
