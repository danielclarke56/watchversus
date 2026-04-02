'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import type { ApprovedPhoto } from '@/lib/photos'
import { watches } from '@/lib/watches'

export function RecentPhotos() {
  const [photos, setPhotos] = useState<ApprovedPhoto[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadPhotos()
  }, [])

  async function loadPhotos() {
    try {
      const res = await fetch('/api/photos/all?limit=12')
      const data = (await res.json()) as { photos: ApprovedPhoto[]; nextCursor: string | null }
      setPhotos(data.photos)
    } catch (error) {
      console.error('Failed to load recent photos:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading || photos.length === 0) {
    return null
  }

  function getWatchName(watchId: string): string {
    const watch = watches.find((w) => w.slug === watchId)
    return watch ? `${watch.brand} ${watch.name}` : watchId
  }

  return (
    <section className="bg-surface border-b border-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="flex items-end justify-between mb-8 sm:mb-12 gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-textPrimary">
              Recently Added Photos
            </h2>
            <p className="text-textSecond text-sm mt-1">
              Real watches from our community
            </p>
          </div>
          <Link
            href="/"
            className="text-accent hover:text-accentHover transition-colors font-medium text-sm shrink-0"
          >
            View all →
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {photos.map((photo) => {
            const watchName = getWatchName(photo.watchId)
            return (
              <Link
                key={photo.id}
                href={`/watches/${photo.watchId}`}
                className="group relative aspect-square bg-surfaceAlt rounded-sm overflow-hidden border border-border hover:border-borderStrong transition-colors"
              >
                <Image
                  src={photo.url}
                  alt={watchName}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
                {/* Overlay with info */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-end justify-end p-3">
                  <div className="w-full text-right">
                    <p className="text-white text-xs font-semibold truncate">{watchName}</p>
                    <p className="text-white/70 text-[10px] truncate">by {(photo as { isOfficial?: boolean }).isOfficial ? 'WatchVsWatch' : photo.userName}</p>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
