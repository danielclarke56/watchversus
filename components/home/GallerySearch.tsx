'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

interface WatchWithCount {
  watchId: string
  watchName: string
  watchBrand: string | null
  watchReference: string | null
  count: number
}

export default function GallerySearch() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [watches, setWatches] = useState<WatchWithCount[]>([])
  const [input, setInput] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [isLoading, setIsLoading] = useState(true)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const activeWatchId = searchParams.get('watch')
  const activeQuery = searchParams.get('q')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Debounced URL update for free-text search
  const updateQuery = useCallback((text: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString())
      if (text.trim()) {
        params.set('q', text.trim())
        params.delete('watch')
      } else {
        params.delete('q')
      }
      const qs = params.toString()
      router.replace(qs ? `/?${qs}` : '/')
    }, 250)
  }, [router, searchParams])

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  // Fetch watches with photos on mount
  useEffect(() => {
    const fetchWatches = async () => {
      try {
        const res = await fetch('/api/photos/watches')
        const data = await res.json()
        setWatches(data.watches || [])
      } catch (error) {
        console.error('Failed to fetch watches:', error)
        setWatches([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchWatches()
  }, [])

  // When a watch or query is active, populate the input
  useEffect(() => {
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

  // Filter watches by input text
  const filtered = input
    ? watches.filter((w) => {
        const searchText = input.toLowerCase()
        const name = w.watchName.toLowerCase()
        const brand = (w.watchBrand ?? '').toLowerCase()
        return name.includes(searchText) || brand.includes(searchText)
      })
    : []

  // Limit dropdown to 8 items
  const displayedMatches = filtered.slice(0, 8)

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
    if (!isOpen || displayedMatches.length === 0) {
      if (e.key === 'Enter' && input && displayedMatches.length > 0) {
        selectWatch(displayedMatches[0])
      }
      return
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex((prev) => (prev < displayedMatches.length - 1 ? prev + 1 : prev))
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1))
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0) {
          selectWatch(displayedMatches[selectedIndex])
        } else if (displayedMatches.length > 0) {
          selectWatch(displayedMatches[0])
        }
        break
      case 'Escape':
        e.preventDefault()
        setIsOpen(false)
        break
    }
  }

  const selectWatch = (watch: WatchWithCount) => {
    router.push(`/?watch=${encodeURIComponent(watch.watchId)}`)
    setIsOpen(false)
    setSelectedIndex(-1)
  }

  const clearFilter = () => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    router.replace('/')
    setInput('')
  }

  return (
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
          placeholder="Search watches (Rolex, Omega, Tudor...)"
          value={input}
          onChange={(e) => {
            const val = e.target.value
            setInput(val)
            setIsOpen(true)
            setSelectedIndex(-1)
            updateQuery(val)
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400 disabled:opacity-50"
        />

        {/* Clear button (×) when a watch or query is active */}
        {(activeWatchId || activeQuery) && (
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

      {/* Dropdown with matches */}
      {isOpen && !isLoading && displayedMatches.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
          {displayedMatches.map((watch, idx) => (
            <button
              key={watch.watchId}
              type="button"
              onPointerDown={(e) => {
                e.preventDefault()
                selectWatch(watch)
              }}
              onMouseEnter={() => setSelectedIndex(idx)}
              className={`w-full px-4 py-3 text-left flex items-center justify-between border-b border-gray-200 last:border-b-0 transition-colors ${
                idx === selectedIndex ? 'bg-gray-100' : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 truncate">
                  {watch.watchName}
                </p>
                {watch.watchBrand && (
                  <p className="text-sm text-gray-500 truncate">
                    {watch.watchBrand}
                  </p>
                )}
              </div>
              <span className="ml-3 text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-full whitespace-nowrap">
                {watch.count} photo{watch.count !== 1 ? 's' : ''}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
