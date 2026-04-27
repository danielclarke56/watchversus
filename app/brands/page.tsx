export const dynamic = 'force-dynamic'
export const revalidate = 0

import type { Metadata } from 'next'
import Link from 'next/link'
import { db } from '@/lib/db'
import { photos } from '@/lib/db/schema'
import { eq, and, sql, isNotNull } from 'drizzle-orm'

export const metadata: Metadata = {
  title: 'Watch Brands — Wrist Photo Gallery | Watchems',
  description:
    'Browse real owner wrist photos by watch brand. Rolex, Omega, Seiko, Tudor, and more — community-submitted photos on Watchems.',
  alternates: {
    canonical: 'https://watchems.com/brands',
  },
  openGraph: {
    title: 'Watch Brands — Wrist Photo Gallery | Watchems',
    description:
      'Browse real owner wrist photos by watch brand. Rolex, Omega, Seiko, Tudor, and more — community-submitted photos on Watchems.',
    url: 'https://watchems.com/brands',
    type: 'website',
    siteName: 'Watchems',
  },
  twitter: {
    card: 'summary',
    title: 'Watch Brands — Wrist Photo Gallery | Watchems',
    description: 'Browse real owner wrist photos by watch brand on Watchems.',
  },
}

export default async function BrandsPage() {
  const brandGroups = await db
    .select({
      brandName: photos.brandName,
      photoCount: sql<number>`count(*)::int`,
      thumbnailUrl: sql<string | null>`min(${photos.thumbnailUrl})`,
      url: sql<string>`min(${photos.url})`,
    })
    .from(photos)
    .where(and(eq(photos.status, 'approved'), isNotNull(photos.brandName)))
    .groupBy(photos.brandName)
    .orderBy(sql`count(*) DESC`)

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://watchems.com' },
      { '@type': 'ListItem', position: 2, name: 'Brands', item: 'https://watchems.com/brands' },
    ],
  }

  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Watch Brands on Watchems',
    numberOfItems: brandGroups.length,
    itemListElement: brandGroups.map((b, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: b.brandName,
      url: `https://watchems.com/brand/${encodeURIComponent(b.brandName!.toLowerCase())}`,
    })),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">

        {/* Breadcrumb */}
        <nav className="text-xs text-gray-400 mb-6 flex items-center gap-1.5">
          <Link href="/" className="hover:text-gray-600 transition-colors">Home</Link>
          <span>/</span>
          <span className="text-gray-600">Brands</span>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">Watch Brands</h1>
          <p className="text-sm text-gray-500 mt-2">
            Browse real owner wrist photos from {brandGroups.length} watch brand{brandGroups.length !== 1 ? 's' : ''} in the Watchems community.
          </p>
        </div>

        {/* Brand grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {brandGroups.map((brand) => {
            const slug = brand.brandName!.toLowerCase()
            const coverImg = brand.thumbnailUrl || brand.url
            return (
              <Link
                key={brand.brandName}
                href={`/brand/${encodeURIComponent(slug)}`}
                className="group block rounded-xl overflow-hidden border border-gray-100 hover:border-gray-300 transition-colors"
              >
                <div className="aspect-square bg-gray-50 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={coverImg}
                    alt={`${brand.brandName} wrist photo`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>
                <div className="px-2.5 py-2">
                  <p className="text-xs font-semibold text-gray-800 truncate">{brand.brandName}</p>
                  <p className="text-xs text-gray-400">{brand.photoCount} photo{brand.photoCount !== 1 ? 's' : ''}</p>
                </div>
              </Link>
            )
          })}
        </div>

      </main>
    </>
  )
}
