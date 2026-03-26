import type { Metadata } from 'next'
import { ExploreClient } from './ExploreClient'

export const metadata: Metadata = {
  title: 'Explore Watch Photos | WatchVsWatch',
  description: 'Browse real watch photos from owners worldwide. See how watches actually look on the wrist.',
  alternates: {
    canonical: 'https://watchvswatch.com/explore',
  },
  openGraph: {
    title: 'Explore Watch Photos | WatchVsWatch',
    description: 'Browse real watch photos from owners worldwide. See how watches actually look on the wrist.',
    url: 'https://watchvswatch.com/explore',
    type: 'website',
  },
}

export default function ExplorePage() {
  return <ExploreClient />
}
