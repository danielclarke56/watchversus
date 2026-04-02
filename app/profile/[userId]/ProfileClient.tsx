'use client'

import { useRouter } from 'next/navigation'
import type { Photo } from '@/lib/db/schema'

interface ProfileClientProps {
  watchId: string
  photos: Photo[]
}

export default function ProfileClient({ watchId, photos }: ProfileClientProps) {
  const router = useRouter()

  const handlePhotoClick = (photoId: string) => {
    router.push(`/photo/${photoId}`)
  }

  // Extract watch details from the first photo (they're all the same watch)
  const firstPhoto = photos[0]
  const watchName = firstPhoto.brandName && firstPhoto.modelName
    ? `${firstPhoto.brandName} ${firstPhoto.modelName}`
    : `Watch (${watchId})`

  return (
    <>
      <div
        className="bg-surface border border-borderStrong rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
        onClick={() => handlePhotoClick(photos[0].id)}
      >
        {/* Primary photo */}
        <div className="relative aspect-square bg-neutral overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photos[0].url}
            alt={watchName}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {photos.length > 1 && (
            <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
              +{photos.length - 1} photo{photos.length > 2 ? 's' : ''}
            </div>
          )}
        </div>

        {/* Card info */}
        <div className="p-4">
          <h3 className="font-semibold text-textPrimary mb-1 group-hover:text-accent transition-colors">
            {watchName}
          </h3>
          <p className="text-xs text-textMuted">{photos.length} photo{photos.length !== 1 ? 's' : ''}</p>
        </div>
      </div>
    </>
  )
}
