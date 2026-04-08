'use client'

import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import type { PendingPhoto, ApprovedPhoto } from '@/lib/photos'

type Tab = 'pending' | 'approved' | 'rejected'

type EditableFields = {
  brandName: string
  modelName: string
  referenceNumber: string
  movement: string
  caseSize: string
  wristSize: string
  estimatedPrice: string
  lugToLug: string
  betweenLugs: string
  thickness: string
  waterResistance: string
}

// Watch-level metadata (shared across all photos for same watch)
type WatchMetaFields = EditableFields

type PhotoGroup<T extends PendingPhoto | ApprovedPhoto> = {
  watchId: string
  photos: T[]
  brandName: string
  modelName: string
  referenceNumber: string
  submitterName: string
  submittedDate: string
}

type LightboxState = {
  isOpen: boolean
  currentIndex: number
  watchId: string
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

  // Sort each group's photos by sortOrder asc, then createdAt asc (upload order)
  grouped.forEach((group) => {
    group.photos.sort((a, b) => {
      const orderDiff = (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
      if (orderDiff !== 0) return orderDiff
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    })
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
 * Lightbox modal component for viewing full-size photo with navigation
 */
function PhotoLightbox({
  isOpen,
  photos,
  currentIndex,
  onClose,
  onNext,
  onPrev,
}: {
  isOpen: boolean
  photos: (PendingPhoto | ApprovedPhoto)[]
  currentIndex: number
  onClose: () => void
  onNext: () => void
  onPrev: () => void
}) {
  if (!isOpen || photos.length === 0) return null

  const photo = photos[currentIndex]
  if (!photo) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white hover:text-gray-200 transition-colors text-2xl font-bold z-10"
        aria-label="Close lightbox"
      >
        ✕
      </button>

      {/* Previous button */}
      {photos.length > 1 && (
        <button
          onClick={onPrev}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 p-3 rounded-full transition-colors text-xl"
          aria-label="Previous photo"
        >
          ❮
        </button>
      )}

      {/* Main image */}
      <div className="flex flex-col items-center gap-3 max-w-3xl max-h-[90vh]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photo.url}
          alt="Full size"
          className="max-w-full max-h-[80vh] object-contain rounded"
        />

        {/* Navigation info */}
        {photos.length > 1 && (
          <p className="text-white text-sm">
            {currentIndex + 1} / {photos.length}
          </p>
        )}
      </div>

      {/* Next button */}
      {photos.length > 1 && (
        <button
          onClick={onNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 p-3 rounded-full transition-colors text-xl"
          aria-label="Next photo"
        >
          ❯
        </button>
      )}

    </div>
  )
}

/**
 * GroupedPhotoCard: Displays a group of photos for the same watch.
 * - Watch metadata shown ONCE at the group level
 * - Compact thumbnail grid (3-4 per row)
 * - Single "Approve Watch" button for entire group (pending tab)
 * - Individual delete buttons per photo (approved tab)
 * - Lightbox modal for viewing full-size photos with gallery nav
 */
function GroupedPhotoCard<T extends PendingPhoto | ApprovedPhoto>({
  group,
  watchMeta,
  acting,
  aiFillingGroup,
  aiFilledGroupOk,
  onUpdateWatchMeta,
  onAiFillGroup,
  onSaveMetadata,
  isDirty,
  isSavingMeta,
  savedMetaOk,
  onApproveGroup,
  onRejectGroup,
  onRestoreGroup,
  onDelete,
  onReorder,
  isApproved,
  isRejected,
}: {
  group: PhotoGroup<T>
  watchMeta: WatchMetaFields
  acting: string | null
  aiFillingGroup: string | null
  aiFilledGroupOk: string | null
  onUpdateWatchMeta: (watchId: string, field: keyof WatchMetaFields, value: string) => void
  onAiFillGroup: (watchId: string, imageUrls: string[]) => void
  onSaveMetadata?: (watchId: string, photoIds: string[]) => void
  isDirty?: boolean
  isSavingMeta?: boolean
  savedMetaOk?: boolean
  onApproveGroup?: (watchId: string, photoIds: string[]) => void
  onRejectGroup?: (watchId: string, photoIds: string[]) => void
  onRestoreGroup?: (watchId: string, photoIds: string[]) => void
  onDelete?: (photo: T) => void
  onReorder?: (watchId: string, reorderedPhotos: (PendingPhoto | ApprovedPhoto)[]) => void
  isApproved: boolean
  isRejected?: boolean
}) {
  const [lightbox, setLightbox] = useState<LightboxState>({
    isOpen: false,
    currentIndex: 0,
    watchId: group.watchId,
  })
  const [pointerDrag, setPointerDrag] = useState<{
    index: number; ghostX: number; ghostY: number
    offsetX: number; offsetY: number; cardW: number; cardH: number
  } | null>(null)
  const [dropIndex, setDropIndex] = useState<number | null>(null)
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])
  const gridRef = useRef<HTMLDivElement>(null)
  const [pendingReorder, setPendingReorder] = useState<(PendingPhoto | ApprovedPhoto)[] | null>(null)
  const [savingReorder, setSavingReorder] = useState(false)
  const [reorderSavedOk, setReorderSavedOk] = useState(false)

  const displayName = [watchMeta.brandName, watchMeta.modelName].filter(Boolean).join(' ') || group.watchId
  const isAiFillingGroup = aiFillingGroup === group.watchId
  const groupAiFilledOk = aiFilledGroupOk === group.watchId
  const isApprovingGroup = acting === `group-${group.watchId}`
  const isRejectingGroup = acting === `reject-${group.watchId}`
  const isRestoringGroup = acting === `restore-${group.watchId}`
  const isPending = !isApproved && !isRejected

  const openLightbox = useCallback((index: number) => {
    setLightbox({ isOpen: true, currentIndex: index, watchId: group.watchId })
  }, [group.watchId])

  const closeLightbox = useCallback(() => {
    setLightbox((prev) => ({ ...prev, isOpen: false }))
  }, [])

  const goNext = useCallback(() => {
    setLightbox((prev) => ({
      ...prev,
      currentIndex: (prev.currentIndex + 1) % group.photos.length,
    }))
  }, [group.photos.length])

  const goPrev = useCallback(() => {
    setLightbox((prev) => ({
      ...prev,
      currentIndex:
        prev.currentIndex === 0 ? group.photos.length - 1 : prev.currentIndex - 1,
    }))
  }, [group.photos.length])

  // Pointer-based drag: move ghost + find drop target
  useEffect(() => {
    if (!pointerDrag) return

    const handleMove = (e: PointerEvent) => {
      setPointerDrag((prev) => prev ? { ...prev, ghostX: e.clientX, ghostY: e.clientY } : null)
      for (let i = 0; i < cardRefs.current.length; i++) {
        const el = cardRefs.current[i]
        if (!el) continue
        const r = el.getBoundingClientRect()
        if (e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom) {
          setDropIndex(i)
          break
        }
      }
    }

    const handleUp = () => {
      setPointerDrag((prev) => {
        if (prev && dropIndex !== null && dropIndex !== prev.index) {
          const source = pendingReorder ?? group.photos
          const reordered = [...source]
          const [moved] = reordered.splice(prev.index, 1)
          reordered.splice(dropIndex, 0, moved)
          setPendingReorder(reordered)
          setReorderSavedOk(false)
        }
        return null
      })
      setDropIndex(null)
    }

    window.addEventListener('pointermove', handleMove)
    window.addEventListener('pointerup', handleUp)
    return () => {
      window.removeEventListener('pointermove', handleMove)
      window.removeEventListener('pointerup', handleUp)
    }
  }, [pointerDrag, dropIndex, group.photos, pendingReorder, group.watchId, onReorder])

  return (
    <>
      <div className="border border-border rounded-lg overflow-hidden bg-surface">
        {/* Header */}
        <div className="px-3 py-2.5 sm:px-4 sm:py-3 border-b border-border bg-surfaceAlt">
          <div className="flex items-start justify-between gap-2 mb-0.5">
            <div className="flex-1 min-w-0">
              <h3 className="text-sm sm:text-base font-bold text-textPrimary truncate">{displayName || 'New Watch'}</h3>
              <p className="text-xs text-textMuted mt-0.5">
                {group.submitterName} ·{' '}
                {new Date(group.submittedDate).toLocaleDateString('en-US', {
                  month: 'short', day: 'numeric', year: 'numeric',
                })}
              </p>
            </div>
            <div className="text-xs font-semibold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full shrink-0">
              {group.photos.length}
            </div>
          </div>
        </div>

        {/* Watch metadata — compact grid */}
        <div className="px-3 py-2.5 sm:px-4 sm:py-3 border-b border-border">
          <p className="text-[10px] font-semibold text-textMuted uppercase tracking-wider mb-1.5">Watch Info</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
            <FieldInput label="Brand" value={watchMeta.brandName} onChange={(v) => onUpdateWatchMeta(group.watchId, 'brandName', v)} />
            <FieldInput label="Model" value={watchMeta.modelName} onChange={(v) => onUpdateWatchMeta(group.watchId, 'modelName', v)} />
            <FieldInput label="Ref #" value={watchMeta.referenceNumber} onChange={(v) => onUpdateWatchMeta(group.watchId, 'referenceNumber', v)} />
            <FieldInput label="Movement" value={watchMeta.movement} onChange={(v) => onUpdateWatchMeta(group.watchId, 'movement', v)} />
            <FieldInput label="Case" value={watchMeta.caseSize} onChange={(v) => onUpdateWatchMeta(group.watchId, 'caseSize', v)} unit="mm" />
            <FieldInput label="Wrist" value={watchMeta.wristSize} onChange={(v) => onUpdateWatchMeta(group.watchId, 'wristSize', v)} unit="mm" />
            <FieldInput label="Price" value={watchMeta.estimatedPrice} onChange={(v) => onUpdateWatchMeta(group.watchId, 'estimatedPrice', v)} unit="USD" />
            <FieldInput label="L-L" value={watchMeta.lugToLug} onChange={(v) => onUpdateWatchMeta(group.watchId, 'lugToLug', v)} unit="mm" />
            <FieldInput label="B.L." value={watchMeta.betweenLugs} onChange={(v) => onUpdateWatchMeta(group.watchId, 'betweenLugs', v)} unit="mm" />
            <FieldInput label="Thick" value={watchMeta.thickness} onChange={(v) => onUpdateWatchMeta(group.watchId, 'thickness', v)} unit="mm" />
            <FieldInput label="WR" value={watchMeta.waterResistance} onChange={(v) => onUpdateWatchMeta(group.watchId, 'waterResistance', v)} unit="m" />
          </div>
          <div className="flex items-center gap-2 mt-2">
            <button
              onClick={() => onAiFillGroup(group.watchId, group.photos.map((p) => p.url))}
              disabled={isAiFillingGroup}
              className="text-xs bg-purple-600 text-white px-2.5 py-1 rounded font-medium hover:bg-purple-700 transition-colors disabled:opacity-50"
            >
              {isAiFillingGroup ? 'Filling...' : '✨ AI Fill'}
            </button>
            {groupAiFilledOk && <span className="text-xs text-green-600 font-medium">✓ Filled</span>}
          </div>
        </div>

        {/* Compact thumbnail grid */}
        <div className="px-3 py-2.5 sm:px-4 sm:py-3 border-b border-border">
          <div ref={gridRef} className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
            {(pendingReorder ?? group.photos as (PendingPhoto | ApprovedPhoto)[]).map((photo, idx) => {
              const isActing = acting === photo.id
              const isLastPhoto = group.photos.length === 1
              const canDelete = isRejected || isPending ? true : !isLastPhoto
              
              const canDrag = !isRejected && !isLastPhoto
              const isDragging = pointerDrag?.index === idx
              const isDropTarget = dropIndex === idx && pointerDrag !== null && dropIndex !== pointerDrag.index

              const handlePointerDown = (e: React.PointerEvent) => {
                if (!canDrag) return
                // Only main button (left click / touch)
                if (e.button !== 0 && e.pointerType === 'mouse') return
                e.preventDefault()
                const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
                setPointerDrag({
                  index: idx,
                  ghostX: e.clientX,
                  ghostY: e.clientY,
                  offsetX: e.clientX - rect.left,
                  offsetY: e.clientY - rect.top,
                  cardW: rect.width,
                  cardH: rect.height,
                })
                setDropIndex(idx)
              }

              return (
                <div
                  key={photo.id}
                  ref={(el) => { cardRefs.current[idx] = el }}
                  onPointerDown={handlePointerDown}
                  className={`relative aspect-square rounded overflow-hidden border transition-all select-none touch-none ${
                    isDragging
                      ? 'opacity-30 border-dashed border-blue-400 bg-blue-50'
                      : isDropTarget
                        ? 'ring-2 ring-blue-500 border-blue-500 scale-105 shadow-lg'
                        : canDrag
                          ? 'border-border cursor-grab hover:border-blue-400 hover:ring-1 hover:ring-blue-300 hover:shadow-md'
                          : 'border-border'
                  }`}
                >
                  <button
                    onClick={(e) => { if (pointerDrag) { e.preventDefault(); return }; openLightbox(idx) }}
                    className="w-full h-full"
                    aria-label={`View photo ${idx + 1}`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photo.url}
                      alt={`Photo ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>

                  {/* Position badge (for draggable photos — pending and approved) */}
                  {canDrag && (
                    <div className="absolute bottom-1 left-1 bg-black/60 text-white text-[10px] rounded px-1">
                      #{idx + 1}
                    </div>
                  )}

                  {/* Delete button overlay */}
                  {onDelete && (
                    <button
                      onClick={() => onDelete(photo as T)}
                      disabled={isActing || !canDelete}
                      className={`absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                        canDelete
                          ? 'bg-black/60 text-white hover:bg-red-600'
                          : 'bg-gray-500/60 text-gray-300 cursor-not-allowed'
                      }`}
                      title={isLastPhoto && !isRejected && !isPending ? 'Cannot delete the last photo' : 'Delete photo'}
                      aria-label="Delete photo"
                    >
                      {isActing ? '…' : '✕'}
                    </button>
                  )}
                </div>
              )
            })}
          </div>

          {/* Pending reorder save bar */}
          {pendingReorder && (
            <div className="mt-2 flex items-center gap-2">
              <button
                onClick={async () => {
                  setSavingReorder(true)
                  await onReorder?.(group.watchId, pendingReorder)
                  setSavingReorder(false)
                  setReorderSavedOk(true)
                  setPendingReorder(null)
                  setTimeout(() => setReorderSavedOk(false), 2000)
                }}
                disabled={savingReorder}
                className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded font-semibold transition-colors disabled:opacity-50 flex items-center gap-1.5"
              >
                {savingReorder ? (
                  <><span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" /> Saving…</>
                ) : '💾 Save order'}
              </button>
              <button
                onClick={() => setPendingReorder(null)}
                disabled={savingReorder}
                className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1.5 rounded transition-colors"
              >
                Discard
              </button>
            </div>
          )}
          {reorderSavedOk && (
            <p className="mt-1.5 text-xs text-green-600 font-medium">✓ Order saved</p>
          )}
        </div>

        {/* Action buttons — bottom of card */}
        <div className="px-3 py-2.5 sm:px-4 sm:py-3 bg-surfaceAlt flex items-center gap-2">
          {!isApproved && !isRejected && onApproveGroup && (
            <button
              onClick={() => onApproveGroup(group.watchId, group.photos.map((p) => p.id))}
              disabled={isApprovingGroup}
              className="flex-1 text-sm bg-green-600 text-white px-4 py-2 rounded font-semibold hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {isApprovingGroup ? 'Approving...' : `Approve Watch (${group.photos.length})`}
            </button>
          )}
          {!isApproved && !isRejected && onRejectGroup && (
            <button
              onClick={() => onRejectGroup(group.watchId, group.photos.map((p) => p.id))}
              disabled={isRejectingGroup}
              className="bg-red-600 hover:bg-red-700 text-white rounded px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-50"
            >
              {isRejectingGroup ? 'Rejecting...' : `Reject Watch`}
            </button>
          )}
          {isRejected && onRestoreGroup && (
            <button
              onClick={() => onRestoreGroup(group.watchId, group.photos.map((p) => p.id))}
              disabled={isRestoringGroup}
              className="flex-1 text-sm bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded font-semibold transition-colors disabled:opacity-50"
            >
              {isRestoringGroup ? 'Restoring...' : `Restore to Pending`}
            </button>
          )}
          {isApproved && !isDirty && (
            <div className="text-sm text-green-600 font-semibold">
              {savedMetaOk ? '✓ Saved' : '✓ Approved'}
            </div>
          )}
          {isApproved && isDirty && onSaveMetadata && (
            <button
              onClick={() => onSaveMetadata(group.watchId, group.photos.map((p) => p.id))}
              disabled={isSavingMeta}
              className="flex-1 text-sm bg-blue-600 text-white px-4 py-2 rounded font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isSavingMeta ? 'Saving...' : 'Save Changes'}
            </button>
          )}
          {isRejected && (
            <div className="text-sm text-red-600 font-semibold">✗ Rejected</div>
          )}
        </div>
      </div>

      {/* Lightbox modal */}
      <PhotoLightbox
        isOpen={lightbox.isOpen && lightbox.watchId === group.watchId}
        photos={group.photos}
        currentIndex={lightbox.currentIndex}
        onClose={closeLightbox}
        onNext={goNext}
        onPrev={goPrev}
      />

      {/* Floating ghost — follows cursor while dragging */}
      {pointerDrag && (() => {
        const dragPhotos = pendingReorder ?? group.photos
        const photo = dragPhotos[pointerDrag.index]
        if (!photo) return null
        return (
          <div
            style={{
              position: 'fixed',
              left: pointerDrag.ghostX - pointerDrag.offsetX,
              top: pointerDrag.ghostY - pointerDrag.offsetY,
              width: pointerDrag.cardW,
              height: pointerDrag.cardH,
              zIndex: 1000,
              pointerEvents: 'none',
              transform: 'rotate(3deg) scale(1.08)',
              boxShadow: '0 24px 48px rgba(0,0,0,0.35)',
              borderRadius: '8px',
              overflow: 'hidden',
              cursor: 'grabbing',
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photo.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', inset: 0, border: '2px solid rgba(59,130,246,0.8)', borderRadius: '8px' }} />
          </div>
        )
      })()}
    </>
  )
}

export default function AdminPhotosClient() {
  const [activeTab, setActiveTab] = useState<Tab>('pending')
  const [pendingPhotos, setPendingPhotos] = useState<PendingPhoto[]>([])
  const [approvedPhotos, setApprovedPhotos] = useState<ApprovedPhoto[]>([])
  const [rejectedPhotos, setRejectedPhotos] = useState<PendingPhoto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')
  const [acting, setActing] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState<string>('')

  // Group-level watch metadata state (keyed by watchId)
  const [watchMetaState, setWatchMetaState] = useState<Record<string, WatchMetaFields>>({})

  // AI Fill state
  const [aiFillingGroup, setAiFillingGroup] = useState<string | null>(null)
  const [aiFilledGroupOk, setAiFilledGroupOk] = useState<string | null>(null)

  // Metadata save state (approved tab)
  const [dirtyGroups, setDirtyGroups] = useState<Set<string>>(new Set())
  const [savingMetaGroup, setSavingMetaGroup] = useState<string | null>(null)
  const [savedMetaGroupOk, setSavedMetaGroupOk] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const showToast = useCallback((message: string) => {
    setToast(message)
    setTimeout(() => setToast(null), 2500)
  }, [])

  // Grouped photos for display
  const pendingGroups = useMemo(() => groupPhotosByWatch(pendingPhotos), [pendingPhotos])
  const approvedGroups = useMemo(() => groupPhotosByWatch(approvedPhotos), [approvedPhotos])
  const rejectedGroups = useMemo(() => groupPhotosByWatch(rejectedPhotos), [rejectedPhotos])

  // Filter groups by search query
  const filteredPendingGroups = useMemo(() => {
    if (!searchQuery.trim()) return pendingGroups
    const query = searchQuery.toLowerCase()
    return pendingGroups.filter((group) => {
      return group.brandName.toLowerCase().includes(query) ||
        group.modelName.toLowerCase().includes(query) ||
        group.referenceNumber.toLowerCase().includes(query)
    })
  }, [pendingGroups, searchQuery])

  const filteredApprovedGroups = useMemo(() => {
    if (!searchQuery.trim()) return approvedGroups
    const query = searchQuery.toLowerCase()
    return approvedGroups.filter((group) => {
      return group.brandName.toLowerCase().includes(query) ||
        group.modelName.toLowerCase().includes(query) ||
        group.referenceNumber.toLowerCase().includes(query)
    })
  }, [approvedGroups, searchQuery])

  const filteredRejectedGroups = useMemo(() => {
    if (!searchQuery.trim()) return rejectedGroups
    const query = searchQuery.toLowerCase()
    return rejectedGroups.filter((group) => {
      return group.brandName.toLowerCase().includes(query) ||
        group.modelName.toLowerCase().includes(query) ||
        group.referenceNumber.toLowerCase().includes(query)
    })
  }, [rejectedGroups, searchQuery])

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        const [pendingRes, approvedRes, rejectedRes] = await Promise.all([
          fetch('/api/admin/photos'),
          fetch('/api/admin/photos?status=approved'),
          fetch('/api/admin/photos?status=rejected'),
        ])

        if (!pendingRes.ok || !approvedRes.ok || !rejectedRes.ok) {
          if (pendingRes.status === 401 || pendingRes.status === 403) {
            throw new Error('Access denied — admin only')
          }
          throw new Error('Failed to fetch photos')
        }

        const pendingData = (await pendingRes.json()) as PendingPhoto[]
        const approvedData = (await approvedRes.json()) as ApprovedPhoto[]
        const rejectedData = (await rejectedRes.json()) as PendingPhoto[]

        if (Array.isArray(pendingData)) {
          setPendingPhotos(pendingData)
          initializeState(pendingData)
        }

        if (Array.isArray(approvedData)) {
          setApprovedPhotos(approvedData)
          initializeState(approvedData)
        }

        if (Array.isArray(rejectedData)) {
          setRejectedPhotos(rejectedData)
          initializeState(rejectedData)
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

    photos.forEach((photo) => {
      if (!metaByWatch[photo.watchId]) {
        metaByWatch[photo.watchId] = photoToWatchMeta(photo)
      }
    })

    setWatchMetaState((prev) => ({ ...prev, ...metaByWatch }))
  }

  function updateWatchMeta(watchId: string, field: keyof WatchMetaFields, value: string) {
    setWatchMetaState((prev) => ({
      ...prev,
      [watchId]: { ...prev[watchId], [field]: value },
    }))
    setDirtyGroups((prev) => new Set(prev).add(watchId))
  }

  async function handleSaveMetadata(watchId: string, photoIds: string[]) {
    const meta = watchMetaState[watchId]
    if (!meta) return
    setSavingMetaGroup(watchId)
    try {
      const results = await Promise.all(
        photoIds.map((photoId) =>
          fetch('/api/admin/photos', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ photoId, fields: { ...meta } }),
          })
        )
      )
      if (results.every((r) => r.ok)) {
        setDirtyGroups((prev) => { const next = new Set(prev); next.delete(watchId); return next })
        // Update local approved photos state so gallery reflects new meta immediately
        setApprovedPhotos((prev) =>
          prev.map((p) => (p.watchId !== watchId ? p : { ...p, ...meta }))
        )
        setSavedMetaGroupOk(watchId)
        setTimeout(() => setSavedMetaGroupOk(null), 2500)
      } else {
        alert('Save failed — one or more photos could not be updated.')
      }
    } catch (err) {
      alert(`Save failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
    setSavingMetaGroup(null)
  }

  async function handleAiFillGroup(watchId: string, imageUrls: string[]) {
    const meta = watchMetaState[watchId]
    if (!meta) return

    setAiFillingGroup(watchId)
    setAiFilledGroupOk(null)

    try {
      const response = await fetch('/api/admin/ai-fill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brandName: meta.brandName,
          modelName: meta.modelName,
          referenceNumber: meta.referenceNumber,
          imageUrls,
        }),
      })

      if (!response.ok) {
        const err = await response.json().catch(() => ({})) as { error?: string }
        throw new Error(err.error || 'Failed to fetch AI suggestions')
      }

      const aiSuggestions = (await response.json()) as Record<string, string>

      // Update watchMeta — only fill empty fields
      setWatchMetaState((prev) => {
        const current = prev[watchId] ?? {}
        const fill = (key: keyof typeof current) =>
          (current[key] as string)?.trim() ? current[key] : aiSuggestions[key] || ''
        return {
          ...prev,
          [watchId]: {
            ...current,
            movement: fill('movement'),
            caseSize: fill('caseSize'),
            lugToLug: fill('lugToLug'),
            betweenLugs: fill('betweenLugs'),
            thickness: fill('thickness'),
            waterResistance: fill('waterResistance'),
            estimatedPrice: fill('estimatedPrice'),
            wristSize: fill('wristSize'),
          },
        }
      })

      setDirtyGroups((prev) => new Set(prev).add(watchId))
      setAiFilledGroupOk(watchId)
      setTimeout(() => setAiFilledGroupOk(null), 2500)
    } catch (err) {
      console.error('AI fill failed:', err)
      alert(`AI fill failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }

    setAiFillingGroup(null)
  }

  /**
   * Approve entire watch group — all photos and metadata approved at once
   */
  async function handleApproveGroup(watchId: string, photoIds: string[]) {
    setActing(`group-${watchId}`)
    try {
      // Save all metadata first
      const meta = watchMetaState[watchId]
      if (meta) {
        await Promise.all(
          photoIds.map((photoId) =>
            fetch('/api/admin/photos', {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                photoId,
                fields: { ...meta },
              }),
            })
          )
        )
      }

      // Approve all photos in group
      const approveResults = await Promise.all(
        photoIds.map((photoId) =>
          fetch('/api/admin/photos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'approve', watchId, photoId }),
          })
        )
      )

      if (approveResults.every((res) => res.ok)) {
        // Move all photos from pending to approved
        const photosToApprove = pendingPhotos.filter((p) => photoIds.includes(p.id))
        setPendingPhotos((prev) => prev.filter((p) => !photoIds.includes(p.id)))
        setApprovedPhotos((prev) => [
          ...photosToApprove.map((p) => ({ ...p, approved: true as const })),
          ...prev,
        ])
      }
    } catch { /* ignore */ }
    setActing(null)
  }

  async function handleReorder(
    watchId: string,
    reorderedPhotos: (PendingPhoto | ApprovedPhoto)[]
  ) {
    // reorderedPhotos is already in the new order from drag-and-drop
    setActing(`reorder-${watchId}`)
    try {
      const res = await fetch('/api/admin/photos', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ watchId, photoIds: reorderedPhotos.map((p) => p.id) }),
      })
      if (res.ok) {
        setApprovedPhotos((prev) =>
          prev.map((p) => ({
            ...p,
            sortOrder: reorderedPhotos.findIndex((rp) => rp.id === p.id),
          }))
        )
        showToast('Order saved')
      }
    } catch { /* ignore */ }
    setActing(null)
  }

  async function handleReorderPending(
    watchId: string,
    reorderedPhotos: (PendingPhoto | ApprovedPhoto)[]
  ) {
    setActing(`reorder-${watchId}`)
    try {
      const res = await fetch('/api/admin/photos', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ watchId, photoIds: reorderedPhotos.map((p) => p.id) }),
      })
      if (res.ok) {
        // Reorder pending photos in local state to reflect drag order
        setPendingPhotos((prev) => {
          const reorderedIds = reorderedPhotos.map((p) => p.id)
          const watchPhotos = prev.filter((p) => p.watchId === watchId)
          const otherPhotos = prev.filter((p) => p.watchId !== watchId)
          const sorted = reorderedIds.map((id) => watchPhotos.find((p) => p.id === id)!).filter(Boolean)
          return [...otherPhotos, ...sorted]
        })
        showToast('Order saved')
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

  async function handleRejectGroup(watchId: string, photoIds: string[]) {
    setActing(`reject-${watchId}`)
    try {
      const results = await Promise.all(
        photoIds.map((photoId) =>
          fetch('/api/admin/photos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'reject', watchId, photoId }),
          })
        )
      )

      if (results.every((res) => res.ok)) {
        const photosToReject = pendingPhotos.filter((p) => photoIds.includes(p.id))
        setPendingPhotos((prev) => prev.filter((p) => !photoIds.includes(p.id)))
        setRejectedPhotos((prev) => [...photosToReject, ...prev])
      }
    } catch { /* ignore */ }
    setActing(null)
  }

  async function handleRestoreGroup(watchId: string, photoIds: string[]) {
    setActing(`restore-${watchId}`)
    try {
      const results = await Promise.all(
        photoIds.map((photoId) =>
          fetch('/api/admin/photos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'restore', watchId, photoId }),
          })
        )
      )

      if (results.every((res) => res.ok)) {
        const photosToRestore = rejectedPhotos.filter((p) => photoIds.includes(p.id))
        setRejectedPhotos((prev) => prev.filter((p) => !photoIds.includes(p.id)))
        setPendingPhotos((prev) => [...photosToRestore, ...prev])
      }
    } catch { /* ignore */ }
    setActing(null)
  }

  async function handleDeletePending(photo: PendingPhoto) {
    if (!confirm('Delete this pending photo? This cannot be undone.')) return
    setActing(photo.id)
    try {
      const res = await fetch('/api/admin/photos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete-pending', watchId: photo.watchId, photoId: photo.id }),
      })
      if (res.ok) {
        setPendingPhotos((prev) => prev.filter((p) => p.id !== photo.id))
      }
    } catch { /* ignore */ }
    setActing(null)
  }

  async function handleDeleteRejected(photo: PendingPhoto) {
    if (!confirm('Permanently delete this photo? This cannot be undone.')) return
    setActing(photo.id)
    try {
      const res = await fetch('/api/admin/photos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', watchId: photo.watchId, photoId: photo.id }),
      })
      if (res.ok) {
        setRejectedPhotos((prev) => prev.filter((p) => p.id !== photo.id))
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

      {/* Search Bar */}
      <div className="mb-6 flex items-center gap-2">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search by brand, model, or reference #..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-sm border border-border rounded px-3 py-2 bg-surface text-textPrimary placeholder-textMuted focus:outline-none focus:ring-1 focus:ring-blue-400"
            aria-label="Search watches"
          />
        </div>
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="px-2.5 py-2 text-xl text-textMuted hover:text-textPrimary transition-colors"
            aria-label="Clear search"
            title="Clear search"
          >
            ×
          </button>
        )}
      </div>

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
        <button
          onClick={() => setActiveTab('rejected')}
          className={`px-3 sm:px-5 py-2.5 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'rejected'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-textMuted hover:text-textPrimary'
          }`}
        >
          Rejected
          {!loading && rejectedPhotos.length > 0 && (
            <span className="ml-1 sm:ml-2 bg-red-100 text-red-700 text-xs font-semibold px-2 py-0.5 rounded-full inline-block">
              {rejectedPhotos.length}
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
              ) : filteredPendingGroups.length === 0 ? (
                <div className="py-16 text-center">
                  <p className="text-textSecond text-lg mb-1">No matches</p>
                  <p className="text-textMuted text-sm">No watches match your search.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredPendingGroups.map((group) => (
                    <GroupedPhotoCard
                      key={group.watchId}
                      group={group}
                      watchMeta={watchMetaState[group.watchId] ?? photoToWatchMeta(group.photos[0])}
                      acting={acting}
                      aiFillingGroup={aiFillingGroup}
                      aiFilledGroupOk={aiFilledGroupOk}
                      onUpdateWatchMeta={updateWatchMeta}
                      onAiFillGroup={handleAiFillGroup}
                      onApproveGroup={handleApproveGroup}
                      onRejectGroup={handleRejectGroup}
                      onDelete={(photo) => handleDeletePending(photo)}
                      onReorder={handleReorderPending}
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
              ) : filteredApprovedGroups.length === 0 ? (
                <div className="py-16 text-center">
                  <p className="text-textSecond text-lg mb-1">No matches</p>
                  <p className="text-textMuted text-sm">No watches match your search.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredApprovedGroups.map((group) => (
                    <GroupedPhotoCard
                      key={group.watchId}
                      group={group}
                      watchMeta={watchMetaState[group.watchId] ?? photoToWatchMeta(group.photos[0])}
                      acting={acting}
                      aiFillingGroup={aiFillingGroup}
                      aiFilledGroupOk={aiFilledGroupOk}
                      onUpdateWatchMeta={updateWatchMeta}
                      onAiFillGroup={handleAiFillGroup}
                      onSaveMetadata={handleSaveMetadata}
                      isDirty={dirtyGroups.has(group.watchId)}
                      isSavingMeta={savingMetaGroup === group.watchId}
                      savedMetaOk={savedMetaGroupOk === group.watchId}
                      onDelete={(photo) => handleDeleteApproved(photo)}
                      onReorder={handleReorder}
                      isApproved={true}
                    />
                  ))}
                </div>
              )}
            </>
          )}

          {activeTab === 'rejected' && (
            <>
              {rejectedPhotos.length === 0 ? (
                <div className="py-16 text-center">
                  <p className="text-textSecond">No rejected photos.</p>
                </div>
              ) : filteredRejectedGroups.length === 0 ? (
                <div className="py-16 text-center">
                  <p className="text-textSecond text-lg mb-1">No matches</p>
                  <p className="text-textMuted text-sm">No watches match your search.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredRejectedGroups.map((group) => (
                    <GroupedPhotoCard
                      key={group.watchId}
                      group={group}
                      watchMeta={watchMetaState[group.watchId] ?? photoToWatchMeta(group.photos[0])}
                      acting={acting}


                      aiFillingGroup={aiFillingGroup}
                      aiFilledGroupOk={aiFilledGroupOk}
                      onUpdateWatchMeta={updateWatchMeta}

                      onAiFillGroup={handleAiFillGroup}
                      onRestoreGroup={handleRestoreGroup}
                      onDelete={(photo) => handleDeleteRejected(photo)}
                      isApproved={false}
                      isRejected={true}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* Toast notification */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-sm px-4 py-2 rounded-full shadow-lg z-50 pointer-events-none">
          {toast}
        </div>
      )}
    </div>
  )
}
