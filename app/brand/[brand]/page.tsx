export const dynamic = 'force-dynamic'
export const revalidate = 0

import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { db } from '@/lib/db'
import { photos } from '@/lib/db/schema'
import { eq, and, asc, desc, sql, isNotNull, ilike } from 'drizzle-orm'
import { buildPhotoAltText } from '@/lib/photoAlt'
import { brands as brandDataList } from '@/lib/brandData'
import { toWatchSlug } from '@/lib/normalizeWatch'

interface BrandPageProps {
  params: { brand: string }
}

export async function generateMetadata({ params }: BrandPageProps): Promise<Metadata> {
  const brand = decodeURIComponent(params.brand)

  const stats = await db
    .select({ photoCount: sql<number>`count(*)::int` })
    .from(photos)
    .where(and(eq(photos.status, 'approved'), ilike(photos.brandName, brand)))
    .then((r) => r[0])

  if (!stats || stats.photoCount === 0) return { title: 'Brand Not Found | Watchems' }

  const repPhoto = await db
    .select({ brandName: photos.brandName, thumbnailUrl: photos.thumbnailUrl, url: photos.url })
    .from(photos)
    .where(and(eq(photos.status, 'approved'), ilike(photos.brandName, brand)))
    .orderBy(asc(photos.sortOrder), asc(photos.createdAt))
    .limit(1)
    .then((r) => r[0])

  const canonicalBrandName = repPhoto?.brandName || brand
  const imageUrl = repPhoto?.thumbnailUrl || repPhoto?.url || ''

  const title = `${canonicalBrandName} Watch Photos on the Wrist | Watchems`
  const description = `Browse ${stats.photoCount} real owner photos of ${canonicalBrandName} watches worn on the wrist. Community-submitted wrist shots — no affiliate links, just real ${canonicalBrandName} watches on real wrists.`

  return {
    title,
    description,
    alternates: {
      canonical: `https://watchems.com/brand/${brand}`,
    },
    openGraph: {
      title,
      description,
      url: `https://watchems.com/brand/${brand}`,
      type: 'website',
      siteName: 'Watchems',
      images: imageUrl ? [{ url: imageUrl, width: 1200, height: 630, alt: `${canonicalBrandName} wrist photos` }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: imageUrl ? [imageUrl] : [],
    },
  }
}

export default async function BrandPage({ params }: BrandPageProps) {
  const brand = decodeURIComponent(params.brand)

  // Stats + guard
  const stats = await db
    .select({ photoCount: sql<number>`count(*)::int` })
    .from(photos)
    .where(and(eq(photos.status, 'approved'), ilike(photos.brandName, brand)))
    .then((r) => r[0])

  if (!stats || stats.photoCount === 0) notFound()

  // Cover photo (for OG + structured data)
  const repPhoto = await db
    .select({ brandName: photos.brandName, thumbnailUrl: photos.thumbnailUrl, url: photos.url })
    .from(photos)
    .where(and(eq(photos.status, 'approved'), ilike(photos.brandName, brand)))
    .orderBy(asc(photos.sortOrder), asc(photos.createdAt))
    .limit(1)
    .then((r) => r[0])

  if (!repPhoto) notFound()

  const canonicalBrandName = repPhoto.brandName || brand
  const imageUrl = repPhoto.thumbnailUrl || repPhoto.url

  // Watch model hubs for this brand (3+ photos each)
  const watchGroups = await db
    .select({
      watchId: photos.watchId,
      modelName: photos.modelName,
      photoCount: sql<number>`count(*)::int`,
      thumbnailUrl: sql<string | null>`min(${photos.thumbnailUrl})`,
      url: sql<string>`min(${photos.url})`,
    })
    .from(photos)
    .where(and(eq(photos.status, 'approved'), ilike(photos.brandName, brand), isNotNull(photos.watchId)))
    .groupBy(photos.watchId, photos.modelName)
    .having(sql`count(*) >= 3`)
    .orderBy(sql`count(*) DESC`)

  // Recent photos (all, for the recent grid)
  const recentPhotos = await db
    .select({
      id: photos.id,
      slug: photos.slug,
      url: photos.url,
      thumbnailUrl: photos.thumbnailUrl,
      brandName: photos.brandName,
      modelName: photos.modelName,
      userName: photos.userName,
      referenceNumber: photos.referenceNumber,
      caseSize: photos.caseSize,
    })
    .from(photos)
    .where(and(eq(photos.status, 'approved'), ilike(photos.brandName, brand)))
    .orderBy(desc(photos.createdAt))
    .limit(12)

  // Editorial content from brandData if available
  // Normalize the URL param (strip diacritics, spaces→hyphens) before matching
  const normalizedBrandSlug = toWatchSlug(brand)
  const brandData = brandDataList.find((b) => b.slug === normalizedBrandSlug) ?? null

  // Structured data
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://watchems.com' },
      { '@type': 'ListItem', position: 2, name: 'Brands', item: 'https://watchems.com/brands' },
      { '@type': 'ListItem', position: 3, name: canonicalBrandName, item: `https://watchems.com/brand/${brand}` },
    ],
  }

  const collectionPageJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${canonicalBrandName} Wrist Photos`,
    description: `Real owner wrist photos of ${canonicalBrandName} watches worn on the wrist, submitted by the Watchems community.`,
    url: `https://watchems.com/brand/${brand}`,
    numberOfItems: stats.photoCount,
    image: imageUrl,
  }

  const faqJsonLd = brandData && brandData.faq.length > 0
    ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: brandData.faq.map(({ question, answer }) => ({
          '@type': 'Question',
          name: question,
          acceptedAnswer: { '@type': 'Answer', text: answer },
        })),
      }
    : null

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionPageJsonLd) }}
      />
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">

        {/* Breadcrumb */}
        <nav className="text-xs text-gray-400 mb-6 flex items-center gap-1.5">
          <Link href="/" className="hover:text-gray-600 transition-colors">Home</Link>
          <span>/</span>
          <Link href="/brands" className="hover:text-gray-600 transition-colors">Brands</Link>
          <span>/</span>
          <span className="text-gray-600">{canonicalBrandName}</span>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">
            {canonicalBrandName} Watch Photos
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            {stats.photoCount} real owner photo{stats.photoCount !== 1 ? 's' : ''} on the wrist
          </p>
        </div>

        {/* Brand overview (editorial content from brandData) */}
        {brandData && (
          <div className="bg-gray-50 rounded-xl border border-gray-100 p-5 mb-8">
            {brandData.heroFact && (
              <p className="text-sm font-medium text-gray-700 mb-3 italic">
                &ldquo;{brandData.heroFact}&rdquo;
              </p>
            )}
            <p className="text-sm text-gray-600 leading-relaxed">{brandData.overview}</p>
            <p className="text-xs text-gray-400 mt-3">Founded {brandData.founded} · {brandData.country}</p>
          </div>
        )}

        {/* Watch model hubs */}
        {watchGroups.length > 0 && (
          <div className="mb-10">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {canonicalBrandName} models
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {watchGroups.map((watch) => (
                <Link
                  key={watch.watchId}
                  href={`/w/${watch.watchId}`}
                  className="group block rounded-xl overflow-hidden border border-gray-100 hover:border-gray-300 transition-colors"
                >
                  <div className="aspect-square bg-gray-50 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={watch.thumbnailUrl || watch.url}
                      alt={`${canonicalBrandName} ${watch.modelName || ''} wrist photo`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  </div>
                  <div className="px-2.5 py-2">
                    <p className="text-xs font-medium text-gray-700 truncate">{watch.modelName || 'Unknown model'}</p>
                    <p className="text-xs text-gray-400">{watch.photoCount} photo{watch.photoCount !== 1 ? 's' : ''}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Recent photos */}
        {recentPhotos.length > 0 && (
          <div className="mb-10">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Recent {canonicalBrandName} photos
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {recentPhotos.map((photo) => (
                <Link
                  key={photo.id}
                  href={`/photo/${photo.slug ?? photo.id}`}
                  className="group block rounded-xl overflow-hidden border border-gray-100 hover:border-gray-300 transition-colors"
                >
                  <div className="aspect-square bg-gray-50 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photo.thumbnailUrl || photo.url}
                      alt={buildPhotoAltText(photo)}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  </div>
                  <div className="px-2.5 py-2">
                    <p className="text-xs text-gray-500 truncate">by {photo.userName}</p>
                    {photo.caseSize && (
                      <p className="text-xs text-gray-400">{photo.caseSize}mm</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* FAQ section */}
        {brandData && brandData.faq.length > 0 && (
          <div className="mb-10">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {canonicalBrandName} — common questions
            </h2>
            <div className="space-y-4">
              {brandData.faq.map((item, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-100 p-5">
                  <h3 className="text-sm font-semibold text-gray-800 mb-2">{item.question}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{item.answer}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <Link
            href="/brands"
            className="text-sm text-gray-500 hover:text-gray-800 underline underline-offset-2 transition-colors"
          >
            ← All brands
          </Link>
          <Link
            href="/upload"
            className="text-sm font-medium text-white bg-gray-900 hover:bg-gray-700 px-4 py-2 rounded-lg transition-colors"
          >
            Upload your {canonicalBrandName}
          </Link>
        </div>

      </main>
    </>
  )
}
