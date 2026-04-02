import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { db } from '@/lib/db'
import { photos } from '@/lib/db/schema'
import { eq, and, ilike, ne } from 'drizzle-orm'
import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import type { ApprovedPhoto } from '@/lib/photos'

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

  // Fetch related photos (same brand, different watchId)
  let relatedPhotos: typeof photoRecord = []
  if (p.brandName) {
    relatedPhotos = await db
      .select()
      .from(photos)
      .where(
        and(
          eq(photos.status, 'approved'),
          ilike(photos.brandName, p.brandName),
          ne(photos.watchId, p.watchId)
        )
      )
      .limit(6)
  }

  // Convert DB record to ApprovedPhoto interface
  const photo: ApprovedPhoto = {
    id: p.id,
    watchId: p.watchId,
    userId: p.userId,
    userName: p.userName,
    url: p.url,
    brandName: p.brandName ?? undefined,
    modelName: p.modelName ?? undefined,
    referenceNumber: p.referenceNumber ?? undefined,
    movement: p.movement ?? undefined,
    caseSize: p.caseSize ?? undefined,
    wristSize: p.wristSize ?? undefined,
    estimatedPrice: p.estimatedPrice ?? undefined,
    productionYear: p.productionYear ?? undefined,
    lugToLug: p.lugToLug ?? undefined,
    betweenLugs: p.betweenLugs ?? undefined,
    thickness: p.thickness ?? undefined,
    waterResistance: p.waterResistance ?? undefined,
    approved: true,
    createdAt: p.createdAt.toISOString(),
  }

  const brandName = photo.brandName || 'Watch'
  const modelName = photo.modelName || 'on the wrist'

  // Build JSON-LD structured data
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'ImageObject',
    contentUrl: photo.url,
    name: `${brandName} ${modelName}`,
    description: `On-wrist photo of ${brandName} ${modelName}`,
    creator: {
      '@type': 'Person',
      name: photo.userName,
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <Section>
        <Container>
          {/* Navigation */}
          <div className="mb-8">
            <Link
              href={photo.brandName ? `/brand/${encodeURIComponent(photo.brandName.toLowerCase())}` : '/'}
              className="text-accent hover:text-accentDark inline-block"
            >
              ← More {photo.brandName || 'watches'}
            </Link>
          </div>

          {/* Main Photo Hero */}
          <div className="mb-8">
            <div className="relative w-full h-auto bg-surfaceAlt rounded-lg overflow-hidden border border-border">
              <Image
                src={photo.url}
                alt={`${brandName} ${modelName}${photo.referenceNumber ? ` ref. ${photo.referenceNumber}` : ''} on the wrist — submitted by ${photo.userName}`}
                width={900}
                height={900}
                className="w-full h-auto object-contain"
                priority
              />
            </div>
          </div>

          {/* Watch Info and Metadata */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Main Info */}
            <div className="lg:col-span-2">
              <h1 className="text-4xl font-bold text-textPrimary mb-2">
                {brandName} {modelName}
              </h1>
              <p className="text-lg text-textSecond mb-6">
                Submitted by: <span className="font-semibold">{photo.userName}</span>
              </p>

              {/* Metadata Grid */}
              {(photo.caseSize ||
                photo.movement ||
                photo.referenceNumber ||
                photo.wristSize ||
                photo.estimatedPrice ||
                photo.lugToLug ||
                photo.betweenLugs ||
                photo.thickness ||
                photo.waterResistance) && (
                <div className="card p-6">
                  <h2 className="text-xl font-bold text-textPrimary mb-4">Watch Specifications</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {photo.brandName && (
                      <div>
                        <p className="text-sm text-textSecond font-semibold mb-1">Brand</p>
                        <p className="text-textPrimary">{photo.brandName}</p>
                      </div>
                    )}
                    {photo.modelName && (
                      <div>
                        <p className="text-sm text-textSecond font-semibold mb-1">Model</p>
                        <p className="text-textPrimary">{photo.modelName}</p>
                      </div>
                    )}
                    {photo.referenceNumber && (
                      <div>
                        <p className="text-sm text-textSecond font-semibold mb-1">Reference</p>
                        <p className="text-textPrimary">{photo.referenceNumber}</p>
                      </div>
                    )}
                    {photo.movement && (
                      <div>
                        <p className="text-sm text-textSecond font-semibold mb-1">Movement</p>
                        <p className="text-textPrimary">{photo.movement}</p>
                      </div>
                    )}
                    {photo.caseSize && (
                      <div>
                        <p className="text-sm text-textSecond font-semibold mb-1">Case Size</p>
                        <p className="text-textPrimary">{photo.caseSize}</p>
                      </div>
                    )}
                    {photo.wristSize && (
                      <div>
                        <p className="text-sm text-textSecond font-semibold mb-1">Wrist Size</p>
                        <p className="text-textPrimary">{photo.wristSize}</p>
                      </div>
                    )}
                    {photo.estimatedPrice && (
                      <div>
                        <p className="text-sm text-textSecond font-semibold mb-1">Estimated Price</p>
                        <p className="text-textPrimary">{photo.estimatedPrice}</p>
                      </div>
                    )}
                    {photo.lugToLug && (
                      <div>
                        <p className="text-sm text-textSecond font-semibold mb-1">Lug-to-Lug</p>
                        <p className="text-textPrimary">{photo.lugToLug}</p>
                      </div>
                    )}
                    {photo.betweenLugs && (
                      <div>
                        <p className="text-sm text-textSecond font-semibold mb-1">Between Lugs</p>
                        <p className="text-textPrimary">{photo.betweenLugs}</p>
                      </div>
                    )}
                    {photo.thickness && (
                      <div>
                        <p className="text-sm text-textSecond font-semibold mb-1">Thickness</p>
                        <p className="text-textPrimary">{photo.thickness}</p>
                      </div>
                    )}
                    {photo.waterResistance && (
                      <div>
                        <p className="text-sm text-textSecond font-semibold mb-1">Water Resistance</p>
                        <p className="text-textPrimary">{photo.waterResistance}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar - Navigation Links */}
            <div className="lg:col-span-1">
              <div className="space-y-3">
                <div className="card p-4">
                  <Link
                    href={`/w/${photo.watchId}`}
                    className="block w-full text-center px-4 py-2.5 bg-accent text-white font-semibold rounded hover:bg-accentDark transition-colors"
                  >
                    See all {brandName} {modelName}
                  </Link>
                </div>
                <div className="card p-4">
                  <Link
                    href="/"
                    className="block w-full text-center px-4 py-2.5 bg-surfaceAlt border border-border text-textPrimary font-semibold rounded hover:bg-surface hover:border-borderStrong transition-colors"
                  >
                    Browse all photos
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Related Photos Section */}
          {relatedPhotos.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-textPrimary mb-4">More {brandName} Watches</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {(() => {
                  // Group related photos by watchId and show first photo of each group
                  const grouped = new Map<string, typeof relatedPhotos[0]>()
                  relatedPhotos.forEach((p) => {
                    if (!grouped.has(p.watchId)) {
                      grouped.set(p.watchId, p)
                    }
                  })
                  return Array.from(grouped.values()).map((photo) => (
                    <Link
                      key={photo.watchId}
                      href={`/w/${photo.watchId}`}
                      className="group"
                    >
                      <div className="relative aspect-square bg-surfaceAlt rounded-sm overflow-hidden border border-border hover:border-borderStrong transition-colors">
                        <Image
                          src={photo.url}
                          alt={`${photo.brandName} ${photo.modelName}${photo.referenceNumber ? ` ref. ${photo.referenceNumber}` : ''}`}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 33vw"
                        />
                      </div>
                      <p className="text-sm text-textSecond mt-2 group-hover:text-accent transition-colors">
                        {photo.modelName}
                      </p>
                    </Link>
                  ))
                })()}
              </div>
            </div>
          )}
        </Container>
      </Section>
    </>
  )
}
