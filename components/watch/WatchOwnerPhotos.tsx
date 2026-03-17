'use client'

import { useState } from 'react'
import type { Watch } from '@/lib/types'

interface WatchOwnerPhotosProps {
  watch: Watch
}

/**
 * Real Owner Photos - MVP stub with photo gallery and upload modal
 * - Gallery grid (placeholder images for MVP)
 * - Photo count badge
 * - Upload button that opens modal
 * - Modal form with file input, watch model (auto-filled), optional fields
 * - Submits to /api/photos/submit (stubbed, returns success and logs to console)
 *
 * Rules:
 * - Photos require manual approval before display
 * - No comments, no likes, no profiles
 */
export default function WatchOwnerPhotos({ watch }: WatchOwnerPhotosProps) {
  const [showModal, setShowModal] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // MVP: Placeholder photo count (hardcoded for now)
  const photoCount = 12

  // MVP: Generate placeholder gallery images (grid of 6 images)
  const placeholderPhotos = Array.from({ length: 6 }, (_, i) => ({
    id: i,
    src: '/placeholder-watch.jpg',
    alt: `Owner photo ${i + 1}`,
  }))

  const handlePhotoSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    const formData = new FormData(e.currentTarget)
    const payload = {
      watchSlug: watch.slug,
      watchName: watch.name,
      image: formData.get('image'),
      wristSize: formData.get('wristSize'),
      strapBracelet: formData.get('strapBracelet'),
      note: formData.get('note'),
      timestamp: new Date().toISOString(),
    }

    try {
      // TODO: Use actual image upload (e.g. to S3 or Vercel blob storage)
      // For MVP, just log to console and POST to stubbed endpoint
      console.log('Photo submission payload:', payload)

      const response = await fetch('/api/photos/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          watch: watch.slug,
          watchName: watch.name,
          wristSize: formData.get('wristSize'),
          strapBracelet: formData.get('strapBracelet'),
          note: formData.get('note'),
        }),
      })

      const data = await response.json()
      console.log('Photo submission response:', data)

      setSubmitSuccess(true)
      setIsSubmitting(false)
      setTimeout(() => {
        setShowModal(false)
        setSubmitSuccess(false)
      }, 2000)
    } catch (error) {
      console.error('Photo submission error:', error)
      setIsSubmitting(false)
    }
  }

  return (
    <section className="py-8 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-textPrimary">Real Owner Photos</h2>
          <button
            onClick={() => setShowModal(true)}
            className="bg-accent text-white font-semibold text-sm px-4 py-2 rounded-md hover:bg-accentHover transition-colors"
          >
            + Add Your Photo
          </button>
        </div>

        {/* Photo Count Badge */}
        <div className="mb-6 inline-block px-3 py-1 bg-surfaceAlt rounded-full">
          <p className="text-sm font-semibold text-textPrimary">{photoCount} photos</p>
        </div>

        {/* Photo Gallery Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {placeholderPhotos.map((photo) => (
            <div
              key={photo.id}
              className="relative w-full aspect-square bg-surfaceAlt rounded-lg border border-border overflow-hidden"
            >
              <div className="flex items-center justify-center w-full h-full">
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-2 rounded-full border-2 border-border flex items-center justify-center">
                    <svg className="w-6 h-6 text-borderStrong" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-xs text-textMuted">Photo {photo.id + 1}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Info Box */}
        <div className="mt-6 p-4 bg-accentLight rounded-lg border border-accent/20">
          <p className="text-sm text-textPrimary">
            📝 <strong>Note:</strong> All photos are reviewed before publication. Help other buyers by sharing how the watch looks on your wrist!
          </p>
        </div>
      </div>

      {/* Upload Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-surface rounded-lg shadow-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-textPrimary">Add Your Photo</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-textMuted hover:text-textPrimary"
              >
                ✕
              </button>
            </div>

            {submitSuccess ? (
              <div className="text-center py-6">
                <div className="text-3xl mb-2">✓</div>
                <p className="text-winner font-semibold">
                  Thanks! Your photo will appear after review.
                </p>
              </div>
            ) : (
              <form onSubmit={handlePhotoSubmit} className="space-y-4">
                {/* Watch Model (auto-filled, read-only) */}
                <div>
                  <label className="block text-sm font-semibold text-textPrimary mb-1">
                    Watch Model
                  </label>
                  <input
                    type="text"
                    value={`${watch.brand} ${watch.name}`}
                    disabled
                    className="w-full px-3 py-2 bg-surfaceAlt border border-border rounded-sm text-textPrimary text-sm"
                  />
                </div>

                {/* File Input */}
                <div>
                  <label className="block text-sm font-semibold text-textPrimary mb-1">
                    Photo *
                  </label>
                  <input
                    type="file"
                    name="image"
                    accept="image/*"
                    required
                    className="w-full px-3 py-2 border border-borderStrong rounded-sm text-sm focus:border-accent focus:outline-none"
                  />
                </div>

                {/* Wrist Size (optional) */}
                <div>
                  <label className="block text-sm font-semibold text-textPrimary mb-1">
                    Wrist Size (optional)
                  </label>
                  <input
                    type="text"
                    name="wristSize"
                    placeholder="e.g., 7.5 inches"
                    className="w-full px-3 py-2 border border-borderStrong rounded-sm text-sm focus:border-accent focus:outline-none"
                  />
                </div>

                {/* Strap/Bracelet (optional) */}
                <div>
                  <label className="block text-sm font-semibold text-textPrimary mb-1">
                    Strap / Bracelet (optional)
                  </label>
                  <input
                    type="text"
                    name="strapBracelet"
                    placeholder="e.g., Steel bracelet"
                    className="w-full px-3 py-2 border border-borderStrong rounded-sm text-sm focus:border-accent focus:outline-none"
                  />
                </div>

                {/* Note (optional, max 200 chars) */}
                <div>
                  <label className="block text-sm font-semibold text-textPrimary mb-1">
                    Your Note (optional, max 200 chars)
                  </label>
                  <textarea
                    name="note"
                    maxLength={200}
                    placeholder="What do you love about this watch on your wrist?"
                    className="w-full px-3 py-2 border border-borderStrong rounded-sm text-sm resize-none focus:border-accent focus:outline-none"
                    rows={3}
                  />
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2 bg-surfaceAlt text-textPrimary rounded-md font-semibold hover:bg-border transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2 bg-accent text-white rounded-md font-semibold hover:bg-accentHover disabled:opacity-50 transition-colors"
                  >
                    {isSubmitting ? 'Uploading...' : 'Submit Photo'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  )
}
