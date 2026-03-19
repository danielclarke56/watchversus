import type { Metadata } from 'next'
import { watches } from '@/lib/watches'
import CompareClient from './CompareClient'

export const metadata: Metadata = {
  title: 'Compare Watches Side-by-Side | 160+ Matchups',
  description: 'Compare any two watches head-to-head across specs, community ratings, and pricing. 160+ side-by-side matchups with honest differences. Find out which watch is right for you.',
}

export default function ComparePage({ searchParams }: { searchParams: { a?: string; b?: string } }) {
  return <CompareClient watches={watches} initialA={searchParams.a || ''} initialB={searchParams.b || ''} />
}
