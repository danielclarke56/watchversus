'use client'

import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { buildPhotoAltText } from '@/lib/photoAlt'
import type { Photo } from '@/lib/db/schema'

interface ProfileClientProps {
  watchId?: string
  photos: Photo[]
}

export default function ProfileClient({ photos }: ProfileClientProps) {
  const router = useRouter()

  const handlePhotoClick = (photo: { id: string; slug?: string | null }) => {
    router.push(`/photo/${photo.slug ?? photo.id}`)
  }

  // Extract watch details from the first photo (they're all the same watch)
  const firstPhoto = photos[0]
  const brand = firstPhoto.brandName || null
  const model = firstPhoto.modelName || null
  const watchDisplayName = [brand, model].filter(Boolean).join(' ') || null
  const count = photos.length

  return (
    <button
      type="button"
      onClick={() => handlePhotoClick(photos[0])}
      className="group relative aspect-square rounded-2xl overflow-hidden bg-surface"
    >
      <Image
        src={firstPhoto.url}
        alt={buildPhotoAltText(firstPhoto)}
        fill
        className="object-cover transition-transform duration-200 group-hover:scale-105"
        sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1280px) 25vw, 20vw"
      />
      {count > 1 && (
        <div className="absolute top-2 right-2 bg-black/60 text-white text-xs font-semibold px-1.5 py-0.5 rounded-md flex items-center gap-1">
          <span>🖼</span>
          <span>{count}</span>
        </div>
      )}
      {watchDisplayName && (
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <p className="text-white text-xs font-medium truncate">{watchDisplayName}</p>
        </div>
      )}
    </button>
  )
}
