export const dynamic = 'force-dynamic'
export const revalidate = 0

import { notFound, redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { Suspense } from 'react'
import Link from 'next/link'
import { buildPhotoAltText } from '@/lib/photoAlt'
import { db } from '@/lib/db'
import { photos } from '@/lib/db/schema'
import { or, and, ne, asc, desc, eq } from 'drizzle-orm'
import HeroSearch from '@/components/home/HeroSearch'
import PhotoGallery from '@/components/home/PhotoGallery'
import SaveToBoard from '@/components/SaveToBoard'

interface PhotoPageProps {
  params: { id: string }
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// Generate dynamic metadata
export async function generateMetadata({ params }: PhotoPageProps): Promise<Metadata> {
  const param = params.id
  const isUUID = UUID_REGEX.test(param)

  const photoRecord = await db
    .select()
    .from(photos)
    .where(isUUID ? eq(photos.id, param) : or(eq(photos.slug, param), eq(photos.id, param))!)
    .limit(1)

  if (photoRecord.length === 0 || photoRecord[0].status !== 'approved') {
    return { title: 'Photo Not Found | Watchems' }
  }

  const p = photoRecord[0]
  const slug = p.slug ?? p.id
  const brandName = p.brandName || 'Watch'
  const modelName = p.modelName || 'on the wrist'
  const title = `${brandName} ${modelName} Wrist Photo by ${p.userName} | Watchems`
  const description = `Real owner photo of the ${brandName} ${modelName}${p.referenceNumber ? ` (ref. ${p.referenceNumber})` : ''} submitted by ${p.userName} on Watchems.${p.caseSize ? ` Case size: ${p.caseSize}.` : ''}${p.movement ? ` Movement: ${p.movement}.` : ''}`
  const imageUrl = p.thumbnailUrl || p.url

  // Find the primary photo in this user's carousel (lowest sortOrder, then earliest createdAt)
  // Secondary carousel photos point their canonical to the primary
  let canonicalSlug = slug
  if (p.userId) {
    const primaryPhoto = await db
      .select({ id: photos.id, slug: photos.slug })
      .from(photos)
      .where(and(eq(photos.watchId, p.watchId), eq(photos.userId, p.userId), eq(photos.status, 'approved')))
      .orderBy(asc(photos.sortOrder), asc(photos.createdAt))
      .limit(1)
    if (primaryPhoto.length > 0 && primaryPhoto[0].id !== p.id) {
      canonicalSlug = primaryPhoto[0].slug ?? primaryPhoto[0].id
    }
  }

  return {
    title,
    description,
    alternates: {
      canonical: `https://watchems.com/photo/${canonicalSlug}`,
    },
    openGraph: {
      title,
      description,
      url: `https://watchems.com/photo/${slug}`,
      type: 'website',
      siteName: 'Watchems',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: buildPhotoAltText(p),
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
  }
}

export default async function PhotoPage({ params }: PhotoPageProps) {
  const param = params.id
  const isUUID = UUID_REGEX.test(param)

  const photoRecord = await db
    .select()
    .from(photos)
    .where(isUUID ? eq(photos.id, param) : or(eq(photos.slug, param), eq(photos.id, param))!)
    .limit(1)

  if (photoRecord.length === 0 || photoRecord[0].status !== 'approved') {
    notFound()
  }

  const p = photoRecord[0]

  // UUID accessed directly — 301 redirect to slug URL
  if (isUUID && p.slug) {
    redirect(`/photo/${p.slug}`)
  }

  const slug = p.slug ?? p.id
  const brandName = p.brandName || 'Watch'
  const modelName = p.modelName || 'on the wrist'
  const imageUrl = p.thumbnailUrl || p.url

  // Fetch related photos in parallel
  const relatedByWatch = await db
    .select({
      id: photos.id,
      slug: photos.slug,
      url: photos.url,
      thumbnailUrl: photos.thumbnailUrl,
      userName: photos.userName,
      brandName: photos.brandName,
      modelName: photos.modelName,
    })
    .from(photos)
    .where(and(eq(photos.watchId, p.watchId), eq(photos.status, 'approved'), ne(photos.id, p.id)))
    .orderBy(asc(photos.sortOrder), desc(photos.createdAt))
    .limit(6)

  // Structured data — ImageObject
  const imageJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ImageObject',
    contentUrl: p.url,
    url: `https://watchems.com/photo/${slug}`,
    name: buildPhotoAltText(p),
    description: `On-wrist photo of ${brandName} ${modelName}${p.referenceNumber ? ` (ref. ${p.referenceNumber})` : ''} submitted by ${p.userName} on Watchems.`,
    thumbnailUrl: imageUrl,
    datePublished: p.createdAt.toISOString(),
    creator: {
      '@type': 'Person',
      name: p.userName,
    },
    creditText: p.userName,
    copyrightNotice: `© ${p.userName}, shared on Watchems`,
    license: 'https://creativecommons.org/licenses/by-nc/4.0/',
    acquireLicensePage: 'https://watchems.com/about',
    about: {
      '@type': 'Thing',
      name: `${brandName} ${modelName}`,
    },
  }

  // Structured data — Product (only when we have brand + model)
  const productJsonLd = p.brandName && p.modelName
    ? {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: `${brandName} ${modelName}`,
        brand: { '@type': 'Brand', name: brandName },
        image: imageUrl,
        url: `https://watchems.com/photo/${slug}`,
        ...(p.referenceNumber && { mpn: p.referenceNumber }),
        description: [
          `${brandName} ${modelName}${p.referenceNumber ? ` (ref. ${p.referenceNumber})` : ''}.`,
          p.movement && `Movement: ${p.movement}`,
          p.caseSize && `Case size: ${p.caseSize}`,
          p.waterResistance && `Water resistance: ${p.waterResistance}`,
        ]
          .filter(Boolean)
          .join(' '),
        offers: {
          '@type': 'Offer',
          url: `https://watchems.com/photo/${slug}`,
          priceCurrency: 'USD',
          price: '0',
          availability: 'https://schema.org/InStock',
          hasMerchantReturnPolicy: {
            '@type': 'MerchantReturnPolicy',
            applicableCountry: 'US',
            returnPolicyCategory: 'https://schema.org/MerchantReturnNotPermitted',
          },
          shippingDetails: {
            '@type': 'OfferShippingDetails',
            shippingRate: {
              '@type': 'MonetaryAmount',
              value: '0',
              currency: 'USD',
            },
            shippingDestination: {
              '@type': 'DefinedRegion',
              addressCountry: 'US',
            },
            deliveryTime: {
              '@type': 'ShippingDeliveryTime',
              handlingTime: {
                '@type': 'QuantitativeValue',
                minValue: 0,
                maxValue: 0,
                unitCode: 'DAY',
              },
              transitTime: {
                '@type': 'QuantitativeValue',
                minValue: 0,
                maxValue: 0,
                unitCode: 'DAY',
              },
            },
          },
        },
      }
    : null

  // Structured data — BreadcrumbList
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://watchems.com' },
      { '@type': 'ListItem', position: 2, name: 'Photos', item: 'https://watchems.com' },
      {
        '@type': 'ListItem',
        position: 3,
        name: `${brandName} ${modelName}`,
        item: `https://watchems.com/photo/${slug}`,
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(imageJsonLd) }}
      />
      {productJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <main className="min-h-screen">
        <Suspense>
          <HeroSearch />
          <PhotoGallery initialPhotoSlug={slug} />
        </Suspense>

        {/* SEO content — server-rendered for Google indexing */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h1 className="text-xl font-semibold text-gray-900 mb-2">
              {brandName} {modelName} — Owner Photo
            </h1>
            <p className="text-gray-700 leading-relaxed">
              Real owner photo of the {brandName} {modelName}
              {p.referenceNumber ? ` (ref. ${p.referenceNumber})` : ''}, worn on the wrist and
              shared by {p.userName} on Watchems.
              {p.caseSize ? ` Case size: ${p.caseSize}.` : ''}
              {p.movement ? ` Movement: ${p.movement}.` : ''}
              {p.waterResistance ? ` Water resistance: ${p.waterResistance}.` : ''}
              {p.wristSize ? ` Wrist size: ${p.wristSize}.` : ''}
            </p>
            <div className="flex items-center justify-between mt-3">
              <p className="text-sm text-gray-500">
                Submitted by <span className="font-medium text-gray-700">{p.userName}</span>
              </p>
              <SaveToBoard photoId={p.id} variant="button" />
            </div>
          </div>

          {/* Related photos — same watch model */}
          {relatedByWatch.length > 0 && (
            <div className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  More {brandName} {modelName} photos
                </h2>
                {/* Link to hub page once there are enough photos (current + related >= 3) */}
                {relatedByWatch.length >= 2 && p.brandName && p.modelName && (
                  <Link
                    href={`/w/${p.watchId}`}
                    className="text-sm text-gray-500 hover:text-gray-800 underline underline-offset-2 transition-colors"
                  >
                    See all →
                  </Link>
                )}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {relatedByWatch.map((photo) => (
                  <Link
                    key={photo.id}
                    href={`/photo/${photo.slug ?? photo.id}`}
                    className="block rounded-lg overflow-hidden border border-gray-100 hover:border-gray-300 transition-colors"
                  >
                    <div className="aspect-square bg-gray-50">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={photo.thumbnailUrl || photo.url}
                        alt={`${photo.brandName || 'Watch'} ${photo.modelName || ''} by ${photo.userName}`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

        </section>
      </main>
    </>
  )
}
