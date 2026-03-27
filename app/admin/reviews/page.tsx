'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@clerk/nextjs'
import { Review } from '@/lib/reviews'
import Link from 'next/link'

export default function AdminReviewsPage() {
  const { userId } = useAuth()
  const router = useRouter()
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string>('')
  const [processing, setProcessing] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) {
      router.push('/sign-in')
      return
    }

    fetchReviews()
  }, [userId, router])

  const fetchReviews = async (): Promise<void> => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/reviews')

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw new Error('Access denied — admin only')
        }
        throw new Error('Failed to fetch reviews')
      }

      const data = (await response.json()) as { reviews: Review[] }
      setReviews(data.reviews)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (review: Review): Promise<void> => {
    try {
      setProcessing(review.id)
      const response = await fetch(`/api/admin/reviews/${review.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          watchSlug: review.watchSlug,
          action: 'approve',
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to approve review')
      }

      setReviews((prev) => prev.filter((r) => r.id !== review.id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setProcessing(null)
    }
  }

  const handleReject = async (review: Review): Promise<void> => {
    try {
      setProcessing(review.id)
      const response = await fetch(`/api/admin/reviews/${review.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          watchSlug: review.watchSlug,
          action: 'reject',
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to reject review')
      }

      setReviews((prev) => prev.filter((r) => r.id !== review.id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setProcessing(null)
    }
  }

  if (!userId) {
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold">Review Moderation</h1>
              <p className="text-gray-600 mt-1">
                Manage pending user reviews ({reviews.length} pending)
              </p>
            </div>
            <Link href="/admin" className="text-blue-600 hover:underline">
              ← Back to Admin
            </Link>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Reviews List */}
        {reviews.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <p className="text-gray-600 text-lg">No pending reviews to moderate</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="bg-white rounded-lg border border-gray-200 p-6"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{review.title}</h3>
                    <div className="flex items-center gap-3 mt-2 text-sm text-gray-600">
                      <span>Watch: {review.watchSlug}</span>
                      <span>Rating: {review.rating}/5</span>
                      <span>User: {review.userId}</span>
                    </div>
                  </div>
                </div>

                {/* Body */}
                <p className="text-gray-700 mb-4">{review.body}</p>

                {/* Pros and Cons */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <h4 className="text-sm font-semibold text-green-700 mb-2">Pros</h4>
                    <ul className="text-sm text-gray-700 space-y-1">
                      {review.pros.map((pro, i) => (
                        <li key={i}>• {pro}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-red-700 mb-2">Cons</h4>
                    <ul className="text-sm text-gray-700 space-y-1">
                      {review.cons.map((con, i) => (
                        <li key={i}>• {con}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={() => handleApprove(review)}
                    disabled={processing === review.id}
                    className="flex-1 bg-green-600 text-white py-2 rounded-md font-medium hover:bg-green-700 disabled:bg-gray-400"
                  >
                    {processing === review.id ? 'Processing...' : 'Approve'}
                  </button>
                  <button
                    onClick={() => handleReject(review)}
                    disabled={processing === review.id}
                    className="flex-1 bg-red-600 text-white py-2 rounded-md font-medium hover:bg-red-700 disabled:bg-gray-400"
                  >
                    {processing === review.id ? 'Processing...' : 'Reject'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
