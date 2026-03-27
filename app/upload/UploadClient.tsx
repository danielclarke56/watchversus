'use client'

import { useState, useRef, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser, SignInButton } from '@clerk/nextjs'
import Link from 'next/link'
import { watches } from '@/lib/watches'
import type { Watch } from '@/lib/types'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

export default function UploadClient() {
  const { isSignedIn, isLoaded } = useUser()
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [selectedWatch, setSelectedWatch] = useState<Watch | null>(null)
  const [showDropdown, setShowDropdown] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [caption, setCaption] = useState('')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [preview, setPreview] = useState<string | null>(null)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const [isDragging, setIsDragging] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const dropzoneRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLUListElement>(null)

  const filtered = useMemo(() => {
    if (!search.trim() || search.trim().length < 2) return []
    const q = search.toLowerCase()
    return watches
      .filter(
        (w) =>
          w.brand.toLowerCase().includes(q) ||
          w.name.toLowerCase().includes(q) ||
          `${w.brand} ${w.name}`.toLowerCase().includes(q)
      )
      .slice(0, 20)
  }, [search])

  // Group filtered results by brand
  const groupedResults = useMemo(() => {
    const groups: { [key: string]: Watch[] } = {}
    filtered.forEach((w) => {
      if (!groups[w.brand]) groups[w.brand] = []
      groups[w.brand].push(w)
    })
    return groups
  }, [filtered])

  // Keyboard navigation for dropdown
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (!showDropdown) return
      const totalItems = filtered.length
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setHighlightedIndex((prev) => (prev < totalItems - 1 ? prev + 1 : 0))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : totalItems - 1))
      } else if (e.key === 'Enter') {
        e.preventDefault()
        if (highlightedIndex >= 0 && highlightedIndex < totalItems) {
          selectWatch(filtered[highlightedIndex])
        } else {
          // User pressed Enter without selecting — close dropdown, keep typed text
          setShowDropdown(false)
          setHighlightedIndex(-1)
        }
      } else if (e.key === 'Escape') {
        e.preventDefault()
        setShowDropdown(false)
        setHighlightedIndex(-1)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [showDropdown, filtered, highlightedIndex])

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        e.target instanceof HTMLElement &&
        !e.target.closest('input')
      ) {
        setShowDropdown(false)
        setHighlightedIndex(-1)
      }
    }
    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showDropdown])

  function highlightMatch(text: string, query: string): React.ReactNode {
    if (!query.trim()) return text
    const parts = text.split(
      new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'i')
    )
    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <span key={i} className="font-bold">
          {part}
        </span>
      ) : (
        part
      )
    )
  }

  function selectWatch(w: Watch) {
    setSelectedWatch(w)
    setSearch(`${w.brand} ${w.name}`)
    setShowDropdown(false)
    setHighlightedIndex(-1)
  }

  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
    setSearch(val)
    // Clear the selected DB watch when user edits the field
    setSelectedWatch(null)
    setShowDropdown(true)
    setHighlightedIndex(-1)
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    processFile(f)
  }

  function processFile(f: File) {
    if (f.size > 5 * 1024 * 1024) {
      setError('File must be under 5MB')
      return
    }
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(f.type)) {
      setError('Only JPEG, PNG, or WebP images are allowed')
      return
    }
    setFile(f)
    setError('')
    const reader = new FileReader()
    reader.onload = () => setPreview(reader.result as string)
    reader.readAsDataURL(f)
  }

  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  function handleDragLeave(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    const f = e.dataTransfer.files?.[0]
    if (f) processFile(f)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const watchId = selectedWatch?.slug || slugify(search.trim())
    if (!watchId || !file) return
    setUploading(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('file', file)
      if (caption.trim()) formData.append('caption', caption.trim())

      const res = await fetch(`/api/photos/${watchId}`, {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Upload failed')
      }

      router.push('/')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-surfaceAlt flex items-center justify-center">
        <div className="animate-pulse text-textMuted">Loading...</div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-surfaceAlt text-textPrimary">
      <div className="max-w-xl mx-auto px-4 py-16">
        <Link href="/" className="text-sm text-textMuted hover:text-textPrimary mb-8 inline-block">
          ← Back to home
        </Link>

        <h1 className="text-3xl font-bold mb-2">Upload Your Watch Photo</h1>
        <p className="text-textMuted mb-8">
          Share a real wrist shot. Help others see how this watch looks in real life.
        </p>

        {!isSignedIn ? (
          <div className="bg-surface border border-borderStrong rounded-xl p-8 text-center shadow-sm">
            <p className="text-textSecond mb-4">Sign in to upload your watch photos</p>
            <SignInButton mode="modal">
              <button className="px-6 py-3 bg-accent hover:bg-accentHover text-white rounded-lg font-medium transition-colors">
                Sign in to upload
              </button>
            </SignInButton>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Watch Name — free text with DB suggestions */}
            <div className="relative">
              <label className="block text-sm font-medium text-textSecond mb-2">
                Watch name
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={search}
                  onChange={handleSearchChange}
                  onFocus={() => {
                    if (search.trim().length >= 2) setShowDropdown(true)
                  }}
                  placeholder="e.g. Rolex Submariner, Casio G-Shock..."
                  className="w-full bg-surface border border-borderStrong rounded-lg px-4 py-3 pr-10 text-textPrimary placeholder-textMuted focus:outline-none focus:border-accent shadow-sm"
                />
                {/* Clear button */}
                {search && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearch('')
                      setSelectedWatch(null)
                      setShowDropdown(false)
                      setHighlightedIndex(-1)
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-textMuted hover:text-textPrimary"
                    aria-label="Clear"
                  >
                    ×
                  </button>
                )}
              </div>
              {/* Selected from DB indicator */}
              {selectedWatch && (
                <p className="mt-1 text-xs text-accent">
                  ✓ Matched in database
                </p>
              )}
              {/* Dropdown suggestions */}
              {showDropdown && search.trim().length >= 2 && (
                <>
                  {filtered.length > 0 ? (
                    <ul
                      ref={dropdownRef}
                      className="absolute z-10 w-full mt-1 bg-surface border border-borderStrong rounded-lg max-h-60 overflow-y-auto shadow-md"
                    >
                      {Object.entries(groupedResults).map(([brand, brandWatches]) => {
                        let itemIndex = 0
                        for (const [b] of Object.entries(groupedResults)) {
                          if (b === brand) break
                          itemIndex += groupedResults[b].length
                        }
                        return (
                          <li key={brand}>
                            <div className="sticky top-0 bg-neutral px-4 py-2 text-xs font-semibold text-textSecond uppercase tracking-wider">
                              {brand}
                            </div>
                            {brandWatches.map((w) => {
                              const currentIndex = itemIndex
                              itemIndex += 1
                              const isHighlighted = highlightedIndex === currentIndex
                              return (
                                <button
                                  key={w.slug}
                                  type="button"
                                  onClick={() => selectWatch(w)}
                                  className={`w-full text-left px-4 py-2 transition-colors ${
                                    isHighlighted
                                      ? 'bg-accent text-white'
                                      : 'text-textSecond hover:bg-neutral hover:text-textPrimary'
                                  }`}
                                >
                                  <span className="font-medium">
                                    {highlightMatch(w.brand, search)}
                                  </span>{' '}
                                  <span className={isHighlighted ? 'text-white' : 'text-textMuted'}>
                                    {highlightMatch(w.name, search)}
                                  </span>
                                </button>
                              )
                            })}
                          </li>
                        )
                      })}
                    </ul>
                  ) : (
                    <div className="absolute z-10 w-full mt-1 bg-surface border border-borderStrong rounded-lg p-3 text-sm text-textMuted shadow-md">
                      No matches in our database — that&apos;s fine, we&apos;ll add it.
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Photo Upload — always visible */}
            <div>
              <label className="block text-sm font-medium text-textSecond mb-2">
                Photo
              </label>
              <div
                ref={dropzoneRef}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileRef.current?.click()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
                  isDragging
                    ? 'border-accent bg-accent/5'
                    : 'border-borderStrong hover:border-accent'
                }`}
              >
                {preview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={preview}
                    alt="Preview"
                    className="max-h-64 mx-auto rounded-lg"
                  />
                ) : (
                  <div>
                    <div className="text-4xl mb-2">📷</div>
                    <p className="text-textMuted mb-1">
                      {isDragging ? 'Drop your photo here' : 'Drag & drop or click to select'}
                    </p>
                    <p className="text-textMuted text-sm">JPEG, PNG, or WebP · Max 5MB</p>
                  </div>
                )}
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {/* Caption — always visible */}
            <div>
              <label className="block text-sm font-medium text-textSecond mb-2">
                Caption <span className="text-textMuted">(optional)</span>
              </label>
              <input
                type="text"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="e.g. 7.25 inch wrist, daily wear for 2 years"
                maxLength={200}
                className="w-full bg-surface border border-borderStrong rounded-lg px-4 py-3 text-textPrimary placeholder-textMuted focus:outline-none focus:border-accent shadow-sm"
              />
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            {/* Submit — disabled until watch name AND photo are provided */}
            <button
              type="submit"
              disabled={!search.trim() || !file || uploading}
              className="w-full py-3 bg-accent hover:bg-accentHover disabled:bg-neutral disabled:text-textMuted text-white rounded-lg font-medium transition-colors"
            >
              {uploading ? 'Uploading...' : 'Upload Photo'}
            </button>
          </form>
        )}
      </div>
    </main>
  )
}
