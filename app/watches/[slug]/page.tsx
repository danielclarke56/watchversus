import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { watches, getWatchBySlug, getReviewsForWatch, calcAverageRatings, calcOverallRating, formatPrice, popularComparisons } from '@/lib/watches'
import RatingBar from '@/components/RatingBar'
import StarRating from '@/components/StarRating'
import ReviewCard from '@/components/ReviewCard'
import ReviewForm from './ReviewForm'
import UserReviews from './UserReviews'
import WatchImageZoom from '@/components/WatchImageZoom'

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

const RATING_LABELS: Record<string, string> = {
  value_for_money: 'Value for Money',
  build_quality: 'Build Quality',
  movement_reliability: 'Movement Reliability',
  daily_wearability: 'Daily Wearability',
  resale_strength: 'Resale Strength',
}

export default function WatchPage({ params }: { params: { slug: string } }) {
  const watch = getWatchBySlug(params.slug)
  if (!watch) notFound()

  const reviews = getReviewsForWatch(watch.id)
  const avgRatings = calcAverageRatings(reviews)
  const overallRating = avgRatings ? calcOverallRating(avgRatings) : null

  const relatedComparisons = popularComparisons
    .filter((c) => c.slug1 === watch.slug || c.slug2 === watch.slug)
    .slice(0, 4)

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
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-[#0f172a] to-[#1e293b] h-96 flex items-center justify-center overflow-hidden">
        {/* Background image with overlay */}
        {watch.image && (
          <>
            <Image
              src={watch.image}
              alt={watch.imageAlt ?? `${watch.brand} ${watch.name}`}
              fill
              className="object-cover opacity-20"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0f172a]/90 to-[#1e293b]/80" />
          </>
        )}

        {/* Content */}
        <div className="relative z-10 text-center text-white">
          <p className="text-[#b8860b] font-bold uppercase tracking-widest text-sm mb-3">{watch.brand}</p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-3">{watch.name}</h1>
          <p className="text-lg text-[#cbd5e1] max-w-2xl mx-auto">{watch.description}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Breadcrumb */}
        <nav className="text-sm text-[#94a3b8] mb-6 flex items-center gap-2">
          <Link href="/watches" className="hover:text-[#b8860b] transition-colors">Watches</Link>
          <span>/</span>
          <span className="text-[#0f172a]">{watch.brand} {watch.name}</span>
        </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Header */}
          <div>
            <div className="flex flex-wrap gap-2 mb-3">
              {watch.style.map((s) => (
                <span key={s} className="text-xs uppercase tracking-wider bg-[#b8860b]/10 text-[#b8860b] px-3 py-1 rounded-full border border-[#b8860b]/20 capitalize">
                  {s}
                </span>
              ))}
            </div>
            <p className="text-[#b8860b] font-bold uppercase tracking-widest text-sm mb-1">{watch.brand}</p>
            <h1 className="text-3xl md:text-4xl font-bold text-[#0f172a] mb-2">{watch.name}</h1>
            <p className="text-[#94a3b8] mb-4">Ref. {watch.reference} · Introduced {watch.year_introduced}</p>
            <p className="text-[#475569] leading-relaxed">{watch.description}</p>
          </div>

          {/* Watch image */}
          {watch.image ? (
            <WatchImageZoom
              src={watch.image}
              alt={watch.imageAlt ?? `${watch.brand} ${watch.name}`}
              watchName={`${watch.brand} ${watch.name}`}
              containerClassName="bg-[#f8fafc] rounded-xl border border-[#e2e8f0] h-80 w-full flex items-center justify-center overflow-hidden"
              imgClassName="w-full h-full object-contain p-4"
            />
          ) : (
            <div className="bg-[#f8fafc] rounded-xl border border-[#e2e8f0] h-80 flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-3 rounded-full border-2 border-[#e2e8f0] flex items-center justify-center">
                  <svg className="w-10 h-10 text-[#e2e8f0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="9" strokeWidth="1.5" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 7v5l3 3" />
                  </svg>
                </div>
                <p className="text-[#94a3b8] text-sm">Watch image coming soon</p>
              </div>
            </div>
          )}

          {/* Specs table */}
          <div>
            <h2 className="text-xl font-bold text-[#0f172a] mb-4">Full Specifications</h2>
            <div className="card overflow-hidden">
              <table className="w-full text-sm">
                <tbody>
                  {[
                    ['Case Diameter', `${watch.case_diameter_mm}mm`],
                    ['Case Thickness', `${watch.case_thickness_mm}mm`],
                    ['Lug Width', `${watch.lug_width_mm}mm`],
                    ['Lug-to-Lug', `${watch.lug_to_lug_mm}mm`],
                    ['Movement Type', watch.movement_type],
                    ['Caliber', watch.movement_caliber],
                    ['Power Reserve', watch.power_reserve_hours ? `${watch.power_reserve_hours}h` : 'N/A (quartz)'],
                    ['Water Resistance', `${watch.water_resistance_m}m`],
                    ['Crystal', watch.crystal],
                    ['Case Material', watch.case_material],
                    ['Bracelet/Strap', watch.bracelet_material],
                    ['Price (New)', formatPrice(watch.price_new_usd)],
                    ['Price (Pre-owned)', formatPrice(watch.price_preowned_usd)],
                  ].map(([label, value], i) => (
                    <tr key={label} className={i % 2 === 0 ? 'bg-[#f8fafc]' : 'bg-white'}>
                      <td className="px-4 py-3 text-[#475569] font-medium w-1/2">{label}</td>
                      <td className="px-4 py-3 text-[#0f172a] capitalize">{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Community ratings */}
          {avgRatings && (
            <div>
              <h2 className="text-xl font-bold text-[#0f172a] mb-4">Community Ratings</h2>
              <div className="card p-5 space-y-3">
                {Object.entries(avgRatings).map(([key, val]) => (
                  <RatingBar key={key} label={RATING_LABELS[key] || key} value={val} />
                ))}
              </div>
            </div>
          )}

          {/* Reviews */}
          <div>
            <h2 className="text-xl font-bold text-[#0f172a] mb-4">
              Community Reviews
              {reviews.length > 0 && (
                <span className="text-[#94a3b8] font-normal text-base ml-2">({reviews.length})</span>
              )}
            </h2>
            {reviews.length === 0 ? (
              <div className="card p-6 text-center text-[#475569]">
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

          {/* User reviews from Redis */}
          <UserReviews watchId={watch.id} />

          {/* Review form */}
          <ReviewForm watchId={watch.id} watchName={`${watch.brand} ${watch.name}`} />

          {/* Compare this watch — same brand */}
          {(() => {
            const sameBrand = watches.filter((w) => w.brand === watch.brand && w.slug !== watch.slug)
            if (sameBrand.length === 0) return null
            return (
              <div>
                <h2 className="text-xl font-bold text-[#0f172a] mb-4">Compare {watch.name} with Other {watch.brand} Watches</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {sameBrand.map((other) => (
                    <Link
                      key={other.slug}
                      href={`/compare/${watch.slug}-vs-${other.slug}`}
                      className="card p-4 hover:border-[#b8860b]/40 transition-colors"
                    >
                      <p className="text-xs text-[#b8860b] font-semibold uppercase tracking-wider">{other.brand}</p>
                      <p className="text-[#0f172a] font-medium">{other.name}</p>
                      <p className="text-xs text-[#94a3b8] mt-1">{watch.name} vs {other.name} →</p>
                    </Link>
                  ))}
                </div>
              </div>
            )
          })()}
        </div>

        {/* Right sidebar */}
        <div className="space-y-5">
          {/* Overall rating */}
          {overallRating && (
            <div className="card p-5 text-center">
              <p className="text-[#94a3b8] text-xs uppercase tracking-wider mb-2">Community Score</p>
              <div className="text-5xl font-bold text-[#b8860b] mb-2">{overallRating.toFixed(1)}</div>
              <StarRating rating={overallRating} size="md" />
              <p className="text-[#94a3b8] text-xs mt-2">Based on {reviews.length} review{reviews.length !== 1 ? 's' : ''}</p>
            </div>
          )}

          {/* Compare CTA */}
          <div className="card p-5">
            <h3 className="text-[#0f172a] font-semibold mb-3">Compare with Another Watch</h3>
            <Link
              href={`/compare?a=${watch.slug}`}
              className="block w-full text-center btn-outline"
            >
              Start Comparison
            </Link>
          </div>

          {/* Related comparisons */}
          {relatedComparisons.length > 0 && (
            <div className="card p-5">
              <h3 className="text-[#0f172a] font-semibold mb-4">Related Comparisons</h3>
              <div className="space-y-2">
                {relatedComparisons.map((c) => {
                  const other = c.slug1 === watch.slug ? c.slug2 : c.slug1
                  const otherSlug = other
                  return (
                    <Link
                      key={`${c.slug1}-${c.slug2}`}
                      href={`/compare/${c.slug1}-vs-${c.slug2}`}
                      className="block text-sm text-[#475569] hover:text-[#b8860b] transition-colors py-1 border-b border-[#e2e8f0] last:border-0"
                    >
                      vs {otherSlug.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                    </Link>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  )
}
