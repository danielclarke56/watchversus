import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { watches, getWatchBySlug, getReviewsForWatch, calcAverageRatings, calcOverallRating } from '@/lib/watches'
import { getApprovedReviewsForWatch, type Review } from '@/lib/reviews'
import WatchHero from '@/components/watch/WatchHero'
import GuideTableOfContents from '@/app/components/GuideTableOfContents'
import WatchVerdict from '@/components/watch/WatchVerdict'
import WatchSpecs from '@/components/watch/WatchSpecs'
import WatchGallery from '@/components/watch/WatchGallery'
import WatchReviewsSection from '@/components/watch/WatchReviewsSection'
import UserReviewsSection from '@/components/UserReviewsSection'
import WatchCompareSection from '@/components/watch/WatchCompareSection'
import WatchRelatedGuides from '@/components/watch/WatchRelatedGuides'
import MoreBrandWatches from '@/components/watch/MoreBrandWatches'
import WatchBrowseSimilar from '@/components/watch/WatchBrowseSimilar'
import QuizCTA from '@/components/QuizCTA'

export async function generateStaticParams() {
  return watches.map((w) => ({ slug: w.slug }))
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const watch = getWatchBySlug(params.slug)
  if (!watch) return {}
  return {
    title: `${watch.brand} ${watch.name} Review`,
    description: `Read community reviews, full specs, and pricing for the ${watch.brand} ${watch.name} (${watch.reference}). ${watch.description.slice(0, 120)}...`,
    alternates: {
      canonical: `https://watchvswatch.com/watches/${watch.slug}`,
    },
    openGraph: {
      title: `${watch.brand} ${watch.name} Review & Specs | WatchVsWatch`,
      description: watch.description,
      url: `https://watchvswatch.com/watches/${watch.slug}`,
      type: 'article',
      images: [{ url: `https://watchvswatch.com/api/og?type=watch&title=${encodeURIComponent(watch.brand + ' ' + watch.name)}&subtitle=${encodeURIComponent(watch.reference + ' — Full Specs, Reviews & Pricing')}`, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${watch.brand} ${watch.name} Review & Specs`,
      description: watch.description.slice(0, 200),
      images: [`https://watchvswatch.com/api/og?type=watch&title=${encodeURIComponent(watch.brand + ' ' + watch.name)}&subtitle=${encodeURIComponent(watch.reference + ' — Full Specs, Reviews & Pricing')}`],
    },
  }
}

export default async function WatchPage({ params }: { params: { slug: string } }) {
  const watch = getWatchBySlug(params.slug)
  if (!watch) notFound()

  const reviews = getReviewsForWatch(watch.id)
  const avgRatings = calcAverageRatings(reviews)
  const overallRating = avgRatings ? calcOverallRating(avgRatings) : null
  
  // Fetch user reviews from Redis
  let userReviews: Review[] = []
  try {
    userReviews = await getApprovedReviewsForWatch(watch.slug)
  } catch (error) {
    console.error('Error fetching user reviews:', error)
  }

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

      {/* Hero — full-width, above the two-column layout */}
      <WatchHero watch={watch} reviewCount={reviews.length} />

      {/* Two-column layout: sidenav + content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex gap-8">
        {/* Sticky sidebar TOC — hidden below lg breakpoint */}
        <GuideTableOfContents
          sections={[
            { id: 'verdict', label: 'The Verdict' },
            { id: 'specs', label: 'Full Specs' },
            { id: 'gallery', label: 'Photos' },
            { id: 'reviews', label: 'Reviews' },
            { id: 'compare', label: 'Compare & Alternatives' },
            { id: 'more-brand', label: `More ${watch.brand}` },
            { id: 'similar-watches', label: 'Similar Watches' },
            { id: 'guides', label: 'Buying Guides' },
          ]}
        />

        {/* Main content column */}
        <div className="flex-1 min-w-0 space-y-10">
          <WatchVerdict watch={watch} />
          <WatchSpecs watch={watch} />
          <WatchGallery watchId={watch.id} watchName={`${watch.brand} ${watch.name}`} />

          <WatchReviewsSection
            watchName={`${watch.brand} ${watch.name}`}
            watchId={watch.id}
            reviews={reviews}
          />

          <UserReviewsSection watchSlug={watch.slug} initialReviews={userReviews} />

          <QuizCTA />

          <WatchCompareSection watch={watch} />
          <MoreBrandWatches watch={watch} />
          <WatchBrowseSimilar watch={watch} limit={6} />
          <WatchRelatedGuides watch={watch} />
        </div>
      </div>
    </>
  )
}
