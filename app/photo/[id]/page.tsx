import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { Suspense } from 'react'
import { db } from '@/lib/db'
import { photos } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import HeroSearch from '@/components/home/HeroSearch'
import PhotoGallery from '@/components/home/PhotoGallery'

interface PhotoPageProps {
  params: { id: string }
}

// Generate static params for all approved photo IDs
export async function generateStaticParams(): Promise<{ id: string }[]> {
  const photoIds = await db
    .select({ id: photos.id })
    .from(photos)
    .where(eq(photos.status, 'approved'))

  return photoIds.map((row) => ({ id: row.id }))
}

// Generate dynamic metadata
export async function generateMetadata({ params }: PhotoPageProps): Promise<Metadata> {
  const photoRecord = await db
    .select()
    .from(photos)
    .where(eq(photos.id, params.id))
    .limit(1)

  if (photoRecord.length === 0 || photoRecord[0].status !== 'approved') {
    return {
      title: 'Photo Not Found | WatchVsWatch',
    }
  }

  const p = photoRecord[0]
  const brandName = p.brandName || 'Watch'
  const modelName = p.modelName || 'on the wrist'
  const title = `${brandName} ${modelName} Wrist Photo by ${p.userName} | WatchVsWatch`
  const description = `Real owner photo of the ${brandName} ${modelName}${p.referenceNumber ? ` (ref. ${p.referenceNumber})` : ''} submitted by ${p.userName} on WatchVsWatch.${p.caseSize ? ` Case size: ${p.caseSize}.` : ''}${p.movement ? ` Movement: ${p.movement}.` : ''}`

  return {
    title,
    description,
    alternates: {
      canonical: `https://watchvswatch.com/photo/${params.id}`,
    },
    openGraph: {
      title,
      description,
      url: `https://watchvswatch.com/photo/${params.id}`,
      type: 'website',
      images: [
        {
          url: p.url,
          width: 800,
          height: 800,
          alt: `${brandName} ${modelName}${p.referenceNumber ? ` ref. ${p.referenceNumber}` : ''} wrist photo by ${p.userName}`,
        },
      ],
    },
  }
}

export default async function PhotoPage({ params }: PhotoPageProps) {
  const photoRecord = await db
    .select()
    .from(photos)
    .where(eq(photos.id, params.id))
    .limit(1)

  if (photoRecord.length === 0 || photoRecord[0].status !== 'approved') {
    notFound()
  }

  const p = photoRecord[0]
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
          <PhotoGallery initialPhotoId={params.id} />
        </Suspense>
      </main>
    </>
  )
}
