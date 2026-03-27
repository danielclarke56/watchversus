'use client'

import { useState, useEffect } from 'react'
import type { PendingPhoto } from '@/lib/photos'

export default function AdminPhotosClient() {
  const [photos, setPhotos] = useState<PendingPhoto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')
  const [acting, setActing] = useState<string | null>(null)

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        const response = await fetch('/api/admin/photos')
        
        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            throw new Error('Access denied — admin only')
          }
          throw new Error('Failed to fetch photos')
        }

        const data = (await response.json()) as PendingPhoto[]
        if (Array.isArray(data)) setPhotos(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchPhotos()
  }, [])

  async function handleAction(action: 'approve' | 'delete', photo: PendingPhoto) {
    setActing(photo.id)
    try {
      const res = await fetch('/api/admin/photos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, watchId: photo.watchId, photoId: photo.id }),
      })
      if (res.ok) {
        setPhotos((prev) => prev.filter((p) => p.id !== photo.id))
      }
    } catch {
      // ignore
    }
    setActing(null)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-textPrimary mb-2">Photo Moderation</h1>
      <p className="text-textSecond text-sm mb-8">
        Review and approve community-submitted photos. {photos.length} pending.
      </p>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-textMuted text-sm">Loading...</p>
      ) : photos.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-textSecond">No photos pending review.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {photos.map((photo) => (
            <div key={photo.id} className="card p-4 flex gap-4 items-start">
              {/* Photo preview */}
              <div className="shrink-0 w-32 h-32 bg-surfaceAlt rounded-sm overflow-hidden border border-border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.url}
                  alt="Pending submission"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-textPrimary">{photo.watchId}</p>
                <p className="text-xs text-textMuted mt-0.5">
                  By {photo.userName} &middot; {new Date(photo.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </p>

                {/* Actions */}
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => handleAction('approve', photo)}
                    disabled={acting === photo.id}
                    className="bg-green-600 text-white px-4 py-1.5 rounded-sm text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleAction('delete', photo)}
                    disabled={acting === photo.id}
                    className="bg-red-500 text-white px-4 py-1.5 rounded-sm text-sm font-medium hover:bg-red-600 transition-colors disabled:opacity-50"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
