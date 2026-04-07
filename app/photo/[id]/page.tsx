export const dynamic = 'force-dynamic'

import { notFound, redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { Suspense } from 'react'
import { buildPhotoAltText } from '@/lib/photoAlt'
import { db } from '@/lib/db'
import { photos } from '@/lib/db/schema'
import { eq, or } from 'drizzle-orm'
import HeroSearch from '@/components/home/HeroSearch'
import PhotoGallery from '@/components/home/PhotoGallery'

interface PhotoPageProps {
  params: { id: string }
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// Generate static params for all approved photo slugs
export async function generateStaticParams(): Promise<{ id: string }[]> {
  try {
    const rows = await db
      .select({ slug: photos.slug, id: photos.id })
      .from(photos)
      .where(eq(photos.status, 'approved'))

    return rows.map((row) => ({ id: row.slug ?? row.id }))
  } catch {
    return []
  }
}

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

  return {
    title,
    description,
    alternates: {
      canonical: `https://watchems.com/photo/${slug}`,
    },
    openGraph: {
      title,
      description,
      url: `https://watchems.com/photo/${slug}`,
      type: 'website',
      images: [
        {
          url: p.url,
          width: 800,
          height: 800,
          alt: buildPhotoAltText(p),
        },
      ],
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

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'ImageObject',
    contentUrl: p.url,
    name: `${brandName} ${modelName}`,
    description: `On-wrist photo of ${brandName} ${modelName}`,
    creator: {
      '@type': 'Person',
      name: p.userName,
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <main className="min-h-screen">
        <Suspense>
          <HeroSearch />
          <PhotoGallery initialPhotoSlug={slug} />
        </Suspense>
      </main>
    </>
  )
}
