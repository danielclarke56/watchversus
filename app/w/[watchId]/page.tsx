import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { db } from '@/lib/db'
import { photos } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { getWatchById } from '@/lib/watches'
import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import type { ApprovedPhoto } from '@/lib/photos'

interface WatchPageProps {
  params: { watchId: string }
}

// Un-slugify a watchId (e.g. "tudor-black-bay-54" → "Tudor Black Bay 54")
function unslugify(slug: string): string {
  return slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

// Generate static params for all watchIds with approved photos
export async function generateStaticParams(): Promise<{ watchId: string }[]> {
  const watchIds = await db
    .selectDistinct({ watchId: photos.watchId })
    .from(photos)
    .where(eq(photos.status, 'approved'))

  return watchIds.map((row) => ({ watchId: row.watchId }))
}

// Generate dynamic metadata
export async function generateMetadata({ params }: WatchPageProps): Promise<Metadata> {
  const photoRecords = await db
    .select()
    .from(photos)
    .where(and(eq(photos.watchId, params.watchId), eq(photos.status, 'approved')))
    .limit(1)

  if (photoRecords.length === 0) {
    return {
      title: 'Watch Not Found | WatchVsWatch',
    }
  }

  const firstPhoto = photoRecords[0]
  const watch = getWatchById(params.watchId)

  const brand = firstPhoto.brandName || watch?.brand || unslugify(params.watchId).split(' ')[0]
  const model =
    firstPhoto.modelName ||
    watch?.name ||
    unslugify(params.watchId)
      .split(' ')
      .slice(1)
      .join(' ')

  return {
    title: `${brand} ${model} Owner Photos | WatchVsWatch`,
    description: `See real ${brand} ${model} photos from owners. Actual wrist shots, specs, and reviews.`,
    alternates: {
      canonical: `https://watchvswatch.com/w/${params.watchId}`,
    },
    openGraph: {
      title: `${brand} ${model} Owner Photos | WatchVsWatch`,
      description: `See real ${brand} ${model} photos from owners. Actual wrist shots, specs, and reviews.`,
      url: `https://watchvswatch.com/w/${params.watchId}`,
      type: 'website',
      images: [
        {
          url: firstPhoto.url,
          width: 800,
          height: 800,
          alt: `${brand} ${model}`,
        },
      ],
    },
  }
}

export default async function WatchPage({ params }: WatchPageProps) {
  const photoRecords = await db
    .select()
    .from(photos)
    .where(and(eq(photos.watchId, params.watchId), eq(photos.status, 'approved')))

  if (photoRecords.length === 0) {
    notFound()
  }

  // Convert DB records to ApprovedPhoto interface
  const approvedPhotos: ApprovedPhoto[] = photoRecords.map((p) => ({
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
    createdAt: p.createdAt.toISOString(),
    approved: true,
  }))

  const watch = getWatchById(params.watchId)
  const brandName =
    approvedPhotos[0].brandName || watch?.brand || unslugify(params.watchId).split(' ')[0]
  const modelName =
    approvedPhotos[0].modelName ||
    watch?.name ||
    unslugify(params.watchId)
      .split(' ')
      .slice(1)
      .join(' ')

  // Collect metadata from all photos (only non-empty values)
  const metadata: {
    caseSize?: Set<string>
    movement?: Set<string>
    referenceNumber?: Set<string>
    wristSize?: Set<string>
    estimatedPrice?: Set<string>
    lugToLug?: Set<string>
    betweenLugs?: Set<string>
    thickness?: Set<string>
    waterResistance?: Set<string>
  } = {}

  approvedPhotos.forEach((photo) => {
    if (photo.caseSize) {
      if (!metadata.caseSize) metadata.caseSize = new Set()
      metadata.caseSize.add(photo.caseSize)
    }
    if (photo.movement) {
      if (!metadata.movement) metadata.movement = new Set()
      metadata.movement.add(photo.movement)
    }
    if (photo.referenceNumber) {
      if (!metadata.referenceNumber) metadata.referenceNumber = new Set()
      metadata.referenceNumber.add(photo.referenceNumber)
    }
    if (photo.wristSize) {
      if (!metadata.wristSize) metadata.wristSize = new Set()
      metadata.wristSize.add(photo.wristSize)
    }
    if (photo.estimatedPrice) {
      if (!metadata.estimatedPrice) metadata.estimatedPrice = new Set()
      metadata.estimatedPrice.add(photo.estimatedPrice)
    }
    if (photo.lugToLug) {
      if (!metadata.lugToLug) metadata.lugToLug = new Set()
      metadata.lugToLug.add(photo.lugToLug)
    }
    if (photo.betweenLugs) {
      if (!metadata.betweenLugs) metadata.betweenLugs = new Set()
      metadata.betweenLugs.add(photo.betweenLugs)
    }
    if (photo.thickness) {
      if (!metadata.thickness) metadata.thickness = new Set()
      metadata.thickness.add(photo.thickness)
    }
    if (photo.waterResistance) {
      if (!metadata.waterResistance) metadata.waterResistance = new Set()
      metadata.waterResistance.add(photo.waterResistance)
    }
  })

  // Build JSON-LD structured data for images
  const imageStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'ImageGallery',
    name: `${brandName} ${modelName} Owner Photos`,
    image: approvedPhotos.map((photo) => ({
      '@type': 'ImageObject',
      contentUrl: photo.url,
      name: `${brandName} ${modelName} owner photo`,
      author: {
        '@type': 'Person',
        name: photo.userName,
      },
    })),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(imageStructuredData) }}
      />
      <Section>
        <Container>
          <div className="mb-8">
            <Link href="/explore" className="text-accent hover:text-accentDark mb-4 inline-block">
              ← All watches
            </Link>
            <h1 className="text-4xl font-bold text-textPrimary mb-2">
              {brandName} {modelName}
            </h1>
            <p className="text-lg text-textSecond">
              {approvedPhotos.length} {approvedPhotos.length === 1 ? 'photo' : 'photos'} from owners
            </p>
          </div>

          {/* Photo Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-12">
            {approvedPhotos.map((photo) => (
              <div
                key={photo.id}
                className="group relative aspect-square bg-surfaceAlt rounded-sm overflow-hidden border border-border hover:border-borderStrong transition-colors"
              >
                <Image
                  src={photo.url}
                  alt={`${brandName} ${modelName} photo by ${photo.userName}`}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
                {/* Overlay with info */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-end justify-end p-3">
                  <div className="w-full text-right">
                    <p className="text-white text-xs font-semibold">
                      {new Date(photo.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                    <p className="text-white/70 text-[10px] truncate">by {photo.userName}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Metadata Section */}
          {Object.keys(metadata).length > 0 && (
            <div className="card p-6 mb-8">
              <h2 className="text-2xl font-bold text-textPrimary mb-6">Watch Specifications</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {metadata.caseSize && (
                  <div>
                    <p className="text-sm text-textSecond font-semibold mb-1">Case Size</p>
                    <p className="text-textPrimary">{Array.from(metadata.caseSize).join(', ')}</p>
                  </div>
                )}
                {metadata.movement && (
                  <div>
                    <p className="text-sm text-textSecond font-semibold mb-1">Movement</p>
                    <p className="text-textPrimary">{Array.from(metadata.movement).join(', ')}</p>
                  </div>
                )}
                {metadata.referenceNumber && (
                  <div>
                    <p className="text-sm text-textSecond font-semibold mb-1">Reference</p>
                    <p className="text-textPrimary">
                      {Array.from(metadata.referenceNumber).join(', ')}
                    </p>
                  </div>
                )}
                {metadata.wristSize && (
                  <div>
                    <p className="text-sm text-textSecond font-semibold mb-1">Wrist Size</p>
                    <p className="text-textPrimary">{Array.from(metadata.wristSize).join(', ')}</p>
                  </div>
                )}
                {metadata.estimatedPrice && (
                  <div>
                    <p className="text-sm text-textSecond font-semibold mb-1">Estimated Price</p>
                    <p className="text-textPrimary">
                      {Array.from(metadata.estimatedPrice).join(', ')}
                    </p>
                  </div>
                )}
                {metadata.lugToLug && (
                  <div>
                    <p className="text-sm text-textSecond font-semibold mb-1">Lug-to-Lug</p>
                    <p className="text-textPrimary">{Array.from(metadata.lugToLug).join(', ')}</p>
                  </div>
                )}
                {metadata.betweenLugs && (
                  <div>
                    <p className="text-sm text-textSecond font-semibold mb-1">Between Lugs</p>
                    <p className="text-textPrimary">{Array.from(metadata.betweenLugs).join(', ')}</p>
                  </div>
                )}
                {metadata.thickness && (
                  <div>
                    <p className="text-sm text-textSecond font-semibold mb-1">Thickness</p>
                    <p className="text-textPrimary">{Array.from(metadata.thickness).join(', ')}</p>
                  </div>
                )}
                {metadata.waterResistance && (
                  <div>
                    <p className="text-sm text-textSecond font-semibold mb-1">Water Resistance</p>
                    <p className="text-textPrimary">
                      {Array.from(metadata.waterResistance).join(', ')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="text-center py-8">
            <Link href="/explore" className="btn-outline px-6 py-2.5">
              ← Back to All Watches
            </Link>
          </div>
        </Container>
      </Section>
    </>
  )
}
