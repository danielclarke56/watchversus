'use client'

import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import dynamic from 'next/dynamic'
import type { PendingPhoto, ApprovedPhoto } from '@/lib/photos'
import { generatePhotoSlug } from '@/lib/generatePhotoSlug'

const CropModal = dynamic(() => import('@/app/upload/CropModal'), { ssr: false })

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
  key: string
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



/** Extract the real watchId from a group key like "omega-seamaster::user_abc" */
function watchIdFromKey(groupKey: string): string {
  return groupKey.split('::')[0]
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
 * Group photos by watchId + userId (= one submission). Each group takes metadata from the first photo.
 * Photos are ordered newest first within each group.
 */
function groupPhotosByWatch<T extends PendingPhoto | ApprovedPhoto>(photos: T[]): PhotoGroup<T>[] {
  const grouped = new Map<string, PhotoGroup<T>>()

  photos.forEach((photo) => {
    const key = `${photo.watchId}::${photo.userId}`
    if (!grouped.has(key)) {
      grouped.set(key, {
        key,
        watchId: photo.watchId,
        photos: [],
        brandName: photo.brandName ?? '',
        modelName: photo.modelName ?? '',
        referenceNumber: photo.referenceNumber ?? '',
        submitterName: photo.userName,
        submittedDate: photo.createdAt,
      })
    }
    grouped.get(key)!.photos.push(photo)
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
  onDeleteGroup,
  onDelete,
  onSplitPhoto,
  splittingPhotoId,
  onCropPhoto,
  onRevertCrop,
  croppingPhotoId,
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
  onDeleteGroup?: (watchId: string, photoIds: string[]) => void
  onDelete?: (photo: T) => void
  onSplitPhoto?: (photo: T) => void
  splittingPhotoId?: string | null
  onCropPhoto?: (photo: T) => void
  onRevertCrop?: (photo: T) => void
  croppingPhotoId?: string | null
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
  const isAiFillingGroup = aiFillingGroup === group.key
  const groupAiFilledOk = aiFilledGroupOk === group.key
  const isApprovingGroup = acting === `group-${group.key}`
  const isRejectingGroup = acting === `reject-${group.key}`
  const isRestoringGroup = acting === `restore-${group.key}`
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
  }, [pointerDrag, dropIndex, group.photos, pendingReorder, group.key, onReorder])

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
            <div className="flex items-center gap-1.5 shrink-0">
              {isApproved && group.photos.reduce((s, p) => s + (p.likeCount ?? 0), 0) > 0 && (
                <span className="text-xs font-semibold bg-red-50 text-red-600 px-2 py-0.5 rounded-full" title="Total likes">
                  ♥ {group.photos.reduce((s, p) => s + (p.likeCount ?? 0), 0)}
                </span>
              )}
              {isApproved && group.photos.reduce((s, p) => s + (p.saveCount ?? 0), 0) > 0 && (
                <span className="text-xs font-semibold bg-yellow-50 text-yellow-700 px-2 py-0.5 rounded-full" title="Total saves">
                  🔖 {group.photos.reduce((s, p) => s + (p.saveCount ?? 0), 0)}
                </span>
              )}
              <span className="text-xs font-semibold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                {group.photos.length}
              </span>
            </div>
          </div>
        </div>

        {/* Watch metadata — compact grid */}
        <div className="px-3 py-2.5 sm:px-4 sm:py-3 border-b border-border">
          <p className="text-[10px] font-semibold text-textMuted uppercase tracking-wider mb-1.5">Watch Info</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
            <FieldInput label="Brand" value={watchMeta.brandName} onChange={(v) => onUpdateWatchMeta(group.key, 'brandName', v)} />
            <FieldInput label="Model" value={watchMeta.modelName} onChange={(v) => onUpdateWatchMeta(group.key, 'modelName', v)} />
            <FieldInput label="Ref #" value={watchMeta.referenceNumber} onChange={(v) => onUpdateWatchMeta(group.key, 'referenceNumber', v)} />
            <FieldInput label="Movement" value={watchMeta.movement} onChange={(v) => onUpdateWatchMeta(group.key, 'movement', v)} />
            <FieldInput label="Case" value={watchMeta.caseSize} onChange={(v) => onUpdateWatchMeta(group.key, 'caseSize', v)} unit="mm" />
            <FieldInput label="Wrist" value={watchMeta.wristSize} onChange={(v) => onUpdateWatchMeta(group.key, 'wristSize', v)} unit="mm" />
            <FieldInput label="Price" value={watchMeta.estimatedPrice} onChange={(v) => onUpdateWatchMeta(group.key, 'estimatedPrice', v)} unit="USD" />
            <FieldInput label="L-L" value={watchMeta.lugToLug} onChange={(v) => onUpdateWatchMeta(group.key, 'lugToLug', v)} unit="mm" />
            <FieldInput label="B.L." value={watchMeta.betweenLugs} onChange={(v) => onUpdateWatchMeta(group.key, 'betweenLugs', v)} unit="mm" />
            <FieldInput label="Thick" value={watchMeta.thickness} onChange={(v) => onUpdateWatchMeta(group.key, 'thickness', v)} unit="mm" />
            <FieldInput label="WR" value={watchMeta.waterResistance} onChange={(v) => onUpdateWatchMeta(group.key, 'waterResistance', v)} unit="m" />
          </div>
          <div className="flex items-center gap-2 mt-2">
            <button
              onClick={() => onAiFillGroup(group.key, group.photos.map((p) => p.url))}
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

                  {/* Crop / Revert buttons */}
                  {onCropPhoto && (
                    <div className="absolute bottom-1 right-1 flex gap-0.5">
                      {onRevertCrop && photo.originalUrl && (
                        <button
                          onClick={(e) => { e.stopPropagation(); onRevertCrop(photo as T) }}
                          disabled={croppingPhotoId === photo.id}
                          className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] bg-amber-600 text-white hover:bg-amber-700 transition-colors disabled:opacity-50"
                          title="Revert to original (undo crop)"
                          aria-label="Revert to original"
                        >
                          {croppingPhotoId === photo.id ? '…' : '↺'}
                        </button>
                      )}
                      <button
                        onClick={(e) => { e.stopPropagation(); onCropPhoto(photo as T) }}
                        disabled={croppingPhotoId === photo.id}
                        className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] bg-black/60 text-white hover:bg-purple-600 transition-colors disabled:opacity-50"
                        title="Crop photo"
                        aria-label="Crop photo"
                      >
                        {croppingPhotoId === photo.id ? '…' : '⬔'}
                      </button>
                    </div>
                  )}

                  {/* Split button — re-identify and move to its own group */}
                  {onSplitPhoto && !isLastPhoto && isPending && (
                    <button
                      onClick={(e) => { e.stopPropagation(); onSplitPhoto(photo as T) }}
                      disabled={splittingPhotoId === photo.id}
                      className="absolute top-1 left-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
                      title="Split: re-identify this photo as a separate watch"
                      aria-label="Split photo to new watch"
                    >
                      {splittingPhotoId === photo.id ? '…' : '✂'}
                    </button>
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
                  await onReorder?.(group.key, pendingReorder)
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
        <div className="px-3 py-2.5 sm:px-4 sm:py-3 bg-surfaceAlt flex flex-col gap-2">
          {/* Pending: save row (shown when dirty) */}
          {!isApproved && !isRejected && isDirty && onSaveMetadata && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onSaveMetadata(group.key, group.photos.map((p) => p.id))}
                disabled={isSavingMeta}
                className="flex-1 text-sm bg-blue-600 text-white px-4 py-2 rounded font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {isSavingMeta ? (
                  <><span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" /> Saving…</>
                ) : '💾 Save metadata'}
              </button>
              {savedMetaOk && <span className="text-xs text-green-600 font-semibold shrink-0">✓ Saved</span>}
            </div>
          )}
          {/* Pending: approve / reject row */}
          <div className="flex items-center gap-2">
            {!isApproved && !isRejected && onApproveGroup && (
              <button
                onClick={() => onApproveGroup(group.key, group.photos.map((p) => p.id))}
                disabled={isApprovingGroup}
                className={`flex-1 text-sm text-white px-4 py-2 rounded font-semibold transition-colors disabled:opacity-50 ${
                  isDirty ? 'bg-green-500 hover:bg-green-600' : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {isApprovingGroup ? 'Approving...' : `Approve Watch (${group.photos.length})`}
              </button>
            )}
            {!isApproved && !isRejected && onRejectGroup && (
              <button
                onClick={() => onRejectGroup(group.key, group.photos.map((p) => p.id))}
                disabled={isRejectingGroup}
                className="bg-red-600 hover:bg-red-700 text-white rounded px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-50"
              >
                {isRejectingGroup ? 'Rejecting...' : `Reject`}
              </button>
            )}
            {isRejected && onRestoreGroup && (
              <button
                onClick={() => onRestoreGroup(group.key, group.photos.map((p) => p.id))}
                disabled={isRestoringGroup}
                className="flex-1 text-sm bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded font-semibold transition-colors disabled:opacity-50"
              >
                {isRestoringGroup ? 'Restoring...' : `Restore to Pending`}
              </button>
            )}
            {isRejected && onDeleteGroup && (
              <button
                onClick={() => {
                  if (confirm(`Permanently delete all ${group.photos.length} photo${group.photos.length > 1 ? 's' : ''} for ${displayName}? This cannot be undone.`))
                    onDeleteGroup(group.key, group.photos.map((p) => p.id))
                }}
                disabled={acting === `delete-group-${group.key}`}
                className="text-sm bg-red-700 hover:bg-red-800 text-white px-3 py-2 rounded font-semibold transition-colors disabled:opacity-50"
              >
                {acting === `delete-group-${group.key}` ? 'Deleting…' : '🗑 Delete all'}
              </button>
            )}
            {isApproved && !isDirty && (
              <div className="text-sm text-green-600 font-semibold">
                {savedMetaOk ? '✓ Saved' : '✓ Approved'}
              </div>
            )}
            {isApproved && isDirty && onSaveMetadata && (
              <button
                onClick={() => onSaveMetadata(group.key, group.photos.map((p) => p.id))}
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

  // Split photo state
  const [splittingPhotoId, setSplittingPhotoId] = useState<string | null>(null)

  // Crop state
  const [cropTarget, setCropTarget] = useState<{ photoId: string; imageUrl: string } | null>(null)
  const [croppingPhotoId, setCroppingPhotoId] = useState<string | null>(null)

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
    // Group by watchId::userId (submission) — take metadata from the first photo per group
    const metaByGroup: Record<string, WatchMetaFields> = {}

    photos.forEach((photo) => {
      const key = `${photo.watchId}::${photo.userId}`
      if (!metaByGroup[key]) {
        metaByGroup[key] = photoToWatchMeta(photo)
      }
    })

    setWatchMetaState((prev) => ({ ...prev, ...metaByGroup }))
  }

  function updateWatchMeta(groupKey: string, field: keyof WatchMetaFields, value: string) {
    setWatchMetaState((prev) => ({
      ...prev,
      [groupKey]: { ...prev[groupKey], [field]: value },
    }))
    setDirtyGroups((prev) => new Set(prev).add(groupKey))
  }

  async function handleSaveMetadata(groupKey: string, photoIds: string[]) {
    const meta = watchMetaState[groupKey]
    if (!meta) return
    setSavingMetaGroup(groupKey)
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
        setDirtyGroups((prev) => { const next = new Set(prev); next.delete(groupKey); return next })
        // Update local approved photos state so gallery reflects new meta immediately
        setApprovedPhotos((prev) =>
          prev.map((p) => (photoIds.includes(p.id) ? { ...p, ...meta } : p))
        )
        setSavedMetaGroupOk(groupKey)
        setTimeout(() => setSavedMetaGroupOk(null), 2500)
      } else {
        alert('Save failed — one or more photos could not be updated.')
      }
    } catch (err) {
      alert(`Save failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
    setSavingMetaGroup(null)
  }

  async function handleAiFillGroup(groupKey: string, imageUrls: string[]) {
    const meta = watchMetaState[groupKey]
    if (!meta) return

    setAiFillingGroup(groupKey)
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
        const current = prev[groupKey] ?? {}
        const fill = (key: keyof typeof current) =>
          (current[key] as string)?.trim() ? current[key] : aiSuggestions[key] || ''
        return {
          ...prev,
          [groupKey]: {
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

      setDirtyGroups((prev) => new Set(prev).add(groupKey))
      setAiFilledGroupOk(groupKey)
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
  async function handleApproveGroup(groupKey: string, photoIds: string[]) {
    const watchId = watchIdFromKey(groupKey)
    setActing(`group-${groupKey}`)
    try {
      // Save all metadata first
      const meta = watchMetaState[groupKey]
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

      // Approve all photos in group with a single request (sends one summary email)
      const approveResult = await fetch('/api/admin/photos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'bulk-approve', watchId, photoIds }),
      })

      if (approveResult.ok) {
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
    groupKey: string,
    reorderedPhotos: (PendingPhoto | ApprovedPhoto)[]
  ) {
    const watchId = watchIdFromKey(groupKey)
    // reorderedPhotos is already in the new order from drag-and-drop
    setActing(`reorder-${groupKey}`)
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
    groupKey: string,
    reorderedPhotos: (PendingPhoto | ApprovedPhoto)[]
  ) {
    const watchId = watchIdFromKey(groupKey)
    setActing(`reorder-${groupKey}`)
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
          const groupPhotos = prev.filter((p) => reorderedIds.includes(p.id))
          const otherPhotos = prev.filter((p) => !reorderedIds.includes(p.id))
          const sorted = reorderedIds.map((id) => groupPhotos.find((p) => p.id === id)!).filter(Boolean)
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

  /**
   * Approve ALL pending groups from a single user — one API call, one email.
   */
  async function handleApproveAllFromUser(submitterUserId: string, groups: typeof pendingGroups) {
    const allPhotoIds = groups.flatMap((g) => g.photos.map((p) => p.id))
    setActing(`user-approve-${submitterUserId}`)

    try {
      // Save metadata for all groups first
      await Promise.all(
        groups.map((group) => {
          const meta = watchMetaState[group.key]
          if (!meta) return Promise.resolve()
          return Promise.all(
            group.photos.map((photo) =>
              fetch('/api/admin/photos', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ photoId: photo.id, fields: { ...meta } }),
              })
            )
          )
        })
      )

      const res = await fetch('/api/admin/photos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'user-approve', submitterUserId, photoIds: allPhotoIds }),
      })

      if (res.ok) {
        const approvedSet = new Set(allPhotoIds)
        const photosToApprove = pendingPhotos.filter((p) => approvedSet.has(p.id))
        setPendingPhotos((prev) => prev.filter((p) => !approvedSet.has(p.id)))
        setApprovedPhotos((prev) => [
          ...photosToApprove.map((p) => ({ ...p, approved: true as const })),
          ...prev,
        ])
        showToast(`✓ Approved ${photosToApprove.length} photo${photosToApprove.length !== 1 ? 's' : ''} — 1 email sent`)
      }
    } catch { /* ignore */ }
    setActing(null)
  }

  async function handleRejectGroup(groupKey: string, photoIds: string[]) {
    const watchId = watchIdFromKey(groupKey)
    setActing(`reject-${groupKey}`)
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

  async function handleRestoreGroup(groupKey: string, photoIds: string[]) {
    const watchId = watchIdFromKey(groupKey)
    setActing(`restore-${groupKey}`)
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

  async function handleDeleteRejectedGroup(groupKey: string, photoIds: string[]) {
    const watchId = watchIdFromKey(groupKey)
    setActing(`delete-group-${groupKey}`)
    try {
      await Promise.all(photoIds.map((photoId) =>
        fetch('/api/admin/photos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'delete', watchId, photoId }),
        })
      ))
      setRejectedPhotos((prev) => prev.filter((p) => !photoIds.includes(p.id)))
    } catch { /* ignore */ }
    setActing(null)
  }

  /**
   * Split a photo out of its group: AI-identify it, update its watchId + metadata,
   * so it appears as its own submission in the pending list.
   */
  async function handleSplitPhoto(photo: PendingPhoto | ApprovedPhoto) {
    setSplittingPhotoId(photo.id)
    try {
      // Step 1: AI-identify the watch in this photo
      const identifyRes = await fetch('/api/admin/identify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: photo.url }),
      })
      if (!identifyRes.ok) {
        alert('AI identification failed — try again or update manually.')
        setSplittingPhotoId(null)
        return
      }
      const ai = await identifyRes.json()
      if (!ai.brand) {
        alert('Could not identify the watch in this photo.')
        setSplittingPhotoId(null)
        return
      }

      // Step 2: Build new watchId slug + metadata
      const toSlug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
      const newWatchId = toSlug(`${ai.brand} ${ai.model || ''}`.trim())
      const newSlug = generatePhotoSlug(ai.brand, ai.model, newWatchId, photo.id)
      const fields: Record<string, string> = {
        watchId: newWatchId,
        slug: newSlug,
        brandName: ai.brand || '',
        modelName: ai.model || '',
        referenceNumber: ai.reference || '',
        movement: ai.movement || '',
        caseSize: ai.caseSize || '',
        lugToLug: ai.lugToLug || '',
        betweenLugs: ai.betweenLugs || '',
        thickness: ai.thickness || '',
        waterResistance: ai.waterResistance || '',
        estimatedPrice: ai.estimatedPrice || '',
      }

      // Step 3: PATCH the photo with new metadata
      const patchRes = await fetch('/api/admin/photos', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photoId: photo.id, fields }),
      })
      if (!patchRes.ok) {
        alert('Failed to update photo metadata.')
        setSplittingPhotoId(null)
        return
      }

      // Step 4: Update local state — change the photo's watchId + metadata so it re-groups
      setPendingPhotos((prev) =>
        prev.map((p) => p.id === photo.id ? { ...p, watchId: newWatchId, ...fields } : p)
      )

      // Re-initialize watch meta for the new group
      const newGroupKey = `${newWatchId}::${photo.userId}`
      setWatchMetaState((prev) => ({
        ...prev,
        [newGroupKey]: {
          brandName: fields.brandName,
          modelName: fields.modelName,
          referenceNumber: fields.referenceNumber,
          movement: fields.movement,
          caseSize: fields.caseSize,
          wristSize: '',
          estimatedPrice: fields.estimatedPrice,
          lugToLug: fields.lugToLug,
          betweenLugs: fields.betweenLugs,
          thickness: fields.thickness,
          waterResistance: fields.waterResistance,
        },
      }))

      showToast(`Split: ${ai.brand} ${ai.model || ''} identified`)
    } catch {
      alert('Split failed — try again.')
    }
    setSplittingPhotoId(null)
  }

  /**
   * Handle crop confirmation: upload the cropped image and update local state.
   */
  async function handleCropConfirm(croppedFile: File) {
    if (!cropTarget) return
    const { photoId } = cropTarget
    setCroppingPhotoId(photoId)
    setCropTarget(null)

    try {
      const form = new FormData()
      form.append('photoId', photoId)
      form.append('photo', croppedFile)

      const res = await fetch('/api/admin/crop', { method: 'POST', body: form })
      if (!res.ok) {
        alert('Crop upload failed.')
        setCroppingPhotoId(null)
        return
      }

      const { url, thumbnailUrl } = await res.json()

      // Bust browser cache by appending a timestamp
      const bust = `?v=${Date.now()}`
      const update = (p: PendingPhoto | ApprovedPhoto) =>
        p.id === photoId ? { ...p, url: url + bust, thumbnailUrl: (thumbnailUrl || url) + bust } : p

      setPendingPhotos((prev) => prev.map(update) as PendingPhoto[])
      setApprovedPhotos((prev) => prev.map(update) as ApprovedPhoto[])
      setRejectedPhotos((prev) => prev.map(update) as PendingPhoto[])

      showToast('Photo cropped')
    } catch {
      alert('Crop failed — try again.')
    }
    setCroppingPhotoId(null)
  }

  /**
   * Revert a cropped photo back to its original.
   */
  async function handleRevertCrop(photo: PendingPhoto | ApprovedPhoto) {
    if (!confirm('Revert this photo to the original (pre-crop) version?')) return
    setCroppingPhotoId(photo.id)
    try {
      const res = await fetch('/api/admin/crop/revert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photoId: photo.id }),
      })
      if (!res.ok) {
        alert('Revert failed.')
        setCroppingPhotoId(null)
        return
      }
      const { url, thumbnailUrl } = await res.json()
      const bust = `?v=${Date.now()}`
      const update = (p: PendingPhoto | ApprovedPhoto) =>
        p.id === photo.id ? { ...p, url: url + bust, thumbnailUrl: (thumbnailUrl || url) + bust, originalUrl: null } : p

      setPendingPhotos((prev) => prev.map(update) as PendingPhoto[])
      setApprovedPhotos((prev) => prev.map(update) as ApprovedPhoto[])
      setRejectedPhotos((prev) => prev.map(update) as PendingPhoto[])
      showToast('Reverted to original')
    } catch {
      alert('Revert failed — try again.')
    }
    setCroppingPhotoId(null)
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
          {!loading && pendingGroups.length > 0 && (
            <span className="ml-1 sm:ml-2 bg-amber-100 text-amber-700 text-xs font-semibold px-2 py-0.5 rounded-full inline-block">
              {pendingGroups.length}
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
              {approvedGroups.length}
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
          {!loading && rejectedGroups.length > 0 && (
            <span className="ml-1 sm:ml-2 bg-red-100 text-red-700 text-xs font-semibold px-2 py-0.5 rounded-full inline-block">
              {rejectedGroups.length}
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
              {pendingGroups.length === 0 ? (
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
                <div className="space-y-6">
                  {/* Group by submitter user */}
                  {(() => {
                    const byUser = new Map<string, { userId: string; userName: string; groups: typeof filteredPendingGroups }>()
                    filteredPendingGroups.forEach((group) => {
                      const uid = group.photos[0]?.userId ?? 'unknown'
                      if (!byUser.has(uid)) {
                        byUser.set(uid, { userId: uid, userName: group.submitterName, groups: [] })
                      }
                      byUser.get(uid)!.groups.push(group)
                    })
                    return Array.from(byUser.values()).map(({ userId: uid, userName, groups: userGroups }) => {
                      const totalPhotos = userGroups.flatMap((g) => g.photos).length
                      const isApprovingAll = acting === `user-approve-${uid}`
                      return (
                        <div key={uid}>
                          {/* User section header */}
                          <div className="flex items-center justify-between gap-3 mb-2 px-1">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="text-xs font-semibold text-textMuted truncate">{userName}</span>
                              <span className="text-xs bg-amber-100 text-amber-700 font-semibold px-2 py-0.5 rounded-full shrink-0">
                                {userGroups.length} watch{userGroups.length !== 1 ? 'es' : ''} · {totalPhotos} photo{totalPhotos !== 1 ? 's' : ''}
                              </span>
                            </div>
                            {userGroups.length > 1 && (
                              <button
                                onClick={() => handleApproveAllFromUser(uid, userGroups)}
                                disabled={isApprovingAll || !!acting}
                                className="shrink-0 text-xs bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg font-semibold transition-colors disabled:opacity-50 flex items-center gap-1.5"
                              >
                                {isApprovingAll ? (
                                  <><span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" /> Approving…</>
                                ) : (
                                  `✓ Approve all (1 email)`
                                )}
                              </button>
                            )}
                          </div>
                          <div className="space-y-3">
                            {userGroups.map((group) => (
                              <GroupedPhotoCard
                                key={group.key}
                                group={group}
                                watchMeta={watchMetaState[group.key] ?? photoToWatchMeta(group.photos[0])}
                                acting={acting}
                                aiFillingGroup={aiFillingGroup}
                                aiFilledGroupOk={aiFilledGroupOk}
                                onUpdateWatchMeta={updateWatchMeta}
                                onAiFillGroup={handleAiFillGroup}
                                onSaveMetadata={handleSaveMetadata}
                                isDirty={dirtyGroups.has(group.key)}
                                isSavingMeta={savingMetaGroup === group.key}
                                savedMetaOk={savedMetaGroupOk === group.key}
                                onApproveGroup={handleApproveGroup}
                                onRejectGroup={handleRejectGroup}
                                onDelete={(photo) => handleDeletePending(photo)}
                                onSplitPhoto={handleSplitPhoto}
                                splittingPhotoId={splittingPhotoId}
                                onCropPhoto={(photo) => setCropTarget({ photoId: photo.id, imageUrl: photo.url })}
                                onRevertCrop={handleRevertCrop}
                                croppingPhotoId={croppingPhotoId}
                                onReorder={handleReorderPending}
                                isApproved={false}
                              />
                            ))}
                          </div>
                        </div>
                      )
                    })
                  })()}
                </div>
              )}
            </>
          )}

          {activeTab === 'approved' && (
            <>
              {approvedGroups.length === 0 ? (
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
                      key={group.key}
                      group={group}
                      watchMeta={watchMetaState[group.key] ?? photoToWatchMeta(group.photos[0])}
                      acting={acting}
                      aiFillingGroup={aiFillingGroup}
                      aiFilledGroupOk={aiFilledGroupOk}
                      onUpdateWatchMeta={updateWatchMeta}
                      onAiFillGroup={handleAiFillGroup}
                      onSaveMetadata={handleSaveMetadata}
                      isDirty={dirtyGroups.has(group.key)}
                      isSavingMeta={savingMetaGroup === group.key}
                      savedMetaOk={savedMetaGroupOk === group.key}
                      onDelete={(photo) => handleDeleteApproved(photo)}
                      onCropPhoto={(photo) => setCropTarget({ photoId: photo.id, imageUrl: photo.url })}
                      onRevertCrop={handleRevertCrop}
                      croppingPhotoId={croppingPhotoId}
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
              {rejectedGroups.length === 0 ? (
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
                      key={group.key}
                      group={group}
                      watchMeta={watchMetaState[group.key] ?? photoToWatchMeta(group.photos[0])}
                      acting={acting}


                      aiFillingGroup={aiFillingGroup}
                      aiFilledGroupOk={aiFilledGroupOk}
                      onUpdateWatchMeta={updateWatchMeta}

                      onAiFillGroup={handleAiFillGroup}
                      onRestoreGroup={handleRestoreGroup}
                      onDeleteGroup={handleDeleteRejectedGroup}
                      onDelete={(photo) => handleDeleteRejected(photo)}
                      onCropPhoto={(photo) => setCropTarget({ photoId: photo.id, imageUrl: photo.url })}
                      onRevertCrop={handleRevertCrop}
                      croppingPhotoId={croppingPhotoId}
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

      {/* Crop modal */}
      {cropTarget && (
        <CropModal
          imageSrc={cropTarget.imageUrl}
          onConfirm={handleCropConfirm}
          onCancel={() => setCropTarget(null)}
        />
      )}
    </div>
  )
}
