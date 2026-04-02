import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { buildPhotoAltText } from '@/lib/photoAlt'
import { db } from '@/lib/db'
import { photos } from '@/lib/db/schema'
import { eq, and, sql } from 'drizzle-orm'
import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import type { ApprovedPhoto } from '@/lib/photos'

interface BrandPageProps {
  params: { brand: string }
}

// Un-slugify a brand name (e.g. "tudor-black-bay" → "Tudor Black Bay")
function unslugify(slug: string): string {
  return slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

// Decode URL-encoded brand (e.g. "rolex%20submariner" → "rolex submariner")
function decodeBrand(encoded: string): string {
  return decodeURIComponent(encoded)
}

// Generate static params for all brands with approved photos
export async function generateStaticParams(): Promise<{ brand: string }[]> {
  const brands = await db
    .selectDistinct({
      brand: sql<string>`LOWER(TRIM(${photos.brandName}))`,
    })
    .from(photos)
    .where(and(eq(photos.status, 'approved'), sql`${photos.brandName} IS NOT NULL`))

  return brands.map((row) => ({
    brand: encodeURIComponent(row.brand.toLowerCase()),
  }))
}

// Generate dynamic metadata
export async function generateMetadata({ params }: BrandPageProps): Promise<Metadata> {
  const decodedBrand = decodeBrand(params.brand)
  const photoRecords = await db
    .select()
    .from(photos)
    .where(
      and(
        eq(photos.status, 'approved'),
        sql`LOWER(TRIM(${photos.brandName})) = ${decodedBrand.toLowerCase().trim()}`
      )
    )
    .limit(1)

  if (photoRecords.length === 0) {
    return {
      title: 'Brand Not Found | WatchVsWatch',
    }
  }

  const displayBrand = photoRecords[0].brandName || unslugify(params.brand)

  return {
    title: `${displayBrand} Watch Photos | WatchVsWatch`,
    description: `Browse real ${displayBrand} watch photos from owners. See how ${displayBrand} watches actually look on the wrist.`,
    alternates: {
      canonical: `https://watchems.com/brand/${params.brand}`,
    },
    openGraph: {
      title: `${displayBrand} Watch Photos | WatchVsWatch`,
      description: `Browse real ${displayBrand} watch photos from owners. See how ${displayBrand} watches actually look on the wrist.`,
      url: `https://watchems.com/brand/${params.brand}`,
      type: 'website',
    },
  }
}

export default async function BrandPage({ params }: BrandPageProps) {
  const decodedBrand = decodeBrand(params.brand)

  const photoRecords = await db
    .select()
    .from(photos)
    .where(
      and(
        eq(photos.status, 'approved'),
        sql`LOWER(TRIM(${photos.brandName})) = ${decodedBrand.toLowerCase().trim()}`
      )
    )
    .orderBy(sql`${photos.createdAt} DESC`)

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

  // Group photos by watchId
  const photosByWatch = new Map<string, ApprovedPhoto[]>()
  approvedPhotos.forEach((photo) => {
    if (!photosByWatch.has(photo.watchId)) {
      photosByWatch.set(photo.watchId, [])
    }
    photosByWatch.get(photo.watchId)!.push(photo)
  })

  // Sort watch groups by count (most photos first)
  const watchGroups = Array.from(photosByWatch.entries()).sort((a, b) => b[1].length - a[1].length)

  const displayBrand = approvedPhotos[0].brandName || unslugify(params.brand)

  return (
    <Section>
      <Container>
        <div className="mb-8">
          <Link href="/" className="text-accent hover:text-accentDark mb-4 inline-block">
            ← All watches
          </Link>
          <h1 className="text-4xl font-bold text-textPrimary mb-2">{displayBrand} Watch Photos</h1>
          <p className="text-lg text-textSecond">
            {approvedPhotos.length} {approvedPhotos.length === 1 ? 'photo' : 'photos'} from{' '}
            {watchGroups.length} {watchGroups.length === 1 ? 'watch' : 'watches'}
          </p>
        </div>

        {/* Group photos by watch model */}
        {watchGroups.map(([watchId, watchPhotos]) => {
          const firstPhoto = watchPhotos[0]
          const watchModelName =
            firstPhoto.modelName ||
            watchId
              .split('-')
              .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
              .join(' ')

          return (
            <div key={watchId} className="mb-12">
              <Link href={`/w/${watchId}`}>
                <h2 className="text-2xl font-semibold text-accent hover:text-accentDark mb-4">
                  {displayBrand} {watchModelName} →
                </h2>
              </Link>

              {/* Photo Grid for this watch */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-8">
                {watchPhotos.map((photo) => (
                  <div
                    key={photo.id}
                    className="group relative aspect-square bg-surfaceAlt rounded-sm overflow-hidden border border-border hover:border-borderStrong transition-colors"
                  >
                    <Image
                      src={photo.url}
                      alt={buildPhotoAltText(photo)}
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
            </div>
          )
        })}

        <div className="text-center py-8">
          <Link href="/" className="btn-outline px-6 py-2.5">
            ← Back to All Watches
          </Link>
        </div>
      </Container>
    </Section>
  )
}
