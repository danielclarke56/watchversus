'use client'

import { useState } from 'react'
import { Review } from '@/lib/reviews'
import type { PendingPhoto, ApprovedPhoto, Photo } from '@/lib/photos'
import Link from 'next/link'

const EDIT_FIELDS: { key: keyof Photo; label: string }[] = [
  { key: 'brandName', label: 'Brand' },
  { key: 'modelName', label: 'Model' },
  { key: 'referenceNumber', label: 'Reference #' },
  { key: 'movement', label: 'Movement' },
  { key: 'caseSize', label: 'Case Size' },
  { key: 'wristSize', label: 'Wrist Size' },
  { key: 'estimatedPrice', label: 'Est. Price' },
  { key: 'lugToLug', label: 'Lug-to-Lug' },
  { key: 'betweenLugs', label: 'Between Lugs' },
  { key: 'thickness', label: 'Thickness' },
  { key: 'waterResistance', label: 'Water Resistance' },
]

interface AdminModerationProps {
  initialReviews: Review[]
  initialPendingPhotos: PendingPhoto[]
  initialApprovedPhotos: ApprovedPhoto[]
}

export default function AdminReviewList({
  initialReviews,
  initialPendingPhotos,
  initialApprovedPhotos,
}: AdminModerationProps) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews)
  const [pendingPhotos, setPendingPhotos] = useState<PendingPhoto[]>(initialPendingPhotos)
  const [approvedPhotos, setApprovedPhotos] = useState<ApprovedPhoto[]>(initialApprovedPhotos)
  const [error, setError] = useState<string>('')
  const [processing, setProcessing] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editFields, setEditFields] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  // ── Reviews ────────────────────────────────────────────────────────────────

  const handleApproveReview = async (review: Review) => {
    try {
      setProcessing(review.id)
      const res = await fetch(`/api/admin/reviews/${review.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ watchSlug: review.watchSlug, action: 'approve' }),
      })
      if (!res.ok) throw new Error('Failed to approve review')
      setReviews((prev) => prev.filter((r) => r.id !== review.id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setProcessing(null)
    }
  }

  const handleRejectReview = async (review: Review) => {
    try {
      setProcessing(review.id)
      const res = await fetch(`/api/admin/reviews/${review.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ watchSlug: review.watchSlug, action: 'reject' }),
      })
      if (!res.ok) throw new Error('Failed to reject review')
      setReviews((prev) => prev.filter((r) => r.id !== review.id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setProcessing(null)
    }
  }

  // ── Photos ─────────────────────────────────────────────────────────────────

  const handlePhotoAction = async (action: 'approve' | 'delete', photo: PendingPhoto) => {
    setProcessing(photo.id)
    try {
      const res = await fetch('/api/admin/photos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, watchId: photo.watchId, photoId: photo.id }),
      })
      if (res.ok) {
        setPendingPhotos((prev) => prev.filter((p) => p.id !== photo.id))
        if (action === 'approve') {
          setApprovedPhotos((prev) => [{ ...photo, approved: true as const }, ...prev])
        }
      }
    } catch {
      // ignore
    }
    setProcessing(null)
  }

  const handleDeleteApproved = async (photo: ApprovedPhoto) => {
    setProcessing(photo.id)
    try {
      const res = await fetch('/api/admin/photos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete-approved', watchId: photo.watchId, photoId: photo.id }),
      })
      if (res.ok) setApprovedPhotos((prev) => prev.filter((p) => p.id !== photo.id))
    } catch {
      // ignore
    }
    setProcessing(null)
  }

  // ── Edit metadata ──────────────────────────────────────────────────────────

  const openEdit = (photo: PendingPhoto | ApprovedPhoto) => {
    const fields: Record<string, string> = {}
    for (const { key } of EDIT_FIELDS) {
      fields[key] = (photo[key] as string | null | undefined) ?? ''
    }
    setEditingId(photo.id)
    setEditFields(fields)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditFields({})
  }

  const saveEdit = async (photoId: string) => {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/photos', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photoId, fields: editFields }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to save')
      }
      // Update local state
      const patch = { ...editFields } as Partial<Photo>
      setPendingPhotos((prev) =>
        prev.map((p) => (p.id === photoId ? { ...p, ...patch } : p))
      )
      setApprovedPhotos((prev) =>
        prev.map((p) => (p.id === photoId ? { ...p, ...patch } : p))
      )
      setEditingId(null)
      setEditFields({})
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const EditPanel = ({ photoId }: { photoId: string }) => (
    <div className="bg-gray-50 border border-gray-200 rounded p-3 mt-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {EDIT_FIELDS.map(({ key, label }) => (
          <label key={key} className="flex flex-col text-xs text-gray-600">
            {label}
            <input
              type="text"
              value={editFields[key] ?? ''}
              onChange={(e) => setEditFields((prev) => ({ ...prev, [key]: e.target.value }))}
              className="mt-0.5 text-sm px-2 py-1 rounded border border-gray-300 text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-400"
            />
          </label>
        ))}
      </div>
      <div className="flex gap-2 mt-3">
        <button
          onClick={() => saveEdit(photoId)}
          disabled={saving}
          className="bg-blue-600 text-white px-4 py-1 rounded text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
        <button
          onClick={cancelEdit}
          disabled={saving}
          className="bg-gray-200 text-gray-700 px-4 py-1 rounded text-sm font-medium hover:bg-gray-300 disabled:opacity-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  )

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Moderation Queue</h1>
            <p className="text-gray-600 mt-1">
              {pendingPhotos.length} photo{pendingPhotos.length !== 1 ? 's' : ''} · {reviews.length} review{reviews.length !== 1 ? 's' : ''} pending
            </p>
          </div>
          <Link href="/admin" className="text-blue-600 hover:underline text-sm">← Back to Admin</Link>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">{error}</div>
        )}

        {/* ── Pending Photos ── */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-4">
            📸 Pending Photos <span className="text-gray-400 font-normal text-base">({pendingPhotos.length})</span>
          </h2>

          {pendingPhotos.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-8 text-center text-gray-500">
              No photos pending review
            </div>
          ) : (
            <div className="space-y-4">
              {pendingPhotos.map((photo) => (
                <div key={photo.id} className="bg-white rounded-lg border border-gray-200 p-4">
                  <div className="flex gap-4 items-start">
                    <div className="shrink-0 w-32 h-32 bg-gray-100 rounded overflow-hidden border border-gray-200">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={photo.url} alt="Pending submission" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900">{photo.watchId}</p>
                      <p className="text-sm text-gray-500 mt-0.5">
                        By {photo.userName} · {new Date(photo.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => handlePhotoAction('approve', photo)}
                          disabled={processing === photo.id}
                          className="bg-green-600 text-white px-4 py-1.5 rounded text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
                        >
                          {processing === photo.id ? 'Processing…' : 'Approve'}
                        </button>
                        <button
                          onClick={() => handlePhotoAction('delete', photo)}
                          disabled={processing === photo.id}
                          className="bg-red-500 text-white px-4 py-1.5 rounded text-sm font-medium hover:bg-red-600 disabled:opacity-50 transition-colors"
                        >
                          {processing === photo.id ? 'Processing…' : 'Reject'}
                        </button>
                        <button
                          onClick={() => editingId === photo.id ? cancelEdit() : openEdit(photo)}
                          className="bg-gray-100 text-gray-700 px-4 py-1.5 rounded text-sm font-medium hover:bg-gray-200 transition-colors border border-gray-300"
                        >
                          {editingId === photo.id ? 'Close' : 'Edit'}
                        </button>
                      </div>
                    </div>
                  </div>
                  {editingId === photo.id && <EditPanel photoId={photo.id} />}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── Pending Reviews ── */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-4">
            ✍️ Pending Reviews <span className="text-gray-400 font-normal text-base">({reviews.length})</span>
          </h2>

          {reviews.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-8 text-center text-gray-500">
              No pending reviews to moderate
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">{review.title}</h3>
                      <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                        <span>Watch: {review.watchSlug}</span>
                        <span>Rating: {review.rating}/5</span>
                        <span>User: {review.userId}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-700 mb-4">{review.body}</p>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <h4 className="text-sm font-semibold text-green-700 mb-1">Pros</h4>
                      <ul className="text-sm text-gray-700 space-y-1">{review.pros.map((p, i) => <li key={i}>✓ {p}</li>)}</ul>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-red-700 mb-1">Cons</h4>
                      <ul className="text-sm text-gray-700 space-y-1">{review.cons.map((c, i) => <li key={i}>✗ {c}</li>)}</ul>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleApproveReview(review)}
                      disabled={processing === review.id}
                      className="flex-1 bg-green-600 text-white py-2 rounded font-medium hover:bg-green-700 disabled:bg-gray-400 transition-colors"
                    >
                      {processing === review.id ? 'Processing…' : 'Approve'}
                    </button>
                    <button
                      onClick={() => handleRejectReview(review)}
                      disabled={processing === review.id}
                      className="flex-1 bg-red-600 text-white py-2 rounded font-medium hover:bg-red-700 disabled:bg-gray-400 transition-colors"
                    >
                      {processing === review.id ? 'Processing…' : 'Reject'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── Approved Photos (Gallery) ── */}
        <section>
          <h2 className="text-xl font-semibold mb-4">
            🖼 Gallery — Approved <span className="text-gray-400 font-normal text-base">({approvedPhotos.length})</span>
          </h2>

          {approvedPhotos.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-8 text-center text-gray-500">
              No approved photos yet
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {approvedPhotos.map((photo) => (
                <div key={photo.id} className="bg-white rounded-lg border border-gray-200 p-3 flex flex-col">
                  <div className="w-full aspect-square bg-gray-100 rounded overflow-hidden border border-gray-100 mb-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={photo.url} alt={`Approved — ${photo.watchId}`} className="w-full h-full object-cover" />
                  </div>
                  <p className="text-xs font-semibold text-gray-900 truncate">{photo.watchId}</p>
                  <p className="text-xs text-gray-500 truncate">By {photo.userName}</p>
                  <p className="text-xs text-gray-400">{new Date(photo.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                  <div className="flex gap-1 mt-2">
                    <button
                      onClick={() => editingId === photo.id ? cancelEdit() : openEdit(photo)}
                      className="flex-1 bg-gray-100 text-gray-700 px-3 py-1 rounded text-xs font-medium hover:bg-gray-200 transition-colors border border-gray-300"
                    >
                      {editingId === photo.id ? 'Close' : 'Edit'}
                    </button>
                    <button
                      onClick={() => handleDeleteApproved(photo)}
                      disabled={processing === photo.id}
                      className="flex-1 bg-red-500 text-white px-3 py-1 rounded text-xs font-medium hover:bg-red-600 disabled:opacity-50 transition-colors"
                    >
                      {processing === photo.id ? 'Deleting…' : 'Delete'}
                    </button>
                  </div>
                  {editingId === photo.id && <EditPanel photoId={photo.id} />}
                </div>
              ))}
            </div>
          )}
        </section>

      </div>
    </div>
  )
}
