'use client'

import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { buildPhotoAltText } from '@/lib/photoAlt'
import type { Photo } from '@/lib/db/schema'
import PhotoCountBadge from '@/components/ui/PhotoCountBadge'
import PhotoCardOverlay from '@/components/ui/PhotoCardOverlay'

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
      <PhotoCountBadge count={count} variant="badge" showIcon />
      <PhotoCardOverlay label={watchDisplayName} />
    </button>
  )
}
