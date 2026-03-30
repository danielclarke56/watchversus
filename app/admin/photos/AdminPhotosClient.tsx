'use client'

import { useState, useEffect } from 'react'
import type { PendingPhoto, ApprovedPhoto } from '@/lib/photos'

type EditableFields = {
  brandName: string
  modelName: string
  referenceNumber: string
  movement: string
  caseSize: string
  wristSize: string
  estimatedPrice: string
  productionYear: string
  lugToLug: string
  betweenLugs: string
  thickness: string
  waterResistance: string
  caption: string
}

function photoToEditable(photo: PendingPhoto): EditableFields {
  return {
    brandName: photo.brandName ?? '',
    modelName: photo.modelName ?? '',
    referenceNumber: photo.referenceNumber ?? '',
    movement: photo.movement ?? '',
    caseSize: photo.caseSize ?? '',
    wristSize: photo.wristSize ?? '',
    estimatedPrice: photo.estimatedPrice ?? '',
    productionYear: photo.productionYear ?? '',
    lugToLug: photo.lugToLug ?? '',
    betweenLugs: photo.betweenLugs ?? '',
    thickness: photo.thickness ?? '',
    waterResistance: photo.waterResistance ?? '',
    caption: photo.caption ?? '',
  }
}

function FieldInput({
  label,
  value,
  onChange,
  unit,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  unit?: string
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <label className="text-xs text-textMuted font-medium uppercase tracking-wide">{label}</label>
      <div className="flex items-center gap-1">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full text-sm border border-border rounded px-2 py-1 bg-surface text-textPrimary focus:outline-none focus:ring-1 focus:ring-blue-400"
          placeholder="—"
        />
        {unit && <span className="text-xs text-textMuted shrink-0">{unit}</span>}
      </div>
    </div>
  )
}

export default function AdminPhotosClient() {
  const [photos, setPhotos] = useState<PendingPhoto[]>([])
  const [approvedPhotos, setApprovedPhotos] = useState<ApprovedPhoto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')
  const [acting, setActing] = useState<string | null>(null)
  const [saving, setSaving] = useState<string | null>(null)
  const [savedOk, setSavedOk] = useState<string | null>(null)
  const [aiFlags, setAiFlags] = useState<Record<string, boolean | 'checking'>>({})
  const [editState, setEditState] = useState<Record<string, EditableFields>>({})

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

        if (Array.isArray(pendingData)) {
          setPhotos(pendingData)
          // Pre-populate edit state for all pending photos
          const initialEdits: Record<string, EditableFields> = {}
          pendingData.forEach((p) => {
            initialEdits[p.id] = photoToEditable(p)
          })
          setEditState(initialEdits)

          // Kick off AI detection per photo (fire-and-forget)
          pendingData.forEach((photo) => {
            ;(async () => {
              setAiFlags((prev) => ({ ...prev, [photo.id]: 'checking' }))
              try {
                const photoBlob = await fetch(photo.url).then((res) => res.blob())
                const formData = new FormData()
                formData.append('photo', photoBlob)
                const res = await fetch('/api/photos/identify', {
                  method: 'POST',
                  body: formData,
                })
                if (res.ok) {
                  const data = await res.json()
                  setAiFlags((prev) => ({ ...prev, [photo.id]: data.isAiGenerated === true }))
                } else {
                  setAiFlags((prev) => { const n = { ...prev }; delete n[photo.id]; return n })
                }
              } catch {
                setAiFlags((prev) => { const n = { ...prev }; delete n[photo.id]; return n })
              }
            })()
          })
        }
        if (Array.isArray(approvedData)) setApprovedPhotos(approvedData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchPhotos()
  }, [])

  function updateField(photoId: string, field: keyof EditableFields, value: string) {
    setEditState((prev) => ({
      ...prev,
      [photoId]: { ...prev[photoId], [field]: value },
    }))
  }

  async function handleSave(photoId: string) {
    setSaving(photoId)
    setSavedOk(null)
    const fields = editState[photoId]
    try {
      const res = await fetch('/api/admin/photos', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photoId, fields }),
      })
      if (res.ok) {
        setSavedOk(photoId)
        setTimeout(() => setSavedOk(null), 2000)
      }
    } catch {
      // silent fail
    }
    setSaving(null)
  }

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
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-textPrimary mb-2">Photo Moderation</h1>
      <p className="text-textSecond text-sm mb-8">
        Review, edit metadata, and approve community-submitted photos. {photos.length} pending.
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
          {/* Pending Photos */}
          {photos.length === 0 ? (
            <div className="card p-8 text-center mb-12">
              <p className="text-textSecond">No photos pending review.</p>
            </div>
          ) : (
            <div className="space-y-6 mb-12">
              {photos.map((photo) => {
                const fields = editState[photo.id]
                if (!fields) return null

                return (
                  <div key={photo.id} className="card p-5 border border-border rounded-lg">
                    <div className="flex gap-5 items-start">
                      {/* Photo */}
                      <div className="shrink-0 w-40 h-40 bg-surfaceAlt rounded overflow-hidden border border-border">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={photo.url}
                          alt="Pending submission"
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Meta */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-semibold text-textPrimary">{photo.watchId}</p>
                          {aiFlags[photo.id] === 'checking' && (
                            <span className="text-xs text-textMuted">🔍 AI check...</span>
                          )}
                          {aiFlags[photo.id] === true && (
                            <span className="text-xs text-red-600 font-medium">🤖 AI-generated detected</span>
                          )}
                        </div>
                        <p className="text-xs text-textMuted mb-3">
                          By {photo.userName} · {new Date(photo.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </p>

                        {/* Editable Fields — 2-col grid */}
                        <div className="grid grid-cols-2 gap-3 mb-4">
                          <FieldInput label="Brand" value={fields.brandName} onChange={(v) => updateField(photo.id, 'brandName', v)} />
                          <FieldInput label="Model" value={fields.modelName} onChange={(v) => updateField(photo.id, 'modelName', v)} />
                          <FieldInput label="Reference No." value={fields.referenceNumber} onChange={(v) => updateField(photo.id, 'referenceNumber', v)} />
                          <FieldInput label="Movement" value={fields.movement} onChange={(v) => updateField(photo.id, 'movement', v)} />
                          <FieldInput label="Case Size" value={fields.caseSize} onChange={(v) => updateField(photo.id, 'caseSize', v)} unit="mm" />
                          <FieldInput label="Wrist Size" value={fields.wristSize} onChange={(v) => updateField(photo.id, 'wristSize', v)} unit="mm" />
                          <FieldInput label="Production Year" value={fields.productionYear} onChange={(v) => updateField(photo.id, 'productionYear', v)} />
                          <FieldInput label="Est. Price" value={fields.estimatedPrice} onChange={(v) => updateField(photo.id, 'estimatedPrice', v)} unit="USD" />
                          <FieldInput label="Lug-to-Lug" value={fields.lugToLug} onChange={(v) => updateField(photo.id, 'lugToLug', v)} unit="mm" />
                          <FieldInput label="Between Lugs" value={fields.betweenLugs} onChange={(v) => updateField(photo.id, 'betweenLugs', v)} unit="mm" />
                          <FieldInput label="Thickness" value={fields.thickness} onChange={(v) => updateField(photo.id, 'thickness', v)} unit="mm" />
                          <FieldInput label="Water Resistance" value={fields.waterResistance} onChange={(v) => updateField(photo.id, 'waterResistance', v)} unit="m" />
                        </div>
                        <div className="mb-4">
                          <FieldInput label="Caption" value={fields.caption} onChange={(v) => updateField(photo.id, 'caption', v)} />
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <button
                            onClick={() => handleSave(photo.id)}
                            disabled={saving === photo.id || acting === photo.id}
                            className="bg-blue-600 text-white px-4 py-1.5 rounded text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                          >
                            {saving === photo.id ? 'Saving...' : 'Save Edits'}
                          </button>
                          {savedOk === photo.id && (
                            <span className="text-xs text-green-600 font-medium">✓ Saved</span>
                          )}
                          <button
                            onClick={() => handleAction('approve', photo)}
                            disabled={acting === photo.id || saving === photo.id}
                            className="bg-green-600 text-white px-4 py-1.5 rounded text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleAction('delete', photo)}
                            disabled={acting === photo.id || saving === photo.id}
                            className="bg-red-500 text-white px-4 py-1.5 rounded text-sm font-medium hover:bg-red-600 transition-colors disabled:opacity-50"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Approved Photos */}
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
