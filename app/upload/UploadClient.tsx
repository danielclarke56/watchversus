'use client'

import { useState, useRef, useMemo, useEffect, useCallback } from 'react'
import { useUser, SignInButton } from '@clerk/nextjs'
import Link from 'next/link'
import { watches } from '@/lib/watches'
import type { Watch } from '@/lib/types'

function toSlug(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

interface PhotoQuality {
  score: string
  issues: string[]
  recommendation: string | null
}

const MOVEMENT_OPTIONS = ['Automatic', 'Mechanical', 'Quartz', 'Digital']
const WRIST_SIZE_OPTIONS = ['Under 6"', '6"', '6.5"', '7"', '7.5"', '8"', 'Over 8"']

const MAX_PHOTOS = 3

export default function UploadClient() {
  const { isSignedIn, isLoaded } = useUser()
  const [success, setSuccess] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedWatch, setSelectedWatch] = useState<Watch | null>(null)
  const [showDropdown, setShowDropdown] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [brandName, setBrandName] = useState('')
  const [modelName, setModelName] = useState('')
  const [referenceNumber, setReferenceNumber] = useState('')
  const [movement, setMovement] = useState('')
  const [caseSize, setCaseSize] = useState('')
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
  const [notAWatch, setNotAWatch] = useState(false)
  const [successPreviews, setSuccessPreviews] = useState<string[]>([])
  const [editingSlotIndex, setEditingSlotIndex] = useState<number>(-1)
  const fileRef = useRef<HTMLInputElement>(null)
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
              if (data.watch.brand) setBrandName(data.watch.brand)
              if (data.watch.model) setModelName(data.watch.model)
              if (data.watch.reference) setReferenceNumber(data.watch.reference)
              const suggestion = [data.watch.brand, data.watch.model]
                .filter(Boolean)
                .join(' ')
              setSearch(suggestion)
              const match = findMatchingWatch(data.watch.brand, data.watch.model)
              if (match) {
                selectWatch(match)
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
              if (data.watch.brand) setBrandName(data.watch.brand)
              if (data.watch.model) setModelName(data.watch.model)
              if (data.watch.reference) setReferenceNumber(data.watch.reference)
              const suggestion = [data.watch.brand, data.watch.model]
                .filter(Boolean)
                .join(' ')
              setSearch(suggestion)
              const match = findMatchingWatch(data.watch.brand, data.watch.model)
              if (match) {
                selectWatch(match)
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
    const resolvedWatchId = selectedWatch?.slug || toSlug(`${brandName} ${modelName}`)
    if (!resolvedWatchId || files.length === 0) return
    setUploading(true)
    setError('')

    try {
      for (let i = 0; i < files.length; i++) {
        setUploadProgress(`Uploading ${i + 1} of ${files.length}...`)
        const formData = new FormData()
        formData.append('photo', files[i])
        if (brandName.trim()) formData.append('brandName', brandName.trim())
        if (modelName.trim()) formData.append('modelName', modelName.trim())
        if (referenceNumber.trim()) formData.append('referenceNumber', referenceNumber.trim())
        if (movement) formData.append('movement', movement)
        if (caseSize.trim()) formData.append('caseSize', caseSize.trim())
        if (wristSize) formData.append('wristSize', wristSize)

        const res = await fetch(`/api/photos/${resolvedWatchId}`, {
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

  const isFormValid = files.length > 0 && brandName.trim().length > 0

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
                  setBrandName('')
                  setModelName('')
                  setReferenceNumber('')
                  setMovement('')
                  setCaseSize('')
                  setWristSize('')
                  setError('')
                  setAiSuggestion(null)
                  setNotAWatch(false)
                  setPhotoQualities([])
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

            {/* AI identification indicator */}
            {aiSuggestion && !notAWatch && (aiSuggestion.confidence === 'high' || aiSuggestion.confidence === 'medium') && (
              <div className="bg-accent/10 border border-accent/30 rounded-lg p-3">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm text-textPrimary">
                    {'\u2728'} AI identified:{' '}
                    <span className="font-bold">
                      {[aiSuggestion.brand, aiSuggestion.model]
                        .filter(Boolean)
                        .join(' ')}
                      {aiSuggestion.reference && ` (${aiSuggestion.reference})`}
                    </span>
                    <span className="text-xs text-textMuted ml-2">
                      ({aiSuggestion.confidence} confidence)
                    </span>
                  </p>
                  <button
                    type="button"
                    onClick={() => setAiSuggestion(null)}
                    className="px-3 py-1 text-xs text-textMuted hover:text-textPrimary font-medium transition-colors shrink-0"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            )}

            {/* Section 2: Watch Details */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-textSecond uppercase tracking-wide">Watch Details</h3>

              {/* Brand name */}
              <div>
                <label className="block text-sm font-medium text-textSecond mb-2">
                  Brand <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  placeholder="e.g. Rolex, Omega, Seiko"
                  maxLength={80}
                  className="w-full bg-surface border border-borderStrong rounded-lg px-4 py-3 text-textPrimary placeholder-textMuted focus:outline-none focus:border-accent shadow-sm"
                />
              </div>

              {/* Model name */}
              <div>
                <label className="block text-sm font-medium text-textSecond mb-2">
                  Model <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={modelName}
                  onChange={(e) => setModelName(e.target.value)}
                  placeholder="e.g. Submariner, Speedmaster, SKX007"
                  maxLength={100}
                  className="w-full bg-surface border border-borderStrong rounded-lg px-4 py-3 text-textPrimary placeholder-textMuted focus:outline-none focus:border-accent shadow-sm"
                />
              </div>

              {/* Reference number */}
              <div>
                <label className="block text-sm font-medium text-textSecond mb-2">
                  Reference number <span className="text-textMuted">(optional)</span>
                </label>
                <input
                  type="text"
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                  placeholder="e.g. 126610LN, 311.30.42.30.01.005"
                  maxLength={60}
                  className="w-full bg-surface border border-borderStrong rounded-lg px-4 py-3 text-textPrimary placeholder-textMuted focus:outline-none focus:border-accent shadow-sm"
                />
              </div>

              {/* Movement */}
              <div>
                <label className="block text-sm font-medium text-textSecond mb-2">
                  Movement <span className="text-textMuted">(optional)</span>
                </label>
                <select
                  value={movement}
                  onChange={(e) => setMovement(e.target.value)}
                  className="w-full bg-surface border border-borderStrong rounded-lg px-4 py-3 text-textPrimary focus:outline-none focus:border-accent shadow-sm"
                >
                  <option value="">Select movement</option>
                  {MOVEMENT_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              {/* Case size */}
              <div>
                <label className="block text-sm font-medium text-textSecond mb-2">
                  Case size <span className="text-textMuted">(optional)</span>
                </label>
                <input
                  type="text"
                  value={caseSize}
                  onChange={(e) => setCaseSize(e.target.value)}
                  placeholder="e.g. 40mm"
                  maxLength={20}
                  className="w-full bg-surface border border-borderStrong rounded-lg px-4 py-3 text-textPrimary placeholder-textMuted focus:outline-none focus:border-accent shadow-sm"
                />
              </div>

              {/* Wrist size */}
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
                  {WRIST_SIZE_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {/* Upload progress */}
            {uploadProgress && (
              <div className="text-sm text-textMuted">
                {uploadProgress}
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={!isFormValid || uploading}
              className={`w-full py-3 rounded-lg font-medium transition-colors ${
                isFormValid && !uploading
                  ? 'bg-accent hover:bg-accentHover text-white cursor-pointer'
                  : 'bg-neutral text-textMuted cursor-not-allowed'
              }`}
            >
              {uploading ? 'Uploading...' : 'Submit photo'}
            </button>
          </form>
        )}
      </div>
    </main>
  )
}
