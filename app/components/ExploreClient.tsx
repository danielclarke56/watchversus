'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import type { ApprovedPhoto } from '@/lib/photos'
import { watches } from '@/lib/watches'

export function ExploreClient() {
  const searchParams = useSearchParams()
  const [photos, setPhotos] = useState<ApprovedPhoto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [cursor, setCursor] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(false)
  const [brands, setBrands] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')

  // Initialize search query from URL params
  useEffect(() => {
    const q = searchParams.get('q')
    if (q) {
      setSearchQuery(q)
    }
  }, [searchParams])

  // Fetch initial photos
  useEffect(() => {
    loadPhotos(null)
    loadBrands()
  }, [searchQuery])

  async function loadPhotos(cursorParam: string | null) {
    setIsLoading(true)
    try {
      const url = new URL('/api/photos/all', window.location.origin)
      url.searchParams.set('limit', '50')
      if (cursorParam) {
        url.searchParams.set('cursor', cursorParam)
      }
      if (searchQuery) {
        url.searchParams.set('q', searchQuery)
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

  async function loadBrands() {
    try {
      const url = new URL('/api/brands', window.location.origin)
      const res = await fetch(url.toString())
      const data = (await res.json()) as { brands: string[] }
      // Show top 8 brands
      setBrands(data.brands.slice(0, 8))
    } catch (error) {
      console.error('Failed to load brands:', error)
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
          <h1 className="text-4xl font-bold text-textPrimary mb-4">Watch Photos</h1>
          <p className="text-lg text-textSecond mb-6">
            Real photos from watch owners around the world. Search by brand or model.
          </p>
          {/* Search Input */}
          <div className="max-w-md">
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search watches (Rolex, Omega, Tudor...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-lg font-semibold"
                  aria-label="Clear search"
                >
                  ×
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Brand Navigation Pills */}
        {brands.length > 0 && (
          <div className="mb-12">
            <h2 className="text-lg font-semibold text-textPrimary mb-4">Browse by Brand</h2>
            <div className="flex flex-wrap gap-2">
              {brands.map((brand) => (
                <Link
                  key={brand}
                  href={`/brand/${encodeURIComponent(brand.toLowerCase())}`}
                  className="px-4 py-2 bg-surfaceAlt border border-border rounded-full text-textPrimary hover:bg-surface hover:border-borderStrong transition-colors text-sm font-medium"
                >
                  {brand}
                </Link>
              ))}
            </div>
          </div>
        )}

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
                  <Link
                    key={photo.id}
                    href={`/photo/${photo.id}`}
                    className="group relative aspect-square bg-surfaceAlt rounded-sm overflow-hidden border border-border hover:border-borderStrong transition-colors block"
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
                        <p className="text-white/50 text-[9px] mt-1">
                          {new Date(photo.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>
                  </Link>
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
