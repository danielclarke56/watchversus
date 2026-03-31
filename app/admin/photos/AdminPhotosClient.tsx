'use client'

import { useState, useEffect } from 'react'
import type { PendingPhoto, ApprovedPhoto } from '@/lib/photos'

type Tab = 'pending' | 'approved'

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

type PhotoGroup<T extends PendingPhoto | ApprovedPhoto> = {
  watchId: string
  photos: T[]
  brandName: string
  modelName: string
  referenceNumber: string
  submitterName: string
  submittedDate: string
}

function photoToEditable(photo: PendingPhoto | ApprovedPhoto): EditableFields {
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

/**
 * Group photos by watchId. Each group takes metadata from the first photo.
 * Photos are ordered newest first within each group.
 */
function groupPhotosByWatch<T extends PendingPhoto | ApprovedPhoto>(photos: T[]): PhotoGroup<T>[] {
  const grouped = new Map<string, PhotoGroup<T>>()

  photos.forEach((photo) => {
    if (!grouped.has(photo.watchId)) {
      grouped.set(photo.watchId, {
        watchId: photo.watchId,
        photos: [],
        brandName: photo.brandName ?? '',
        modelName: photo.modelName ?? '',
        referenceNumber: photo.referenceNumber ?? '',
        submitterName: photo.userName,
        submittedDate: photo.createdAt,
      })
    }
    grouped.get(photo.watchId)!.photos.push(photo)
  })

  // Sort each group's photos by date descending (newest first)
  grouped.forEach((group) => {
    group.photos.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  })

  // Return groups sorted by most recent photo in each group
  return Array.from(grouped.values()).sort((a, b) => {
    const aDate = new Date(a.photos[0]!.createdAt).getTime()
    const bDate = new Date(b.photos[0]!.createdAt).getTime()
    return bDate - aDate
  })
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
      <label className="text-[10px] text-textMuted font-medium uppercase tracking-wide">{label}</label>
      <div className="flex items-center gap-1">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full text-xs border border-border rounded px-1.5 py-1 bg-surface text-textPrimary focus:outline-none focus:ring-1 focus:ring-blue-400"
          placeholder="—"
        />
        {unit && <span className="text-[10px] text-textMuted shrink-0">{unit}</span>}
      </div>
    </div>
  )
}

/**
 * PhotoThumbnail: Compact thumbnail for grouped photos.
 */
function PhotoThumbnail({
  photo,
  onClick,
}: {
  photo: PendingPhoto | ApprovedPhoto
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="relative shrink-0 w-16 h-16 sm:w-20 sm:h-20 bg-surfaceAlt rounded overflow-hidden border border-border hover:border-gray-400 transition-colors group"
      aria-label="View photo"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={photo.url} alt="Thumbnail" className="w-full h-full object-cover" />
      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all" />
    </button>
  )
}

/**
 * GroupedPhotoCard: Displays a group of photos for the same watch.
 * Shows thumbnail strip at top, then expandable list of individual photos below.
 */
function GroupedPhotoCard<T extends PendingPhoto | ApprovedPhoto>({
  group,
  editState,
  acting,
  saving,
  savedOk,
  onUpdateField,
  onSave,
  onApprove,
  onReject,
  onDelete,
  isApproved,
}: {
  group: PhotoGroup<T>
  editState: Record<string, EditableFields>
  acting: string | null
  saving: string | null
  savedOk: string | null
  onUpdateField: (photoId: string, field: keyof EditableFields, value: string) => void
  onSave: (photoId: string) => void
  onApprove?: (photo: T) => void
  onReject?: (photo: T) => void
  onDelete?: (photo: T) => void
  isApproved: boolean
}) {
  const [expandedPhotos, setExpandedPhotos] = useState<Set<string>>(new Set())

  const togglePhotoExpanded = (photoId: string) => {
    setExpandedPhotos((prev) => {
      const next = new Set(prev)
      if (next.has(photoId)) {
        next.delete(photoId)
      } else {
        next.add(photoId)
      }
      return next
    })
  }

  const displayName = [group.brandName, group.modelName].filter(Boolean).join(' ') || group.watchId

  return (
    <div className="border border-border rounded-lg overflow-hidden bg-surface">
      {/* Header: watch info + thumbnail gallery */}
      <div className="p-3 sm:p-4 border-b border-border bg-surfaceAlt">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap mb-1">
              <h3 className="text-sm sm:text-base font-bold text-textPrimary truncate">{displayName}</h3>
              {group.referenceNumber && (
                <span className="text-xs text-textMuted hidden sm:inline">· {group.referenceNumber}</span>
              )}
            </div>
            <p className="text-xs text-textMuted">
              {group.submitterName} ·{' '}
              {new Date(group.submittedDate).toLocaleDateString('en-US', {
                month: 'short', day: 'numeric', year: 'numeric',
              })}
            </p>
          </div>
          <div className="text-xs font-semibold bg-blue-100 text-blue-700 px-2 py-1 rounded-full shrink-0">
            {group.photos.length} {group.photos.length === 1 ? 'photo' : 'photos'}
          </div>
        </div>

        {/* Thumbnail gallery */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {group.photos.map((photo) => (
            <PhotoThumbnail
              key={photo.id}
              photo={photo}
              onClick={() => togglePhotoExpanded(photo.id)}
            />
          ))}
        </div>
      </div>

      {/* Expandable list of individual photos */}
      <div className="space-y-2 p-3 sm:p-4">
        {group.photos.map((photo) => {
          const fields = editState[photo.id]
          if (!fields) return null
          const isExpanded = expandedPhotos.has(photo.id)

          return (
            <div key={photo.id} className="space-y-1">
              {/* Compact photo row */}
              <button
                onClick={() => togglePhotoExpanded(photo.id)}
                className="w-full text-left border border-border rounded p-2 sm:p-2.5 hover:bg-surfaceAlt transition-colors flex items-center gap-2"
              >
                <div className="shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded bg-surfaceAlt border border-border overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photo.url} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0 text-xs sm:text-sm">
                  <p className="text-textMuted">
                    {new Date(photo.createdAt).toLocaleDateString('en-US', {
                      month: 'short', day: 'numeric',
                    })}
                  </p>
                </div>
                <span className="text-textMuted shrink-0">
                  {isExpanded ? '▼' : '▶'}
                </span>
              </button>

              {/* Expanded controls for this photo */}
              {isExpanded && (
                <div className="border border-border rounded p-2 sm:p-3 bg-surfaceAlt space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    <FieldInput label="Brand" value={fields.brandName} onChange={(v) => onUpdateField(photo.id, 'brandName', v)} />
                    <FieldInput label="Model" value={fields.modelName} onChange={(v) => onUpdateField(photo.id, 'modelName', v)} />
                    <FieldInput label="Reference No." value={fields.referenceNumber} onChange={(v) => onUpdateField(photo.id, 'referenceNumber', v)} />
                    <FieldInput label="Movement" value={fields.movement} onChange={(v) => onUpdateField(photo.id, 'movement', v)} />
                    <FieldInput label="Case Size" value={fields.caseSize} onChange={(v) => onUpdateField(photo.id, 'caseSize', v)} unit="mm" />
                    <FieldInput label="Wrist Size" value={fields.wristSize} onChange={(v) => onUpdateField(photo.id, 'wristSize', v)} unit="mm" />
                    <FieldInput label="Year" value={fields.productionYear} onChange={(v) => onUpdateField(photo.id, 'productionYear', v)} />
                    <FieldInput label="Est. Price" value={fields.estimatedPrice} onChange={(v) => onUpdateField(photo.id, 'estimatedPrice', v)} unit="USD" />
                    <FieldInput label="Lug-to-Lug" value={fields.lugToLug} onChange={(v) => onUpdateField(photo.id, 'lugToLug', v)} unit="mm" />
                    <FieldInput label="Between Lugs" value={fields.betweenLugs} onChange={(v) => onUpdateField(photo.id, 'betweenLugs', v)} unit="mm" />
                    <FieldInput label="Thickness" value={fields.thickness} onChange={(v) => onUpdateField(photo.id, 'thickness', v)} unit="mm" />
                    <FieldInput label="Water Resist." value={fields.waterResistance} onChange={(v) => onUpdateField(photo.id, 'waterResistance', v)} unit="m" />
                  </div>
                  <div>
                    <FieldInput label="Caption" value={fields.caption} onChange={(v) => onUpdateField(photo.id, 'caption', v)} />
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-border">
                    <button
                      onClick={() => onSave(photo.id)}
                      disabled={saving === photo.id || acting === photo.id}
                      className="text-xs bg-blue-600 text-white px-3 py-1 rounded font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      {saving === photo.id ? 'Saving...' : 'Save'}
                    </button>
                    {savedOk === photo.id && (
                      <span className="text-xs text-green-600 font-medium">✓ Saved</span>
                    )}
                    {!isApproved && onApprove && (
                      <button
                        onClick={() => onApprove(photo)}
                        disabled={acting === photo.id || saving === photo.id}
                        className="text-xs bg-green-600 text-white px-3 py-1 rounded font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
                      >
                        Approve
                      </button>
                    )}
                    {!isApproved && onReject && (
                      <button
                        onClick={() => onReject(photo)}
                        disabled={acting === photo.id || saving === photo.id}
                        className="text-xs bg-red-500 text-white px-3 py-1 rounded font-medium hover:bg-red-600 transition-colors disabled:opacity-50"
                      >
                        Reject
                      </button>
                    )}
                    {isApproved && onDelete && (
                      <button
                        onClick={() => onDelete(photo)}
                        disabled={acting === photo.id}
                        className="text-xs bg-red-500 text-white px-3 py-1 rounded font-medium hover:bg-red-600 transition-colors disabled:opacity-50"
                      >
                        {acting === photo.id ? 'Deleting...' : 'Delete'}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function AdminPhotosClient() {
  const [activeTab, setActiveTab] = useState<Tab>('pending')
  const [pendingPhotos, setPendingPhotos] = useState<PendingPhoto[]>([])
  const [approvedPhotos, setApprovedPhotos] = useState<ApprovedPhoto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')
  const [acting, setActing] = useState<string | null>(null)
  const [saving, setSaving] = useState<string | null>(null)
  const [savedOk, setSavedOk] = useState<string | null>(null)
  const [editState, setEditState] = useState<Record<string, EditableFields>>({})

  // Grouped photos for display
  const pendingGroups = groupPhotosByWatch(pendingPhotos)
  const approvedGroups = groupPhotosByWatch(approvedPhotos)

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
          setPendingPhotos(pendingData)
          const initialEdits: Record<string, EditableFields> = {}
          pendingData.forEach((p) => { initialEdits[p.id] = photoToEditable(p) })
          setEditState((prev) => ({ ...prev, ...initialEdits }))
        }

        if (Array.isArray(approvedData)) {
          setApprovedPhotos(approvedData)
          const initialEdits: Record<string, EditableFields> = {}
          approvedData.forEach((p) => { initialEdits[p.id] = photoToEditable(p) })
          setEditState((prev) => ({ ...prev, ...initialEdits }))
        }
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
    try {
      const res = await fetch('/api/admin/photos', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photoId, fields: editState[photoId] }),
      })
      if (res.ok) {
        setSavedOk(photoId)
        setTimeout(() => setSavedOk(null), 2000)
      }
    } catch { /* silent */ }
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
        setPendingPhotos((prev) => prev.filter((p) => p.id !== photo.id))
        if (action === 'approve') {
          setApprovedPhotos((prev) => [{ ...photo, approved: true as const }, ...prev])
        }
      }
    } catch { /* ignore */ }
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
    } catch { /* ignore */ }
    setActing(null)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
      <h1 className="text-xl sm:text-2xl font-bold text-textPrimary mb-6">Photo Moderation</h1>

      {error && (
        <div className="mb-6 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs sm:text-sm">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-border mb-5 overflow-x-auto">
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-3 sm:px-5 py-2.5 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'pending'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-textMuted hover:text-textPrimary'
          }`}
        >
          Pending
          {!loading && pendingPhotos.length > 0 && (
            <span className="ml-1 sm:ml-2 bg-amber-100 text-amber-700 text-xs font-semibold px-2 py-0.5 rounded-full inline-block">
              {pendingPhotos.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('approved')}
          className={`px-3 sm:px-5 py-2.5 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'approved'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-textMuted hover:text-textPrimary'
          }`}
        >
          Approved
          {!loading && (
            <span className="ml-1 sm:ml-2 bg-gray-100 text-gray-600 text-xs font-semibold px-2 py-0.5 rounded-full inline-block">
              {approvedPhotos.length}
            </span>
          )}
        </button>
      </div>

      {loading ? (
        <p className="text-textMuted text-sm">Loading...</p>
      ) : (
        <>
          {activeTab === 'pending' && (
            <>
              {pendingPhotos.length === 0 ? (
                <div className="py-16 text-center">
                  <p className="text-textSecond text-lg mb-1">All clear ✓</p>
                  <p className="text-textMuted text-sm">No photos pending review.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingGroups.map((group) => (
                    <GroupedPhotoCard
                      key={group.watchId}
                      group={group}
                      editState={editState}
                      acting={acting}
                      saving={saving}
                      savedOk={savedOk}
                      onUpdateField={(photoId, field, value) => updateField(photoId, field, value)}
                      onSave={(photoId) => handleSave(photoId)}
                      onApprove={(photo) => handleAction('approve', photo)}
                      onReject={(photo) => handleAction('delete', photo)}
                      isApproved={false}
                    />
                  ))}
                </div>
              )}
            </>
          )}

          {activeTab === 'approved' && (
            <>
              {approvedPhotos.length === 0 ? (
                <div className="py-16 text-center">
                  <p className="text-textSecond">No approved photos yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {approvedGroups.map((group) => (
                    <GroupedPhotoCard
                      key={group.watchId}
                      group={group}
                      editState={editState}
                      acting={acting}
                      saving={saving}
                      savedOk={savedOk}
                      onUpdateField={(photoId, field, value) => updateField(photoId, field, value)}
                      onSave={(photoId) => handleSave(photoId)}
                      onDelete={(photo) => handleDeleteApproved(photo)}
                      isApproved={true}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  )
}
