'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'

interface Photo {
  id: string
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
  caption: string | null
  status: string
  createdAt: Date
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date)
}

function PhotoThumbnail({ url, alt }: { url: string; alt: string }) {
  const [error, setError] = useState(false)
  if (error || !url || url.startsWith('/')) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-1 text-gray-400">
        <span className="text-3xl">🖼️</span>
        <span className="text-xs">Image unavailable</span>
      </div>
    )
  }
  return (
    <Image
      src={url}
      alt={alt}
      fill
      className="object-cover"
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      onError={() => setError(true)}
    />
  )
}

const FIELD_CONFIG = [
  { key: 'brandName', label: 'Brand' },
  { key: 'modelName', label: 'Model' },
  { key: 'referenceNumber', label: 'Reference #' },
  { key: 'movement', label: 'Movement' },
  { key: 'caseSize', label: 'Case Size' },
  { key: 'wristSize', label: 'Wrist Size' },
  { key: 'estimatedPrice', label: 'Price (USD)' },
  { key: 'productionYear', label: 'Year' },
  { key: 'lugToLug', label: 'Lug-to-Lug (mm)' },
  { key: 'betweenLugs', label: 'Between Lugs (mm)' },
  { key: 'thickness', label: 'Thickness (mm)' },
  { key: 'waterResistance', label: 'Water Resistance' },
  { key: 'caption', label: 'Caption' },
] as const

type EditableKey = (typeof FIELD_CONFIG)[number]['key']

function photoToEditable(photo: Photo): Record<EditableKey, string> {
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

function PhotoCard({ photo }: { photo: Photo }) {
  const alt = [photo.brandName, photo.modelName].filter(Boolean).join(' ') || 'Watch photo'
  const [editing, setEditing] = useState(false)
  const [fields, setFields] = useState<Record<EditableKey, string>>(() => photoToEditable(photo))
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSave() {
    setSaving(true)
    setError(null)
    try {
      const res = await fetch(`/api/user/photos/${photo.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Save failed')
      }
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
      setEditing(false)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="rounded-lg border border-gray-200 overflow-hidden bg-white shadow-sm">
      {/* Thumbnail */}
      <div className="relative w-full h-48 bg-gray-100">
        <PhotoThumbnail url={photo.url} alt={alt} />
      </div>

      {/* Card body */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="text-base font-semibold text-gray-900 leading-snug">{alt || 'Untitled'}</h3>
          {saved && <span className="text-xs text-green-600 font-medium shrink-0">✓ Saved</span>}
        </div>
        {photo.referenceNumber && (
          <p className="text-sm text-gray-500 mb-1">Ref. {photo.referenceNumber}</p>
        )}
        <p className="text-xs text-gray-400 mb-3">{formatDate(photo.createdAt)}</p>

        {/* Edit form */}
        {editing && (
          <div className="mb-4 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              {FIELD_CONFIG.map(({ key, label }) => (
                <div key={key} className={key === 'caption' ? 'col-span-2' : ''}>
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
            {error && <p className="text-xs text-red-500">{error}</p>}
            <div className="flex gap-2 pt-1">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 bg-blue-600 text-white text-sm font-medium py-1.5 rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {saving ? 'Saving…' : 'Save'}
              </button>
              <button
                onClick={() => { setEditing(false); setFields(photoToEditable(photo)) }}
                className="flex-1 border border-gray-300 text-gray-600 text-sm font-medium py-1.5 rounded hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Action row */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setEditing((v) => !v)}
            className="flex-1 border border-gray-300 text-gray-700 text-sm font-medium py-1.5 rounded hover:bg-gray-50 transition-colors"
          >
            {editing ? 'Close' : '✏️ Edit info'}
          </button>
          <Link
            href="/upload"
            className="flex-1 text-center border border-gray-300 text-gray-700 text-sm font-medium py-1.5 rounded hover:bg-gray-50 transition-colors"
          >
            + Add photo
          </Link>
          {photo.status === 'approved' && (
            <Link
              href="/"
              className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium py-1.5 border-t border-gray-100 mt-1 block"
            >
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
  { id: 'approved', label: 'Approved', emptyText: 'No approved photos yet.' },
  { id: 'pending', label: 'Pending Review', emptyText: 'No photos pending review.' },
  { id: 'rejected', label: 'Rejected', emptyText: 'No rejected photos.' },
]

export default function PhotoGrid({ photos }: { photos: Photo[] }) {
  const [activeTab, setActiveTab] = useState<TabId>('approved')

  const groups: Record<TabId, Photo[]> = {
    approved: photos.filter((p) => p.status === 'approved'),
    pending: photos.filter((p) => p.status === 'pending'),
    rejected: photos.filter((p) => p.status === 'rejected'),
  }

  const visiblePhotos = groups[activeTab]

  return (
    <div>
      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        {TABS.map((tab) => {
          const count = groups[tab.id].length
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors -mb-px ${
                isActive
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                  isActive ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'
                }`}
              >
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Tab Content */}
      {visiblePhotos.length === 0 ? (
        <p className="text-sm text-gray-400 italic py-6">
          {TABS.find((t) => t.id === activeTab)?.emptyText}
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visiblePhotos.map((photo) => (
            <PhotoCard key={photo.id} photo={photo} />
          ))}
        </div>
      )}
    </div>
  )
}
