'use client'

import { useState, useEffect } from 'react'
import type { PendingPhoto, ApprovedPhoto } from '@/lib/photos'

export default function AdminPhotosClient() {
  const [photos, setPhotos] = useState<PendingPhoto[]>([])
  const [approvedPhotos, setApprovedPhotos] = useState<ApprovedPhoto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')
  const [acting, setActing] = useState<string | null>(null)

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        const [pendingRes, approvedRes] = await Promise.all([
          fetch('/api/admin/photos'),
          fetch('/api/admin/photos?status=approved'),
        ])

        if (!pendingRes.ok || !approvedRes.ok) {
          if (pendingRes.status === 401 || pendingRes.status === 403) {
            throw new Error('Access denied — admin only')
          }
          throw new Error('Failed to fetch photos')
        }

        const pendingData = (await pendingRes.json()) as PendingPhoto[]
        const approvedData = (await approvedRes.json()) as ApprovedPhoto[]
        if (Array.isArray(pendingData)) setPhotos(pendingData)
        if (Array.isArray(approvedData)) setApprovedPhotos(approvedData)
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
        // If approved, add to the approved list
        if (action === 'approve') {
          setApprovedPhotos((prev) => [{ ...photo, approved: true as const }, ...prev])
        }
      }
    } catch {
      // ignore
    }
    setActing(null)
  }

  async function handleDeleteApproved(photo: ApprovedPhoto) {
    setActing(photo.id)
    try {
      const res = await fetch('/api/admin/photos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete-approved', watchId: photo.watchId, photoId: photo.id }),
      })
      if (res.ok) {
        setApprovedPhotos((prev) => prev.filter((p) => p.id !== photo.id))
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
      ) : (
        <>
          {/* Pending Photos Section */}
          {photos.length === 0 ? (
            <div className="card p-8 text-center mb-12">
              <p className="text-textSecond">No photos pending review.</p>
            </div>
          ) : (
            <div className="space-y-4 mb-12">
              {photos.map((photo) => (
                <div key={photo.id} className="card p-4 flex gap-4 items-start">
                  <div className="shrink-0 w-32 h-32 bg-surfaceAlt rounded-sm overflow-hidden border border-border">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photo.url}
                      alt="Pending submission"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-textPrimary">{photo.watchId}</p>
                    <p className="text-xs text-textMuted mt-0.5">
                      By {photo.userName} &middot; {new Date(photo.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
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

          {/* Approved Photos (Gallery) Section */}
          <h2 className="text-xl font-bold text-textPrimary mb-2">Gallery (Approved)</h2>
          <p className="text-textSecond text-sm mb-4">
            {approvedPhotos.length} approved photo{approvedPhotos.length !== 1 ? 's' : ''} in the gallery.
          </p>

          {approvedPhotos.length === 0 ? (
            <div className="card p-8 text-center">
              <p className="text-textSecond">No approved photos yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {approvedPhotos.map((photo) => (
                <div key={photo.id} className="card p-3 flex flex-col">
                  <div className="w-full aspect-square bg-surfaceAlt rounded-sm overflow-hidden border border-border mb-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photo.url}
                      alt={`Approved photo for ${photo.watchId}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="text-xs font-semibold text-textPrimary truncate">{photo.watchId}</p>
                  <p className="text-xs text-textMuted truncate">By {photo.userName}</p>
                  <p className="text-xs text-textMuted">
                    {new Date(photo.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                  <button
                    onClick={() => handleDeleteApproved(photo)}
                    disabled={acting === photo.id}
                    className="mt-2 bg-red-500 text-white px-3 py-1 rounded-sm text-xs font-medium hover:bg-red-600 transition-colors disabled:opacity-50 w-full"
                  >
                    {acting === photo.id ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
