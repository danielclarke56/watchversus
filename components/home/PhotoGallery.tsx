'use client'

import { useState, useEffect, useRef, useCallback, Suspense, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { buildPhotoAltText } from '@/lib/photoAlt'

interface PhotoItem {
  id: string
  watchId: string
  userId: string
  url: string
  userName: string
  isOfficial?: boolean
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

function PhotoGalleryContent({ initialPhotoId }: { initialPhotoId?: string }) {
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
  const [showScrollCue, setShowScrollCue] = useState(false)
  const [copied, setCopied] = useState(false)
  const scrollCueTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const touchStartYRef = useRef<number | null>(null)
  const wheelDebounceRef = useRef<NodeJS.Timeout | null>(null)
  const lightboxContainerRef = useRef<HTMLDivElement>(null)

  // Pinterest-style URL tracking
  const galleryUrlRef = useRef<string>('/')
  const lightboxOpenRef = useRef(false)
  const initialPhotoOpenedRef = useRef(false)

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

  // Auto-open lightbox when initialPhotoId is provided (Pinterest-style direct link)
  useEffect(() => {
    if (!initialPhotoId || initialPhotoOpenedRef.current || loading || groups.length === 0) return

    // Search all loaded groups for the target photo
    for (let gi = 0; gi < groups.length; gi++) {
      const pi = groups[gi].photos.findIndex((p) => p.id === initialPhotoId)
      if (pi !== -1) {
        initialPhotoOpenedRef.current = true
        galleryUrlRef.current = '/'
        lightboxOpenRef.current = true
        window.history.replaceState({ lightbox: true }, '', window.location.pathname)
        setLightbox({ groupIdx: gi, photoIdx: pi })
        return
      }
    }

    // Photo not found yet — fetch more if available
    if (nextCursor && !loadingMore) {
      setLoadingMore(true)
      fetchPhotos(nextCursor).then((data) => {
        setPhotos((prev) => [...prev, ...data.photos])
        setNextCursor(data.nextCursor)
        setLoadingMore(false)
      }).catch(() => setLoadingMore(false))
    } else if (!nextCursor) {
      // No more pages — stop retrying
      initialPhotoOpenedRef.current = true
    }
  }, [initialPhotoId, groups, loading, nextCursor, loadingMore, fetchPhotos])

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
        closeLightbox()
      } else if (e.key === 'ArrowLeft') {
        if (lightbox.groupIdx > 0) {
          navigateLightbox(lightbox.groupIdx - 1, 0)
        }
      } else if (e.key === 'ArrowRight') {
        if (lightbox.groupIdx < groups.length - 1) {
          navigateLightbox(lightbox.groupIdx + 1, 0)
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
  }, [lightbox, groups])

  // Fetch more photos when navigating near the end of loaded groups in the lightbox
  // (the scroll sentinel can't fire while the lightbox is open)
  useEffect(() => {
    if (!lightbox || !nextCursor || loadingMore) return
    // Pre-fetch when within 5 groups of the end
    if (lightbox.groupIdx >= groups.length - 5) {
      setLoadingMore(true)
      fetchPhotos(nextCursor).then((data) => {
        setPhotos((prev) => [...prev, ...data.photos])
        setNextCursor(data.nextCursor)
        setLoadingMore(false)
      }).catch(() => setLoadingMore(false))
    }
  }, [lightbox?.groupIdx, groups.length, nextCursor, loadingMore, fetchPhotos])

  // Show loading state when lightbox photo changes
  useEffect(() => {
    if (lightbox === null) return
    setLightboxImageLoading(true)
  }, [lightbox])

  // Cleanup wheel debounce and scroll cue timeout on unmount or lightbox close
  useEffect(() => {
    return () => {
      if (wheelDebounceRef.current) {
        clearTimeout(wheelDebounceRef.current)
      }
      if (scrollCueTimeoutRef.current) {
        clearTimeout(scrollCueTimeoutRef.current)
      }
    }
  }, [])

  // Lock body scroll when lightbox is open (prevents background scroll on mobile)
  const savedScrollYRef = useRef(0)
  useEffect(() => {
    if (lightbox !== null) {
      // Save current scroll position before locking
      savedScrollYRef.current = window.scrollY
      // Lock body scroll
      document.body.style.overflow = 'hidden'
      document.body.style.position = 'fixed'
      document.body.style.top = `-${savedScrollYRef.current}px`
      document.body.style.width = '100%'
    } else {
      // Restore body scroll and position
      document.body.style.overflow = ''
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.width = ''
      window.scrollTo(0, savedScrollYRef.current)
    }
    return () => {
      // Cleanup on unmount
      document.body.style.overflow = ''
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.width = ''
    }
  }, [lightbox])

  // Attach non-passive touchmove listener to lightbox to prevent scroll passthrough
  useEffect(() => {
    const container = lightboxContainerRef.current
    if (!container) return

    const preventScroll = (e: TouchEvent) => {
      e.preventDefault()
    }

    if (lightbox !== null) {
      container.addEventListener('touchmove', preventScroll, { passive: false })
    }

    return () => {
      container.removeEventListener('touchmove', preventScroll)
    }
  }, [lightbox])

  // Pinterest URL behavior: push /photo/[id] when lightbox opens, restore on close
  const openLightbox = useCallback((groupIdx: number, photoIdx: number = 0) => {
    const photo = groups[groupIdx]?.photos[photoIdx]
    if (photo && !lightboxOpenRef.current) {
      galleryUrlRef.current = window.location.pathname + window.location.search
      window.history.pushState({ lightbox: true }, '', `/photo/${photo.id}`)
      lightboxOpenRef.current = true
      // Show scroll cue on first open
      setShowScrollCue(true)
      if (scrollCueTimeoutRef.current) clearTimeout(scrollCueTimeoutRef.current)
      scrollCueTimeoutRef.current = setTimeout(() => setShowScrollCue(false), 3000)
    } else if (photo && lightboxOpenRef.current) {
      window.history.replaceState({ lightbox: true }, '', `/photo/${photo.id}`)
    }
    setLightbox({ groupIdx, photoIdx })
  }, [groups])

  const navigateLightbox = useCallback((groupIdx: number, photoIdx: number = 0) => {
    const photo = groups[groupIdx]?.photos[photoIdx]
    if (photo) {
      window.history.replaceState({ lightbox: true }, '', `/photo/${photo.id}`)
    }
    setLightboxImageLoading(true)
    setCopied(false)
    setLightbox({ groupIdx, photoIdx })
  }, [groups])

  const closeLightbox = useCallback(() => {
    if (lightboxOpenRef.current) {
      window.history.replaceState(null, '', galleryUrlRef.current)
      lightboxOpenRef.current = false
    }
    setShowScrollCue(false)
    if (scrollCueTimeoutRef.current) clearTimeout(scrollCueTimeoutRef.current)
    setLightbox(null)
  }, [])

  const handleShare = useCallback(async (photoId: string) => {
    const shareUrl = `https://watchems.com/photo/${photoId}`
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ url: shareUrl })
      } catch {
        // User cancelled or share failed — ignore
      }
    } else {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }, [])

  // Handle browser back button while lightbox is open
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      if (lightboxOpenRef.current) {
        lightboxOpenRef.current = false
        setLightbox(null)
        // Prevent Next.js from doing a full navigation
        e.preventDefault?.()
      }
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

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
                onClick={() => openLightbox(groupIdx, 0)}
                className="group relative aspect-square rounded-lg overflow-hidden bg-surface"
              >
                <Image
                  src={primary.url}
                  alt={buildPhotoAltText(primary)}
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
          ref={lightboxContainerRef}
          className="fixed inset-0 z-50 bg-black"
          onClick={closeLightbox}
          onTouchStart={(e) => { touchStartYRef.current = e.touches[0]?.clientY ?? null }}
          onTouchEnd={(e) => {
            const touchEndY = e.changedTouches[0]?.clientY
            const touchStartY = touchStartYRef.current
            if (touchStartY === null || touchEndY === null) return
            
            const diff = touchStartY - touchEndY
            const threshold = 50
            
            // Swipe up → next photo
            if (diff > threshold && lightbox.groupIdx < groups.length - 1) {
              navigateLightbox(lightbox.groupIdx + 1, 0)
            }
            // Swipe down → previous photo
            else if (diff < -threshold && lightbox.groupIdx > 0) {
              navigateLightbox(lightbox.groupIdx - 1, 0)
            }
            touchStartYRef.current = null
          }}
          onWheel={(e) => {
            // Debounced scroll wheel navigation
            if (wheelDebounceRef.current) {
              clearTimeout(wheelDebounceRef.current)
            }
            wheelDebounceRef.current = setTimeout(() => {
              if (e.deltaY > 0 && lightbox.groupIdx < groups.length - 1) {
                // Scroll down → next photo
                navigateLightbox(lightbox.groupIdx + 1, 0)
              } else if (e.deltaY < 0 && lightbox.groupIdx > 0) {
                // Scroll up → previous photo
                navigateLightbox(lightbox.groupIdx - 1, 0)
              }
            }, 300)
          }}
          style={{ overscrollBehavior: 'contain', touchAction: 'none' }}
        >
          <div className="flex flex-col items-center justify-center w-full h-full" onClick={(e) => e.stopPropagation()}>
            {/* Share + Close */}
            <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); handleShare(activeLightboxPhoto.id) }}
                className="text-white bg-black/40 opacity-70 hover:opacity-100 hover:bg-black/60 rounded-full w-10 h-10 flex items-center justify-center transition-all"
                aria-label="Share photo"
              >
                {copied ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                  </svg>
                )}
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); closeLightbox() }}
                className="text-white text-2xl bg-black/40 opacity-70 hover:opacity-100 hover:bg-black/60 rounded-full w-10 h-10 flex items-center justify-center transition-all"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {/* Left arrow — previous watch (hidden on mobile) */}
            {lightbox.groupIdx > 0 && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); navigateLightbox(lightbox.groupIdx - 1, 0) }}
                className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 text-white text-2xl bg-black/40 opacity-50 hover:opacity-100 hover:bg-black/60 rounded-full w-12 h-12 items-center justify-center transition-all z-10"
                aria-label="Previous watch"
              >
                ←
              </button>
            )}

            {/* Right arrow — next watch (hidden on mobile) */}
            {lightbox.groupIdx < groups.length - 1 && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); navigateLightbox(lightbox.groupIdx + 1, 0) }}
                className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 text-white text-2xl bg-black/40 opacity-50 hover:opacity-100 hover:bg-black/60 rounded-full w-12 h-12 items-center justify-center transition-all z-10"
                aria-label="Next watch"
              >
                →
              </button>
            )}

            {/* Main image — full-screen fill */}
            <div className="relative w-full h-full flex items-center justify-center">
              {/* Loading spinner overlay */}
              {lightboxImageLoading && (
                <div className="absolute inset-0 flex items-center justify-center z-20">
                  <div className="w-12 h-12 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                </div>
              )}
              
              <Image
                src={activeLightboxPhoto.url}
                alt={buildPhotoAltText(activeLightboxPhoto)}
                fill
                className="object-contain"
                priority
                onLoad={() => setLightboxImageLoading(false)}
              />

              {/* Scroll cue — bouncing chevron (mobile only) */}
              {showScrollCue && (
                <div className="block md:hidden absolute bottom-24 left-1/2 -translate-x-1/2 animate-bounce z-20">
                  <div className="text-white/70 text-2xl">⌃⌃</div>
                </div>
              )}
            </div>

            {/* Watch info at bottom with gradient overlay */}
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black via-black/80 to-transparent p-6 text-center">
              {(() => {
                const p = activeLightboxPhoto
                const brand = p.brandName || p.watchBrand || null
                const model = p.modelName || p.watchName || null
                const ref = p.referenceNumber || p.watchReference || null
                return (
                  <div className="space-y-1">
                    {(brand || model) && (
                      <p className="text-white font-semibold text-lg">
                        {[brand, model].filter(Boolean).join(' ')}
                      </p>
                    )}
                    {ref && <p className="text-white/70 text-sm">Ref. {ref}</p>}
                    <p className="text-white/60 text-xs">
                      by{' '}
                      {p.isOfficial ? (
                        <span className="text-accent">Watchems</span>
                      ) : (
                        <Link
                          href={`/profile/${p.userId}`}
                          className="text-accent hover:text-accentHover transition-colors underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {p.userName}
                        </Link>
                      )}
                    </p>
                  </div>
                )
              })()}

              {/* Thumbnail strip — only shown when multiple photos */}
              {activeLightboxPhotos.length > 1 && (
                <div className="mt-4 flex gap-2 justify-center overflow-x-auto pb-1">
                  {activeLightboxPhotos.map((thumb, thumbIdx) => (
                    <button
                      key={thumb.id}
                      type="button"
                      onClick={(e) => { e.stopPropagation(); navigateLightbox(lightbox.groupIdx, thumbIdx) }}
                      className={`shrink-0 relative w-14 h-14 rounded overflow-hidden border-2 transition-colors ${
                        thumbIdx === lightbox.photoIdx
                          ? 'border-white'
                          : 'border-transparent opacity-60 hover:opacity-90'
                      }`}
                      aria-label={`Photo ${thumbIdx + 1}`}
                    >
                      <Image
                        src={thumb.url}
                        alt={buildPhotoAltText(thumb)}
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
        </div>
      )}
    </section>
  )
}

export default function PhotoGallery({ initialPhotoId }: { initialPhotoId?: string }) {
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
      <PhotoGalleryContent initialPhotoId={initialPhotoId} />
    </Suspense>
  )
}
