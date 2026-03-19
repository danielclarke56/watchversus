import watchesData from '@/data/watches.json'
import reviewsData from '@/data/reviews.json'
import comparisonTiersData from '@/data/comparison-tiers.json'
import type { Watch, Review, ReviewRatings, ComparisonTiersData, ComparisonTierEntry } from './types'

export const watches: Watch[] = watchesData as Watch[]
export const seedReviews: Review[] = reviewsData as Review[]

export function getWatchBySlug(slug: string): Watch | undefined {
  return watches.find((w) => w.slug === slug)
}

export function getWatchById(id: string): Watch | undefined {
  return watches.find((w) => w.id === id)
}

export function getReviewsForWatch(watchId: string): Review[] {
  return seedReviews.filter((r) => r.watch_id === watchId)
}

export function calcAverageRatings(reviews: Review[]): ReviewRatings | null {
  if (reviews.length === 0) return null
  const keys: (keyof ReviewRatings)[] = [
    'value_for_money',
    'build_quality',
    'movement_reliability',
    'daily_wearability',
    'resale_strength',
  ]
  const totals = keys.reduce((acc, k) => ({ ...acc, [k]: 0 }), {} as ReviewRatings)
  reviews.forEach((r) => {
    keys.forEach((k) => {
      totals[k] += r.ratings[k]
    })
  })
  return keys.reduce(
    (acc, k) => ({ ...acc, [k]: totals[k] / reviews.length }),
    {} as ReviewRatings
  )
}

export function calcOverallRating(ratings: ReviewRatings): number {
  const vals = Object.values(ratings)
  return vals.reduce((a, b) => a + b, 0) / vals.length
}

export function formatPrice(price: { min: number; max: number }): string {
  const fmt = (n: number) =>
    n >= 1000 ? `$${(n / 1000).toFixed(0)}k` : `$${n}`
  if (price.min === price.max) return fmt(price.min)
  return `${fmt(price.min)}–${fmt(price.max)}`
}

// Comparison tiers: single source of truth for all comparison pairs
export const comparisonTiers = (comparisonTiersData as ComparisonTiersData).comparisons

// Derived for backward compatibility — sorted by priority (highest first)
export const popularComparisons = comparisonTiers
  .slice()
  .sort((a, b) => b.priority - a.priority)
  .map(({ slug1, slug2 }) => ({ slug1, slug2 }))

// Lookup helpers for tier data
export function getComparisonTier(slug1: string, slug2: string): ComparisonTierEntry | undefined {
  return comparisonTiers.find(
    (c) =>
      (c.slug1 === slug1 && c.slug2 === slug2) ||
      (c.slug1 === slug2 && c.slug2 === slug1)
  )
}
