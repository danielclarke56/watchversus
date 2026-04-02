'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { Photo } from '@/lib/db/schema'
import { buildPhotoAltText } from '@/lib/photoAlt'

interface ProfileClientProps {
  watchId: string
  photos: Photo[]
  displayName: string
  userId: string
}

export default function ProfileClient({ watchId, photos, displayName, userId }: ProfileClientProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)

  const handlePhotoClick = (index: number) => {
    setSelectedIndex(index)
    setLightboxOpen(true)
  }

  // Extract watch details from the first photo (they're all the same watch)
  const firstPhoto = photos[0]
  const watchName = firstPhoto.brandName && firstPhoto.modelName
    ? `${firstPhoto.brandName} ${firstPhoto.modelName}`
    : `Watch (${watchId})`

  const selectedPhoto = photos[selectedIndex]

  return (
    <>
      <div
        className="bg-surface border border-borderStrong rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
        onClick={() => handlePhotoClick(0)}
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

      {/* Lightbox */}
      {lightboxOpen && selectedPhoto && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90"
          onClick={() => setLightboxOpen(false)}
        >
          {/* Close button */}
          <button
            type="button"
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 text-white text-2xl bg-black/50 rounded-full w-10 h-10 flex items-center justify-center hover:bg-black/80 transition-colors z-10"
            aria-label="Close"
          >
            ✕
          </button>

          {/* Left arrow */}
          {selectedIndex > 0 && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setSelectedIndex(selectedIndex - 1) }}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white text-2xl bg-black/50 rounded-full w-12 h-12 flex items-center justify-center hover:bg-black/80 transition-colors z-10"
              aria-label="Previous photo"
            >
              ←
            </button>
          )}

          {/* Right arrow */}
          {selectedIndex < photos.length - 1 && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setSelectedIndex(selectedIndex + 1) }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white text-2xl bg-black/50 rounded-full w-12 h-12 flex items-center justify-center hover:bg-black/80 transition-colors z-10"
              aria-label="Next photo"
            >
              →
            </button>
          )}

          {/* Main image + info */}
          <div
            className="flex flex-col items-center max-h-[90vh] max-w-[90vw]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={selectedPhoto.url}
              alt={buildPhotoAltText(selectedPhoto)}
              style={{ maxHeight: '70vh', maxWidth: '90vw', width: 'auto', height: 'auto' }}
            />

            {/* Watch info */}
            <div className="mt-2 text-center space-y-0.5">
              {watchName && (
                <p className="text-white font-semibold text-base leading-tight">
                  {watchName}
                </p>
              )}
              {selectedPhoto.referenceNumber && (
                <p className="text-white/60 text-sm">Ref. {selectedPhoto.referenceNumber}</p>
              )}
              <p className="text-white/50 text-xs">
                by{' '}
                <Link
                  href={`/profile/${userId}`}
                  className="text-accent hover:text-accentHover transition-colors underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  {displayName}
                </Link>
              </p>
            </div>

            {/* Thumbnail strip */}
            {photos.length > 1 && (
              <div className="mt-3 flex gap-2 overflow-x-auto max-w-[90vw] pb-1">
                {photos.map((thumb, thumbIdx) => (
                  <button
                    key={thumb.id}
                    type="button"
                    onClick={() => setSelectedIndex(thumbIdx)}
                    className={`shrink-0 relative w-14 h-14 rounded overflow-hidden border-2 transition-colors ${
                      thumbIdx === selectedIndex
                        ? 'border-white'
                        : 'border-transparent opacity-60 hover:opacity-90'
                    }`}
                    aria-label={`Photo ${thumbIdx + 1}`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={thumb.url}
                      alt={buildPhotoAltText(thumb)}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
