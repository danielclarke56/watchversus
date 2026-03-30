'use client'

import { useState, useEffect, useRef, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'

interface PhotoItem {
  id: string
  watchId: string
  url: string
  caption?: string
  userName: string
  createdAt: string
  watchSlug?: string
  watchName?: string
  watchBrand?: string
  watchReference?: string
}

interface PhotosResponse {
  photos: PhotoItem[]
  nextCursor: string | null
}

const PAGE_SIZE = 20

function PhotoGalleryContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const activeWatchId = searchParams.get('watch')
  const activeQuery = searchParams.get('q')

  const [photos, setPhotos] = useState<PhotoItem[]>([])
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const sentinelRef = useRef<HTMLDivElement>(null)

  const fetchPhotos = useCallback(async (cursor?: string) => {
    const params = new URLSearchParams({ limit: String(PAGE_SIZE) })
    if (cursor) params.set('cursor', cursor)
    if (activeWatchId) params.set('watchId', activeWatchId)
    if (activeQuery) params.set('q', activeQuery)

    const res = await fetch(`/api/photos/all?${params.toString()}`)
    const data: PhotosResponse = await res.json()
    return data
  }, [activeWatchId, activeQuery])

  // Initial load and re-fetch when activeWatchId changes
  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setPhotos([])
    setNextCursor(null)

    fetchPhotos().then((data) => {
      if (!cancelled) {
        setPhotos(data.photos)
        setNextCursor(data.nextCursor)
        setLoading(false)
      }
    }).catch(() => {
      if (!cancelled) setLoading(false)
    })

    return () => { cancelled = true }
  }, [fetchPhotos, activeWatchId, activeQuery])

  // Infinite scroll
  useEffect(() => {
    if (!sentinelRef.current) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && nextCursor && !loadingMore) {
          setLoadingMore(true)
          fetchPhotos(nextCursor).then((data) => {
            setPhotos((prev) => [...prev, ...data.photos])
            setNextCursor(data.nextCursor)
            setLoadingMore(false)
          }).catch(() => setLoadingMore(false))
        }
      },
      { rootMargin: '400px' }
    )
    observer.observe(sentinelRef.current)
    return () => observer.disconnect()
  }, [nextCursor, loadingMore, fetchPhotos])

  // Keyboard navigation in lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return

      if (e.key === 'Escape') {
        setLightboxIndex(null)
      } else if (e.key === 'ArrowLeft' && lightboxIndex > 0) {
        setLightboxIndex(lightboxIndex - 1)
      } else if (e.key === 'ArrowRight' && lightboxIndex < photos.length - 1) {
        setLightboxIndex(lightboxIndex + 1)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [lightboxIndex, photos.length])

  const closeLightbox = () => setLightboxIndex(null)
  const goToPrevious = () => {
    if (lightboxIndex !== null && lightboxIndex > 0) {
      setLightboxIndex(lightboxIndex - 1)
    }
  }
  const goToNext = () => {
    if (lightboxIndex !== null && lightboxIndex < photos.length - 1) {
      setLightboxIndex(lightboxIndex + 1)
    }
  }

  // Get the selected watch name from the first photo if filtering
  const selectedWatchName = activeWatchId && photos.length > 0 
    ? photos[0].watchBrand && photos[0].watchName 
      ? `${photos[0].watchBrand} ${photos[0].watchName}`
      : photos[0].watchName ?? activeWatchId
    : null

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
      {/* Filter indicator */}
      {activeWatchId && selectedWatchName && (
        <div className="mb-6 flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
          <span className="text-sm font-medium text-blue-900">
            Showing: <span className="font-semibold">{selectedWatchName}</span>
          </span>
          <button
            type="button"
            onClick={() => router.replace('/')}
            className="ml-auto text-blue-600 hover:text-blue-800 font-semibold"
            aria-label="Clear filter"
          >
            ✕ Clear
          </button>
        </div>
      )}
      {!activeWatchId && activeQuery && (
        <div className="mb-6 flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
          <span className="text-sm font-medium text-blue-900">
            Showing results for: <span className="font-semibold">{activeQuery}</span>
          </span>
          <button
            type="button"
            onClick={() => router.replace('/')}
            className="ml-auto text-blue-600 hover:text-blue-800 font-semibold"
            aria-label="Clear filter"
          >
            ✕ Clear
          </button>
        </div>
      )}

      {/* Gallery grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="aspect-square rounded-lg bg-surface animate-pulse" />
          ))}
        </div>
      ) : photos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="text-6xl mb-6">📷</div>
          <h2 className="text-2xl font-bold text-textPrimary mb-2">No photos yet</h2>
          <p className="text-textSecond mb-6">Be the first to share your watch</p>
          <a href="/upload" className="btn-gold">Upload a Photo</a>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">
          {photos.map((photo, index) => (
            <button
              key={photo.id}
              type="button"
              onClick={() => setLightboxIndex(index)}
              className="group relative aspect-square rounded-lg overflow-hidden bg-surface"
            >
              <Image
                src={photo.url}
                alt={photo.watchName ?? 'Watch photo'}
                fill
                className="object-cover transition-transform duration-200 group-hover:scale-105"
                sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1280px) 25vw, 20vw"
                priority={index < 6}
              />
              {photo.watchReference && (
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-white/70 text-xs truncate">Ref. {photo.watchReference}</p>
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Infinite scroll sentinel */}
      <div ref={sentinelRef} className="h-1" />
      {loadingMore && (
        <div className="flex justify-center py-8">
          <div className="w-6 h-6 border-2 border-textSecond border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Lightbox Modal */}
      {lightboxIndex !== null && (
        <div
          className="bg-black/90 fixed inset-0 z-50 flex items-center justify-center"
          onClick={closeLightbox}
        >
          {/* Close button */}
          <button
            type="button"
            onClick={closeLightbox}
            className="absolute top-4 right-4 text-white text-2xl bg-black/50 rounded-full w-10 h-10 flex items-center justify-center hover:bg-black/80 transition-colors"
            aria-label="Close lightbox"
          >
            ✕
          </button>

          {/* Left arrow */}
          {lightboxIndex > 0 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                goToPrevious()
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white text-2xl bg-black/50 rounded-full w-12 h-12 flex items-center justify-center hover:bg-black/80 transition-colors"
              aria-label="Previous photo"
            >
              ←
            </button>
          )}

          {/* Right arrow */}
          {lightboxIndex < photos.length - 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                goToNext()
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white text-2xl bg-black/50 rounded-full w-12 h-12 flex items-center justify-center hover:bg-black/80 transition-colors"
              aria-label="Next photo"
            >
              →
            </button>
          )}

          {/* Main image container (click doesn't close) */}
          <div
            className="flex flex-col items-center justify-center max-h-[90vh] max-w-[90vw]"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={photos[lightboxIndex].url}
              alt={photos[lightboxIndex].watchName ?? 'Watch photo'}
              width={1200}
              height={1200}
              style={{
                objectFit: 'contain',
                maxHeight: '85vh',
                maxWidth: '90vw',
                width: 'auto',
                height: 'auto',
              }}
              priority
            />

            {/* Watch info below image */}
            <div className="mt-3 flex items-center gap-3 text-sm flex-wrap justify-center">
              {(photos[lightboxIndex].watchBrand || photos[lightboxIndex].watchName) && (
                <span className="text-white font-semibold">
                  {[photos[lightboxIndex].watchBrand, photos[lightboxIndex].watchName].filter(Boolean).join(' ')}
                </span>
              )}
              {photos[lightboxIndex].watchReference && (
                <span className="text-white/60">Ref. {photos[lightboxIndex].watchReference}</span>
              )}
              {photos[lightboxIndex].caption && (
                <span className="text-white/70 italic">{photos[lightboxIndex].caption}</span>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

export default function PhotoGallery() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16"><div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">{Array.from({ length: 20 }).map((_, i) => (<div key={i} className="aspect-square rounded-lg bg-surface animate-pulse" />))}</div></div>}>
      <PhotoGalleryContent />
    </Suspense>
  )
}
