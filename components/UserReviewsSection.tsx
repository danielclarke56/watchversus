'use client'

import { useState } from 'react'
import { useAuth } from '@clerk/nextjs'
import { Review } from '@/lib/reviews'
import ReviewForm from '@/components/ReviewForm'
import ReviewsList from '@/components/ReviewsList'
import Link from 'next/link'

interface UserReviewsSectionProps {
  watchSlug: string
  initialReviews: Review[]
}

export default function UserReviewsSection({ watchSlug, initialReviews }: UserReviewsSectionProps) {
  const { userId, isLoaded } = useAuth()
  const [reviews] = useState<Review[]>(initialReviews)

  const handleReviewSuccess = (newReview: Review): void => {
    // Note: New reviews start as 'pending', so they won't appear in the list until approved
    // Just show the success message for now
  }

  if (!isLoaded) {
    return <div className="py-8 text-center text-gray-600">Loading...</div>
  }

  return (
    <div className="py-8 space-y-8">
      <div className="border-t pt-8">
        {/* Reviews Section Header */}
        <h2 className="text-2xl font-bold mb-6">Community Reviews</h2>

        {/* Show review form or sign-in CTA */}
        {userId ? (
          <div className="mb-8">
            <ReviewForm watchSlug={watchSlug} onSubmitSuccess={handleReviewSuccess} />
          </div>
        ) : (
          <div className="mb-8 bg-blue-50 rounded-lg border border-blue-200 p-6 text-center">
            <p className="text-gray-700 mb-3">
              Share your experience with this watch
            </p>
            <Link
              href="/sign-in"
              className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md font-medium hover:bg-blue-700"
            >
              Sign In to Write a Review
            </Link>
          </div>
        )}

        {/* Reviews List */}
        <ReviewsList reviews={reviews} watchSlug={watchSlug} />
      </div>
    </div>
  )
}
