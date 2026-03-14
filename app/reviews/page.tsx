import type { Metadata } from 'next'
import { getAllReviews, watches } from '@/lib/watches'
import ReviewsClient from './ReviewsClient'

export const metadata: Metadata = {
  title: 'Community Watch Reviews',
  description: 'Browse all community watch reviews. Filter by brand or rating. Real owner perspectives on Rolex, Omega, Tudor, Seiko, and more.',
}

export default function ReviewsPage() {
  const reviews = getAllReviews()
  return <ReviewsClient reviews={reviews} watches={watches} />
}
