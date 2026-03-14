import type { Metadata } from 'next'
import { watches } from '@/lib/watches'
import WatchesClient from './WatchesClient'

export const metadata: Metadata = {
  title: 'Watch Index — Browse All 50 Watches',
  description:
    'Browse our complete database of 50 watches from Rolex, Omega, Tudor, Seiko, Grand Seiko, Nomos and more. Filter by brand, price, and style.',
}

export default function WatchesPage({ searchParams }: { searchParams: { search?: string; brand?: string; style?: string; price?: string } }) {
  return <WatchesClient watches={watches} initialSearch={searchParams.search || ''} initialBrand={searchParams.brand || ''} initialStyle={searchParams.style || ''} initialPrice={searchParams.price || ''} />
}
