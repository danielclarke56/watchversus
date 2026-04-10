'use client'

/**
 * Shared client-side cache for /api/photos/watches data.
 * Used by both GallerySearch (autocomplete) and PhotoGallery (DidYouMean).
 * Avoids duplicate API calls when both components mount on the same page.
 */

export interface WatchWithCount {
  watchId: string
  watchName: string
  watchBrand: string | null
  watchReference: string | null
  count: number
}

export interface BrandWithCount {
  name: string
  photoCount: number
}

export interface CharacteristicChip {
  name: string
  photoCount: number
}

interface WatchesCache {
  watches: WatchWithCount[]
  brands: BrandWithCount[]
  trending: string[]
  dialColors: CharacteristicChip[]
  watchStyles: CharacteristicChip[]
  caseMaterials: CharacteristicChip[]
  strapTypes: CharacteristicChip[]
  ts: number
}

let cache: WatchesCache | null = null
const TTL = 5 * 60 * 1000 // 5 minutes
let inflight: Promise<WatchesCache> | null = null

async function fetchWatchesData(): Promise<WatchesCache> {
  const res = await fetch('/api/photos/watches')
  const data = await res.json()
  return {
    watches: data.watches || [],
    brands: data.brands || [],
    trending: data.trending || [],
    dialColors: data.dialColors || [],
    watchStyles: data.watchStyles || [],
    caseMaterials: data.caseMaterials || [],
    strapTypes: data.strapTypes || [],
    ts: Date.now(),
  }
}

/**
 * Get cached watches data, revalidating in the background if stale.
 * Returns immediately from cache if fresh. Deduplicates in-flight requests.
 */
export async function getWatchesData(): Promise<WatchesCache> {
  if (cache && Date.now() - cache.ts < TTL) return cache

  if (!inflight) {
    inflight = fetchWatchesData().then((data) => {
      cache = data
      inflight = null
      return data
    }).catch((err) => {
      inflight = null
      if (cache) return cache
      throw err
    })
  }

  return inflight
}

/**
 * Get current cache synchronously (may be null if not yet loaded).
 * Useful for useMemo hooks that can't await.
 */
export function getWatchesCacheSync(): WatchesCache | null {
  return cache
}

/**
 * Set cache from external source (e.g., when GallerySearch already fetched it).
 */
export function setWatchesCache(data: Omit<WatchesCache, 'ts'>) {
  cache = { ...data, ts: Date.now() }
}
