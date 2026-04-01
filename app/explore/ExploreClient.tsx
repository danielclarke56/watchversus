'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import type { ApprovedPhoto } from '@/lib/photos'
import { watches } from '@/lib/watches'

export function ExploreClient() {
  const [photos, setPhotos] = useState<ApprovedPhoto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [cursor, setCursor] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(false)

  // Fetch initial photos
  useEffect(() => {
    loadPhotos(null)
  }, [])

  async function loadPhotos(cursorParam: string | null) {
    setIsLoading(true)
    try {
      const url = new URL('/api/photos/all', window.location.origin)
      url.searchParams.set('limit', '50')
      if (cursorParam) {
        url.searchParams.set('cursor', cursorParam)
      }

      const res = await fetch(url.toString())
      const data = (await res.json()) as { photos: ApprovedPhoto[]; nextCursor: string | null }

      if (cursorParam) {
        setPhotos((prev) => [...prev, ...data.photos])
      } else {
        setPhotos(data.photos)
      }

      setCursor(data.nextCursor)
      setHasMore(!!data.nextCursor)
    } catch (error) {
      console.error('Failed to load photos:', error)
    } finally {
      setIsLoading(false)
    }
  }

  function getWatchName(watchId: string): string {
    const watch = watches.find((w) => w.slug === watchId)
    return watch ? `${watch.brand} ${watch.name}` : watchId
  }

  const handleLoadMore = () => {
    if (cursor) {
      loadPhotos(cursor)
    }
  }

  return (
    <Section>
      <Container>
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-textPrimary mb-2">Explore Watch Photos</h1>
          <p className="text-lg text-textSecond">
            Real photos from watch owners around the world
          </p>
        </div>

        {isLoading && photos.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-block">
              <div className="w-8 h-8 border-4 border-border border-t-accent rounded-full animate-spin" />
            </div>
            <p className="text-textSecond mt-4">Loading photos...</p>
          </div>
        ) : photos.length === 0 ? (
          <div className="card p-12 text-center">
            <div className="text-5xl mb-4">📷</div>
            <h2 className="text-xl font-semibold text-textPrimary mb-2">No photos yet</h2>
            <p className="text-textSecond">Be the first to share your watch photos!</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {photos.map((photo) => {
                const watchName = getWatchName(photo.watchId)
                return (
                  <div
                    key={photo.id}
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
                        <p className="text-white/70 text-[10px] truncate">by {photo.userName}</p>
                        <p className="text-white/50 text-[9px] mt-1">
                          {new Date(photo.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {hasMore && (
              <div className="text-center mt-8">
                <button
                  onClick={handleLoadMore}
                  disabled={isLoading}
                  className="btn-outline px-6 py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Loading...' : 'Load More Photos'}
                </button>
              </div>
            )}
          </>
        )}
      </Container>
    </Section>
  )
}
