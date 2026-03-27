'use client'

import { useEffect, useState, useRef } from 'react'
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

  // When a watch is active, populate the input with its name
  useEffect(() => {
    if (activeWatchId) {
      const active = watches.find((w) => w.watchId === activeWatchId)
      if (active) {
        setInput(`${active.watchBrand ?? ''} ${active.watchName}`.trim())
      }
    } else {
      setInput('')
    }
  }, [activeWatchId, watches])

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
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }

    window.addEventListener('mousedown', handleClickOutside)
    return () => window.removeEventListener('mousedown', handleClickOutside)
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
    router.push('/')
    setInput('')
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          placeholder="Search watches (Rolex, Omega, Tudor...)"
          value={input}
          onChange={(e) => {
            setInput(e.target.value)
            setIsOpen(true)
            setSelectedIndex(-1)
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400 disabled:opacity-50"
        />

        {/* Clear button (×) when a watch is actively selected */}
        {activeWatchId && (
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
              onClick={() => selectWatch(watch)}
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
