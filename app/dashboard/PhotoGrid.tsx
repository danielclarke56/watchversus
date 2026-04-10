'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import PhotoCountBadge from '@/components/ui/PhotoCountBadge'

interface Photo {
  id: string
  watchId: string
  slug: string | null
  url: string
  brandName: string | null
  modelName: string | null
  referenceNumber: string | null
  movement: string | null
  caseSize: string | null
  wristSize: string | null
  estimatedPrice: string | null
  productionYear: string | null
  lugToLug: string | null
  betweenLugs: string | null
  thickness: string | null
  waterResistance: string | null
  status: string
  createdAt: Date
}

// Group photos by watchId; oldest photo first per group
interface WatchGroup {
  watchId: string
  photos: Photo[]          // oldest → newest
  dominantStatus: 'approved' | 'pending' | 'rejected'
}

function groupByWatch(photos: Photo[]): WatchGroup[] {
  const map = new Map<string, Photo[]>()
  for (const p of photos) {
    if (!map.has(p.watchId)) map.set(p.watchId, [])
    map.get(p.watchId)!.push(p)
  }
  return Array.from(map.entries()).map(([watchId, groupPhotos]) => {
    const sorted = [...groupPhotos].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    )
    const statuses = sorted.map((p) => p.status)
    const dominantStatus: WatchGroup['dominantStatus'] = statuses.includes('approved')
      ? 'approved'
      : statuses.includes('pending')
      ? 'pending'
      : 'rejected'
    return { watchId, photos: sorted, dominantStatus }
  })
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(date)
}

function PhotoThumb({ url, alt, size = 'full' }: { url: string; alt: string; size?: 'full' | 'mini' }) {
  const [error, setError] = useState(false)
  if (error || !url || url.startsWith('/')) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-1 text-gray-400">
        <span className={size === 'mini' ? 'text-base' : 'text-3xl'}>🖼️</span>
      </div>
    )
  }
  return (
    <Image
      src={url}
      alt={alt}
      fill
      className="object-cover"
      sizes={size === 'mini' ? '48px' : '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'}
      onError={() => setError(true)}
    />
  )
}

const STATUS_BADGE: Record<string, { text: string; class: string }> = {
  approved: { text: '✓ Approved', class: 'bg-green-100 text-green-800' },
  pending:  { text: '⏳ Pending',  class: 'bg-yellow-100 text-yellow-800' },
  rejected: { text: '✕ Rejected', class: 'bg-red-100 text-red-800' },
}

const FIELD_CONFIG = [
  { key: 'brandName',       label: 'Brand' },
  { key: 'modelName',       label: 'Model' },
  { key: 'referenceNumber', label: 'Reference #' },
  { key: 'movement',        label: 'Movement' },
  { key: 'caseSize',        label: 'Case Size' },
  { key: 'wristSize',       label: 'Wrist Size' },
  { key: 'estimatedPrice',  label: 'Price (USD)' },
  { key: 'productionYear',  label: 'Year' },
  { key: 'lugToLug',        label: 'Lug-to-Lug (mm)' },
  { key: 'betweenLugs',     label: 'Between Lugs (mm)' },
  { key: 'thickness',       label: 'Thickness (mm)' },
  { key: 'waterResistance', label: 'Water Resistance' },
] as const

type EditableKey = typeof FIELD_CONFIG[number]['key']

// Build editable fields from the most data-complete photo in the group
function groupToEditable(photos: Photo[]): Record<EditableKey, string> {
  // Merge: for each field, take the first non-empty value across photos
  const fields: Record<EditableKey, string> = {
    brandName: '', modelName: '', referenceNumber: '', movement: '',
    caseSize: '', wristSize: '', estimatedPrice: '', productionYear: '',
    lugToLug: '', betweenLugs: '', thickness: '', waterResistance: '',
  }
  for (const photo of photos) {
    for (const { key } of FIELD_CONFIG) {
      if (!fields[key]) fields[key] = photo[key] ?? ''
    }
  }
  return fields
}

function GroupCard({ group }: { group: WatchGroup }) {
  const router = useRouter()
  const primary = group.photos[0]
  const alt = [primary.brandName, primary.modelName].filter(Boolean).join(' ') || 'Watch'

  const [editing, setEditing]       = useState(false)
  const [fields, setFields]         = useState<Record<EditableKey, string>>(() => groupToEditable(group.photos))
  const [saving, setSaving]         = useState(false)
  const [saved, setSaved]           = useState(false)
  const [editError, setEditError]   = useState<string | null>(null)

  const [addingPhoto, setAddingPhoto]   = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading]       = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [uploadError, setUploadError]   = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [deleting, setDeleting]        = useState(false)
  const [deleteError, setDeleteError]  = useState<string | null>(null)

  // Save metadata to ALL photos in the group so the entire entry is consistent
  async function handleSave() {
    setSaving(true)
    setEditError(null)
    try {
      await Promise.all(
        group.photos.map((photo) =>
          fetch(`/api/user/photos/${photo.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fields }),
          }).then((res) => {
            if (!res.ok) throw new Error('Save failed')
          })
        )
      )
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
      setEditing(false)
    } catch (e) {
      setEditError(e instanceof Error ? e.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedFile(e.target.files?.[0] ?? null)
    setUploadError(null)
    setUploadSuccess(false)
  }, [])

  async function handleUpload() {
    if (!selectedFile) return
    setUploading(true)
    setUploadError(null)
    try {
      const formData = new FormData()
      formData.append('photo', selectedFile)
      const res = await fetch(`/api/photos/${group.watchId}`, { method: 'POST', body: formData })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Upload failed')
      setUploadSuccess(true)
      setSelectedFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
      setTimeout(() => router.refresh(), 1200)
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  async function handleDeleteGroup() {
    if (!confirm(`Delete all ${group.photos.length} photo(s) in this entry?`)) return
    setDeleting(true)
    setDeleteError(null)
    try {
      await Promise.all(
        group.photos.map((photo) =>
          fetch(`/api/user/photos/${photo.id}`, { method: 'DELETE' }).then((res) => {
            if (!res.ok) throw new Error('Delete failed')
          })
        )
      )
      setTimeout(() => router.refresh(), 600)
    } catch (e) {
      setDeleteError(e instanceof Error ? e.message : 'Delete failed')
      setDeleting(false)
    }
  }

  const badge = STATUS_BADGE[group.dominantStatus] ?? STATUS_BADGE.pending
  const extraCount = group.photos.length - 1

  return (
    <div className="rounded-lg border border-gray-200 overflow-hidden bg-white shadow-sm">
      {/* Primary thumbnail */}
      <div className="relative w-full h-48 bg-gray-100">
        <PhotoThumb url={primary.url} alt={alt} />
        <PhotoCountBadge count={group.photos.length} variant="badge" showIcon />
        {/* Status badge */}
        <div className={`absolute bottom-2 left-2 text-xs font-medium px-2 py-0.5 rounded-full ${badge.class}`}>
          {badge.text}
        </div>
      </div>

      {/* Additional photo strip */}
      {group.photos.length > 1 && (
        <div className="flex gap-1.5 px-3 pt-2 overflow-x-auto">
          {group.photos.slice(1).map((photo) => (
            <div key={photo.id} className="relative shrink-0 w-12 h-12 rounded overflow-hidden bg-gray-100 border border-gray-200">
              <PhotoThumb url={photo.url} alt="Photo" size="mini" />
              <div className={`absolute inset-x-0 bottom-0 h-1 ${
                photo.status === 'approved' ? 'bg-green-400' :
                photo.status === 'rejected' ? 'bg-red-400' : 'bg-yellow-400'
              }`} />
            </div>
          ))}
          <p className="self-center text-xs text-gray-400 ml-1 shrink-0">+{extraCount} more</p>
        </div>
      )}

      {/* Card body */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="text-base font-semibold text-gray-900 leading-snug">{alt}</h3>
          {saved && <span className="text-xs text-green-600 font-medium shrink-0">✓ Saved</span>}
        </div>
        {(fields.referenceNumber || primary.referenceNumber) && (
          <p className="text-sm text-gray-500 mb-1">Ref. {fields.referenceNumber || primary.referenceNumber}</p>
        )}
        <p className="text-xs text-gray-400 mb-3">First uploaded {formatDate(primary.createdAt)}</p>

        {/* Edit form */}
        {editing && (
          <div className="mb-4 space-y-2">
            {group.photos.length > 1 && (
              <p className="text-xs text-blue-600 bg-blue-50 rounded px-2 py-1">
                Editing info for all {group.photos.length} photos of this watch
              </p>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {FIELD_CONFIG.map(({ key, label }) => (
                <div key={key}>
                  <label className="block text-xs text-gray-500 mb-0.5">{label}</label>
                  <input
                    type="text"
                    value={fields[key]}
                    onChange={(e) => setFields((prev) => ({ ...prev, [key]: e.target.value }))}
                    className="w-full text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={label}
                  />
                </div>
              ))}
            </div>
            {editError && <p className="text-xs text-red-500">{editError}</p>}
            <div className="flex gap-2 pt-1">
              <button onClick={handleSave} disabled={saving}
                className="flex-1 bg-blue-600 text-white text-sm font-medium py-1.5 rounded hover:bg-blue-700 disabled:opacity-50 transition-colors">
                {saving ? 'Saving…' : 'Save'}
              </button>
              <button onClick={() => { setEditing(false); setFields(groupToEditable(group.photos)) }}
                className="flex-1 border border-gray-300 text-gray-600 text-sm font-medium py-1.5 rounded hover:bg-gray-50 transition-colors">
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Inline add photo */}
        {addingPhoto && (
          <div className="mb-4 rounded-md border border-dashed border-gray-300 bg-gray-50 p-3 space-y-2">
            <p className="text-xs text-gray-500 font-medium">Add another photo for this watch</p>
            <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-600 file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer" />
            {selectedFile && !uploadSuccess && (
              <p className="text-xs text-gray-500 truncate">Selected: {selectedFile.name}</p>
            )}
            {uploadError && <p className="text-xs text-red-500">{uploadError}</p>}
            {uploadSuccess && <p className="text-xs text-green-600 font-medium">✓ Uploaded — pending review</p>}
            <div className="flex gap-2 pt-1">
              <button onClick={handleUpload} disabled={!selectedFile || uploading || uploadSuccess}
                className="flex-1 bg-blue-600 text-white text-sm font-medium py-1.5 rounded hover:bg-blue-700 disabled:opacity-50 transition-colors">
                {uploading ? 'Uploading…' : 'Upload'}
              </button>
              <button onClick={() => { setAddingPhoto(false); setSelectedFile(null); setUploadError(null); if (fileInputRef.current) fileInputRef.current.value = '' }}
                className="flex-1 border border-gray-300 text-gray-600 text-sm font-medium py-1.5 rounded hover:bg-gray-50 transition-colors">
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Action row */}
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => { setEditing((v) => !v); setAddingPhoto(false) }}
            className="flex-1 border border-gray-300 text-gray-700 text-sm font-medium py-1.5 rounded hover:bg-gray-50 transition-colors">
            {editing ? 'Close' : '✏️ Edit info'}
          </button>
          <button onClick={() => { setAddingPhoto((v) => !v); setEditing(false) }}
            className="flex-1 border border-gray-300 text-gray-700 text-sm font-medium py-1.5 rounded hover:bg-gray-50 transition-colors">
            {addingPhoto ? 'Cancel' : '+ Add photo'}
          </button>
          {group.dominantStatus === 'rejected' && (
            <button onClick={handleDeleteGroup} disabled={deleting}
              className="flex-1 border border-red-300 text-red-600 text-sm font-medium py-1.5 rounded hover:bg-red-50 disabled:opacity-50 transition-colors">
              {deleting ? 'Deleting…' : '🗑️ Delete'}
            </button>
          )}
          {deleteError && <p className="w-full text-xs text-red-500 text-center">{deleteError}</p>}
          {group.dominantStatus === 'approved' && (
            <Link href={`/photo/${group.photos[0].slug ?? group.photos[0].id}`} className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium py-1.5 border-t border-gray-100 mt-1 block">
              View in Gallery →
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}

type TabId = 'approved' | 'pending' | 'rejected'

const TABS: { id: TabId; label: string; emptyText: string }[] = [
  { id: 'approved', label: 'Approved',       emptyText: 'No approved photos yet.' },
  { id: 'pending',  label: 'Pending Review', emptyText: 'No photos pending review.' },
  { id: 'rejected', label: 'Rejected',       emptyText: 'No rejected photos.' },
]

export default function PhotoGrid({ photos }: { photos: Photo[] }) {
  const allGroups = groupByWatch(photos)
  const tabGroups: Record<TabId, WatchGroup[]> = {
    approved: allGroups.filter((g) => g.dominantStatus === 'approved'),
    pending:  allGroups.filter((g) => g.dominantStatus === 'pending'),
    rejected: allGroups.filter((g) => g.dominantStatus === 'rejected'),
  }

  // Default to first non-empty tab
  const firstNonEmpty = (TABS.find((t) => tabGroups[t.id].length > 0)?.id ?? 'approved') as TabId
  const [tab, setTab] = useState<TabId>(firstNonEmpty)
  const visibleGroups = tabGroups[tab]

  return (
    <div>
      <div className="flex border-b border-gray-200 mb-6">
        {TABS.map((t) => {
          const count = tabGroups[t.id].length
          const isActive = tab === t.id
          return (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors -mb-px ${
                isActive ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}>
              {t.label}
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                isActive ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'
              }`}>
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {visibleGroups.length === 0 ? (
        <p className="text-sm text-gray-400 italic py-6">
          {TABS.find((t) => t.id === tab)?.emptyText}
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visibleGroups.map((group) => (
            <GroupCard key={group.watchId} group={group} />
          ))}
        </div>
      )}
    </div>
  )
}
