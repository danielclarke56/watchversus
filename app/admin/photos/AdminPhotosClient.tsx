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

// Watch-level metadata (shared across all photos for same watch)
type WatchMetaFields = Omit<EditableFields, 'caption'>

type PhotoGroup<T extends PendingPhoto | ApprovedPhoto> = {
  watchId: string
  photos: T[]
  brandName: string
  modelName: string
  referenceNumber: string
  submitterName: string
  submittedDate: string
}



function photoToWatchMeta(photo: PendingPhoto | ApprovedPhoto): WatchMetaFields {
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
 * GroupedPhotoCard: Displays a group of photos for the same watch.
 * Watch metadata is shown ONCE at the group level.
 * Individual photos show only their caption + approve/reject actions.
 */
function GroupedPhotoCard<T extends PendingPhoto | ApprovedPhoto>({
  group,
  watchMeta,
  captionState,
  acting,
  savingGroup,
  savedGroupOk,
  onUpdateWatchMeta,
  onSaveGroup,
  onUpdateCaption,
  onApprove,
  onReject,
  onDelete,
  isApproved,
}: {
  group: PhotoGroup<T>
  watchMeta: WatchMetaFields
  captionState: Record<string, string>
  acting: string | null
  savingGroup: string | null
  savedGroupOk: string | null
  onUpdateWatchMeta: (watchId: string, field: keyof WatchMetaFields, value: string) => void
  onSaveGroup: (watchId: string, photoIds: string[]) => void
  onUpdateCaption: (photoId: string, caption: string) => void
  onApprove?: (photo: T) => void
  onReject?: (photo: T) => void
  onDelete?: (photo: T) => void
  isApproved: boolean
}) {
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null)

  const displayName = [watchMeta.brandName, watchMeta.modelName].filter(Boolean).join(' ') || group.watchId
  const isSavingGroup = savingGroup === group.watchId
  const groupSavedOk = savedGroupOk === group.watchId

  return (
    <div className="border border-border rounded-lg overflow-hidden bg-surface">
      {/* Header */}
      <div className="p-3 sm:p-4 border-b border-border bg-surfaceAlt">
        <div className="flex items-start justify-between gap-3 mb-1">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm sm:text-base font-bold text-textPrimary truncate">{displayName || 'New Watch'}</h3>
            <p className="text-xs text-textMuted mt-0.5">
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
      </div>

      {/* Watch metadata — shown ONCE per group */}
      <div className="p-3 sm:p-4 border-b border-border">
        <p className="text-[10px] font-semibold text-textMuted uppercase tracking-wider mb-2">Watch Info</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
          <FieldInput label="Brand" value={watchMeta.brandName} onChange={(v) => onUpdateWatchMeta(group.watchId, 'brandName', v)} />
          <FieldInput label="Model" value={watchMeta.modelName} onChange={(v) => onUpdateWatchMeta(group.watchId, 'modelName', v)} />
          <FieldInput label="Reference No." value={watchMeta.referenceNumber} onChange={(v) => onUpdateWatchMeta(group.watchId, 'referenceNumber', v)} />
          <FieldInput label="Movement" value={watchMeta.movement} onChange={(v) => onUpdateWatchMeta(group.watchId, 'movement', v)} />
          <FieldInput label="Case Size" value={watchMeta.caseSize} onChange={(v) => onUpdateWatchMeta(group.watchId, 'caseSize', v)} unit="mm" />
          <FieldInput label="Wrist Size" value={watchMeta.wristSize} onChange={(v) => onUpdateWatchMeta(group.watchId, 'wristSize', v)} unit="mm" />
          <FieldInput label="Year" value={watchMeta.productionYear} onChange={(v) => onUpdateWatchMeta(group.watchId, 'productionYear', v)} />
          <FieldInput label="Est. Price" value={watchMeta.estimatedPrice} onChange={(v) => onUpdateWatchMeta(group.watchId, 'estimatedPrice', v)} unit="USD" />
          <FieldInput label="Lug-to-Lug" value={watchMeta.lugToLug} onChange={(v) => onUpdateWatchMeta(group.watchId, 'lugToLug', v)} unit="mm" />
          <FieldInput label="Between Lugs" value={watchMeta.betweenLugs} onChange={(v) => onUpdateWatchMeta(group.watchId, 'betweenLugs', v)} unit="mm" />
          <FieldInput label="Thickness" value={watchMeta.thickness} onChange={(v) => onUpdateWatchMeta(group.watchId, 'thickness', v)} unit="mm" />
          <FieldInput label="Water Resist." value={watchMeta.waterResistance} onChange={(v) => onUpdateWatchMeta(group.watchId, 'waterResistance', v)} unit="m" />
        </div>
        <div className="flex items-center gap-2 mt-3">
          <button
            onClick={() => onSaveGroup(group.watchId, group.photos.map(p => p.id))}
            disabled={isSavingGroup}
            className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {isSavingGroup ? 'Saving...' : group.photos.length > 1 ? `Save to all ${group.photos.length} photos` : 'Save'}
          </button>
          {groupSavedOk && (
            <span className="text-xs text-green-600 font-medium">✓ Saved</span>
          )}
        </div>
      </div>

      {/* Individual photos */}
      <div className="divide-y divide-border">
        {group.photos.map((photo) => {
          const caption = captionState[photo.id] ?? ''
          const isSelected = selectedPhoto === photo.id
          const isActing = acting === photo.id

          return (
            <div key={photo.id} className="p-3 sm:p-4">
              <div className="flex gap-3">
                {/* Thumbnail — click to enlarge */}
                <button
                  onClick={() => setSelectedPhoto(isSelected ? null : photo.id)}
                  className="shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded overflow-hidden border border-border hover:border-gray-400 transition-colors"
                  aria-label="View photo"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photo.url} alt="Thumbnail" className="w-full h-full object-cover" />
                </button>

                <div className="flex-1 min-w-0 space-y-2">
                  <p className="text-xs text-textMuted">
                    Submitted {new Date(photo.createdAt).toLocaleDateString('en-US', {
                      month: 'short', day: 'numeric', year: 'numeric',
                    })}
                  </p>

                  {/* Caption — per photo */}
                  <FieldInput
                    label="Caption"
                    value={caption}
                    onChange={(v) => onUpdateCaption(photo.id, v)}
                  />

                  {/* Action buttons */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {!isApproved && onApprove && (
                      <button
                        onClick={() => onApprove(photo)}
                        disabled={isActing}
                        className="text-xs bg-green-600 text-white px-3 py-1 rounded font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
                      >
                        {isActing ? '...' : 'Approve'}
                      </button>
                    )}
                    {!isApproved && onReject && (
                      <button
                        onClick={() => onReject(photo)}
                        disabled={isActing}
                        className="text-xs bg-red-500 text-white px-3 py-1 rounded font-medium hover:bg-red-600 transition-colors disabled:opacity-50"
                      >
                        {isActing ? '...' : 'Reject'}
                      </button>
                    )}
                    {isApproved && onDelete && (
                      <button
                        onClick={() => onDelete(photo)}
                        disabled={isActing}
                        className="text-xs bg-red-500 text-white px-3 py-1 rounded font-medium hover:bg-red-600 transition-colors disabled:opacity-50"
                      >
                        {isActing ? 'Deleting...' : 'Delete'}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Enlarged photo view */}
              {isSelected && (
                <div className="mt-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo.url}
                    alt="Full size"
                    className="max-w-full max-h-96 object-contain rounded border border-border"
                  />
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

  // Group-level watch metadata state (keyed by watchId)
  const [watchMetaState, setWatchMetaState] = useState<Record<string, WatchMetaFields>>({})
  // Per-photo caption state (keyed by photoId)
  const [captionState, setCaptionState] = useState<Record<string, string>>({})

  // Saving state
  const [savingGroup, setSavingGroup] = useState<string | null>(null)
  const [savedGroupOk, setSavedGroupOk] = useState<string | null>(null)

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
          initializeState(pendingData)
        }

        if (Array.isArray(approvedData)) {
          setApprovedPhotos(approvedData)
          initializeState(approvedData)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchPhotos()
  }, [])

  function initializeState(photos: (PendingPhoto | ApprovedPhoto)[]) {
    // Group by watchId — take metadata from the first photo per watch
    const metaByWatch: Record<string, WatchMetaFields> = {}
    const captions: Record<string, string> = {}

    photos.forEach((photo) => {
      if (!metaByWatch[photo.watchId]) {
        metaByWatch[photo.watchId] = photoToWatchMeta(photo)
      }
      captions[photo.id] = photo.caption ?? ''
    })

    setWatchMetaState((prev) => ({ ...prev, ...metaByWatch }))
    setCaptionState((prev) => ({ ...prev, ...captions }))
  }

  function updateWatchMeta(watchId: string, field: keyof WatchMetaFields, value: string) {
    setWatchMetaState((prev) => ({
      ...prev,
      [watchId]: { ...prev[watchId], [field]: value },
    }))
  }

  function updateCaption(photoId: string, caption: string) {
    setCaptionState((prev) => ({ ...prev, [photoId]: caption }))
  }

  async function handleSaveGroup(watchId: string, photoIds: string[]) {
    const meta = watchMetaState[watchId]
    if (!meta) return

    setSavingGroup(watchId)
    setSavedGroupOk(null)

    try {
      await Promise.all(
        photoIds.map((photoId) =>
          fetch('/api/admin/photos', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              photoId,
              fields: { ...meta, caption: captionState[photoId] ?? '' },
            }),
          })
        )
      )
      setSavedGroupOk(watchId)
      setTimeout(() => setSavedGroupOk(null), 2500)
    } catch { /* silent */ }

    setSavingGroup(null)
  }

  async function handleAction(action: 'approve' | 'delete', photo: PendingPhoto) {
    setActing(photo.id)
    try {
      // Save caption before approving
      const meta = watchMetaState[photo.watchId]
      if (meta) {
        await fetch('/api/admin/photos', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            photoId: photo.id,
            fields: { ...meta, caption: captionState[photo.id] ?? '' },
          }),
        })
      }

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
                      watchMeta={watchMetaState[group.watchId] ?? photoToWatchMeta(group.photos[0])}
                      captionState={captionState}
                      acting={acting}
                      savingGroup={savingGroup}
                      savedGroupOk={savedGroupOk}
                      onUpdateWatchMeta={updateWatchMeta}
                      onSaveGroup={handleSaveGroup}
                      onUpdateCaption={updateCaption}
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
                      watchMeta={watchMetaState[group.watchId] ?? photoToWatchMeta(group.photos[0])}
                      captionState={captionState}
                      acting={acting}
                      savingGroup={savingGroup}
                      savedGroupOk={savedGroupOk}
                      onUpdateWatchMeta={updateWatchMeta}
                      onSaveGroup={handleSaveGroup}
                      onUpdateCaption={updateCaption}
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
