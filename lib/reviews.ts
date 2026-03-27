import { getRedis } from '@/lib/redis'

export interface Review {
  id: string
  watchSlug: string
  userId: string
  rating: number // 1-5
  title: string
  body: string
  pros: string[]
  cons: string[]
  submittedAt: string
  status: 'pending' | 'approved' | 'rejected'
}

/**
 * Generate a unique review ID
 */
export function generateReviewId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Submit a new review to pending queue
 */
export async function submitReview(review: Omit<Review, 'id' | 'submittedAt' | 'status'>): Promise<Review> {
  const redis = getRedis()
  if (!redis) throw new Error('Redis not configured')

  const reviewId = generateReviewId()
  const now = new Date().toISOString()
  
  const fullReview: Review = {
    ...review,
    id: reviewId,
    submittedAt: now,
    status: 'pending',
  }

  const key = `review:${review.watchSlug}:${reviewId}`
  
  // Store the review
  await redis.set(key, JSON.stringify(fullReview), { ex: 7776000 }) // 90 days expiry
  
  // Add to pending index (sorted set by timestamp)
  await redis.zadd('reviews:pending', {
    score: Date.now(),
    member: `${review.watchSlug}:${reviewId}`,
  })

  return fullReview
}

/**
 * Get all pending reviews
 */
export async function getPendingReviews(): Promise<Review[]> {
  const redis = getRedis()
  if (!redis) return []

  const pendingKeys = await redis.zrange('reviews:pending', 0, -1)
  
  if (!pendingKeys || pendingKeys.length === 0) {
    return []
  }

  const reviews: Review[] = []
  
  for (const key of pendingKeys) {
    const [watchSlug, reviewId] = (key as string).split(':')
    const reviewKey = `review:${watchSlug}:${reviewId}`
    const reviewData = await redis.get(reviewKey)
    
    if (reviewData) {
      reviews.push(JSON.parse(reviewData as string) as Review)
    }
  }

  return reviews
}

/**
 * Approve a review
 */
export async function approveReview(watchSlug: string, reviewId: string): Promise<void> {
  const redis = getRedis()
  if (!redis) throw new Error('Redis not configured')

  const key = `review:${watchSlug}:${reviewId}`
  const reviewData = await redis.get(key)
  
  if (!reviewData) {
    throw new Error('Review not found')
  }

  const review = JSON.parse(reviewData as string) as Review
  review.status = 'approved'

  // Update review status
  await redis.set(key, JSON.stringify(review), { ex: 7776000 })
  
  // Remove from pending index
  await redis.zrem('reviews:pending', `${watchSlug}:${reviewId}`)
  
  // Add to approved index
  await redis.zadd(`reviews:approved:${watchSlug}`, {
    score: Date.now(),
    member: reviewId,
  })
}

/**
 * Reject a review
 */
export async function rejectReview(watchSlug: string, reviewId: string): Promise<void> {
  const redis = getRedis()
  if (!redis) throw new Error('Redis not configured')

  const key = `review:${watchSlug}:${reviewId}`
  const reviewData = await redis.get(key)
  
  if (!reviewData) {
    throw new Error('Review not found')
  }

  const review = JSON.parse(reviewData as string) as Review
  review.status = 'rejected'

  // Update review status
  await redis.set(key, JSON.stringify(review), { ex: 7776000 })
  
  // Remove from pending index
  await redis.zrem('reviews:pending', `${watchSlug}:${reviewId}`)
}

/**
 * Get approved reviews for a watch
 */
export async function getApprovedReviewsForWatch(watchSlug: string): Promise<Review[]> {
  const redis = getRedis()
  if (!redis) return []

  const reviewIds = await redis.zrange(`reviews:approved:${watchSlug}`, 0, -1)
  
  if (!reviewIds || reviewIds.length === 0) {
    return []
  }

  const reviews: Review[] = []
  
  for (const reviewId of reviewIds) {
    const key = `review:${watchSlug}:${reviewId}`
    const reviewData = await redis.get(key)
    
    if (reviewData) {
      reviews.push(JSON.parse(reviewData as string) as Review)
    }
  }

  return reviews.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
}

/**
 * Get a specific review
 */
export async function getReview(watchSlug: string, reviewId: string): Promise<Review | null> {
  const redis = getRedis()
  if (!redis) return null

  const key = `review:${watchSlug}:${reviewId}`
  const reviewData = await redis.get(key)
  
  if (!reviewData) {
    return null
  }

  return JSON.parse(reviewData as string) as Review
}

export async function getRecentApprovedReviews(limit = 4): Promise<Review[]> {
  try {
    const redis = getRedis()
    if (!redis) return []
    const keys = await redis.keys('reviews:approved:*')
    if (!keys || keys.length === 0) return []
    
    const allReviews: Review[] = []
    for (const key of keys) {
      const reviews = await redis.lrange(key, 0, -1)
      for (const r of reviews) {
        try {
          const review = typeof r === 'string' ? JSON.parse(r) : r
          allReviews.push(review as Review)
        } catch {
          continue
        }
      }
    }
    
    allReviews.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
    return allReviews.slice(0, limit)
  } catch {
    return []
  }
}
