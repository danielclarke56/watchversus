'use client'

import { useState, useRef, useMemo, useEffect } from 'react'
import { useUser, SignInButton } from '@clerk/nextjs'
import Link from 'next/link'
import imageCompression from 'browser-image-compression'
import { watches } from '@/lib/watches'
import type { Watch } from '@/lib/types'
import CropModal from './CropModal'

function toSlug(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

const MOVEMENT_OPTIONS = ['Automatic', 'Mechanical', 'Quartz', 'Digital']
const WRIST_SIZE_OPTIONS = ['Under 6"', '6"', '6.5"', '7"', '7.5"', '8"', 'Over 8"']
const PRODUCTION_YEAR_OPTIONS = [
  ...Array.from({ length: new Date().getFullYear() - 1949 }, (_, i) => String(new Date().getFullYear() - i)),
]

const ESTIMATED_PRICE_OPTIONS = [
  'Under $500',
  '$500 – $1,000',
  '$1,000 – $5,000',
  '$5,000 – $15,000',
  '$15,000 – $50,000',
  '$50,000+',
  'Prefer not to say',
]

const MAX_PHOTOS = 3

interface AiCandidate {
  brand: string
  model: string
  reference: string | null
  movement: string | null
  caseSize: string | null
  wristSize: string | null
  estimatedPrice: string | null
  productionYear: string | null
  lugToLug: string | null
  betweenLugs: string | null
  thickness: string | null
  waterResistance: string | null
  confidence: 'high' | 'medium' | 'low'
  reasoning: string
}

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
  const [estimatedPrice, setEstimatedPrice] = useState('')
  const [productionYear, setProductionYear] = useState('')
  const [lugToLug, setLugToLug] = useState('')
  const [betweenLugs, setBetweenLugs] = useState('')
  const [thickness, setThickness] = useState('')
  const [waterResistance, setWaterResistance] = useState('')
  const [uploading, setUploading] = useState(false)
  const [compressing, setCompressing] = useState(false)
  const [uploadProgress, setUploadProgress] = useState('')
  const [error, setError] = useState('')
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const [isDragging, setIsDragging] = useState(false)
  const [successPreviews, setSuccessPreviews] = useState<string[]>([])
  const [editingSlotIndex, setEditingSlotIndex] = useState<number>(-1)
  const [pendingCrop, setPendingCrop] = useState<{ src: string; file: File; slotIndex: number } | null>(null)
  const [identifying, setIdentifying] = useState(false)
  const [isWatch, setIsWatch] = useState<boolean | null>(null)
  const [aiGenerated, setAiGenerated] = useState<boolean | null>(null)
  const [aiIdentified, setAiIdentified] = useState(false)
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

  // Compress image to target max 2400px on longest side, 85% quality, max output 3MB
  const compressImage = async (file: File): Promise<File> => {
    try {
      const options = {
        maxSizeMB: 3,
        maxWidthOrHeight: 2400,
        useWebWorker: true,
        fileType: 'image/webp',
        initialQuality: 0.85,
      }
      const compressedBlob = await imageCompression(file, options)
      return new File([compressedBlob], file.name, { type: 'image/webp' })
    } catch (err) {
      console.error('Compression failed:', err)
      return file
    }
  }

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

  async function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return

    // Validation
    if (f.size > 20 * 1024 * 1024) {
      setError('File must be under 20MB')
      return
    }
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/avif'].includes(f.type)) {
      setError('Only JPEG, PNG, WebP, or AVIF images are allowed')
      return
    }
    setError('')

    const slotIndex = editingSlotIndex >= 0 && editingSlotIndex < files.length ? editingSlotIndex : -1
    setEditingSlotIndex(-1)
    if (fileRef.current) fileRef.current.value = ''

    // Compress image before processing
    setCompressing(true)
    const compressedFile = await compressImage(f)
    setCompressing(false)

    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = reader.result as string
      if (slotIndex >= 0) {
        // Replace existing slot
        setFiles((prev) => {
          const next = [...prev]
          next[slotIndex] = compressedFile
          return next
        })
        setPreviews((prev) => {
          const next = [...prev]
          next[slotIndex] = dataUrl
          return next
        })
        // Reset AI state when photo is replaced
        if (slotIndex === 0) {
          setIsWatch(null)
          setAiGenerated(null)
          setAiIdentified(false)
        }
      } else {
        // Add new
        if (files.length < MAX_PHOTOS) {
          setFiles((prev) => [...prev, compressedFile])
          setPreviews((prev) => [...prev, dataUrl])
        }
      }
    }
    reader.readAsDataURL(compressedFile)
  }

  function handleCropConfirm(croppedFile: File, croppedDataUrl: string) {
    if (!pendingCrop) return
    if (pendingCrop.slotIndex >= 0) {
      // Replace existing slot
      setFiles((prev) => {
        const next = [...prev]
        next[pendingCrop.slotIndex] = croppedFile
        return next
      })
      setPreviews((prev) => {
        const next = [...prev]
        next[pendingCrop.slotIndex] = croppedDataUrl
        return next
      })
      // Reset AI state when slot 0 is cropped/replaced
      if (pendingCrop.slotIndex === 0) {
        setIsWatch(null)
        setAiGenerated(null)
        setAiIdentified(false)
      }
    } else {
      // Add new
      if (files.length >= MAX_PHOTOS) return
      setFiles((prev) => [...prev, croppedFile])
      setPreviews((prev) => [...prev, croppedDataUrl])
    }
    setPendingCrop(null)
  }

  function handleCropCancel() {
    setPendingCrop(null)
  }

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index))
    setPreviews((prev) => prev.filter((_, i) => i !== index))
    // Clear identification if slot 0 is removed
    if (index === 0) {
      setIsWatch(null)
      setAiGenerated(null)
    }
  }

  async function identify(file: File) {
    setIdentifying(true)
    setIsWatch(null)
    setAiGenerated(null)
    try {
      const formData = new FormData()
      formData.append('photo', file)
      const res = await fetch('/api/photos/identify', {
        method: 'POST',
        body: formData,
      })
      if (!res.ok) throw new Error('Identification failed')
      const data = await res.json()
      setIsWatch(data.isWatch)
      setAiGenerated(data.isAiGenerated)
      // Auto-apply top candidate
      if (data.candidates && Array.isArray(data.candidates) && data.candidates.length > 0) {
        applyCandidate(data.candidates[0])
        setAiIdentified(true)
      }
    } catch (err: unknown) {
      console.error('Identification error:', err)
      setIsWatch(true) // assume it's a watch if API fails
    } finally {
      setIdentifying(false)
    }
  }

  function applyCandidate(candidate: AiCandidate) {
    setBrandName(candidate.brand || '')
    setModelName(candidate.model || '')
    setReferenceNumber(candidate.reference || '')
    setMovement(candidate.movement || '')
    setCaseSize(candidate.caseSize || '')
    setWristSize(candidate.wristSize || '')
    setEstimatedPrice(candidate.estimatedPrice || '')
    setProductionYear(candidate.productionYear || '')
    setLugToLug(candidate.lugToLug || '')
    setBetweenLugs(candidate.betweenLugs || '')
    setThickness(candidate.thickness || '')
    setWaterResistance(candidate.waterResistance || '')
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

  async function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    const f = e.dataTransfer.files?.[0]
    if (!f) return

    // Validation
    if (f.size > 20 * 1024 * 1024) {
      setError('File must be under 20MB')
      return
    }
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/avif'].includes(f.type)) {
      setError('Only JPEG, PNG, WebP, or AVIF images are allowed')
      return
    }
    setError('')

    // Compress image before processing
    setCompressing(true)
    const compressedFile = await compressImage(f)
    setCompressing(false)

    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = reader.result as string
      if (files.length < MAX_PHOTOS) {
        setFiles((prev) => [...prev, compressedFile])
        setPreviews((prev) => [...prev, dataUrl])
      }
    }
    reader.readAsDataURL(compressedFile)
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
        if (estimatedPrice) formData.append('estimatedPrice', estimatedPrice)
        if (productionYear) formData.append('productionYear', productionYear)
        if (lugToLug.trim()) formData.append('lugToLug', lugToLug.trim())
        if (betweenLugs.trim()) formData.append('betweenLugs', betweenLugs.trim())
        if (thickness.trim()) formData.append('thickness', thickness.trim())
        if (waterResistance.trim()) formData.append('waterResistance', waterResistance.trim())

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

  const isFormValid = files.length > 0 && brandName.trim().length > 0 && isWatch !== false

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-surfaceAlt flex items-center justify-center">
        <div className="animate-pulse text-textMuted">Loading...</div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-surfaceAlt text-textPrimary">
      <div className="max-w-[80rem] mx-auto px-4 py-8 sm:py-16">
        <Link href="/" className="text-xs sm:text-sm text-textMuted hover:text-textPrimary mb-6 sm:mb-8 inline-block">
          &larr; Back to home
        </Link>

        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Upload Your Watch Photo</h1>
        <p className="text-textMuted mb-8 text-sm sm:text-base">
          Share a real wrist shot. Help others see how this watch looks in real life.
        </p>

        {!isSignedIn ? (
          <div className="bg-surface border border-borderStrong rounded-xl p-6 sm:p-8 text-center shadow-sm">
            <p className="text-textSecond mb-4 text-sm sm:text-base">Sign in to upload your watch photos</p>
            <SignInButton mode="modal">
              <button className="px-4 sm:px-6 py-2 sm:py-3 bg-accent hover:bg-accentHover text-white rounded-lg font-medium transition-colors text-sm sm:text-base w-full sm:w-auto">
                Sign in to upload
              </button>
            </SignInButton>
          </div>
        ) : success ? (
          <div className="bg-surface border border-borderStrong rounded-xl p-6 sm:p-8 text-center shadow-sm">
            {/* Success thumbnails */}
            {successPreviews.length > 0 && (
              <div className="flex justify-center gap-2 sm:gap-3 mb-4 flex-wrap">
                {successPreviews.map((src, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={i}
                    src={src}
                    className="w-24 sm:w-32 h-24 sm:h-32 object-cover rounded-xl"
                    alt={`Your submitted photo ${i + 1}`}
                  />
                ))}
              </div>
            )}
            <h2 className="text-xl sm:text-2xl font-bold text-textPrimary mb-4">
              {successPreviews.length > 1 ? 'Photos submitted!' : 'Photo submitted!'}
            </h2>
            <p className="text-textMuted mb-8 text-sm sm:text-base">
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
                  setEstimatedPrice('')
                  setProductionYear('')
                  setLugToLug('')
                  setBetweenLugs('')
                  setThickness('')
                  setWaterResistance('')
                  setError('')
                  setSuccessPreviews([])
                  setAiIdentified(false)
                }}
                className="px-6 py-3 bg-neutral hover:bg-neutral/80 text-textPrimary rounded-lg font-medium transition-colors"
              >
                Upload another
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            {/* LEFT COLUMN: Photo Upload */}
            <div className="space-y-6 min-h-[480px] flex flex-col">
              <div className="flex-1 flex flex-col">
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
                        className="max-h-80 mx-auto rounded-lg"
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
                      {/* Crop button */}
                      <button
                        type="button"
                        onClick={() => setPendingCrop({ src, file: files[i], slotIndex: i })}
                        className="absolute bottom-2 left-2 bg-white/80 text-xs px-2 py-1 rounded shadow hover:bg-white text-gray-700"
                      >
                        ✂️ Crop
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
                    className={`border-2 border-dashed rounded-lg p-6 sm:p-12 text-center cursor-pointer transition-all flex-1 flex flex-col items-center justify-center ${
                      isDragging
                        ? 'border-accent bg-accent/5'
                        : 'border-borderStrong hover:border-accent'
                    }`}
                  >
                    <div className="text-4xl sm:text-5xl mb-3">{'\uD83D\uDCF7'}</div>
                    <p className="text-textMuted mb-1 text-xs sm:text-sm">
                      {compressing ? 'Optimising image...' : isDragging ? 'Drop your photo here' : 'Drag & drop or click to select'}
                    </p>
                    <p className="text-textMuted text-xs sm:text-sm">JPEG, PNG, WebP, or AVIF &middot; Up to 20MB</p>
                  </div>
                ) : files.length < MAX_PHOTOS ? (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingSlotIndex(-1)
                      fileRef.current?.click()
                    }}
                    className="w-full border-2 border-dashed border-borderStrong hover:border-accent rounded-lg p-3 sm:p-4 text-center cursor-pointer transition-all text-textMuted hover:text-textPrimary text-xs sm:text-sm"
                  >
                    + Add another photo
                  </button>
                ) : null}

                <input
                  ref={fileRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  onChange={handleFileInput}
                  className="hidden"
                />
              </div>
            </div>

            {/* RIGHT COLUMN: Form Fields + Submit */}
            <div className="space-y-6">


              {/* AI Identification */}
              {files.length > 0 && (
                <>
                  {/* Opt-in AI auto-fill button */}
                  {!identifying && !aiIdentified && (
                    <button
                      type="button"
                      onClick={() => identify(files[0])}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-surface border border-borderStrong hover:border-accent rounded-lg text-sm font-medium text-textSecond hover:text-textPrimary transition-colors"
                    >
                      <span>✨</span>
                      <span>Auto-fill details with AI</span>
                    </button>
                  )}

                  {/* Loading spinner */}
                  {identifying && (
                    <div className="flex items-center justify-center gap-2 p-4 bg-surface border border-borderStrong rounded-lg">
                      <div className="animate-spin w-4 h-4 border-2 border-accent border-t-transparent rounded-full" />
                      <span className="text-textMuted text-sm">🔍 Identifying watch...</span>
                    </div>
                  )}

                  {/* Warning: Not a watch */}
                  {isWatch === false && (
                    <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg">
                      <p className="text-sm text-yellow-800 dark:text-yellow-200">
                        ⚠️ This doesn&apos;t look like a watch photo. Please verify the image and try again.
                      </p>
                    </div>
                  )}

                  {/* Warning: AI-Generated */}
                  {aiGenerated === true && (
                    <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg">
                      <p className="text-sm text-amber-800 dark:text-amber-200">
                        ⚠️ This photo may be AI-generated. AI-generated images won&apos;t be approved — please upload a real photo of your watch. You can still submit if you believe this is incorrect.
                      </p>
                    </div>
                  )}

                  {/* AI auto-fill notice */}
                  {aiIdentified && !identifying && (
                    <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
                      <span className="text-base leading-none mt-0.5">✨</span>
                      <p className="text-xs text-blue-800 dark:text-blue-200">
                        Details filled in by AI — please review and correct before submitting.
                      </p>
                    </div>
                  )}
                </>
              )}

              {/* Section 2: Watch Details - with disabled state when no files */}
              <div className={files.length === 0 ? 'opacity-40 pointer-events-none select-none' : ''}>
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-textSecond uppercase tracking-wide">Watch Details</h3>

                  {/* Brand name */}
                  <div>
                    <label className="block text-sm font-medium text-textSecond mb-2">
                      Brand <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={brandName}
                        onChange={(e) => setBrandName(e.target.value)}
                        placeholder="e.g. Rolex, Omega, Seiko"
                        maxLength={80}
                        className={`w-full bg-surface border border-borderStrong rounded-lg px-4 py-3 text-textPrimary placeholder-textMuted focus:outline-none focus:border-accent shadow-sm${aiIdentified && brandName ? ' pr-8' : ''}`}
                      />
                      {aiIdentified && brandName && (
                        <button type="button" onClick={() => setBrandName('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-textMuted hover:text-textPrimary text-base leading-none">×</button>
                      )}
                    </div>
                  </div>

                  {/* Model name */}
                  <div>
                    <label className="block text-sm font-medium text-textSecond mb-2">
                      Model <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={modelName}
                        onChange={(e) => setModelName(e.target.value)}
                        placeholder="e.g. Submariner, Speedmaster, SKX007"
                        maxLength={100}
                        className={`w-full bg-surface border border-borderStrong rounded-lg px-4 py-3 text-textPrimary placeholder-textMuted focus:outline-none focus:border-accent shadow-sm${aiIdentified && modelName ? ' pr-8' : ''}`}
                      />
                      {aiIdentified && modelName && (
                        <button type="button" onClick={() => setModelName('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-textMuted hover:text-textPrimary text-base leading-none">×</button>
                      )}
                    </div>
                  </div>

                  {/* Reference number */}
                  <div>
                    <label className="block text-sm font-medium text-textSecond mb-2">
                      Reference number <span className="text-textMuted">(optional)</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={referenceNumber}
                        onChange={(e) => setReferenceNumber(e.target.value)}
                        placeholder="e.g. 126610LN, 311.30.42.30.01.005"
                        maxLength={60}
                        className={`w-full bg-surface border border-borderStrong rounded-lg px-4 py-3 text-textPrimary placeholder-textMuted focus:outline-none focus:border-accent shadow-sm${aiIdentified && referenceNumber ? ' pr-8' : ''}`}
                      />
                      {aiIdentified && referenceNumber && (
                        <button type="button" onClick={() => setReferenceNumber('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-textMuted hover:text-textPrimary text-base leading-none">×</button>
                      )}
                    </div>
                  </div>

                  {/* Movement */}
                  <div>
                    <label className="block text-sm font-medium text-textSecond mb-2">
                      Movement <span className="text-textMuted">(optional)</span>
                    </label>
                    <div className="relative">
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
                      {aiIdentified && movement && (
                        <button type="button" onClick={() => setMovement('')} className="absolute right-8 top-1/2 -translate-y-1/2 text-textMuted hover:text-textPrimary text-base leading-none">×</button>
                      )}
                    </div>
                  </div>

                  {/* Case dimensions — 2-column grid (responsive on mobile) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-textSecond mb-2">
                        Case size <span className="text-textMuted">(optional)</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={caseSize}
                          onChange={(e) => setCaseSize(e.target.value)}
                          placeholder="e.g. 40mm"
                          maxLength={20}
                          className={`w-full bg-surface border border-borderStrong rounded-lg px-4 py-3 text-textPrimary placeholder-textMuted focus:outline-none focus:border-accent shadow-sm${aiIdentified && caseSize ? ' pr-8' : ''}`}
                        />
                        {aiIdentified && caseSize && (
                          <button type="button" onClick={() => setCaseSize('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-textMuted hover:text-textPrimary text-base leading-none">×</button>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-textSecond mb-2">
                        Lug-to-lug <span className="text-textMuted">(optional)</span>
                      </label>
                      <input
                        type="text"
                        value={lugToLug}
                        onChange={(e) => setLugToLug(e.target.value)}
                        placeholder="e.g. 47mm"
                        maxLength={20}
                        className="w-full bg-surface border border-borderStrong rounded-lg px-4 py-3 text-textPrimary placeholder-textMuted focus:outline-none focus:border-accent shadow-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-textSecond mb-2">
                        Lug width <span className="text-textMuted">(optional)</span>
                      </label>
                      <input
                        type="text"
                        value={betweenLugs}
                        onChange={(e) => setBetweenLugs(e.target.value)}
                        placeholder="e.g. 20mm"
                        maxLength={20}
                        className="w-full bg-surface border border-borderStrong rounded-lg px-4 py-3 text-textPrimary placeholder-textMuted focus:outline-none focus:border-accent shadow-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-textSecond mb-2">
                        Thickness <span className="text-textMuted">(optional)</span>
                      </label>
                      <input
                        type="text"
                        value={thickness}
                        onChange={(e) => setThickness(e.target.value)}
                        placeholder="e.g. 12.5mm"
                        maxLength={20}
                        className="w-full bg-surface border border-borderStrong rounded-lg px-4 py-3 text-textPrimary placeholder-textMuted focus:outline-none focus:border-accent shadow-sm"
                      />
                    </div>
                  </div>

                  {/* Water resistance */}
                  <div>
                    <label className="block text-sm font-medium text-textSecond mb-2">
                      Water resistance <span className="text-textMuted">(optional)</span>
                    </label>
                    <input
                      type="text"
                      value={waterResistance}
                      onChange={(e) => setWaterResistance(e.target.value)}
                      placeholder="e.g. 300m / 1000ft"
                      maxLength={40}
                      className="w-full bg-surface border border-borderStrong rounded-lg px-4 py-3 text-textPrimary placeholder-textMuted focus:outline-none focus:border-accent shadow-sm"
                    />
                  </div>

                  {/* Production year */}
                  <div>
                    <label className="block text-sm font-medium text-textSecond mb-2">
                      Production year <span className="text-textMuted">(optional)</span>
                    </label>
                    <select
                      value={productionYear}
                      onChange={(e) => setProductionYear(e.target.value)}
                      className="w-full bg-surface border border-borderStrong rounded-lg px-4 py-3 text-textPrimary focus:outline-none focus:border-accent shadow-sm"
                    >
                      <option value="">Select year</option>
                      {PRODUCTION_YEAR_OPTIONS.map((yr) => (
                        <option key={yr} value={yr}>{yr}</option>
                      ))}
                    </select>
                  </div>

                  {/* Personal fields — user-only */}
                  <h3 className="text-sm font-semibold text-textSecond uppercase tracking-wide pt-2">Your Details</h3>

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

                  {/* Estimated price */}
                  <div>
                    <label className="block text-sm font-medium text-textSecond mb-2">
                      Estimated value <span className="text-textMuted">(optional)</span>
                    </label>
                    <select
                      value={estimatedPrice}
                      onChange={(e) => setEstimatedPrice(e.target.value)}
                      className="w-full bg-surface border border-borderStrong rounded-lg px-4 py-3 text-textPrimary focus:outline-none focus:border-accent shadow-sm"
                    >
                      <option value="">Select estimated value</option>
                      {ESTIMATED_PRICE_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
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
              {files.length > 0 && (
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
              )}
            </div>
          </form>
        )}

        {/* Crop Modal */}
        {pendingCrop && (
          <CropModal
            imageSrc={pendingCrop.src}
            onConfirm={handleCropConfirm}
            onCancel={handleCropCancel}
          />
        )}
      </div>
    </main>
  )
}
