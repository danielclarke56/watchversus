import Image from 'next/image'
import Link from 'next/link'
import type { ApprovedPhoto } from '@/lib/photos'
import { buildPhotoAltText } from '@/lib/photoAlt'
import { Container } from '@/components/ui/Container'

interface TrendingPhotosProps {
  photos: ApprovedPhoto[]
}

export default function TrendingPhotos({ photos }: TrendingPhotosProps) {
  if (photos.length === 0) {
    return (
      <section className="py-12 md:py-14">
        <Container>
          <h2 className="text-2xl sm:text-3xl font-bold text-textPrimary mb-8">
            Trending Photos
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="aspect-square bg-surfaceAlt border border-border rounded-sm flex items-center justify-center"
              >
                <p className="text-xs text-textMuted text-center px-2">
                  Be the first to upload
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>
    )
  }

  return (
    <section className="py-12 md:py-14">
      <Container>
        <h2 className="text-2xl sm:text-3xl font-bold text-textPrimary mb-8">
          Trending Photos
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {photos.slice(0, 12).map((photo) => {
            const watchName = [photo.brandName, photo.modelName].filter(Boolean).join(' ') || photo.watchId
            return (
              <Link
                key={photo.id}
                href={photo.slug ? `/photo/${photo.slug}` : `/photo/${photo.id}`}
                className="group"
              >
                <div className="relative aspect-square bg-surfaceAlt border border-border rounded-sm overflow-hidden">
                  <Image
                    src={photo.url}
                    alt={buildPhotoAltText(photo)}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 16vw"
                  />
                </div>
                <div className="mt-1.5">
                  <p className="text-xs font-semibold text-textPrimary truncate">
                    {watchName}
                  </p>
                </div>
              </Link>
            )
          })}
        </div>
      </Container>
    </section>
  )
}
