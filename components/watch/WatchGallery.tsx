'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { useUser, SignInButton } from '@clerk/nextjs'
import type { ApprovedPhoto } from '@/lib/photos'
import { PHOTOS_PER_PAGE, ACCEPTED_TYPES, MAX_FILE_SIZE } from '@/lib/photos'

interface WatchGalleryProps {
  watchId: string
  watchName: string
}

export default function WatchGallery({ watchId, watchName }: WatchGalleryProps) {
  const { isSignedIn, isLoaded } = useUser()
  const [photos, setPhotos] = useState<ApprovedPhoto[]>([])
  const [visibleCount, setVisibleCount] = useState(PHOTOS_PER_PAGE)
  const [lightbox, setLightbox] = useState<ApprovedPhoto | null>(null)
  const [showUpload, setShowUpload] = useState(false)
  const [uploadState, setUploadState] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [preview, setPreview] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  useEffect(() => {
    fetch(`/api/photos/${watchId}`)
      .then((r) => r.json())
      .then((data: ApprovedPhoto[]) => setPhotos(data))
      .catch(() => {})
  }, [watchId])

  // Close lightbox on Escape
  useEffect(() => {
    if (!lightbox) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightbox(null)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [lightbox])

  const navigateLightbox = useCallback(
    (direction: 1 | -1) => {
      if (!lightbox) return
      const idx = photos.findIndex((p) => p.id === lightbox.id)
      const next = idx + direction
      if (next >= 0 && next < photos.length) setLightbox(photos[next])
    },
    [lightbox, photos]
  )

  useEffect(() => {
    if (!lightbox) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') navigateLightbox(-1)
      if (e.key === 'ArrowRight') navigateLightbox(1)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [lightbox, navigateLightbox])

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setErrorMsg('Only JPEG, PNG, and WebP images are accepted.')
      return
    }
    if (file.size > MAX_FILE_SIZE) {
      setErrorMsg('Photo must be under 5 MB.')
      return
    }

    setErrorMsg('')
    setSelectedFile(file)
    setPreview(URL.createObjectURL(file))
  }

  function clearUpload() {
    setSelectedFile(null)
    if (preview) URL.revokeObjectURL(preview)
    setPreview(null)
    setErrorMsg('')
    setUploadState('idle')
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!selectedFile) return

    setUploadState('uploading')
    setErrorMsg('')

    const form = e.currentTarget
    const formData = new FormData()
    formData.append('photo', selectedFile)

    const caption = (form.elements.namedItem('caption') as HTMLInputElement)?.value?.trim()
    const wristSize = (form.elements.namedItem('wristSize') as HTMLInputElement)?.value?.trim()
    const strapBracelet = (form.elements.namedItem('strapBracelet') as HTMLInputElement)?.value?.trim()

    if (caption) formData.append('caption', caption)
    if (wristSize) formData.append('wristSize', wristSize)
    if (strapBracelet) formData.append('strapBracelet', strapBracelet)

    try {
      const res = await fetch(`/api/photos/${watchId}`, {
        method: 'POST',
        body: formData,
      })
      const data = (await res.json()) as { error?: string }
      if (!res.ok) {
        setErrorMsg(data.error ?? 'Upload failed.')
        setUploadState('error')
      } else {
        setUploadState('success')
      }
    } catch {
      setErrorMsg('Network error — please try again.')
      setUploadState('error')
    }
  }

  const visible = photos.slice(0, visibleCount)
  const hasMore = photos.length > visibleCount

  return (
    <section id="gallery" className="pb-10 border-b border-border scroll-mt-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-textPrimary">
            Community Photos
            {photos.length > 0 && (
              <span className="text-textMuted font-normal text-base ml-2">
                ({photos.length})
              </span>
            )}
          </h2>
          <p className="text-textSecond text-sm mt-1">
            Real photos from {watchName} owners
          </p>
        </div>
        <button
          onClick={() => setShowUpload(!showUpload)}
          className="btn-outline px-4 py-2 text-sm flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Photo
        </button>
      </div>

      {/* Upload Form */}
      {showUpload && (
        <div className="card p-6 mb-6">
          {!isLoaded ? null : !isSignedIn ? (
            <div className="text-center py-4">
              <p className="text-textSecond text-sm mb-3">Sign in to share your photos.</p>
              <SignInButton mode="modal">
                <button className="btn-outline px-6 py-2 text-sm">Sign In</button>
              </SignInButton>
            </div>
          ) : uploadState === 'success' ? (
            <div className="text-center py-6">
              <div className="text-accent text-3xl mb-3">&#10003;</div>
              <h3 className="text-textPrimary font-semibold mb-1">Photo submitted!</h3>
              <p className="text-textSecond text-sm mb-4">
                Your photo is pending approval and will appear shortly.
              </p>
              <button
                onClick={() => {
                  clearUpload()
                  setShowUpload(false)
                }}
                className="btn-outline px-4 py-2 text-sm"
              >
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h3 className="text-textPrimary font-semibold text-lg">
                Share Your {watchName}
              </h3>

              {/* Drop zone / file picker */}
              {!preview ? (
                <label className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-border rounded-sm cursor-pointer hover:border-accent transition-colors bg-surfaceAlt">
                  <svg className="w-10 h-10 text-textMuted mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-textSecond text-sm font-medium">Click to select a photo</p>
                  <p className="text-textMuted text-xs mt-1">JPEG, PNG, or WebP — max 5 MB</p>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </label>
              ) : (
                <div className="relative">
                  <div className="relative h-64 bg-surfaceAlt rounded-sm overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={preview}
                      alt="Preview"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={clearUpload}
                    className="absolute top-2 right-2 w-8 h-8 bg-surface/90 rounded-full flex items-center justify-center text-textSecond hover:text-textPrimary transition-colors"
                  >
                    &times;
                  </button>
                </div>
              )}

              {/* Metadata fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-textSecond text-sm mb-1">
                    Wrist size <span className="text-textMuted">(optional)</span>
                  </label>
                  <input
                    name="wristSize"
                    type="text"
                    placeholder="e.g. 7 inches"
                    className="w-full bg-surfaceAlt border border-border rounded-sm px-3 py-2 text-textPrimary placeholder-textMuted text-sm focus:outline-none focus:border-accent transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-textSecond text-sm mb-1">
                    Strap / bracelet <span className="text-textMuted">(optional)</span>
                  </label>
                  <input
                    name="strapBracelet"
                    type="text"
                    placeholder="e.g. OEM bracelet, leather NATO"
                    className="w-full bg-surfaceAlt border border-border rounded-sm px-3 py-2 text-textPrimary placeholder-textMuted text-sm focus:outline-none focus:border-accent transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="block text-textSecond text-sm mb-1">
                  Caption <span className="text-textMuted">(optional)</span>
                </label>
                <input
                  name="caption"
                  type="text"
                  maxLength={120}
                  placeholder="A note about this photo..."
                  className="w-full bg-surfaceAlt border border-border rounded-sm px-3 py-2 text-textPrimary placeholder-textMuted text-sm focus:outline-none focus:border-accent transition-colors"
                />
              </div>

              {errorMsg && <p className="text-red-500 text-sm">{errorMsg}</p>}

              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={!selectedFile || uploadState === 'uploading'}
                  className="btn-gold px-6 py-2.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploadState === 'uploading' ? 'Uploading...' : 'Submit Photo'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    clearUpload()
                    setShowUpload(false)
                  }}
                  className="text-textSecond text-sm hover:text-textPrimary transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Gallery Grid */}
      {photos.length === 0 ? (
        <div className="card p-8 text-center">
          <div className="text-4xl mb-3 text-textMuted">📷</div>
          <p className="text-textPrimary font-semibold mb-1">No photos yet</p>
          <p className="text-textSecond text-sm mb-4">
            Be the first to share a photo of your {watchName}.
          </p>
          {!showUpload && (
            <button
              onClick={() => setShowUpload(true)}
              className="btn-outline px-6 py-2 text-sm"
            >
              Add the First Photo
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {visible.map((photo) => (
              <button
                key={photo.id}
                onClick={() => setLightbox(photo)}
                className="group relative aspect-square bg-surfaceAlt rounded-sm overflow-hidden border border-border hover:border-borderStrong transition-colors"
              >
                <Image
                  src={photo.url}
                  alt={photo.caption || `${watchName} by ${photo.userName}`}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-end">
                  <div className="w-full p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-white text-xs font-medium truncate">
                      {photo.userName}
                    </p>
                    {photo.wristSize && (
                      <p className="text-white/70 text-[10px]">{photo.wristSize} wrist</p>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {hasMore && (
            <div className="text-center mt-4">
              <button
                onClick={() => setVisibleCount((p) => p + PHOTOS_PER_PAGE)}
                className="btn-outline px-6 py-2 text-sm"
              >
                Show More ({photos.length - visibleCount} remaining)
              </button>
            </div>
          )}
        </>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <div
            className="relative max-w-4xl w-full max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setLightbox(null)}
              className="absolute -top-10 right-0 text-white/70 hover:text-white text-2xl z-10"
            >
              &times;
            </button>

            {/* Image */}
            <div className="relative flex-1 min-h-0 bg-black rounded-sm overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={lightbox.url}
                alt={lightbox.caption || `${watchName} by ${lightbox.userName}`}
                className="w-full h-full max-h-[75vh] object-contain"
              />

              {/* Navigation arrows */}
              {photos.indexOf(lightbox) > 0 && (
                <button
                  onClick={() => navigateLightbox(-1)}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors"
                >
                  ‹
                </button>
              )}
              {photos.indexOf(lightbox) < photos.length - 1 && (
                <button
                  onClick={() => navigateLightbox(1)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors"
                >
                  ›
                </button>
              )}
            </div>

            {/* Metadata bar */}
            <div className="bg-surface rounded-b-sm px-5 py-3 flex items-center gap-4 flex-wrap">
              <span className="text-textPrimary text-sm font-semibold">
                {lightbox.userName}
              </span>
              {lightbox.wristSize && (
                <span className="text-xs bg-accentLight text-textSecond px-2 py-0.5 rounded-full">
                  {lightbox.wristSize} wrist
                </span>
              )}
              {lightbox.strapBracelet && (
                <span className="text-xs bg-accentLight text-textSecond px-2 py-0.5 rounded-full">
                  {lightbox.strapBracelet}
                </span>
              )}
              {lightbox.caption && (
                <p className="text-textSecond text-sm flex-1 min-w-0">
                  {lightbox.caption}
                </p>
              )}
              <span className="text-textMuted text-xs ml-auto">
                {new Date(lightbox.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
