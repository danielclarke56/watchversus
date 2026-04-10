'use client'

import { useEffect, useState, useRef, useCallback, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Fuse from 'fuse.js'
import SectionLabel from '@/components/ui/SectionLabel'
import { setWatchesCache } from '@/lib/watchesCache'
import type { WatchWithCount, BrandWithCount } from '@/lib/watchesCache'

interface FilterChip {
  key: string
  label: string
  param: string
  value: string
  // For price/case size range chips
  paramMin?: string
  paramMax?: string
  valueMin?: string
  valueMax?: string
}

// Filter chip data — hidden from UI for now, kept for future use
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const MOVEMENT_CHIPS: FilterChip[] = [
  { key: 'mv-automatic', label: 'Automatic', param: 'movement', value: 'automatic' },
  { key: 'mv-quartz', label: 'Quartz', param: 'movement', value: 'quartz' },
  { key: 'mv-manual', label: 'Manual', param: 'movement', value: 'manual' },
]

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const PRICE_CHIPS: FilterChip[] = [
  { key: 'price-0-500', label: 'Under $500', param: 'price', value: '0-500', paramMin: 'priceMin', paramMax: 'priceMax', valueMin: '0', valueMax: '500' },
  { key: 'price-500-2000', label: '$500\u2013$2K', param: 'price', value: '500-2000', paramMin: 'priceMin', paramMax: 'priceMax', valueMin: '500', valueMax: '2000' },
  { key: 'price-2000-5000', label: '$2K\u2013$5K', param: 'price', value: '2000-5000', paramMin: 'priceMin', paramMax: 'priceMax', valueMin: '2000', valueMax: '5000' },
  { key: 'price-5000-10000', label: '$5K\u2013$10K', param: 'price', value: '5000-10000', paramMin: 'priceMin', paramMax: 'priceMax', valueMin: '5000', valueMax: '10000' },
  { key: 'price-10000+', label: '$10K+', param: 'price', value: '10000+', paramMin: 'priceMin', paramMax: 'priceMax', valueMin: '10000', valueMax: '' },
]

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const SIZE_CHIPS: FilterChip[] = [
  { key: 'size-0-38', label: 'Under 38mm', param: 'caseSize', value: '0-38', paramMin: 'caseSizeMin', paramMax: 'caseSizeMax', valueMin: '0', valueMax: '38' },
  { key: 'size-38-42', label: '38\u201342mm', param: 'caseSize', value: '38-42', paramMin: 'caseSizeMin', paramMax: 'caseSizeMax', valueMin: '38', valueMax: '42' },
  { key: 'size-42+', label: '42mm+', param: 'caseSize', value: '42+', paramMin: 'caseSizeMin', paramMax: 'caseSizeMax', valueMin: '42', valueMax: '' },
]

const RECENT_SEARCHES_KEY = 'watchems-recent-searches'
const MAX_RECENT = 5

function getRecentSearches(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(RECENT_SEARCHES_KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

function saveRecentSearch(query: string) {
  if (typeof window === 'undefined' || !query.trim()) return
  try {
    const recent = getRecentSearches().filter((s) => s.toLowerCase() !== query.toLowerCase())
    recent.unshift(query.trim())
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(recent.slice(0, MAX_RECENT)))
  } catch { /* ignore */ }
}

// Module-level cache for /api/photos/watches — backed by shared lib/watchesCache
type WatchesCache = {
  watches: WatchWithCount[]
  brands: BrandWithCount[]
  trending: string[]
  dialColors: { name: string; photoCount: number }[]
  watchStyles: { name: string; photoCount: number }[]
  caseMaterials: { name: string; photoCount: number }[]
  strapTypes: { name: string; photoCount: number }[]
  ts: number
}
let watchesCache: WatchesCache | null = null
const WATCHES_CACHE_TTL = 5 * 60 * 1000 // 5 minutes

export default function GallerySearch({ onExpandChange, forceCollapse }: { onExpandChange?: (expanded: boolean) => void; forceCollapse?: number } = {}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [watches, setWatches] = useState<WatchWithCount[]>([])
  const [brands, setBrands] = useState<BrandWithCount[]>([])
  const [trending, setTrending] = useState<string[]>([])
  const [input, setInput] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [isLoading, setIsLoading] = useState(true)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Notify parent when search expands/collapses
  useEffect(() => { onExpandChange?.(isOpen) }, [isOpen, onExpandChange])

  // Parent can force-collapse the dropdown (e.g. Cancel button in navbar)
  useEffect(() => {
    if (forceCollapse && forceCollapse > 0) {
      setIsOpen(false)
      inputRef.current?.blur()
    }
  }, [forceCollapse])

  const activeWatchId = searchParams.get('watch')
  const activeQuery = searchParams.get('q')
  const activeBrand = searchParams.get('brand')
  const activeMovement = searchParams.get('movement')
  const activePriceMin = searchParams.get('priceMin')
  const activePriceMax = searchParams.get('priceMax')
  const activeCaseSizeMin = searchParams.get('caseSizeMin')
  const activeCaseSizeMax = searchParams.get('caseSizeMax')

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isTypingRef = useRef(false)
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Build current filter params (excluding q and watch)
  const buildFilterParams = useCallback(() => {
    const params = new URLSearchParams()
    if (activeBrand) params.set('brand', activeBrand)
    if (activeMovement) params.set('movement', activeMovement)
    if (activePriceMin) params.set('priceMin', activePriceMin)
    if (activePriceMax) params.set('priceMax', activePriceMax)
    if (activeCaseSizeMin) params.set('caseSizeMin', activeCaseSizeMin)
    if (activeCaseSizeMax) params.set('caseSizeMax', activeCaseSizeMax)
    return params
  }, [activeBrand, activeMovement, activePriceMin, activePriceMax, activeCaseSizeMin, activeCaseSizeMax])

  // Debounced URL update for free-text search
  const updateQuery = useCallback((text: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      const params = buildFilterParams()
      if (text.trim()) {
        params.set('q', text.trim())
        params.delete('watch')
      } else {
        params.delete('q')
      }
      // Preserve existing filters
      const qs = params.toString()
      router.replace(qs ? `/?${qs}` : '/')
    }, 150)
  }, [router, buildFilterParams])

  // Cleanup debounce and typing timer on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
    }
  }, [])

  // Fetch watches with photos on mount (with module-level cache)
  useEffect(() => {
    const applyData = (data: WatchesCache) => {
      setWatches(data.watches)
      setBrands(data.brands)
      setTrending(data.trending)
      setIsLoading(false)
    }

    // Serve from cache immediately if fresh
    if (watchesCache && Date.now() - watchesCache.ts < WATCHES_CACHE_TTL) {
      applyData(watchesCache)
    }

    // Always revalidate in background
    fetch('/api/photos/watches')
      .then((res) => res.json())
      .then((data) => {
        const cached: WatchesCache = {
          watches: data.watches || [],
          brands: data.brands || [],
          trending: data.trending || [],
          dialColors: data.dialColors || [],
          watchStyles: data.watchStyles || [],
          caseMaterials: data.caseMaterials || [],
          strapTypes: data.strapTypes || [],
          ts: Date.now(),
        }
        watchesCache = cached
        setWatchesCache(cached) // push to shared cache for DidYouMean
        applyData(cached)
      })
      .catch((error) => {
        console.error('Failed to fetch watches:', error)
        if (!watchesCache) {
          setWatches([])
          setIsLoading(false)
        }
      })
  }, [])

  // Load recent searches on mount
  useEffect(() => {
    setRecentSearches(getRecentSearches())
  }, [])

  // When a watch or query is active, populate the input
  // Skip if user is actively typing (don't overwrite with stale URL value)
  useEffect(() => {
    if (isTypingRef.current) return
    if (activeWatchId) {
      const active = watches.find((w) => w.watchId === activeWatchId)
      if (active) {
        setInput(`${active.watchBrand ?? ''} ${active.watchName}`.trim())
      }
    } else if (activeQuery) {
      setInput(activeQuery)
    } else {
      setInput('')
    }
  }, [activeWatchId, activeQuery, watches])

  // Fuse.js indexes for fuzzy autocomplete
  const brandFuse = useMemo(() => {
    if (brands.length === 0) return null
    return new Fuse(brands, {
      keys: ['name'],
      threshold: 0.35,
      distance: 50,
      minMatchCharLength: 2,
    })
  }, [brands])

  const watchFuse = useMemo(() => {
    if (watches.length === 0) return null
    return new Fuse(watches, {
      keys: ['watchName', 'watchBrand', 'watchReference', 'watchId'],
      threshold: 0.35,
      distance: 100,
      minMatchCharLength: 2,
    })
  }, [watches])

  // Brand-level autocomplete grouping (fuzzy)
  const brandMatches = useMemo(() => {
    if (!input || !brandFuse) return []
    return brandFuse.search(input, { limit: 4 }).map((r) => r.item)
  }, [input, brandFuse])

  // Model-level matches (fuzzy, exclude brands to avoid duplicates)
  const modelMatches = useMemo(() => {
    if (!input || !watchFuse) return []
    const results = watchFuse.search(input, { limit: 10 }).map((r) => r.item)
    const brandNames = new Set(brandMatches.map((b) => b.name.toLowerCase()))
    return results
      .filter((w) => !brandNames.has((w.watchBrand ?? '').toLowerCase()) || results.length <= 4)
      .slice(0, 6)
  }, [input, watchFuse, brandMatches])

  // Total dropdown items for keyboard navigation
  const allDropdownItems = useMemo(() => {
    const result: ({ type: 'brand'; brand: BrandWithCount } | { type: 'model'; watch: WatchWithCount })[] = []
    for (const b of brandMatches) result.push({ type: 'brand', brand: b })
    for (const w of modelMatches) result.push({ type: 'model', watch: w })
    return result
  }, [brandMatches, modelMatches])

  // Show trending/recent when input is empty and dropdown is open
  const showTrending = isOpen && !input && !isLoading

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: PointerEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }

    window.addEventListener('pointerdown', handleClickOutside)
    return () => window.removeEventListener('pointerdown', handleClickOutside)
  }, [])

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const totalItems = showTrending
      ? trending.length + recentSearches.length
      : allDropdownItems.length

    if (!isOpen || totalItems === 0) {
      if (e.key === 'Enter' && input) {
        saveRecentSearch(input)
        setRecentSearches(getRecentSearches())
        setIsOpen(false)
      }
      return
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex((prev) => (prev < totalItems - 1 ? prev + 1 : prev))
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1))
        break
      case 'Enter':
        e.preventDefault()
        if (showTrending) {
          // Navigate trending/recent
          if (selectedIndex >= 0 && selectedIndex < trending.length) {
            handleTrendingClick(trending[selectedIndex])
          } else if (selectedIndex >= trending.length) {
            const recentIdx = selectedIndex - trending.length
            if (recentSearches[recentIdx]) {
              handleRecentClick(recentSearches[recentIdx])
            }
          }
        } else if (selectedIndex >= 0 && selectedIndex < allDropdownItems.length) {
          const item = allDropdownItems[selectedIndex]
          if (item.type === 'brand') {
            handleBrandSelect(item.brand.name)
          } else {
            selectWatch(item.watch)
          }
        } else if (allDropdownItems.length > 0) {
          const item = allDropdownItems[0]
          if (item.type === 'brand') {
            handleBrandSelect(item.brand.name)
          } else {
            selectWatch(item.watch)
          }
        } else if (input) {
          saveRecentSearch(input)
          setRecentSearches(getRecentSearches())
          setIsOpen(false)
        }
        break
      case 'Escape':
        e.preventDefault()
        setIsOpen(false)
        break
    }
  }

  const selectWatch = (watch: WatchWithCount) => {
    saveRecentSearch(`${watch.watchBrand ?? ''} ${watch.watchName}`.trim())
    setRecentSearches(getRecentSearches())
    // open=1 tells the gallery to auto-open the lightbox for the first photo
    router.push(`/?watch=${encodeURIComponent(watch.watchId)}&open=1`)
    setIsOpen(false)
    setSelectedIndex(-1)
  }

  const handleBrandSelect = (brandName: string) => {
    saveRecentSearch(brandName)
    setRecentSearches(getRecentSearches())
    const params = buildFilterParams()
    params.set('brand', brandName.toLowerCase())
    params.delete('q')
    params.delete('watch')
    router.replace(`/?${params.toString()}`)
    setInput('')
    setIsOpen(false)
    setSelectedIndex(-1)
  }

  const handleTrendingClick = (brandName: string) => {
    saveRecentSearch(brandName)
    setRecentSearches(getRecentSearches())
    const params = buildFilterParams()
    params.set('brand', brandName.toLowerCase())
    params.delete('q')
    params.delete('watch')
    router.replace(`/?${params.toString()}`)
    setInput('')
    setIsOpen(false)
  }

  const handleRecentClick = (query: string) => {
    setInput(query)
    setIsOpen(false)
    const params = buildFilterParams()
    params.set('q', query)
    params.delete('watch')
    router.replace(`/?${params.toString()}`)
  }

  const clearFilter = () => {
    isTypingRef.current = false
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    router.replace('/')
    setInput('')
    setIsOpen(false)
  }

  // Toggle a filter chip (hidden from UI for now)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const toggleChip = (chip: FilterChip) => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('watch')

    if (chip.param === 'movement') {
      if (activeMovement === chip.value) {
        params.delete('movement')
      } else {
        params.set('movement', chip.value)
      }
    } else if (chip.param === 'price') {
      const isActive = activePriceMin === chip.valueMin && activePriceMax === (chip.valueMax || null)
      if (isActive) {
        params.delete('priceMin')
        params.delete('priceMax')
      } else {
        if (chip.valueMin) params.set('priceMin', chip.valueMin)
        else params.delete('priceMin')
        if (chip.valueMax) params.set('priceMax', chip.valueMax)
        else params.delete('priceMax')
      }
    } else if (chip.param === 'caseSize') {
      const isActive = activeCaseSizeMin === chip.valueMin && activeCaseSizeMax === (chip.valueMax || null)
      if (isActive) {
        params.delete('caseSizeMin')
        params.delete('caseSizeMax')
      } else {
        if (chip.valueMin) params.set('caseSizeMin', chip.valueMin)
        else params.delete('caseSizeMin')
        if (chip.valueMax) params.set('caseSizeMax', chip.valueMax)
        else params.delete('caseSizeMax')
      }
    }

    const qs = params.toString()
    router.replace(qs ? `/?${qs}` : '/')
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const toggleBrandChip = (brandName: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('watch')
    if (activeBrand === brandName.toLowerCase()) {
      params.delete('brand')
    } else {
      params.set('brand', brandName.toLowerCase())
    }
    const qs = params.toString()
    router.replace(qs ? `/?${qs}` : '/')
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const isChipActive = (chip: FilterChip): boolean => {
    if (chip.param === 'movement') return activeMovement === chip.value
    if (chip.param === 'price') return activePriceMin === chip.valueMin && activePriceMax === (chip.valueMax || null)
    if (chip.param === 'caseSize') return activeCaseSizeMin === chip.valueMin && activeCaseSizeMax === (chip.valueMax || null)
    return false
  }

  const hasActiveFilters = activeBrand || activeMovement || activePriceMin || activePriceMax || activeCaseSizeMin || activeCaseSizeMax

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const brandChips = brands.slice(0, 8)

  return (
    <div className="space-y-3">
      <div ref={containerRef} className="relative">
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
          </div>
          <input
            ref={inputRef}
            type="text"
            placeholder="Search watches..."
            value={input}
            onChange={(e) => {
              // Mark as typing, reset after 600ms of no input
              isTypingRef.current = true
              if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
              typingTimeoutRef.current = setTimeout(() => {
                isTypingRef.current = false
              }, 600)

              const val = e.target.value
              setInput(val)
              setIsOpen(true)
              setSelectedIndex(-1)
              updateQuery(val)
            }}
            onFocus={() => {
              setIsOpen(true)
              setRecentSearches(getRecentSearches())
            }}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            className="w-full pl-9 sm:pl-10 pr-9 sm:pr-10 h-9 sm:h-10 text-sm rounded-lg border-0 bg-gray-100 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 disabled:opacity-50"
          />

          {/* Clear button */}
          {(activeWatchId || activeQuery || input || hasActiveFilters) && (
            <button
              type="button"
              onClick={clearFilter}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-lg font-semibold"
              aria-label="Clear filter"
            >
              ×
            </button>
          )}
        </div>

        {/* Dropdown: trending/recent on empty, grouped results on typing */}
        {isOpen && !isLoading && (
          <>
            {/* Trending / recent searches on empty focus */}
            {showTrending && (trending.length > 0 || recentSearches.length > 0) && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-[50vh] overflow-y-auto">
                {trending.length > 0 && (
                  <div className="px-3 pt-3 pb-1">
                    <SectionLabel className="mb-2">Trending</SectionLabel>
                    {trending.map((brand, idx) => (
                      <button
                        key={brand}
                        type="button"
                        onPointerDown={(e) => { e.preventDefault(); handleTrendingClick(brand) }}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        className={`w-full px-3 py-2 text-left rounded-md text-sm transition-colors ${
                          idx === selectedIndex ? 'bg-gray-100' : 'hover:bg-gray-50'
                        }`}
                      >
                        <span className="text-gray-700 font-medium">{brand}</span>
                      </button>
                    ))}
                  </div>
                )}
                {recentSearches.length > 0 && (
                  <div className={`px-3 pb-3 pt-1 ${trending.length > 0 ? 'border-t border-gray-100' : 'pt-3'}`}>
                    <SectionLabel className="mb-2">Recent searches</SectionLabel>
                    {recentSearches.map((query, idx) => {
                      const globalIdx = trending.length + idx
                      return (
                        <button
                          key={query}
                          type="button"
                          onPointerDown={(e) => { e.preventDefault(); handleRecentClick(query) }}
                          onMouseEnter={() => setSelectedIndex(globalIdx)}
                          className={`w-full px-3 py-2 text-left rounded-md text-sm transition-colors flex items-center gap-2 ${
                            globalIdx === selectedIndex ? 'bg-gray-100' : 'hover:bg-gray-50'
                          }`}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-gray-600">{query}</span>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Grouped autocomplete: brands + models */}
            {input && (brandMatches.length > 0 || modelMatches.length > 0) && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-[50vh] overflow-y-auto">
                {brandMatches.length > 0 && (
                  <div className="px-3 pt-3 pb-1">
                    <SectionLabel className="mb-1">Brands</SectionLabel>
                    {brandMatches.map((brand, idx) => (
                      <button
                        key={brand.name}
                        type="button"
                        onPointerDown={(e) => { e.preventDefault(); handleBrandSelect(brand.name) }}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        className={`w-full px-3 py-2.5 text-left rounded-md flex items-center justify-between transition-colors ${
                          idx === selectedIndex ? 'bg-gray-100' : 'hover:bg-gray-50'
                        }`}
                      >
                        <span className="font-semibold text-gray-900 text-sm">{brand.name}</span>
                        <span className="ml-3 text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full whitespace-nowrap">
                          {brand.photoCount} photo{brand.photoCount !== 1 ? 's' : ''}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
                {modelMatches.length > 0 && (
                  <div className={`px-3 pb-2 pt-1 ${brandMatches.length > 0 ? 'border-t border-gray-100' : 'pt-3'}`}>
                    <SectionLabel className="mb-1">Models</SectionLabel>
                    {modelMatches.map((watch, idx) => {
                      const globalIdx = brandMatches.length + idx
                      return (
                        <button
                          key={watch.watchId}
                          type="button"
                          onPointerDown={(e) => { e.preventDefault(); selectWatch(watch) }}
                          onMouseEnter={() => setSelectedIndex(globalIdx)}
                          className={`w-full px-3 py-2.5 text-left rounded-md flex items-center justify-between transition-colors ${
                            globalIdx === selectedIndex ? 'bg-gray-100' : 'hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate text-sm">
                              {[watch.watchBrand, watch.watchName].filter(Boolean).join(' ')}
                            </p>
                            {watch.watchReference && (
                              <p className="text-xs text-gray-400 truncate font-mono">
                                {watch.watchReference}
                              </p>
                            )}
                          </div>
                          <span className="ml-3 text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full whitespace-nowrap">
                            {watch.count} photo{watch.count !== 1 ? 's' : ''}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Filter chips — hidden for now until feature is refined */}
    </div>
  )
}
