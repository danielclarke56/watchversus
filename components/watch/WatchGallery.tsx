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
  const [previews, setPreviews] = useState<string[]>([])
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [uploadedCount, setUploadedCount] = useState(0)

  useEffect(() => {
    fetch(`/api/photos/${watchId}`)
      .then((r) => r.json())
      .then((data: ApprovedPhoto[]) => setPhotos(data))
      .catch(() => {})
  }, [watchId])

  // Listen for hero button trigger
  useEffect(() => {
    function handleOpen() {
      setShowUpload(true)
    }
    window.addEventListener('open-photo-upload', handleOpen)
    return () => window.removeEventListener('open-photo-upload', handleOpen)
  }, [])

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
    const files = Array.from(e.target.files ?? [])
    if (files.length === 0) return

    const valid: File[] = []
    for (const file of files) {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        setErrorMsg('Only JPEG, PNG, and WebP images are accepted.')
        return
      }
      if (file.size > MAX_FILE_SIZE) {
        setErrorMsg('Each photo must be under 5 MB.')
        return
      }
      valid.push(file)
    }

    if (selectedFiles.length + valid.length > 10) {
      setErrorMsg('Maximum 10 photos per submission.')
      return
    }

    setErrorMsg('')
    setSelectedFiles((prev) => [...prev, ...valid])
    setPreviews((prev) => [...prev, ...valid.map((f) => URL.createObjectURL(f))])
    // Reset the input so the same file can be re-selected
    e.target.value = ''
  }

  function removeFile(index: number) {
    URL.revokeObjectURL(previews[index])
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
    setPreviews((prev) => prev.filter((_, i) => i !== index))
  }

  function clearUpload() {
    previews.forEach((p) => URL.revokeObjectURL(p))
    setSelectedFiles([])
    setPreviews([])
    setErrorMsg('')
    setUploadState('idle')
    setUploadedCount(0)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (selectedFiles.length === 0) return

    setUploadState('uploading')
    setErrorMsg('')
    setUploadedCount(0)

    let failed = 0
    for (const file of selectedFiles) {
      const formData = new FormData()
      formData.append('photo', file)

      try {
        const res = await fetch(`/api/photos/${watchId}`, {
          method: 'POST',
          body: formData,
        })
        if (!res.ok) {
          const data = (await res.json()) as { error?: string }
          setErrorMsg(data.error ?? 'Upload failed.')
          failed++
        } else {
          setUploadedCount((prev) => prev + 1)
        }
      } catch {
        failed++
      }
    }

    if (failed === selectedFiles.length) {
      setErrorMsg('Upload failed — please try again.')
      setUploadState('error')
    } else {
      setUploadState('success')
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
              <h3 className="text-textPrimary font-semibold mb-1">
                {uploadedCount} photo{uploadedCount !== 1 ? 's' : ''} submitted!
              </h3>
              <p className="text-textSecond text-sm mb-4">
                Your photos are pending review and will appear once approved.
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

              {/* Photo previews */}
              {previews.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                  {previews.map((src, i) => (
                    <div key={i} className="relative aspect-square bg-surfaceAlt rounded-sm overflow-hidden border border-border">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={src} alt={`Preview ${i + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeFile(i)}
                        className="absolute top-1 right-1 w-6 h-6 bg-black/60 rounded-full flex items-center justify-center text-white text-xs hover:bg-black/80 transition-colors"
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* File picker */}
              {selectedFiles.length < 10 && (
                <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-border rounded-sm cursor-pointer hover:border-accent transition-colors bg-surfaceAlt">
                  <svg className="w-8 h-8 text-textMuted mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-textSecond text-sm font-medium">
                    {selectedFiles.length === 0 ? 'Click to select photos' : 'Add more photos'}
                  </p>
                  <p className="text-textMuted text-xs mt-1">JPEG, PNG, or WebP — max 5 MB each — up to 10 photos</p>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </label>
              )}

              {errorMsg && <p className="text-red-500 text-sm">{errorMsg}</p>}

              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={selectedFiles.length === 0 || uploadState === 'uploading'}
                  className="btn-gold px-6 py-2.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploadState === 'uploading'
                    ? `Uploading ${uploadedCount}/${selectedFiles.length}...`
                    : `Submit ${selectedFiles.length} photo${selectedFiles.length !== 1 ? 's' : ''}`}
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

              <p className="text-textMuted text-xs">
                Photos are reviewed before appearing on the site.
              </p>
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
