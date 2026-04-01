'use client'

import { useState, useEffect, useRef, useCallback, Suspense, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

interface PhotoItem {
  id: string
  watchId: string
  userId: string
  url: string
  caption?: string
  userName: string
  createdAt: string
  watchSlug?: string
  watchName?: string
  watchBrand?: string
  watchReference?: string
  brandName?: string | null
  modelName?: string | null
  referenceNumber?: string | null
}

interface PhotosResponse {
  photos: PhotoItem[]
  nextCursor: string | null
}

interface WatchGroup {
  watchId: string
  photos: PhotoItem[]
}

const PAGE_SIZE = 20

// Group flat photos list into per-watchId groups.
// photos[0] = first ever uploaded (oldest) → used as the primary card thumbnail.
// Slideshow order is newest-first (reversed array).
function groupByWatch(photos: PhotoItem[]): WatchGroup[] {
  const map = new Map<string, PhotoItem[]>()
  for (const photo of photos) {
    if (!map.has(photo.watchId)) map.set(photo.watchId, [])
    map.get(photo.watchId)!.push(photo)
  }
  return Array.from(map.entries()).map(([watchId, photos]) => ({
    watchId,
    // Sort ascending so index 0 = first uploaded (primary card image)
    photos: [...photos].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    ),
  }))
}

function getWatchLabel(group: WatchGroup) {
  const p = group.photos[0]
  const brand = p.brandName || p.watchBrand || null
  const model = p.modelName || p.watchName || null
  const ref = p.referenceNumber || p.watchReference || null
  return { brand, model, ref }
}

function PhotoGalleryContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const activeWatchId = searchParams.get('watch')
  const activeQuery = searchParams.get('q')

  const [photos, setPhotos] = useState<PhotoItem[]>([])
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const sentinelRef = useRef<HTMLDivElement>(null)

  // Lightbox: which group + which photo within it
  const [lightbox, setLightbox] = useState<{ groupIdx: number; photoIdx: number } | null>(null)
  const [lightboxImageLoading, setLightboxImageLoading] = useState(false)
  const touchStartXRef = useRef<number | null>(null)

  const fetchPhotos = useCallback(async (cursor?: string) => {
    const params = new URLSearchParams({ limit: String(PAGE_SIZE) })
    if (cursor) params.set('cursor', cursor)
    if (activeWatchId) params.set('watchId', activeWatchId)
    if (activeQuery) params.set('q', activeQuery)
    const res = await fetch(`/api/photos/all?${params.toString()}`)
    const data: PhotosResponse = await res.json()
    return data
  }, [activeWatchId, activeQuery])

  // Group photos by watchId early — used in useEffect hooks below
  const groups = useMemo(() => groupByWatch(photos), [photos])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setPhotos([])
    setNextCursor(null)
    setLightbox(null)

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

  // Keyboard navigation — arrows move between watches, not photos within a watch
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!lightbox) return
      if (e.key === 'Escape') {
        setLightbox(null)
      } else if (e.key === 'ArrowLeft') {
        if (lightbox.groupIdx > 0) {
          setLightbox({ groupIdx: lightbox.groupIdx - 1, photoIdx: 0 })
        }
      } else if (e.key === 'ArrowRight') {
        if (lightbox.groupIdx < groups.length - 1) {
          setLightbox({ groupIdx: lightbox.groupIdx + 1, photoIdx: 0 })
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [lightbox, groups])

  // Preload adjacent lightbox images when lightbox group changes
  useEffect(() => {
    if (!lightbox) return
    
    const preloadAdjacentImages = () => {
      const { groupIdx } = lightbox
      const urlsToPreload = []
      
      // Preload next group's first photo
      if (groupIdx < groups.length - 1) {
        const nextPhoto = groups[groupIdx + 1]?.photos[0]
        if (nextPhoto) urlsToPreload.push(nextPhoto.url)
      }
      
      // Preload previous group's first photo
      if (groupIdx > 0) {
        const prevPhoto = groups[groupIdx - 1]?.photos[0]
        if (prevPhoto) urlsToPreload.push(prevPhoto.url)
      }
      
      // Create Image objects to preload
      urlsToPreload.forEach((url) => {
        const img = document.createElement('img')
        img.src = url
        img.style.display = 'none'
      })
    }
    preloadAdjacentImages()
  }, [lightbox?.groupIdx, groups])

  // Show loading state when lightbox photo changes
  useEffect(() => {
    if (lightbox === null) return
    setLightboxImageLoading(true)
  }, [lightbox?.groupIdx, lightbox?.photoIdx])

  const selectedWatchName = activeWatchId && photos.length > 0
    ? photos[0].watchBrand && photos[0].watchName
      ? `${photos[0].watchBrand} ${photos[0].watchName}`
      : photos[0].watchName ?? activeWatchId
    : null

  const activeLightboxGroup = lightbox !== null ? groups[lightbox.groupIdx] : null
  // Photos in ascending order (oldest = index 0 = primary card image)
  // Thumbnails let user select a specific photo; arrows navigate between watches
  const activeLightboxPhotos = activeLightboxGroup ? activeLightboxGroup.photos : []
  const activeLightboxPhoto = activeLightboxPhotos[lightbox?.photoIdx ?? 0] ?? null

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
      {/* Filter indicators */}
      {activeWatchId && selectedWatchName && (
        <div className="mb-6 flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
          <span className="text-sm font-medium text-blue-900">
            Showing: <span className="font-semibold">{selectedWatchName}</span>
          </span>
          <button type="button" onClick={() => router.replace('/')} className="ml-auto text-blue-600 hover:text-blue-800 font-semibold">
            ✕ Clear
          </button>
        </div>
      )}
      {!activeWatchId && activeQuery && (
        <div className="mb-6 flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
          <span className="text-sm font-medium text-blue-900">
            Results for: <span className="font-semibold">{activeQuery}</span>
          </span>
          <button type="button" onClick={() => router.replace('/')} className="ml-auto text-blue-600 hover:text-blue-800 font-semibold">
            ✕ Clear
          </button>
        </div>
      )}

      {/* Gallery grid — one card per watch group */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="aspect-square rounded-lg bg-surface animate-pulse" />
          ))}
        </div>
      ) : groups.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="text-6xl mb-6">📷</div>
          <h2 className="text-2xl font-bold text-textPrimary mb-2">No photos yet</h2>
          <p className="text-textSecond mb-6">Be the first to share your watch</p>
          <a href="/upload" className="btn-gold">Upload a Photo</a>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">
          {groups.map((group, groupIdx) => {
            const primary = group.photos[0]
            const { ref } = getWatchLabel(group)
            const count = group.photos.length
            return (
              <button
                key={group.watchId}
                type="button"
                onClick={() => setLightbox({ groupIdx, photoIdx: 0 })}
                className="group relative aspect-square rounded-lg overflow-hidden bg-surface"
              >
                <Image
                  src={primary.url}
                  alt={primary.watchName ?? 'Watch photo'}
                  fill
                  className="object-cover transition-transform duration-200 group-hover:scale-105"
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1280px) 25vw, 20vw"
                  priority={groupIdx < 6}
                />
                {/* Multi-photo badge */}
                {count > 1 && (
                  <div className="absolute top-2 right-2 bg-black/60 text-white text-xs font-semibold px-1.5 py-0.5 rounded-md flex items-center gap-1">
                    <span>🖼</span>
                    <span>{count}</span>
                  </div>
                )}
                {/* Hover ref overlay */}
                {ref && (
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-white/70 text-xs truncate">Ref. {ref}</p>
                  </div>
                )}
              </button>
            )
          })}
        </div>
      )}

      <div ref={sentinelRef} className="h-1" />
      {loadingMore && (
        <div className="flex justify-center py-8">
          <div className="w-6 h-6 border-2 border-textSecond border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Lightbox */}
      {lightbox !== null && activeLightboxGroup && activeLightboxPhoto && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90"
          onClick={() => setLightbox(null)}
          onTouchStart={(e) => { touchStartXRef.current = e.touches[0]?.clientX ?? null }}
          onTouchEnd={(e) => {
            const touchEndX = e.changedTouches[0]?.clientX
            const touchStartX = touchStartXRef.current
            if (touchStartX === null || touchEndX === null) return
            
            const diff = touchStartX - touchEndX
            const threshold = 50
            
            if (diff > threshold && lightbox.groupIdx < groups.length - 1) {
              // Left swipe → next watch
              setLightboxImageLoading(true)
              setLightbox({ groupIdx: lightbox.groupIdx + 1, photoIdx: 0 })
            } else if (diff < -threshold && lightbox.groupIdx > 0) {
              // Right swipe → previous watch
              setLightboxImageLoading(true)
              setLightbox({ groupIdx: lightbox.groupIdx - 1, photoIdx: 0 })
            }
            touchStartXRef.current = null
          }}
        >
          {/* Close */}
          <button
            type="button"
            onClick={() => setLightbox(null)}
            className="absolute top-4 right-4 text-white text-2xl bg-black/50 rounded-full w-10 h-10 flex items-center justify-center hover:bg-black/80 transition-colors z-10"
            aria-label="Close"
          >
            ✕
          </button>

          {/* Left arrow — previous watch */}
          {lightbox.groupIdx > 0 && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setLightboxImageLoading(true); setLightbox({ groupIdx: lightbox.groupIdx - 1, photoIdx: 0 }) }}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white text-2xl bg-black/50 rounded-full w-12 h-12 flex items-center justify-center hover:bg-black/80 transition-colors z-10"
              aria-label="Previous watch"
            >
              ←
            </button>
          )}

          {/* Right arrow — next watch */}
          {lightbox.groupIdx < groups.length - 1 && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setLightboxImageLoading(true); setLightbox({ groupIdx: lightbox.groupIdx + 1, photoIdx: 0 }) }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white text-2xl bg-black/50 rounded-full w-12 h-12 flex items-center justify-center hover:bg-black/80 transition-colors z-10"
              aria-label="Next watch"
            >
              →
            </button>
          )}

          {/* Main image + info */}
          <div
            className="flex flex-col items-center max-h-[90vh] max-w-[90vw] relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Loading spinner overlay */}
            {lightboxImageLoading && (
              <div className="absolute inset-0 flex items-center justify-center z-20">
                <div className="w-12 h-12 border-3 border-white/30 border-t-white rounded-full animate-spin" />
              </div>
            )}
            
            <Image
              src={activeLightboxPhoto.url}
              alt={activeLightboxPhoto.watchName ?? 'Watch photo'}
              width={1200}
              height={1200}
              style={{ objectFit: 'contain', maxHeight: '70vh', maxWidth: '90vw', width: 'auto', height: 'auto' }}
              priority
              onLoad={() => setLightboxImageLoading(false)}
            />

            {/* Watch info */}
            {(() => {
              const p = activeLightboxPhoto
              const brand = p.brandName || p.watchBrand || null
              const model = p.modelName || p.watchName || null
              const ref = p.referenceNumber || p.watchReference || null
              return (
                <div className="mt-2 text-center space-y-0.5">
                  {(brand || model) && (
                    <p className="text-white font-semibold text-base leading-tight">
                      {[brand, model].filter(Boolean).join(' ')}
                    </p>
                  )}
                  {ref && <p className="text-white/60 text-sm">Ref. {ref}</p>}
                  <p className="text-white/50 text-xs">
                    by{' '}
                    <Link
                      href={`/profile/${p.userId}`}
                      className="text-accent hover:text-accentHover transition-colors underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {p.userName}
                    </Link>
                  </p>
                </div>
              )
            })()}

            {/* Thumbnail strip — only shown when multiple photos; newest left */}
            {activeLightboxPhotos.length > 1 && (
              <div className="mt-3 flex gap-2 overflow-x-auto max-w-[90vw] pb-1">
                {activeLightboxPhotos.map((thumb, thumbIdx) => (
                  <button
                    key={thumb.id}
                    type="button"
                    onClick={() => { setLightboxImageLoading(true); setLightbox({ ...lightbox, photoIdx: thumbIdx }) }}
                    className={`shrink-0 relative w-14 h-14 rounded overflow-hidden border-2 transition-colors ${
                      thumbIdx === lightbox.photoIdx
                        ? 'border-white'
                        : 'border-transparent opacity-60 hover:opacity-90'
                    }`}
                    aria-label={`Photo ${thumbIdx + 1}`}
                  >
                    <Image
                      src={thumb.url}
                      alt={`Thumbnail ${thumbIdx + 1}`}
                      fill
                      className="object-cover"
                      sizes="56px"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  )
}

export default function PhotoGallery() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="aspect-square rounded-lg bg-surface animate-pulse" />
          ))}
        </div>
      </div>
    }>
      <PhotoGalleryContent />
    </Suspense>
  )
}
