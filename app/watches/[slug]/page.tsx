import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { watches, getWatchBySlug, getReviewsForWatch, calcAverageRatings, calcOverallRating, popularComparisons } from '@/lib/watches'
import WatchHero from '@/components/watch/WatchHero'
import WatchQuickActions from '@/components/watch/WatchQuickActions'
import WatchProsConsSections from '@/components/watch/WatchProsConsSections'
import WatchVerdict from '@/components/watch/WatchVerdict'
import WatchSpecs from '@/components/watch/WatchSpecs'
import WatchOwnerPhotos from '@/components/watch/WatchOwnerPhotos'
import WatchComparisons from '@/components/watch/WatchComparisons'
import WatchAlternatives from '@/components/watch/WatchAlternatives'
import WatchRelatedGuides from '@/components/watch/WatchRelatedGuides'
import WatchWhatPeopleSay from '@/components/watch/WatchWhatPeopleSay'
import ReviewCard from '@/components/ReviewCard'
import ReviewForm from './ReviewForm'
import UserReviews from './UserReviews'

export async function generateStaticParams() {
  return watches.map((w) => ({ slug: w.slug }))
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const watch = getWatchBySlug(params.slug)
  if (!watch) return {}
  return {
    title: `${watch.brand} ${watch.name} Review | WatchVsWatch`,
    description: `Read community reviews, full specs, and pricing for the ${watch.brand} ${watch.name} (${watch.reference}). ${watch.description.slice(0, 120)}...`,
    alternates: {
      canonical: `https://watchvswatch.com/watches/${watch.slug}`,
    },
    openGraph: {
      title: `${watch.brand} ${watch.name} Review & Specs | WatchVsWatch`,
      description: watch.description,
      url: `https://watchvswatch.com/watches/${watch.slug}`,
      type: 'website',
    },
  }
}

export default function WatchPage({ params }: { params: { slug: string } }) {
  const watch = getWatchBySlug(params.slug)
  if (!watch) notFound()

  const reviews = getReviewsForWatch(watch.id)
  const avgRatings = calcAverageRatings(reviews)
  const overallRating = avgRatings ? calcOverallRating(avgRatings) : null

  // Build up to 3 quick compare targets: popular comparisons first, then alternatives
  const popOthers = popularComparisons
    .filter(({ slug1, slug2 }) => slug1 === watch.slug || slug2 === watch.slug)
    .map(({ slug1, slug2 }) => (slug1 === watch.slug ? slug2 : slug1))
  const altSlugs = watch.alternatives ?? []
  const seen = new Set<string>([watch.slug])
  const quickCompareTargets: string[] = []
  for (const s of [...popOthers, ...altSlugs]) {
    if (s && !seen.has(s)) { seen.add(s); quickCompareTargets.push(s) }
    if (quickCompareTargets.length === 3) break
  }
  const quickCompareWatches = quickCompareTargets
    .map((s) => watches.find((w) => w.slug === s))
    .filter((w): w is NonNullable<typeof w> => w !== undefined)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Product',
        name: `${watch.brand} ${watch.name}`,
        description: watch.description,
        sku: watch.reference,
        image: watch.image ? `https://watchvswatch.com${watch.image}` : undefined,
        brand: {
          '@type': 'Brand',
          name: watch.brand,
        },
        offers: {
          '@type': 'AggregateOffer',
          priceCurrency: 'USD',
          lowPrice: watch.price_new_usd.min,
          highPrice: watch.price_new_usd.max,
          offerCount: 3,
          availability: 'https://schema.org/InStock',
          url: `https://watchvswatch.com/watches/${watch.slug}`,
        },
        ...(overallRating && reviews.length > 0
          ? {
              aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: overallRating.toFixed(1),
                reviewCount: reviews.length,
                bestRating: '5',
                worstRating: '1',
              },
              review: reviews.slice(0, 5).map((r) => ({
                '@type': 'Review',
                reviewRating: {
                  '@type': 'Rating',
                  ratingValue: calcOverallRating(r.ratings).toFixed(1),
                  bestRating: '5',
                  worstRating: '1',
                },
                author: {
                  '@type': 'Person',
                  name: r.reviewer_name,
                },
                reviewBody: r.title + '. ' + r.body,
                datePublished: r.date,
              })),
            }
          : {}),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://watchvswatch.com' },
          { '@type': 'ListItem', position: 2, name: 'Watches', item: 'https://watchvswatch.com/watches' },
          { '@type': 'ListItem', position: 3, name: `${watch.brand} ${watch.name}`, item: `https://watchvswatch.com/watches/${watch.slug}` },
        ],
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* 1. Hero Section - watch image, name (H1), score, would-buy %, votes, verdict */}
      <WatchHero watch={watch} reviewCount={reviews.length} />

      {/* Compare strip — immediately below hero */}
      {quickCompareWatches.length > 0 && (
        <section className="bg-surfaceAlt border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <p className="text-sm font-semibold text-textSecond shrink-0">Compare {watch.name} vs:</p>
              <div className="flex flex-wrap gap-2">
                {quickCompareWatches.map((other) => {
                  const slugs = [watch.slug, other.slug].sort()
                  const compareSlug = `${slugs[0]}-vs-${slugs[1]}`
                  return (
                    <Link
                      key={other.slug}
                      href={`/compare/${compareSlug}`}
                      className="inline-flex items-center gap-1.5 bg-surface border border-border hover:border-accent text-textPrimary hover:text-accent text-sm font-medium px-3 py-1.5 rounded-full transition-colors"
                    >
                      {other.brand} {other.name}
                      <span className="text-accent">→</span>
                    </Link>
                  )
                })}
              </div>
              <Link
                href="/compare"
                className="text-xs text-textMuted hover:text-accent transition-colors sm:ml-auto shrink-0"
              >
                More comparisons →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* 2. Quick Actions - Rate this watch (👍 👎) + Would you buy again (Y/N) */}
      <WatchQuickActions watch={watch} />

      {/* 3. Pros/Cons - Two-column layout with bullet points */}
      <WatchProsConsSections watch={watch} />

      {/* 4. Quick Verdict - Who it's for / Who should skip / Final take */}
      <WatchVerdict watch={watch} />

      {/* 5. Key Specs - 5 essential fields (case size, thickness, movement, water resistance, crystal) */}
      <WatchSpecs watch={watch} />

      {/* 6. Real Owner Photos - MVP stub with placeholder gallery and upload modal */}
      <WatchOwnerPhotos watch={watch} />

      {/* 7. Comparison Section - 2–3 comparisons involving this watch */}
      <WatchComparisons watch={watch} />

      {/* 8. Alternatives Section - 3–5 similar watches from same brand */}
      <WatchAlternatives watch={watch} />

      {/* 8b. Related Buying Guides - contextual guide links based on category + price */}
      <WatchRelatedGuides watch={watch} />

      {/* 9. "What People Say" - Tag-cloud style pros/cons */}
      <WatchWhatPeopleSay watch={watch} />

      {/* Existing Reviews Section */}
      <section className="py-8 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-textPrimary mb-6">
            Community Reviews
            {reviews.length > 0 && (
              <span className="text-textMuted font-normal text-base ml-2">({reviews.length})</span>
            )}
          </h2>
          {reviews.length === 0 ? (
            <div className="card p-6 text-center text-textSecond">
              No reviews yet — be the first!
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((r) => (
                <ReviewCard key={r.id} review={r} showWatch={false} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* User reviews from Redis */}
      <div className="border-b border-border">
        <UserReviews watchId={watch.id} />
      </div>

      {/* Review form */}
      <div className="py-8">
        <ReviewForm watchId={watch.id} watchName={`${watch.brand} ${watch.name}`} />
      </div>
    </>
  )
}
