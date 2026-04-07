'use client'

import { useState, useEffect, useRef, useCallback, Suspense, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { getWatchBySlug } from '@/lib/watches'
import { buildPhotoAltText } from '@/lib/photoAlt'
import type { Watch } from '@/lib/types'

interface PhotoItem {
  id: string
  slug?: string | null
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
  movement?: string | null
  caseSize?: string | null
  wristSize?: string | null
  estimatedPrice?: string | null
  productionYear?: string | null
  lugToLug?: string | null
  betweenLugs?: string | null
  thickness?: string | null
  waterResistance?: string | null
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

function PhotoGalleryContent({ initialPhotoSlug }: { initialPhotoSlug?: string }) {
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
  const [lightboxWatch, setLightboxWatch] = useState<Watch | null>(null)
  const [copied, setCopied] = useState(false)
  const [linkCopied, setLinkCopied] = useState(false)
  const touchStartYRef = useRef<number | null>(null)
  const lightboxContainerRef = useRef<HTMLDivElement>(null)

  // Related photos section state
  const [relatedPhotos, setRelatedPhotos] = useState<PhotoItem[]>([])
  const [relatedPhotosLoading, setRelatedPhotosLoading] = useState(false)
  const relatedPhotosCacheRef = useRef<Map<string, PhotoItem[]>>(new Map())

  // Override: a related photo not yet in `groups` shown directly without page nav
  const [photoOverride, setPhotoOverride] = useState<PhotoItem | null>(null)

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

  // Fetch related photos for the current lightbox photo
  const fetchRelatedPhotos = useCallback(async (currentPhoto: PhotoItem) => {
    const watchId = currentPhoto.watchId
    
    // Check cache first
    if (relatedPhotosCacheRef.current.has(watchId)) {
      setRelatedPhotos(relatedPhotosCacheRef.current.get(watchId) || [])
      return
    }

    setRelatedPhotosLoading(true)
    try {
      const model = currentPhoto.modelName || currentPhoto.watchName || null
      const brand = currentPhoto.watchBrand || currentPhoto.brandName || null

      // 1. Fetch same-watch photos
      const watchParams = new URLSearchParams({ watchId, limit: '12' })
      const watchRes = await fetch(`/api/photos/all?${watchParams.toString()}`)
      const watchData: PhotosResponse = await watchRes.json()
      const sameWatch = watchData.photos.filter((p) => p.id !== currentPhoto.id)
      const seenIds = new Set(sameWatch.map((p) => p.id))
      seenIds.add(currentPhoto.id)

      // 2. Fetch same-model photos (different watch instances of the same model)
      let sameModel: PhotoItem[] = []
      if (model) {
        const modelParams = new URLSearchParams({ q: model, limit: '20' })
        const modelRes = await fetch(`/api/photos/all?${modelParams.toString()}`)
        const modelData: PhotosResponse = await modelRes.json()
        sameModel = modelData.photos.filter((p) => !seenIds.has(p.id))
        for (const p of sameModel) seenIds.add(p.id)
      }

      // 3. Always fetch by brand (different watch instances from same brand)
      let brandPhotos: PhotoItem[] = []
      if (brand) {
        const brandParams = new URLSearchParams({ q: brand, limit: '20' })
        const brandRes = await fetch(`/api/photos/all?${brandParams.toString()}`)
        const brandData: PhotosResponse = await brandRes.json()
        brandPhotos = brandData.photos.filter((p) => !seenIds.has(p.id))
        for (const p of brandPhotos) seenIds.add(p.id)
      }

      // 4. Fallback: always pad with recent gallery photos if we have fewer than 8 other-watch results
      let fallbackPhotos: PhotoItem[] = []
      const differentWatchCount = [...sameModel, ...brandPhotos].filter((p) => p.watchId !== watchId).length
      if (differentWatchCount < 8) {
        const fallbackRes = await fetch(`/api/photos/all?limit=24`)
        const fallbackData: PhotosResponse = await fallbackRes.json()
        fallbackPhotos = fallbackData.photos.filter((p) => !seenIds.has(p.id))
      }

      // Combine: same-watch first, then same-model, then brand/other, then fallback
      const relatedList = [...sameWatch, ...sameModel, ...brandPhotos, ...fallbackPhotos]

      // Cache the results
      relatedPhotosCacheRef.current.set(watchId, relatedList)
      setRelatedPhotos(relatedList)
    } catch (error) {
      console.error('Failed to fetch related photos:', error)
      setRelatedPhotos([])
    } finally {
      setRelatedPhotosLoading(false)
    }
  }, [])

  // Group photos by watchId early — used in useEffect hooks below
  const groups = useMemo(() => groupByWatch(photos), [photos])

  // Auto-open lightbox when initialPhotoSlug is provided (Pinterest-style direct link)
  useEffect(() => {
    if (!initialPhotoSlug || initialPhotoOpenedRef.current || loading || groups.length === 0) return

    // Search all loaded groups for the target photo (match by slug, fall back to id)
    for (let gi = 0; gi < groups.length; gi++) {
      const pi = groups[gi].photos.findIndex(
        (p) => (p.slug ?? p.id) === initialPhotoSlug
      )
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
  }, [initialPhotoSlug, groups, loading, nextCursor, loadingMore, fetchPhotos])

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
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        if (lightbox.groupIdx < groups.length - 1) {
          navigateLightbox(lightbox.groupIdx + 1, 0)
        }
      } else if (e.key === 'ArrowUp') {
        if (lightbox.groupIdx > 0) {
          navigateLightbox(lightbox.groupIdx - 1, 0)
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

  // Fetch watch metadata when lightbox photo changes
  useEffect(() => {
    if (lightbox === null) {
      setLightboxWatch(null)
      return
    }
    const group = groups[lightbox.groupIdx]
    if (!group) {
      setLightboxWatch(null)
      return
    }
    const watch = getWatchBySlug(group.watchId)
    setLightboxWatch(watch || null)
  }, [lightbox, groups])

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


  // Open lightbox — update URL with pushState (back button support) without page navigation
  const openLightbox = useCallback((groupIdx: number, photoIdx: number = 0) => {
    const photo = groups[groupIdx]?.photos[photoIdx]
    if (photo) {
      // Save current gallery URL so closeLightbox can restore it
      galleryUrlRef.current = window.location.pathname + window.location.search
      lightboxOpenRef.current = true
      window.history.pushState({ lightbox: true }, '', `/photo/${photo.slug ?? photo.id}`)
      setPhotoOverride(null)
      setLightboxImageLoading(true)
      setCopied(false)
      setLinkCopied(false)
      setLightbox({ groupIdx, photoIdx })
    }
  }, [groups])

  const navigateLightbox = useCallback((groupIdx: number, photoIdx: number = 0) => {
    const photo = groups[groupIdx]?.photos[photoIdx]
    if (photo) {
      window.history.replaceState({ lightbox: true }, '', `/photo/${photo.slug ?? photo.id}`)
    }
    setPhotoOverride(null)
    setLightboxImageLoading(true)
    setCopied(false)
    setLinkCopied(false)
    setLightbox({ groupIdx, photoIdx })
  }, [groups])

  // Open a related photo in-lightbox without page navigation.
  // If the photo is in the current groups, navigate there directly.
  // Otherwise show it via a local override (URL still updates, no page reload).
  const openRelatedPhoto = useCallback((photo: PhotoItem) => {
    for (let gi = 0; gi < groups.length; gi++) {
      const pi = groups[gi].photos.findIndex((p) => p.id === photo.id)
      if (pi !== -1) {
        navigateLightbox(gi, pi)
        return
      }
    }
    // Not yet in gallery groups — show directly via override
    setPhotoOverride(photo)
    window.history.replaceState({ lightbox: true }, '', `/photo/${photo.slug ?? photo.id}`)
    setLightboxImageLoading(true)
    setCopied(false)
    setLinkCopied(false)
  }, [groups, navigateLightbox])

  // Navigate within carousel (same-watch photos from both gallery and API fetches)
  const navigateCarousel = useCallback((targetPhoto: PhotoItem) => {
    console.log('[navigateCarousel] target:', targetPhoto.id)
    // First, try to find it in the groups (existing gallery structure)
    for (let gi = 0; gi < groups.length; gi++) {
      const pi = groups[gi].photos.findIndex((p) => p.id === targetPhoto.id)
      if (pi !== -1) {
        console.log('[navigateCarousel] found in groups at', gi, pi)
        navigateLightbox(gi, pi)
        return
      }
    }
    // Not in gallery groups — show via override (photo from relatedPhotos API)
    console.log('[navigateCarousel] not in groups, using override')
    setPhotoOverride(targetPhoto)
  }, [groups, navigateLightbox])

  const closeLightbox = useCallback(() => {
    setLightbox(null)
    window.history.pushState({}, '', galleryUrlRef.current)
  }, [])

  const handleShare = useCallback(async (photoSlug: string) => {
    const shareUrl = `https://watchems.com/photo/${photoSlug}`
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

  const handleCopyLink = useCallback(async (photoSlug: string) => {
    const shareUrl = `https://watchems.com/photo/${photoSlug}`
    await navigator.clipboard.writeText(shareUrl)
    setLinkCopied(true)
    setTimeout(() => setLinkCopied(false), 2000)
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

  // Helper to format movement type display (capitalize)
  const formatMovementType = (type: string | undefined): string => {
    if (!type) return '—'
    return type.charAt(0).toUpperCase() + type.slice(1)
  }

  const selectedWatchName = activeWatchId && photos.length > 0
    ? photos[0].watchBrand && photos[0].watchName
      ? `${photos[0].watchBrand} ${photos[0].watchName}`
      : photos[0].watchName ?? activeWatchId
    : null

  const activeLightboxGroup = lightbox !== null ? groups[lightbox.groupIdx] : null
  // Photos in ascending order (oldest = index 0 = primary card image)
  // Thumbnails let user select a specific photo; arrows navigate between watches
  const activeLightboxPhotos = activeLightboxGroup ? activeLightboxGroup.photos : []
  // photoOverride lets related-photo clicks stay in the lightbox without a page nav
  const activeLightboxPhoto = photoOverride ?? (activeLightboxPhotos[lightbox?.photoIdx ?? 0] ?? null)

  // Combined carousel pool: gallery group photos + same-watch photos fetched by relatedPhotos API.
  // This ensures the carousel works even when the second photo of a watch wasn't in the paginated gallery fetch.
  const carouselPhotos = useMemo(() => {
    if (!activeLightboxPhoto) return []
    const seenIds = new Set<string>()
    const combined: PhotoItem[] = []
    for (const p of activeLightboxPhotos) {
      if (!seenIds.has(p.id)) { seenIds.add(p.id); combined.push(p) }
    }
    for (const p of relatedPhotos) {
      if (p.watchId === activeLightboxPhoto.watchId && !seenIds.has(p.id)) {
        seenIds.add(p.id); combined.push(p)
      }
    }
    return combined
  }, [activeLightboxPhoto, activeLightboxPhotos, relatedPhotos])

  const carouselPhotoIdx = carouselPhotos.findIndex((p) => p.id === activeLightboxPhoto?.id)

  // Fetch related photos when lightbox photo changes
  useEffect(() => {
    if (!activeLightboxPhoto) return
    fetchRelatedPhotos(activeLightboxPhoto)
  }, [activeLightboxPhoto, fetchRelatedPhotos])

  // Filter related photos to only truly different watches
  const otherWatchRelated = relatedPhotos.filter(
    (p) => p.watchId !== activeLightboxPhoto?.watchId
  )

  // Split: same model name first, then everything else
  const currentModelName = activeLightboxPhoto?.modelName || activeLightboxPhoto?.watchName || null
  const sameModelRelated = currentModelName
    ? otherWatchRelated.filter((p) => (p.modelName || p.watchName) === currentModelName)
    : []
  const otherModelRelated = currentModelName
    ? otherWatchRelated.filter((p) => (p.modelName || p.watchName) !== currentModelName)
    : otherWatchRelated

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
            <div key={i} className="aspect-square rounded-2xl bg-surface animate-pulse" />
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
            const { brand, model, ref } = getWatchLabel(group)
            const watchDisplayName = [brand, model].filter(Boolean).join(' ') || ref || null
            const count = group.photos.length
            return (
              <button
                key={group.watchId}
                type="button"
                onClick={() => openLightbox(groupIdx, 0)}
                className="group relative aspect-square rounded-2xl overflow-hidden bg-surface"
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
                {/* Hover name overlay */}
                {watchDisplayName && (
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-white text-xs font-medium truncate">{watchDisplayName}</p>
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
          className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center"
          onClick={closeLightbox}
          style={{ overscrollBehavior: 'contain', touchAction: 'pan-y' }}
        >
          {/* Gallery arrows — fixed at viewport edges, visually distinct from carousel arrows */}
          {lightbox.groupIdx > 0 && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); navigateLightbox(lightbox.groupIdx - 1, 0) }}
              className="hidden md:flex fixed left-4 top-1/2 -translate-y-1/2 text-white text-2xl bg-gray-800/60 hover:bg-gray-800/90 backdrop-blur-sm rounded-full w-14 h-14 items-center justify-center transition-all z-50 shadow-xl"
              aria-label="Previous watch"
            >
              ‹
            </button>
          )}
          {lightbox.groupIdx < groups.length - 1 && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); navigateLightbox(lightbox.groupIdx + 1, 0) }}
              className="hidden md:flex fixed right-4 top-1/2 -translate-y-1/2 text-white text-2xl bg-gray-800/60 hover:bg-gray-800/90 backdrop-blur-sm rounded-full w-14 h-14 items-center justify-center transition-all z-50 shadow-xl"
              aria-label="Next watch"
            >
              ›
            </button>
          )}

          <div className="flex flex-col md:flex-row w-full max-w-[1400px] mx-4 md:mx-20 h-full md:h-[90vh] rounded-2xl overflow-hidden bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
            {/* Left column: Main image + watch info */}
            <div className={`flex flex-col ${otherWatchRelated.length > 0 ? 'md:w-[65%]' : 'w-full'} h-auto md:h-full overflow-y-auto md:overflow-hidden`}>
              {/* Close button */}
              <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); closeLightbox() }}
                  className="text-gray-700 bg-white/90 hover:bg-white border border-gray-200 shadow-sm rounded-full w-10 h-10 flex items-center justify-center transition-all"
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>

              {/* Main image area — fixed height on mobile, full height on desktop */}
              <div
                className="relative w-full h-[65vh] md:h-full flex flex-col flex-shrink-0 md:flex-shrink"
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
              >
                {/* Spacer so the photo doesn't sit behind the top buttons */}
                <div className="h-10 flex-shrink-0" />
                {/* Image wrapper — fills remaining space */}
                <div className="relative flex-1 min-h-0 rounded-2xl overflow-hidden">
                  {/* Loading spinner overlay */}
                  {lightboxImageLoading && (
                    <div className="absolute inset-0 flex items-center justify-center z-20">
                      <div className="w-12 h-12 border-3 border-gray-200 border-t-gray-500 rounded-full animate-spin" />
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

                  {/* Within-watch carousel arrows — infinite loop (wraps around) */}
                  {carouselPhotos.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); const prevIdx = (carouselPhotoIdx - 1 + carouselPhotos.length) % carouselPhotos.length; navigateCarousel(carouselPhotos[prevIdx]) }}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-white text-lg bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-full w-10 h-10 flex items-center justify-center transition-all z-20 border border-white/60 cursor-pointer"
                        aria-label="Previous photo of this watch"
                      >
                        ‹
                      </button>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); const nextIdx = (carouselPhotoIdx + 1) % carouselPhotos.length; navigateCarousel(carouselPhotos[nextIdx]) }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white text-lg bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-full w-10 h-10 flex items-center justify-center transition-all z-20 border border-white/60 cursor-pointer"
                        aria-label="Next photo of this watch"
                      >
                        ›
                      </button>
                    </>
                  )}

                  {/* Dot indicators — only when multiple photos for this watch */}
                  {carouselPhotos.length > 1 && (
                    <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-10 pointer-events-none">
                      {carouselPhotos.map((_, i) => (
                        <div
                          key={i}
                          className={`w-1.5 h-1.5 rounded-full transition-all ${i === carouselPhotoIdx ? 'bg-white scale-125' : 'bg-white/50'}`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Watch info — below main image (mobile) or at bottom (desktop) */}
              <div className="relative bg-white border-t border-gray-100 px-4 py-3 text-center flex-shrink-0">
                {(() => {
                  const p = activeLightboxPhoto
                  const brand = p.brandName || p.watchBrand || null
                  const model = p.modelName || p.watchName || null
                  const ref = p.referenceNumber || p.watchReference || null
                  return (
                    <div className="space-y-0.5">
                      {(brand || model) && (
                        <p className="text-gray-900 font-semibold text-base">
                          {[brand, model].filter(Boolean).join(' ')}
                        </p>
                      )}
                      <p className="text-gray-400 text-xs">
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
                      {/* Watch specs — compact grid from photo metadata + static library fallback */}
                    {(() => {
                      const w = lightboxWatch
                      const specs: { label: string; value: string }[] = []
                      if (ref) specs.push({ label: 'Ref.', value: ref })
                      const mv = p.movement || (w?.movement_type ? formatMovementType(w.movement_type) : null)
                      if (mv) specs.push({ label: 'Movement', value: mv })
                      const cs = p.caseSize || (w?.case_diameter_mm ? `${w.case_diameter_mm}mm` : null)
                      if (cs) specs.push({ label: 'Case Size', value: cs })
                      const wr = p.waterResistance || (w?.water_resistance_m ? `${w.water_resistance_m}m` : null)
                      if (wr) specs.push({ label: 'Water Resistance', value: wr })
                      const l2l = p.lugToLug
                      if (l2l) specs.push({ label: 'Lug-to-Lug', value: l2l })
                      const bl = p.betweenLugs
                      if (bl) specs.push({ label: 'Between Lugs', value: bl })
                      const th = p.thickness
                      if (th) specs.push({ label: 'Thickness', value: th })
                      const ws = p.wristSize
                      if (ws) specs.push({ label: 'Wrist Size', value: ws })
                      const yr = p.productionYear
                      if (yr) specs.push({ label: 'Year', value: yr })
                      const pr = p.estimatedPrice
                      if (pr) specs.push({ label: 'Price', value: pr })
                      const mat = w?.case_material ?? null
                      if (mat) specs.push({ label: 'Material', value: mat })
                      if (specs.length === 0) return null
                      return (
                        <div className="mt-2 flex flex-wrap gap-x-6 gap-y-2 text-xs text-center justify-center">
                          {specs.map((s) => (
                            <div key={s.label} className="flex flex-col">
                              <span className="text-gray-400">{s.label}</span>
                              <span className="text-gray-700 font-medium">{s.value}</span>
                            </div>
                          ))}
                        </div>
                      )
                    })()}

                    {/* Share + Copy link buttons — contextually anchored to the watch */}
                      <div className="flex items-center justify-center gap-2 pt-2">
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); handleShare(activeLightboxPhoto.slug ?? activeLightboxPhoto.id) }}
                          className="text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-full w-9 h-9 flex items-center justify-center transition-all"
                          aria-label="Share photo"
                        >
                          {copied ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                            </svg>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); handleCopyLink(activeLightboxPhoto.slug ?? activeLightboxPhoto.id) }}
                          className="text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-full h-9 flex items-center justify-center transition-all px-3 gap-1.5 text-sm"
                          aria-label="Copy link"
                        >
                          {linkCopied ? (
                            <>
                              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              <span>Copied!</span>
                            </>
                          ) : (
                            <>
                              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 001.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
                              </svg>
                              <span>Copy link</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )
                })()}
              </div>

              {/* Mobile: Horizontal thumbnail strip below watch info */}
              {activeLightboxPhotos.length > 1 && (
                <div className="md:hidden w-full px-4 py-4 bg-gray-50 flex-shrink-0">
                  <div className="flex gap-3 overflow-x-auto pb-2">
                    {activeLightboxPhotos.map((thumb, thumbIdx) => (
                      <button
                        key={thumb.id}
                        type="button"
                        onClick={(e) => { e.stopPropagation(); navigateLightbox(lightbox.groupIdx, thumbIdx) }}
                        className={`shrink-0 relative rounded overflow-hidden border-2 transition-colors ${
                          thumbIdx === lightbox.photoIdx
                            ? 'border-gray-900 w-20 h-20'
                            : 'border-transparent opacity-60 hover:opacity-90 w-20 h-20'
                        }`}
                        aria-label={`Photo ${thumbIdx + 1}`}
                      >
                        <Image
                          src={thumb.url}
                          alt={buildPhotoAltText(thumb)}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Mobile: Related photos as horizontal thumbnail strip (always show with fallback) */}
              <div className="md:hidden w-full px-4 py-4 bg-gray-100 flex-shrink-0">
                <h3 className="text-gray-900 font-semibold text-sm mb-3">More like this</h3>
                {relatedPhotosLoading ? (
                  <div className="flex gap-3 overflow-x-auto pb-2">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div
                        key={i}
                        className="shrink-0 w-20 h-20 rounded-2xl bg-gray-200 animate-pulse"
                      />
                    ))}
                  </div>
                ) : relatedPhotos.length > 0 ? (
                  <div className="flex gap-3 overflow-x-auto pb-2">
                    {relatedPhotos.slice(0, 12).map((relatedPhoto) => {
                      const relatedBrand = relatedPhoto.brandName || relatedPhoto.watchBrand || null
                      const relatedModel = relatedPhoto.modelName || relatedPhoto.watchName || null
                      const relatedLabel = [relatedBrand, relatedModel].filter(Boolean).join(' ')
                      return (
                        <button
                          key={relatedPhoto.id}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            openRelatedPhoto(relatedPhoto)
                          }}
                          className="shrink-0 group relative rounded-2xl overflow-hidden bg-gray-200 w-20 h-20"
                          aria-label={relatedLabel || 'Related photo'}
                        >
                          <Image
                            src={relatedPhoto.url}
                            alt={buildPhotoAltText(relatedPhoto)}
                            fill
                            className="object-cover transition-transform duration-200 group-hover:scale-105"
                            sizes="80px"
                          />
                          {relatedLabel && (
                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <p className="text-white text-[10px] font-medium truncate">{relatedLabel}</p>
                            </div>
                          )}
                        </button>
                      )
                    })}
                  </div>
                ) : (
                  <p className="text-gray-500 text-xs">Loading related watches...</p>
                )}
              </div>
            </div>

            {/* DESKTOP ONLY: Right column (35%) — same model first, then other watches. Always show panel (with fallback) */}
            <div className="hidden md:flex flex-col md:w-[35%] h-full bg-gray-50 border-l border-gray-200 overflow-hidden">
              <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
                {relatedPhotosLoading ? (
                  <div className="grid grid-cols-2 gap-2">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="aspect-square rounded-2xl bg-gray-200 animate-pulse" />
                    ))}
                  </div>
                ) : otherWatchRelated.length > 0 ? (
                  <>
                    {/* Section 1: Same model */}
                    {sameModelRelated.length > 0 && (
                      <div>
                        <p className="text-gray-500 text-xs font-semibold uppercase tracking-wide px-1 mb-3">
                          More {currentModelName ?? 'like this'}
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                          {sameModelRelated.slice(0, 12).map((relatedPhoto) => {
                            const relatedBrand = relatedPhoto.brandName || relatedPhoto.watchBrand || null
                            const relatedModel = relatedPhoto.modelName || relatedPhoto.watchName || null
                            const relatedLabel = [relatedBrand, relatedModel].filter(Boolean).join(' ')
                            return (
                              <button
                                key={relatedPhoto.id}
                                type="button"
                                onClick={(e) => { e.stopPropagation(); openRelatedPhoto(relatedPhoto) }}
                                className="group relative aspect-square rounded-2xl overflow-hidden bg-gray-200 hover:bg-gray-300 transition-colors"
                                aria-label={relatedLabel || 'Related photo'}
                              >
                                <Image
                                  src={relatedPhoto.url}
                                  alt={buildPhotoAltText(relatedPhoto)}
                                  fill
                                  className="object-cover transition-transform duration-200 group-hover:scale-105"
                                  sizes="15vw"
                                />
                                {relatedLabel && (
                                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <p className="text-white text-xs font-medium truncate">{relatedLabel}</p>
                                  </div>
                                )}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    {/* Section 2: Other watches */}
                    {otherModelRelated.length > 0 && (
                      <div>
                        {sameModelRelated.length > 0 && (
                          <p className="text-gray-500 text-xs font-semibold uppercase tracking-wide px-1 mb-3">Other watches</p>
                        )}
                        <div className="grid grid-cols-2 gap-2">
                          {otherModelRelated.slice(0, 20).map((relatedPhoto) => {
                            const relatedBrand = relatedPhoto.brandName || relatedPhoto.watchBrand || null
                            const relatedModel = relatedPhoto.modelName || relatedPhoto.watchName || null
                            const relatedLabel = [relatedBrand, relatedModel].filter(Boolean).join(' ')
                            return (
                              <button
                                key={relatedPhoto.id}
                                type="button"
                                onClick={(e) => { e.stopPropagation(); openRelatedPhoto(relatedPhoto) }}
                                className="group relative aspect-square rounded-2xl overflow-hidden bg-gray-200 hover:bg-gray-300 transition-colors"
                                aria-label={relatedLabel || 'Related photo'}
                              >
                                <Image
                                  src={relatedPhoto.url}
                                  alt={buildPhotoAltText(relatedPhoto)}
                                  fill
                                  className="object-cover transition-transform duration-200 group-hover:scale-105"
                                  sizes="15vw"
                                />
                                {relatedLabel && (
                                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <p className="text-white text-xs font-medium truncate">{relatedLabel}</p>
                                  </div>
                                )}
                              </button>
                            )
                          })}
                          </div>
                        </div>
                      )}
                    </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center py-8 px-4">
                    <p className="text-gray-500 text-sm font-medium mb-3">
                      Explore other watches
                    </p>
                    <p className="text-gray-400 text-xs">
                      Discover watches from the gallery
                    </p>
                  </div>
                )}
              </div>
            </div>


          </div>
        </div>
      )}
    </section>
  )
}

export default function PhotoGallery({ initialPhotoSlug }: { initialPhotoSlug?: string }) {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="aspect-square rounded-2xl bg-surface animate-pulse" />
          ))}
        </div>
      </div>
    }>
      <PhotoGalleryContent initialPhotoSlug={initialPhotoSlug} />
    </Suspense>
  )
}
