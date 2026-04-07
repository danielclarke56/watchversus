'use client'

import { useState, useRef } from 'react'
import { useUser, SignInButton } from '@clerk/nextjs'
import Link from 'next/link'
import imageCompression from 'browser-image-compression'
import CropModal from './CropModal'

function toSlug(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

const WRIST_SIZE_OPTIONS = ['Under 6"', '6"', '6.5"', '7"', '7.5"', '8"', 'Over 8"']
const ESTIMATED_PRICE_OPTIONS = [
  'Under $500',
  '$500 – $1,000',
  '$1,000 – $5,000',
  '$5,000 – $15,000',
  '$15,000 – $50,000',
  '$50,000+',
  'Prefer not to say',
]

const AI_CONFIRM_FIELDS = [
  'brand', 'model', 'reference', 'movement', 'caseSize',
  'lugToLug', 'betweenLugs', 'thickness', 'waterResistance',
  'wristSize', 'estimatedPrice',
] as const
type AiConfirmField = (typeof AI_CONFIRM_FIELDS)[number]

type PhotoStatus = 'compressing' | 'identifying' | 'ready' | 'uploading' | 'done' | 'error'

interface AiCandidate {
  brand: string
  model: string
  reference: string | null
  movement: string | null
  caseSize: string | null
  wristSize: string | null
  estimatedPrice: string | null
  lugToLug: string | null
  betweenLugs: string | null
  thickness: string | null
  waterResistance: string | null
  confidence: 'high' | 'medium' | 'low'
  reasoning: string
}

interface PhotoItem {
  id: string
  file: File
  preview: string
  status: PhotoStatus
  errorMessage: string
  isWatch: boolean | null
  aiGenerated: boolean | null
  aiIdentified: boolean
  aiFilledFields: Set<AiConfirmField>
  aiConfirmedFields: Partial<Record<AiConfirmField, boolean>>
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

function createItem(file: File): PhotoItem {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    file,
    preview: '',
    status: 'compressing',
    errorMessage: '',
    isWatch: null,
    aiGenerated: null,
    aiIdentified: false,
    aiFilledFields: new Set(),
    aiConfirmedFields: {},
    brandName: '',
    modelName: '',
    referenceNumber: '',
    movement: '',
    caseSize: '',
    wristSize: '',
    estimatedPrice: '',
    lugToLug: '',
    betweenLugs: '',
    thickness: '',
    waterResistance: '',
  }
}

const MAX_CONCURRENT_IDENTIFY = 3
const MAX_PHOTOS = 20

// ─── PhotoCard ────────────────────────────────────────────────────────────────

interface PhotoCardProps {
  item: PhotoItem
  onRemove: () => void
  onUpdate: (patch: Partial<PhotoItem>) => void
  onRetryIdentify: () => void
  onRetryUpload: () => void
  onCropRequest: (src: string, file: File) => void
}

function PhotoCard({ item, onRemove, onUpdate, onRetryIdentify, onRetryUpload, onCropRequest }: PhotoCardProps) {
  const [showMore, setShowMore] = useState(false)

  function isAiUnconfirmed(field: AiConfirmField) {
    return item.aiIdentified && item.aiFilledFields.has(field) && !item.aiConfirmedFields[field]
  }

  function confirmField(field: AiConfirmField) {
    onUpdate({ aiConfirmedFields: { ...item.aiConfirmedFields, [field]: true } })
  }

  function fieldBorderClass(field: AiConfirmField) {
    if (isAiUnconfirmed(field)) return 'border-blue-400 ring-1 ring-blue-300 dark:ring-blue-600'
    if (item.aiIdentified && item.aiFilledFields.has(field) && item.aiConfirmedFields[field]) return 'border-green-400'
    return 'border-borderStrong focus:border-accent'
  }

  // Inline confirm icon: rendered absolutely inside a relative-positioned input wrapper
  function InlineConfirm({ field }: { field: AiConfirmField }) {
    if (isAiUnconfirmed(field)) {
      return (
        <button
          type="button"
          onClick={() => confirmField(field)}
          aria-label={`Accept AI suggestion for ${field}`}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center text-blue-500 hover:text-blue-700 font-bold text-sm transition-colors"
        >
          ✓
        </button>
      )
    }
    if (item.aiIdentified && item.aiFilledFields.has(field) && item.aiConfirmedFields[field]) {
      return (
        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-green-500 text-sm font-bold" aria-label="Confirmed">✓</span>
      )
    }
    return null
  }

  function inputPrClass(field: AiConfirmField) {
    return item.aiIdentified && item.aiFilledFields.has(field) ? 'pr-8' : ''
  }

  const allAiFieldsConfirmed =
    !item.aiIdentified ||
    item.aiFilledFields.size === 0 ||
    Array.from(item.aiFilledFields).every((f) => !!item.aiConfirmedFields[f])

  const aiFilledCount = item.aiFilledFields.size
  const aiConfirmedCount = AI_CONFIRM_FIELDS.filter(
    (f) => item.aiFilledFields.has(f) && item.aiConfirmedFields[f]
  ).length

  function StatusBadge() {
    switch (item.status) {
      case 'compressing':
        return <span className="text-xs text-textMuted">Optimising...</span>
      case 'identifying':
        return (
          <span className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400">
            <span className="animate-spin inline-block w-3 h-3 border border-blue-500 border-t-transparent rounded-full" />
            Identifying...
          </span>
        )
      case 'ready':
        if (item.isWatch === false) return <span className="text-xs text-yellow-600">⚠️ Not a watch?</span>
        if (!allAiFieldsConfirmed) return <span className="text-xs text-amber-600">Needs review</span>
        if (item.aiGenerated) return <span className="text-xs text-amber-600">⚠️ May be AI-generated</span>
        return <span className="text-xs text-green-600">✓ Ready</span>
      case 'uploading':
        return (
          <span className="flex items-center gap-1.5 text-xs text-blue-600">
            <span className="animate-spin inline-block w-3 h-3 border border-blue-500 border-t-transparent rounded-full" />
            Uploading...
          </span>
        )
      case 'done':
        return <span className="text-xs text-green-600 font-medium">✓ Uploaded</span>
      case 'error':
        return <span className="text-xs text-red-500 truncate max-w-[160px]">{item.errorMessage || 'Error'}</span>
    }
  }

  const canInteract = item.status !== 'uploading' && item.status !== 'done' && item.status !== 'compressing'

  return (
    <div
      className={`bg-surface border rounded-xl overflow-hidden flex flex-col ${
        item.status === 'done'
          ? 'border-green-400'
          : item.status === 'error'
          ? 'border-red-300'
          : 'border-borderStrong'
      }`}
    >
      {/* Thumbnail */}
      <div className="relative">
        {item.preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.preview} alt="Preview" className="w-full h-48 object-cover" />
        ) : (
          <div className="w-full h-48 bg-neutral flex items-center justify-center">
            <div className="animate-pulse text-textMuted text-sm">Processing...</div>
          </div>
        )}

        {/* Done overlay */}
        {item.status === 'done' && (
          <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
            <span className="text-5xl">✓</span>
          </div>
        )}

        {/* Remove */}
        {item.status !== 'uploading' && item.status !== 'done' && (
          <button
            type="button"
            onClick={onRemove}
            className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold shadow"
            aria-label="Remove photo"
          >
            &times;
          </button>
        )}

        {/* Crop */}
        {item.preview && canInteract && (
          <button
            type="button"
            onClick={() => onCropRequest(item.preview, item.file)}
            className="absolute bottom-2 left-2 bg-white/80 text-xs px-2 py-1 rounded shadow hover:bg-white text-gray-700"
          >
            ✂️ Crop
          </button>
        )}
      </div>

      {/* Status bar */}
      <div className="px-3 py-2 border-b border-borderStrong flex items-center justify-between gap-2 min-h-[34px]">
        <StatusBadge />
        <div className="flex items-center gap-2 flex-shrink-0">
          {item.status === 'ready' && (
            <button
              type="button"
              onClick={onRetryIdentify}
              className="text-xs text-textMuted hover:text-textPrimary underline"
            >
              Re-identify
            </button>
          )}
          {item.status === 'error' && (
            <>
              <button
                type="button"
                onClick={onRetryIdentify}
                className="text-xs text-blue-500 hover:text-blue-700 underline"
              >
                Re-identify
              </button>
              <button
                type="button"
                onClick={onRetryUpload}
                className="text-xs text-blue-500 hover:text-blue-700 underline"
              >
                Retry upload
              </button>
            </>
          )}
        </div>
      </div>

      {/* Form — only when actionable */}
      {(item.status === 'ready' || item.status === 'error') && (
        <div className="p-3 space-y-3 flex-1">
          {/* Warnings */}
          {item.isWatch === false && (
            <div className="p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg">
              <p className="text-xs text-yellow-800 dark:text-yellow-200">
                ⚠️ This doesn&apos;t look like a watch photo. You can still submit if incorrect.
              </p>
            </div>
          )}
          {item.aiGenerated === true && (
            <div className="p-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg">
              <p className="text-xs text-amber-800 dark:text-amber-200">
                ⚠️ Photo may be AI-generated. AI images won&apos;t be approved.
              </p>
            </div>
          )}

          {/* AI confirmation progress */}
          {item.aiIdentified && aiFilledCount > 0 && (
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-blue-800 dark:text-blue-200">
                  ✨ AI filled {aiFilledCount} field{aiFilledCount !== 1 ? 's' : ''}
                </span>
                <span className="text-xs text-blue-700 dark:text-blue-300 tabular-nums">
                  {aiConfirmedCount}/{aiFilledCount}
                </span>
              </div>
              <div className="h-1 bg-blue-200 dark:bg-blue-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all duration-300"
                  style={{ width: `${(aiConfirmedCount / aiFilledCount) * 100}%` }}
                />
              </div>
              {!allAiFieldsConfirmed && (
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                  Confirm all AI-filled fields above to submit.
                </p>
              )}
            </div>
          )}

          {/* Brand */}
          <div>
            <label className="block text-xs font-medium text-textSecond mb-1">
              Brand <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={item.brandName}
                onChange={(e) => {
                  const patch: Partial<PhotoItem> = { brandName: e.target.value }
                  if (item.aiFilledFields.has('brand'))
                    patch.aiConfirmedFields = { ...item.aiConfirmedFields, brand: true }
                  onUpdate(patch)
                }}
                placeholder="e.g. Rolex"
                maxLength={80}
                className={`w-full bg-surfaceAlt rounded-md px-3 py-2 text-sm text-textPrimary placeholder-textMuted focus:outline-none shadow-sm transition-colors border ${fieldBorderClass('brand')} ${inputPrClass('brand')}`}
              />
              <InlineConfirm field="brand" />
            </div>
          </div>

          {/* Model */}
          <div>
            <label className="block text-xs font-medium text-textSecond mb-1">
              Model <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={item.modelName}
                onChange={(e) => {
                  const patch: Partial<PhotoItem> = { modelName: e.target.value }
                  if (item.aiFilledFields.has('model'))
                    patch.aiConfirmedFields = { ...item.aiConfirmedFields, model: true }
                  onUpdate(patch)
                }}
                placeholder="e.g. Submariner"
                maxLength={100}
                className={`w-full bg-surfaceAlt rounded-md px-3 py-2 text-sm text-textPrimary placeholder-textMuted focus:outline-none shadow-sm transition-colors border ${fieldBorderClass('model')} ${inputPrClass('model')}`}
              />
              <InlineConfirm field="model" />
            </div>
          </div>

          {/* Optional details toggle */}
          <button
            type="button"
            onClick={() => setShowMore((v) => !v)}
            className="text-xs text-textMuted hover:text-textPrimary underline text-left"
          >
            {showMore ? 'Hide optional details' : '+ Add optional details'}
          </button>

          {showMore && (
            <div className="space-y-3">
              {/* Reference */}
              <div>
                <label className="block text-xs font-medium text-textSecond mb-1">Reference</label>
                <div className="relative">
                  <input
                    type="text"
                    value={item.referenceNumber}
                    onChange={(e) => {
                      const patch: Partial<PhotoItem> = { referenceNumber: e.target.value }
                      if (item.aiFilledFields.has('reference'))
                        patch.aiConfirmedFields = { ...item.aiConfirmedFields, reference: true }
                      onUpdate(patch)
                    }}
                    placeholder="e.g. 126610LN"
                    maxLength={60}
                    className={`w-full bg-surfaceAlt rounded-md px-3 py-2 text-sm text-textPrimary placeholder-textMuted focus:outline-none shadow-sm border ${fieldBorderClass('reference')} ${inputPrClass('reference')}`}
                  />
                  <InlineConfirm field="reference" />
                </div>
              </div>

              {/* Movement */}
              <div>
                <label className="block text-xs font-medium text-textSecond mb-1">Movement</label>
                <div className="relative">
                  <input
                    type="text"
                    value={item.movement}
                    onChange={(e) => {
                      const patch: Partial<PhotoItem> = { movement: e.target.value }
                      if (item.aiFilledFields.has('movement'))
                        patch.aiConfirmedFields = { ...item.aiConfirmedFields, movement: true }
                      onUpdate(patch)
                    }}
                    placeholder="e.g. Automatic"
                    maxLength={60}
                    className={`w-full bg-surfaceAlt rounded-md px-3 py-2 text-sm text-textPrimary placeholder-textMuted focus:outline-none shadow-sm border ${fieldBorderClass('movement')} ${inputPrClass('movement')}`}
                  />
                  <InlineConfirm field="movement" />
                </div>
              </div>

              {/* Case dimensions */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-textSecond mb-1">Case size</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={item.caseSize}
                      onChange={(e) => {
                        const patch: Partial<PhotoItem> = { caseSize: e.target.value }
                        if (item.aiFilledFields.has('caseSize'))
                          patch.aiConfirmedFields = { ...item.aiConfirmedFields, caseSize: true }
                        onUpdate(patch)
                      }}
                      placeholder="e.g. 40mm"
                      maxLength={20}
                      className={`w-full bg-surfaceAlt rounded-md px-2 py-2 text-sm text-textPrimary placeholder-textMuted focus:outline-none shadow-sm border ${fieldBorderClass('caseSize')} ${inputPrClass('caseSize')}`}
                    />
                    <InlineConfirm field="caseSize" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-textSecond mb-1">Lug-to-lug</label>
                  <div className="relative">
                    <input type="text" value={item.lugToLug}
                      onChange={(e) => {
                        const patch: Partial<PhotoItem> = { lugToLug: e.target.value }
                        if (item.aiFilledFields.has('lugToLug'))
                          patch.aiConfirmedFields = { ...item.aiConfirmedFields, lugToLug: true }
                        onUpdate(patch)
                      }}
                      placeholder="e.g. 47mm" maxLength={20}
                      className={`w-full bg-surfaceAlt rounded-md px-2 py-2 text-sm text-textPrimary placeholder-textMuted focus:outline-none shadow-sm border ${fieldBorderClass('lugToLug')} ${inputPrClass('lugToLug')}`}
                    />
                    <InlineConfirm field="lugToLug" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-textSecond mb-1">Lug width</label>
                  <div className="relative">
                    <input type="text" value={item.betweenLugs}
                      onChange={(e) => {
                        const patch: Partial<PhotoItem> = { betweenLugs: e.target.value }
                        if (item.aiFilledFields.has('betweenLugs'))
                          patch.aiConfirmedFields = { ...item.aiConfirmedFields, betweenLugs: true }
                        onUpdate(patch)
                      }}
                      placeholder="e.g. 20mm" maxLength={20}
                      className={`w-full bg-surfaceAlt rounded-md px-2 py-2 text-sm text-textPrimary placeholder-textMuted focus:outline-none shadow-sm border ${fieldBorderClass('betweenLugs')} ${inputPrClass('betweenLugs')}`}
                    />
                    <InlineConfirm field="betweenLugs" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-textSecond mb-1">Thickness</label>
                  <div className="relative">
                    <input type="text" value={item.thickness}
                      onChange={(e) => {
                        const patch: Partial<PhotoItem> = { thickness: e.target.value }
                        if (item.aiFilledFields.has('thickness'))
                          patch.aiConfirmedFields = { ...item.aiConfirmedFields, thickness: true }
                        onUpdate(patch)
                      }}
                      placeholder="e.g. 12.5mm" maxLength={20}
                      className={`w-full bg-surfaceAlt rounded-md px-2 py-2 text-sm text-textPrimary placeholder-textMuted focus:outline-none shadow-sm border ${fieldBorderClass('thickness')} ${inputPrClass('thickness')}`}
                    />
                    <InlineConfirm field="thickness" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-textSecond mb-1">Water resistance</label>
                <div className="relative">
                  <input type="text" value={item.waterResistance}
                    onChange={(e) => {
                      const patch: Partial<PhotoItem> = { waterResistance: e.target.value }
                      if (item.aiFilledFields.has('waterResistance'))
                        patch.aiConfirmedFields = { ...item.aiConfirmedFields, waterResistance: true }
                      onUpdate(patch)
                    }}
                    placeholder="e.g. 300m / 1000ft" maxLength={40}
                    className={`w-full bg-surfaceAlt rounded-md px-3 py-2 text-sm text-textPrimary placeholder-textMuted focus:outline-none shadow-sm border ${fieldBorderClass('waterResistance')} ${inputPrClass('waterResistance')}`}
                  />
                  <InlineConfirm field="waterResistance" />
                </div>
              </div>

              {/* Wrist size & price — selects get a side confirm button */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-textSecond mb-1">Wrist size</label>
                  <div className="flex gap-1 items-center">
                    <select value={item.wristSize}
                      onChange={(e) => {
                        const patch: Partial<PhotoItem> = { wristSize: e.target.value }
                        if (item.aiFilledFields.has('wristSize'))
                          patch.aiConfirmedFields = { ...item.aiConfirmedFields, wristSize: true }
                        onUpdate(patch)
                      }}
                      className={`flex-1 min-w-0 bg-surfaceAlt rounded-md px-2 py-2 text-sm text-textPrimary focus:outline-none shadow-sm border ${fieldBorderClass('wristSize')}`}
                    >
                      <option value="">Select...</option>
                      {WRIST_SIZE_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                    </select>
                    {isAiUnconfirmed('wristSize') && (
                      <button type="button" onClick={() => confirmField('wristSize')} aria-label="Accept wrist size"
                        className="flex-shrink-0 w-7 h-7 flex items-center justify-center text-blue-500 hover:text-blue-700 font-bold text-sm">✓</button>
                    )}
                    {item.aiIdentified && item.aiFilledFields.has('wristSize') && item.aiConfirmedFields['wristSize'] && (
                      <span className="flex-shrink-0 w-7 h-7 flex items-center justify-center text-green-500 text-sm font-bold">✓</span>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-textSecond mb-1">Est. value</label>
                  <div className="flex gap-1 items-center">
                    <select value={item.estimatedPrice}
                      onChange={(e) => {
                        const patch: Partial<PhotoItem> = { estimatedPrice: e.target.value }
                        if (item.aiFilledFields.has('estimatedPrice'))
                          patch.aiConfirmedFields = { ...item.aiConfirmedFields, estimatedPrice: true }
                        onUpdate(patch)
                      }}
                      className={`flex-1 min-w-0 bg-surfaceAlt rounded-md px-2 py-2 text-sm text-textPrimary focus:outline-none shadow-sm border ${fieldBorderClass('estimatedPrice')}`}
                    >
                      <option value="">Select...</option>
                      {ESTIMATED_PRICE_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                    </select>
                    {isAiUnconfirmed('estimatedPrice') && (
                      <button type="button" onClick={() => confirmField('estimatedPrice')} aria-label="Accept estimated price"
                        className="flex-shrink-0 w-7 h-7 flex items-center justify-center text-blue-500 hover:text-blue-700 font-bold text-sm">✓</button>
                    )}
                    {item.aiIdentified && item.aiFilledFields.has('estimatedPrice') && item.aiConfirmedFields['estimatedPrice'] && (
                      <span className="flex-shrink-0 w-7 h-7 flex items-center justify-center text-green-500 text-sm font-bold">✓</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── UploadClient ─────────────────────────────────────────────────────────────

export default function UploadClient() {
  const { isSignedIn, isLoaded } = useUser()
  const [items, setItems] = useState<PhotoItem[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [globalError, setGlobalError] = useState('')
  const [success, setSuccess] = useState(false)
  const [successPreviews, setSuccessPreviews] = useState<string[]>([])
  const [partialSuccess, setPartialSuccess] = useState('')
  const [pendingCrop, setPendingCrop] = useState<{ src: string; file: File; id: string } | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  // Rate-limiting refs for identify
  const identifyQueueRef = useRef<string[]>([])
  const activeCountRef = useRef(0)
  // Store compressed files by id so identify/upload can read them without stale closures
  const filesById = useRef<Map<string, File>>(new Map())

  function patchItem(id: string, patch: Partial<PhotoItem>) {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)))
  }

  async function compressImage(file: File): Promise<File> {
    try {
      const blob = await imageCompression(file, {
        maxSizeMB: 3,
        maxWidthOrHeight: 2400,
        useWebWorker: true,
        fileType: 'image/webp',
        initialQuality: 0.85,
      })
      return new File([blob], file.name, { type: 'image/webp' })
    } catch {
      return file
    }
  }

  function fileToDataUrl(file: File): Promise<string> {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.readAsDataURL(file)
    })
  }

  // ── Rate-limited identify ──────────────────────────────────────────────────

  function queueIdentify(id: string) {
    identifyQueueRef.current.push(id)
    drainQueue()
  }

  function drainQueue() {
    while (
      activeCountRef.current < MAX_CONCURRENT_IDENTIFY &&
      identifyQueueRef.current.length > 0
    ) {
      const id = identifyQueueRef.current.shift()!
      activeCountRef.current++
      identifyOne(id).finally(() => {
        activeCountRef.current--
        drainQueue()
      })
    }
  }

  async function identifyOne(id: string) {
    const file = filesById.current.get(id)
    if (!file) return

    patchItem(id, { status: 'identifying' })

    try {
      const formData = new FormData()
      formData.append('photo', file)
      const res = await fetch('/api/photos/identify', { method: 'POST', body: formData })
      if (!res.ok) throw new Error('Identification failed')
      const data = await res.json()

      setItems((prev) =>
        prev.map((item) => {
          if (item.id !== id) return item

          const patch: Partial<PhotoItem> = {
            isWatch: data.isWatch,
            aiGenerated: data.isAiGenerated ?? null,
            status: 'ready',
          }

          if (data.candidates?.[0]) {
            const c = data.candidates[0] as AiCandidate
            const filled = new Set<AiConfirmField>()
            if (c.brand) filled.add('brand')
            if (c.model) filled.add('model')
            if (c.reference) filled.add('reference')
            if (c.movement) filled.add('movement')
            if (c.caseSize) filled.add('caseSize')
            if (c.lugToLug) filled.add('lugToLug')
            if (c.betweenLugs) filled.add('betweenLugs')
            if (c.thickness) filled.add('thickness')
            if (c.waterResistance) filled.add('waterResistance')
            if (c.wristSize) filled.add('wristSize')
            if (c.estimatedPrice) filled.add('estimatedPrice')

            Object.assign(patch, {
              brandName: c.brand || '',
              modelName: c.model || '',
              referenceNumber: c.reference || '',
              movement: c.movement || '',
              caseSize: c.caseSize || '',
              wristSize: c.wristSize || '',
              estimatedPrice: c.estimatedPrice || '',
              lugToLug: c.lugToLug || '',
              betweenLugs: c.betweenLugs || '',
              thickness: c.thickness || '',
              waterResistance: c.waterResistance || '',
              aiIdentified: true,
              aiFilledFields: filled,
              aiConfirmedFields: {},
            })
          }

          return { ...item, ...patch }
        })
      )
    } catch {
      // Assume watch if API fails; user can still manually fill
      patchItem(id, { status: 'ready', isWatch: true })
    }
  }

  // ── File intake ────────────────────────────────────────────────────────────

  async function processFiles(rawFiles: FileList | File[]) {
    setGlobalError('')
    const arr = Array.from(rawFiles)
    const valid: File[] = []
    const errs: string[] = []

    for (const f of arr) {
      if (f.size > 20 * 1024 * 1024) {
        errs.push(`${f.name}: exceeds 20MB`)
        continue
      }
      if (!['image/jpeg', 'image/png', 'image/webp', 'image/avif'].includes(f.type)) {
        errs.push(`${f.name}: unsupported format`)
        continue
      }
      valid.push(f)
    }

    if (errs.length) setGlobalError(errs.join(' · '))
    if (!valid.length) return

    // Create placeholder items (shown immediately)
    const placeholders = valid.map((f) => createItem(f))

    setItems((prev) => {
      const slots = MAX_PHOTOS - prev.length
      if (slots <= 0) return prev
      return [...prev, ...placeholders.slice(0, slots)]
    })

    // Compress + preview each in parallel, then queue identify
    await Promise.all(
      placeholders.map(async (placeholder) => {
        try {
          const compressed = await compressImage(placeholder.file)
          const preview = await fileToDataUrl(compressed)
          filesById.current.set(placeholder.id, compressed)
          patchItem(placeholder.id, { file: compressed, preview, status: 'identifying' })
          queueIdentify(placeholder.id)
        } catch {
          patchItem(placeholder.id, { status: 'error', errorMessage: 'Failed to process image' })
        }
      })
    )
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files?.length) {
      processFiles(e.target.files)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    if (e.dataTransfer.files?.length) processFiles(e.dataTransfer.files)
  }

  // ── Crop ───────────────────────────────────────────────────────────────────

  function handleCropConfirm(croppedFile: File, croppedDataUrl: string) {
    if (!pendingCrop) return
    const { id } = pendingCrop
    filesById.current.set(id, croppedFile)
    patchItem(id, {
      file: croppedFile,
      preview: croppedDataUrl,
      isWatch: null,
      aiGenerated: null,
      aiIdentified: false,
      aiFilledFields: new Set(),
      aiConfirmedFields: {},
      status: 'identifying',
    })
    queueIdentify(id)
    setPendingCrop(null)
  }

  function handleCropCancel() {
    setPendingCrop(null)
  }

  // ── Submit ─────────────────────────────────────────────────────────────────

  function isItemReady(item: PhotoItem) {
    if (item.status !== 'ready' && item.status !== 'error') return false
    if (!item.brandName.trim()) return false
    if (item.isWatch === false) return false
    const allAiFieldsConfirmed =
      !item.aiIdentified ||
      item.aiFilledFields.size === 0 ||
      Array.from(item.aiFilledFields).every((f) => !!item.aiConfirmedFields[f])
    return allAiFieldsConfirmed
  }

  async function uploadItem(item: PhotoItem): Promise<void> {
    patchItem(item.id, { status: 'uploading', errorMessage: '' })
    const file = filesById.current.get(item.id) || item.file
    const watchId = toSlug(`${item.brandName} ${item.modelName}`)
    const formData = new FormData()
    formData.append('photo', file)
    if (item.brandName.trim()) formData.append('brandName', item.brandName.trim())
    if (item.modelName.trim()) formData.append('modelName', item.modelName.trim())
    if (item.referenceNumber.trim()) formData.append('referenceNumber', item.referenceNumber.trim())
    if (item.movement) formData.append('movement', item.movement)
    if (item.caseSize.trim()) formData.append('caseSize', item.caseSize.trim())
    if (item.wristSize) formData.append('wristSize', item.wristSize)
    if (item.estimatedPrice) formData.append('estimatedPrice', item.estimatedPrice)
    if (item.lugToLug.trim()) formData.append('lugToLug', item.lugToLug.trim())
    if (item.betweenLugs.trim()) formData.append('betweenLugs', item.betweenLugs.trim())
    if (item.thickness.trim()) formData.append('thickness', item.thickness.trim())
    if (item.waterResistance.trim()) formData.append('waterResistance', item.waterResistance.trim())

    const res = await fetch(`/api/photos/${watchId}`, { method: 'POST', body: formData })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      throw new Error(data.error || 'Upload failed')
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setPartialSuccess('')

    const readyItems = items.filter(isItemReady)
    if (!readyItems.length) return

    let successCount = 0
    let failCount = 0

    for (let i = 0; i < readyItems.length; i++) {
      const item = readyItems[i]
      try {
        await uploadItem(item)
        patchItem(item.id, { status: 'done' })
        successCount++
      } catch (err) {
        patchItem(item.id, {
          status: 'error',
          errorMessage: err instanceof Error ? err.message : 'Upload failed',
        })
        failCount++
      }
    }

    if (successCount > 0 && failCount === 0) {
      // All succeeded
      const donePreviews = readyItems.map((i) => i.preview)
      setSuccessPreviews(donePreviews)
      setSuccess(true)
    } else if (successCount > 0 && failCount > 0) {
      setPartialSuccess(
        `${successCount} photo${successCount !== 1 ? 's' : ''} uploaded. ${failCount} failed — fix errors and retry.`
      )
    }
  }

  async function retryUpload(id: string) {
    const item = items.find((i) => i.id === id)
    if (!item || !isItemReady({ ...item, status: 'ready' })) return
    try {
      await uploadItem({ ...item, status: 'ready' })
      patchItem(id, { status: 'done' })
    } catch (err) {
      patchItem(id, {
        status: 'error',
        errorMessage: err instanceof Error ? err.message : 'Upload failed',
      })
    }
  }

  // ── Derived state ──────────────────────────────────────────────────────────

  const readyCount = items.filter(isItemReady).length
  const totalActive = items.filter((i) => i.status !== 'done').length
  const isUploading = items.some((i) => i.status === 'uploading')
  const hasItems = items.length > 0
  const atMax = items.length >= MAX_PHOTOS

  // ── Render ─────────────────────────────────────────────────────────────────

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-surfaceAlt flex items-center justify-center">
        <div className="animate-pulse text-textMuted">Loading...</div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-surfaceAlt text-textPrimary">
      <div className="max-w-[80rem] mx-auto px-4 py-8 sm:py-16">
        <Link href="/" className="text-xs sm:text-sm text-textMuted hover:text-textPrimary mb-6 sm:mb-8 inline-block">
          &larr; Back to home
        </Link>

        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Upload Your Watch Photos</h1>
        <p className="text-textMuted mb-8 text-sm sm:text-base">
          Share real wrist shots. Help others see how watches look in real life.
        </p>

        {!isSignedIn ? (
          <div className="bg-surface border border-borderStrong rounded-xl p-6 sm:p-8 text-center shadow-sm">
            <p className="text-textSecond mb-4 text-sm sm:text-base">Sign in to upload your watch photos</p>
            <SignInButton mode="modal">
              <button className="px-4 sm:px-6 py-2 sm:py-3 bg-accent hover:bg-accentHover text-white rounded-lg font-medium transition-colors text-sm sm:text-base w-full sm:w-auto">
                Sign in to upload
              </button>
            </SignInButton>
          </div>
        ) : success ? (
          <div className="bg-surface border border-borderStrong rounded-xl p-6 sm:p-8 text-center shadow-sm">
            {successPreviews.length > 0 && (
              <div className="flex justify-center gap-2 sm:gap-3 mb-4 flex-wrap">
                {successPreviews.map((src, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={i}
                    src={src}
                    className="w-24 sm:w-32 h-24 sm:h-32 object-cover rounded-xl"
                    alt={`Submitted photo ${i + 1}`}
                  />
                ))}
              </div>
            )}
            <h2 className="text-xl sm:text-2xl font-bold text-textPrimary mb-4">
              {successPreviews.length > 1 ? 'Photos submitted!' : 'Photo submitted!'}
            </h2>
            <p className="text-textMuted mb-8 text-sm sm:text-base">
              {successPreviews.length > 1
                ? 'Your images are being reviewed and will be approved soon.'
                : 'Your image is being reviewed and will be approved soon.'}
              {' '}Thanks for contributing to the community.
            </p>
            <div className="flex flex-col gap-3">
              <Link
                href="/"
                className="px-6 py-3 bg-accent hover:bg-accentHover text-white rounded-lg font-medium transition-colors inline-block text-center"
              >
                &larr; Back to home
              </Link>
              <button
                onClick={() => {
                  setSuccess(false)
                  setItems([])
                  setGlobalError('')
                  setSuccessPreviews([])
                  setPartialSuccess('')
                  filesById.current.clear()
                }}
                className="px-6 py-3 bg-neutral hover:bg-neutral/80 text-textPrimary rounded-lg font-medium transition-colors"
              >
                Upload more
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Global error */}
            {globalError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-800">{globalError}</p>
              </div>
            )}

            {/* Partial success banner */}
            {partialSuccess && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-800">{partialSuccess}</p>
              </div>
            )}

            {/* Drop zone — shown when empty or as "add more" */}
            {!atMax && (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileRef.current?.click()}
                className={`border-2 border-dashed rounded-xl text-center cursor-pointer transition-all ${
                  hasItems ? 'py-4 px-6' : 'py-12 px-6'
                } ${
                  isDragging
                    ? 'border-accent bg-accent/5'
                    : 'border-borderStrong hover:border-accent'
                }`}
              >
                {hasItems ? (
                  <p className="text-textMuted text-sm">
                    + Drop more photos or click to add ({items.length}/{MAX_PHOTOS})
                  </p>
                ) : (
                  <>
                    <div className="text-4xl sm:text-5xl mb-3">{'\uD83D\uDCF7'}</div>
                    <p className="text-textMuted mb-1 text-sm">
                      {isDragging
                        ? 'Drop your photos here'
                        : 'Drag & drop photos or click to select'}
                    </p>
                    <p className="text-textMuted text-xs">
                      Select multiple files at once · JPEG, PNG, WebP, AVIF · Up to 20MB each
                    </p>
                  </>
                )}
              </div>
            )}

            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              multiple
              onChange={handleFileInput}
              className="hidden"
            />

            {/* Photo grid */}
            {hasItems && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {items.map((item) => (
                    <PhotoCard
                      key={item.id}
                      item={item}
                      onRemove={() => {
                        setItems((prev) => prev.filter((i) => i.id !== item.id))
                        filesById.current.delete(item.id)
                        // Remove from identify queue if pending
                        identifyQueueRef.current = identifyQueueRef.current.filter(
                          (qid) => qid !== item.id
                        )
                      }}
                      onUpdate={(patch) => patchItem(item.id, patch)}
                      onRetryIdentify={() => {
                        patchItem(item.id, {
                          aiIdentified: false,
                          aiFilledFields: new Set(),
                          aiConfirmedFields: {},
                          isWatch: null,
                          aiGenerated: null,
                        })
                        queueIdentify(item.id)
                      }}
                      onRetryUpload={() => retryUpload(item.id)}
                      onCropRequest={(src, file) =>
                        setPendingCrop({ src, file, id: item.id })
                      }
                    />
                  ))}
                </div>

                {/* Submit bar */}
                <div className="sticky bottom-4 z-10">
                  <div className="bg-surface border border-borderStrong rounded-xl p-4 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="text-sm text-textSecond text-center sm:text-left">
                      {readyCount === 0 ? (
                        <span className="text-textMuted">
                          {totalActive === 0
                            ? 'All photos uploaded'
                            : 'Confirm all AI-filled fields above to submit'}
                        </span>
                      ) : (
                        <span>
                          <span className="font-semibold text-textPrimary">{readyCount}</span> of{' '}
                          {totalActive} photo{totalActive !== 1 ? 's' : ''} ready to submit
                          {totalActive - readyCount > 0 && (
                            <span className="text-textMuted">
                              {' '}({totalActive - readyCount} need{totalActive - readyCount === 1 ? 's' : ''} review)
                            </span>
                          )}
                        </span>
                      )}
                    </div>
                    <button
                      type="submit"
                      disabled={readyCount === 0 || isUploading}
                      className={`w-full sm:w-auto px-6 py-3 rounded-lg font-medium transition-colors text-sm ${
                        readyCount > 0 && !isUploading
                          ? 'bg-accent hover:bg-accentHover text-white cursor-pointer'
                          : 'bg-neutral text-textMuted cursor-not-allowed'
                      }`}
                    >
                      {isUploading
                        ? 'Uploading...'
                        : readyCount === 1
                        ? 'Submit 1 photo'
                        : `Submit ${readyCount} photos`}
                    </button>
                  </div>
                </div>
              </>
            )}
          </form>
        )}

        {/* Crop Modal */}
        {pendingCrop && (
          <CropModal
            imageSrc={pendingCrop.src}
            onConfirm={handleCropConfirm}
            onCancel={handleCropCancel}
          />
        )}
      </div>
    </main>
  )
}
