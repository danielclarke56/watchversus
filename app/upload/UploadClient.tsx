'use client'

import { useState, useRef, useMemo, useEffect, useCallback } from 'react'
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

interface PhotoQuality {
  score: string
  issues: string[]
  recommendation: string | null
}

const WRIST_SIZE_OPTIONS = [
  '',
  'Under 6.5 in',
  '6.5 in',
  '7 in',
  '7.5 in',
  '8 in',
  'Over 8 in',
]

const MAX_PHOTOS = 3

export default function UploadClient() {
  const { isSignedIn, isLoaded } = useUser()
  const [success, setSuccess] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedWatch, setSelectedWatch] = useState<Watch | null>(null)
  const [showDropdown, setShowDropdown] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [caption, setCaption] = useState('')
  const [wristSize, setWristSize] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState('')
  const [error, setError] = useState('')
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const [isDragging, setIsDragging] = useState(false)
  const [identifying, setIdentifying] = useState(false)
  const [aiSuggestion, setAiSuggestion] = useState<{
    brand: string | null
    model: string | null
    reference: string | null
    confidence: string
  } | null>(null)
  const [photoQualities, setPhotoQualities] = useState<(PhotoQuality | null)[]>([])
  const [confirmPoorQuality, setConfirmPoorQuality] = useState(false)
  const [notAWatch, setNotAWatch] = useState(false)
  const [successPreviews, setSuccessPreviews] = useState<string[]>([])
  const [editingSlotIndex, setEditingSlotIndex] = useState<number>(-1)
  const fileRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLUListElement>(null)

  const hasPoorPhoto = photoQualities.some((q) => q?.score === 'poor')

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

  function findMatchingWatch(brand: string | null, model: string | null): Watch | null {
    if (!brand && !model) return null
    const searchStr = [brand, model].filter(Boolean).join(' ').toLowerCase()
    return (
      watches.find((w) => {
        const full = `${w.brand} ${w.name}`.toLowerCase()
        return full === searchStr
      }) ||
      watches.find((w) => {
        const wBrand = w.brand.toLowerCase()
        const wName = w.name.toLowerCase()
        return (
          (brand && wBrand === brand.toLowerCase() && model && wName.includes(model.toLowerCase())) ||
          (brand && wBrand === brand.toLowerCase() && model && model.toLowerCase().includes(wName))
        )
      }) ||
      null
    )
  }

  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
    setSearch(val)
    setSelectedWatch(null)
    setShowDropdown(true)
    setHighlightedIndex(-1)
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    if (editingSlotIndex >= 0 && editingSlotIndex < files.length) {
      replaceFile(editingSlotIndex, f)
    } else {
      addFile(f)
    }
    setEditingSlotIndex(-1)
    // Reset input so the same file can be re-selected
    if (fileRef.current) fileRef.current.value = ''
  }

  const runQualityCheck = useCallback((file: File, index: number) => {
    const identifyForm = new FormData()
    identifyForm.append('photo', file)

    fetch('/api/photos/identify', {
      method: 'POST',
      body: identifyForm,
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.quality) {
          setPhotoQualities((prev) => {
            const next = [...prev]
            next[index] = data.quality as PhotoQuality
            return next
          })
        }
      })
      .catch(() => {
        // Silent fail
      })
  }, [])

  function addFile(f: File) {
    if (files.length >= MAX_PHOTOS) return
    if (f.size > 5 * 1024 * 1024) {
      setError('File must be under 5MB')
      return
    }
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(f.type)) {
      setError('Only JPEG, PNG, or WebP images are allowed')
      return
    }
    setError('')
    setConfirmPoorQuality(false)

    const newIndex = files.length
    const isFirst = newIndex === 0

    setFiles((prev) => [...prev, f])
    setPhotoQualities((prev) => [...prev, null])

    const reader = new FileReader()
    reader.onload = () => {
      setPreviews((prev) => [...prev, reader.result as string])
    }
    reader.readAsDataURL(f)

    if (isFirst) {
      // Run AI identification + quality on first photo
      setIdentifying(true)
      setAiSuggestion(null)
      setNotAWatch(false)

      const identifyForm = new FormData()
      identifyForm.append('photo', f)

      fetch('/api/photos/identify', {
        method: 'POST',
        body: identifyForm,
      })
        .then((r) => r.json())
        .then((data) => {
          if (data.isWatch === false) {
            setNotAWatch(true)
          } else {
            setNotAWatch(false)
            if (data.watch && (data.watch.brand || data.watch.model)) {
              setAiSuggestion(data.watch)
              const suggestion = [data.watch.brand, data.watch.model]
                .filter(Boolean)
                .join(' ')
              if (!search.trim()) {
                setSearch(suggestion)
                // Also try to match a DB watch
                const match = findMatchingWatch(data.watch.brand, data.watch.model)
                if (match) {
                  selectWatch(match)
                }
              }
            }
          }
          if (data.quality) {
            setPhotoQualities((prev) => {
              const next = [...prev]
              next[0] = data.quality as PhotoQuality
              return next
            })
          }
        })
        .catch(() => {
          // Silent fail
        })
        .finally(() => setIdentifying(false))
    } else {
      // Quality check only for subsequent photos
      runQualityCheck(f, newIndex)
    }
  }

  function replaceFile(index: number, f: File) {
    if (f.size > 5 * 1024 * 1024) {
      setError('File must be under 5MB')
      return
    }
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(f.type)) {
      setError('Only JPEG, PNG, or WebP images are allowed')
      return
    }
    setError('')
    setConfirmPoorQuality(false)

    setFiles((prev) => {
      const next = [...prev]
      next[index] = f
      return next
    })
    setPhotoQualities((prev) => {
      const next = [...prev]
      next[index] = null
      return next
    })

    const reader = new FileReader()
    reader.onload = () => {
      setPreviews((prev) => {
        const next = [...prev]
        next[index] = reader.result as string
        return next
      })
    }
    reader.readAsDataURL(f)

    if (index === 0) {
      // Re-run AI identification + quality on first photo
      setIdentifying(true)
      setAiSuggestion(null)
      setNotAWatch(false)

      const identifyForm = new FormData()
      identifyForm.append('photo', f)

      fetch('/api/photos/identify', {
        method: 'POST',
        body: identifyForm,
      })
        .then((r) => r.json())
        .then((data) => {
          if (data.isWatch === false) {
            setNotAWatch(true)
          } else {
            setNotAWatch(false)
            if (data.watch && (data.watch.brand || data.watch.model)) {
              setAiSuggestion(data.watch)
            }
          }
          if (data.quality) {
            setPhotoQualities((prev) => {
              const next = [...prev]
              next[0] = data.quality as PhotoQuality
              return next
            })
          }
        })
        .catch(() => {})
        .finally(() => setIdentifying(false))
    } else {
      runQualityCheck(f, index)
    }
  }

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index))
    setPreviews((prev) => prev.filter((_, i) => i !== index))
    setPhotoQualities((prev) => prev.filter((_, i) => i !== index))
    setConfirmPoorQuality(false)
    if (index === 0) {
      setAiSuggestion(null)
      setNotAWatch(false)
    }
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
    if (f) addFile(f)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const watchId = selectedWatch?.slug || slugify(search.trim())
    if (!watchId || files.length === 0) return
    setUploading(true)
    setError('')

    try {
      for (let i = 0; i < files.length; i++) {
        setUploadProgress(`Uploading ${i + 1} of ${files.length}...`)
        const formData = new FormData()
        formData.append('photo', files[i])
        if (caption.trim()) formData.append('caption', caption.trim())
        if (wristSize) formData.append('wristSize', wristSize)

        const res = await fetch(`/api/photos/${watchId}`, {
          method: 'POST',
          body: formData,
        })

        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          throw new Error(data.error || `Upload failed for photo ${i + 1}`)
        }
      }

      setSuccessPreviews([...previews])
      setSuccess(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Upload failed. Please try again.')
    } finally {
      setUploading(false)
      setUploadProgress('')
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
          &larr; Back to home
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
        ) : success ? (
          <div className="bg-surface border border-borderStrong rounded-xl p-8 text-center shadow-sm">
            {/* Success thumbnails */}
            {successPreviews.length > 0 && (
              <div className="flex justify-center gap-3 mb-4">
                {successPreviews.map((src, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={i}
                    src={src}
                    className="w-32 h-32 object-cover rounded-xl"
                    alt={`Your submitted photo ${i + 1}`}
                  />
                ))}
              </div>
            )}
            <h2 className="text-2xl font-bold text-textPrimary mb-4">
              {successPreviews.length > 1 ? 'Photos submitted!' : 'Photo submitted!'}
            </h2>
            <p className="text-textMuted mb-8">
              {successPreviews.length > 1
                ? 'Your images are being reviewed and will be approved soon. Thanks for contributing to the community.'
                : 'Your image is being reviewed and will be approved soon. Thanks for contributing to the community.'}
            </p>
            <div className="flex flex-col gap-3">
              <Link
                href="/"
                className="px-6 py-3 bg-accent hover:bg-accentHover text-white rounded-lg font-medium transition-colors inline-block text-center"
              >
                &larr; Back to home
              </Link>
              <button
                onClick={() => {
                  setSuccess(false)
                  setFiles([])
                  setPreviews([])
                  setSearch('')
                  setSelectedWatch(null)
                  setCaption('')
                  setWristSize('')
                  setError('')
                  setAiSuggestion(null)
                  setNotAWatch(false)
                  setPhotoQualities([])
                  setConfirmPoorQuality(false)
                  setSuccessPreviews([])
                }}
                className="px-6 py-3 bg-neutral hover:bg-neutral/80 text-textPrimary rounded-lg font-medium transition-colors"
              >
                Upload another
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 1. Photo Upload — FIRST */}
            <div>
              <label className="block text-sm font-medium text-textSecond mb-2">
                Photo{files.length > 0 && ` (${files.length}/${MAX_PHOTOS})`}
              </label>

              {/* Existing photo previews */}
              {previews.map((src, i) => (
                <div key={i} className="relative mb-3">
                  <div className="border-2 border-borderStrong rounded-lg p-2 relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={src}
                      alt={`Preview ${i + 1}`}
                      className="max-h-64 mx-auto rounded-lg"
                    />
                    {/* Remove button */}
                    <button
                      type="button"
                      onClick={() => removeFile(i)}
                      className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold shadow"
                      aria-label={`Remove photo ${i + 1}`}
                    >
                      &times;
                    </button>
                    {/* Change photo button */}
                    <button
                      type="button"
                      onClick={() => {
                        setEditingSlotIndex(i)
                        fileRef.current?.click()
                      }}
                      className="absolute bottom-2 right-2 bg-white/80 text-xs px-2 py-1 rounded shadow hover:bg-white text-gray-700"
                    >
                      Change photo
                    </button>
                  </div>
                  {/* Per-photo quality badge */}
                  {photoQualities[i] && (
                    <div
                      className={`mt-2 rounded-lg p-3 text-sm ${
                        photoQualities[i]?.score === 'good'
                          ? 'bg-green-50 border border-green-200 text-green-800'
                          : photoQualities[i]?.score === 'acceptable'
                            ? 'bg-yellow-50 border border-yellow-200 text-yellow-800'
                            : 'bg-red-50 border border-red-200 text-red-800'
                      }`}
                    >
                      {photoQualities[i]?.score === 'good' && (
                        <p className="font-medium">{'\u2713'} Good photo</p>
                      )}
                      {photoQualities[i]?.score === 'acceptable' && (
                        <div>
                          <p className="font-medium mb-1">{'\u26A0'} Acceptable photo</p>
                          {photoQualities[i]?.recommendation && (
                            <p className="text-xs opacity-90">{photoQualities[i]?.recommendation}</p>
                          )}
                        </div>
                      )}
                      {photoQualities[i]?.score === 'poor' && (
                        <div>
                          <p className="font-medium mb-1">{'\u2717'} Poor quality</p>
                          <p className="text-xs opacity-90 mb-1">
                            {photoQualities[i]?.issues && photoQualities[i]!.issues.length > 0
                              ? photoQualities[i]!.issues.join(', ')
                              : 'Issues detected'}
                          </p>
                          {photoQualities[i]?.recommendation && (
                            <p className="text-xs opacity-90">{photoQualities[i]?.recommendation}</p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {/* Dropzone for adding a new photo (shown if under max) */}
              {files.length === 0 ? (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => {
                    setEditingSlotIndex(-1)
                    fileRef.current?.click()
                  }}
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
                    isDragging
                      ? 'border-accent bg-accent/5'
                      : 'border-borderStrong hover:border-accent'
                  }`}
                >
                  <div className="text-4xl mb-2">{'\uD83D\uDCF7'}</div>
                  <p className="text-textMuted mb-1">
                    {isDragging ? 'Drop your photo here' : 'Drag & drop or click to select'}
                  </p>
                  <p className="text-textMuted text-sm">JPEG, PNG, or WebP &middot; Max 5MB</p>
                </div>
              ) : files.length < MAX_PHOTOS ? (
                <button
                  type="button"
                  onClick={() => {
                    setEditingSlotIndex(-1)
                    fileRef.current?.click()
                  }}
                  className="w-full border-2 border-dashed border-borderStrong hover:border-accent rounded-lg p-4 text-center cursor-pointer transition-all text-textMuted hover:text-textPrimary text-sm"
                >
                  + Add another photo
                </button>
              ) : null}

              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileInput}
                className="hidden"
              />
            </div>

            {/* Identifying spinner */}
            {identifying && (
              <div className="flex items-center gap-2 text-sm text-textMuted">
                <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-textMuted border-t-accent"></div>
                {'\uD83D\uDD0D'} Identifying watch...
              </div>
            )}

            {/* Not a watch error */}
            {notAWatch && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-800 font-medium">
                  {'\u26A0\uFE0F'} This doesn&apos;t look like a watch photo. Please upload a photo of a wristwatch.
                </p>
              </div>
            )}

            {/* AI suggestion banner */}
            {aiSuggestion && !notAWatch && (aiSuggestion.confidence === 'high' || aiSuggestion.confidence === 'medium') && (
              <div className="bg-accent/10 border border-accent/30 rounded-lg p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-textPrimary mb-1">
                      {'\u2728'} AI identified:{' '}
                      <span className="font-bold">
                        {[aiSuggestion.brand, aiSuggestion.model]
                          .filter(Boolean)
                          .join(' ')}
                        {aiSuggestion.reference && ` (${aiSuggestion.reference})`}
                      </span>
                    </p>
                    <p className="text-xs text-textMuted">
                      Confidence: {aiSuggestion.confidence}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const suggestion = [aiSuggestion.brand, aiSuggestion.model]
                          .filter(Boolean)
                          .join(' ')
                        setSearch(suggestion)
                        // Fix #3: Also match a DB watch
                        const match = findMatchingWatch(aiSuggestion.brand, aiSuggestion.model)
                        if (match) {
                          selectWatch(match)
                        }
                        setAiSuggestion(null)
                      }}
                      className="px-3 py-1 text-xs bg-accent hover:bg-accentHover text-white rounded font-medium transition-colors"
                    >
                      Use this
                    </button>
                    <button
                      type="button"
                      onClick={() => setAiSuggestion(null)}
                      className="px-3 py-1 text-xs text-textMuted hover:text-textPrimary font-medium transition-colors"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 2. Watch Name — free text with DB suggestions */}
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
                    &times;
                  </button>
                )}
              </div>
              {/* Selected from DB indicator */}
              {selectedWatch && (
                <p className="mt-1 text-xs text-accent">
                  {'\u2713'} Matched in database
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
                      No matches in our database &mdash; that&apos;s fine, we&apos;ll add it.
                    </div>
                  )}
                </>
              )}
            </div>

            {/* 3. Wrist size dropdown */}
            <div>
              <label className="block text-sm font-medium text-textSecond mb-2">
                Wrist size <span className="text-textMuted">(optional)</span>
              </label>
              <select
                value={wristSize}
                onChange={(e) => setWristSize(e.target.value)}
                className="w-full bg-surface border border-borderStrong rounded-lg px-4 py-3 text-textPrimary focus:outline-none focus:border-accent shadow-sm"
              >
                <option value="">Select wrist size</option>
                {WRIST_SIZE_OPTIONS.filter(Boolean).map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>

            {/* 4. Caption */}
            <div>
              <label className="block text-sm font-medium text-textSecond mb-2">
                Caption <span className="text-textMuted">(optional)</span>
              </label>
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value.slice(0, 200))}
                placeholder="e.g. Daily wear for 2 years, love the lume..."
                maxLength={200}
                rows={3}
                className="w-full bg-surface border border-borderStrong rounded-lg px-4 py-3 text-textPrimary placeholder-textMuted focus:outline-none focus:border-accent shadow-sm resize-none"
              />
              <p className="text-xs text-gray-400 text-right mt-1">
                {caption.length}/200
              </p>
            </div>

            {/* Quality gate: poor photo warning + checkbox */}
            {hasPoorPhoto && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-800 font-medium mb-2">
                  {'\u26A0'} One or more photos have poor quality and may be rejected.
                </p>
                <label className="flex items-start gap-2 text-sm text-red-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={confirmPoorQuality}
                    onChange={(e) => setConfirmPoorQuality(e.target.checked)}
                    className="mt-0.5"
                  />
                  I understand this photo may be rejected &mdash; submit anyway
                </label>
              </div>
            )}

            {error && <p className="text-red-500 text-sm">{error}</p>}

            {/* Submit */}
            <button
              type="submit"
              disabled={
                !search.trim() ||
                files.length === 0 ||
                uploading ||
                notAWatch ||
                (hasPoorPhoto && !confirmPoorQuality)
              }
              className="w-full py-3 bg-accent hover:bg-accentHover disabled:bg-neutral disabled:text-textMuted text-white rounded-lg font-medium transition-colors"
            >
              {uploading
                ? uploadProgress || 'Uploading...'
                : files.length > 1
                  ? `Upload ${files.length} Photos`
                  : 'Upload Photo'}
            </button>
          </form>
        )}
      </div>
    </main>
  )
}
