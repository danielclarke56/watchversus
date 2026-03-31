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

function PhotoCard({
  photo,
  fields,
  aiFlag,
  acting,
  saving,
  savedOk,
  onUpdateField,
  onSave,
  onApprove,
  onReject,
  isApproved,
  onDelete,
}: {
  photo: PendingPhoto | ApprovedPhoto
  fields: EditableFields
  aiFlag?: boolean | 'checking'
  acting: string | null
  saving: string | null
  savedOk: string | null
  onUpdateField: (field: keyof EditableFields, value: string) => void
  onSave: () => void
  onApprove?: () => void
  onReject?: () => void
  isApproved: boolean
  onDelete?: () => void
}) {
  const [expanded, setExpanded] = useState(false)

  const displayName = [fields.brandName, fields.modelName].filter(Boolean).join(' ') || photo.watchId

  return (
    <div className="border border-border rounded-lg overflow-hidden bg-surface">
      {/* Compact row */}
      <div className="flex gap-2 sm:gap-3 items-center p-2 sm:p-3 flex-col sm:flex-row">
        {/* Thumb */}
        <div className="shrink-0 w-12 sm:w-14 h-12 sm:h-14 bg-surfaceAlt rounded overflow-hidden border border-border">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={photo.url} alt="Submission" className="w-full h-full object-cover" />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 w-full sm:w-auto">
          <div className="flex items-center gap-1.5 flex-wrap">
            <p className="text-xs sm:text-sm font-semibold text-textPrimary truncate">{displayName}</p>
            {fields.referenceNumber && (
              <span className="text-xs text-textMuted hidden sm:inline">· {fields.referenceNumber}</span>
            )}
            {aiFlag === 'checking' && (
              <span className="text-[10px] text-textMuted bg-gray-100 px-1.5 py-0.5 rounded">AI check...</span>
            )}
            {aiFlag === true && (
              <span className="text-[10px] text-red-600 font-semibold bg-red-50 px-1.5 py-0.5 rounded">🤖 AI detected</span>
            )}
          </div>
          <p className="text-xs text-textMuted mt-0.5">
            {photo.userName} ·{' '}
            {new Date(photo.createdAt).toLocaleDateString('en-US', {
              month: 'short', day: 'numeric', year: 'numeric',
            })}
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0 w-full sm:w-auto flex-wrap justify-start sm:justify-end">
          <button
            onClick={() => setExpanded((e) => !e)}
            className="text-xs px-2 sm:px-2.5 py-1 sm:py-1.5 rounded border border-border text-textMuted hover:text-textPrimary hover:border-gray-400 transition-colors font-medium"
          >
            {expanded ? '✕' : '✎'}
          </button>
          {!isApproved && onApprove && (
            <button
              onClick={onApprove}
              disabled={acting === photo.id || saving === photo.id}
              className="text-xs bg-green-600 text-white px-2 sm:px-2.5 py-1 sm:py-1.5 rounded font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              <span className="hidden sm:inline">Approve</span>
              <span className="sm:hidden">✓</span>
            </button>
          )}
          {!isApproved && onReject && (
            <button
              onClick={onReject}
              disabled={acting === photo.id || saving === photo.id}
              className="text-xs bg-red-500 text-white px-2 sm:px-2.5 py-1 sm:py-1.5 rounded font-medium hover:bg-red-600 transition-colors disabled:opacity-50"
            >
              <span className="hidden sm:inline">Reject</span>
              <span className="sm:hidden">✕</span>
            </button>
          )}
          {isApproved && onDelete && (
            <button
              onClick={onDelete}
              disabled={acting === photo.id}
              className="text-xs bg-red-500 text-white px-2 sm:px-2.5 py-1 sm:py-1.5 rounded font-medium hover:bg-red-600 transition-colors disabled:opacity-50"
            >
              <span className="hidden sm:inline">{acting === photo.id ? '...' : 'Delete'}</span>
              <span className="sm:hidden">{acting === photo.id ? '...' : '🗑'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Expanded edit panel */}
      {expanded && (
        <div className="border-t border-border bg-surfaceAlt px-3 py-3 overflow-x-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 mb-2">
            <FieldInput label="Brand" value={fields.brandName} onChange={(v) => onUpdateField('brandName', v)} />
            <FieldInput label="Model" value={fields.modelName} onChange={(v) => onUpdateField('modelName', v)} />
            <FieldInput label="Reference No." value={fields.referenceNumber} onChange={(v) => onUpdateField('referenceNumber', v)} />
            <FieldInput label="Movement" value={fields.movement} onChange={(v) => onUpdateField('movement', v)} />
            <FieldInput label="Case Size" value={fields.caseSize} onChange={(v) => onUpdateField('caseSize', v)} unit="mm" />
            <FieldInput label="Wrist Size" value={fields.wristSize} onChange={(v) => onUpdateField('wristSize', v)} unit="mm" />
            <FieldInput label="Year" value={fields.productionYear} onChange={(v) => onUpdateField('productionYear', v)} />
            <FieldInput label="Est. Price" value={fields.estimatedPrice} onChange={(v) => onUpdateField('estimatedPrice', v)} unit="USD" />
            <FieldInput label="Lug-to-Lug" value={fields.lugToLug} onChange={(v) => onUpdateField('lugToLug', v)} unit="mm" />
            <FieldInput label="Between Lugs" value={fields.betweenLugs} onChange={(v) => onUpdateField('betweenLugs', v)} unit="mm" />
            <FieldInput label="Thickness" value={fields.thickness} onChange={(v) => onUpdateField('thickness', v)} unit="mm" />
            <FieldInput label="Water Resist." value={fields.waterResistance} onChange={(v) => onUpdateField('waterResistance', v)} unit="m" />
          </div>
          <div className="mb-2">
            <FieldInput label="Caption" value={fields.caption} onChange={(v) => onUpdateField('caption', v)} />
          </div>
          <div className="flex items-center gap-2 mt-2">
            <button
              onClick={onSave}
              disabled={saving === photo.id || acting === photo.id}
              className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {saving === photo.id ? 'Saving...' : 'Save'}
            </button>
            {savedOk === photo.id && (
              <span className="text-xs text-green-600 font-medium">✓ Saved</span>
            )}
          </div>
        </div>
      )}
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
          setPendingPhotos(pendingData)
          const initialEdits: Record<string, EditableFields> = {}
          pendingData.forEach((p) => { initialEdits[p.id] = photoToEditable(p) })
          setEditState((prev) => ({ ...prev, ...initialEdits }))

          pendingData.forEach((photo) => {
            ;(async () => {
              setAiFlags((prev) => ({ ...prev, [photo.id]: 'checking' }))
              try {
                const photoBlob = await fetch(photo.url).then((r) => r.blob())
                const fd = new FormData()
                fd.append('photo', photoBlob)
                const res = await fetch('/api/photos/identify', { method: 'POST', body: fd })
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
                <div className="space-y-2">
                  {pendingPhotos.map((photo) => {
                    const fields = editState[photo.id]
                    if (!fields) return null
                    return (
                      <PhotoCard
                        key={photo.id}
                        photo={photo}
                        fields={fields}
                        aiFlag={aiFlags[photo.id]}
                        acting={acting}
                        saving={saving}
                        savedOk={savedOk}
                        onUpdateField={(field, value) => updateField(photo.id, field, value)}
                        onSave={() => handleSave(photo.id)}
                        onApprove={() => handleAction('approve', photo)}
                        onReject={() => handleAction('delete', photo)}
                        isApproved={false}
                      />
                    )
                  })}
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
                <div className="space-y-2">
                  {approvedPhotos.map((photo) => {
                    const fields = editState[photo.id]
                    if (!fields) return null
                    return (
                      <PhotoCard
                        key={photo.id}
                        photo={photo}
                        fields={fields}
                        acting={acting}
                        saving={saving}
                        savedOk={savedOk}
                        onUpdateField={(field, value) => updateField(photo.id, field, value)}
                        onSave={() => handleSave(photo.id)}
                        onDelete={() => handleDeleteApproved(photo)}
                        isApproved={true}
                      />
                    )
                  })}
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  )
}
