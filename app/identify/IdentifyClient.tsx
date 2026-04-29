'use client'

import { useState, useRef } from 'react'
import { useUser, SignInButton } from '@clerk/nextjs'
import Link from 'next/link'
import imageCompression from 'browser-image-compression'

interface AiCandidate {
  brand: string
  model: string
  reference: string | null
  movement: string | null
  caseSize: string | null
  lugToLug: string | null
  betweenLugs: string | null
  thickness: string | null
  waterResistance: string | null
  estimatedPrice: string | null
  wristSize: string | null
  dialColor: string | null
  bezelColor: string | null
  caseMaterial: string | null
  strapType: string | null
  watchStyle: string | null
  confidence: 'high' | 'medium' | 'low'
  reasoning: string
}

interface IdentifyResult {
  isWatch: boolean
  isAiGenerated: boolean
  candidates: AiCandidate[]
}

const PRICE_BUCKETS: Record<string, string> = {
  lt500: 'Under $500',
  lt1000: '$500 – $1,000',
  lt5000: '$1,000 – $5,000',
  lt15000: '$5,000 – $15,000',
  lt50000: '$15,000 – $50,000',
  gt50000: '$50,000+',
}

function mapPriceToBucket(val: string | null | undefined): string {
  if (!val) return ''
  const n = parseFloat(val.replace(/[^0-9.]/g, ''))
  if (isNaN(n)) return ''
  if (n < 500) return PRICE_BUCKETS.lt500
  if (n < 1000) return PRICE_BUCKETS.lt1000
  if (n < 5000) return PRICE_BUCKETS.lt5000
  if (n < 15000) return PRICE_BUCKETS.lt15000
  if (n < 50000) return PRICE_BUCKETS.lt50000
  return PRICE_BUCKETS.gt50000
}

function stripUnits(val: string | null | undefined): string {
  if (!val) return ''
  return val.toString().replace(/[^0-9.]/g, '').trim()
}

function confidenceBadge(c: AiCandidate['confidence']) {
  if (c === 'high') return 'bg-green-100 text-green-700'
  if (c === 'medium') return 'bg-yellow-100 text-yellow-700'
  return 'bg-gray-100 text-gray-500'
}

function buildUploadUrl(candidate: AiCandidate): string {
  const params = new URLSearchParams()
  if (candidate.brand) params.set('brand', candidate.brand)
  if (candidate.model) params.set('model', candidate.model)
  if (candidate.reference) params.set('reference', candidate.reference)
  if (candidate.movement) params.set('movement', candidate.movement)
  if (candidate.caseSize) params.set('caseSize', stripUnits(candidate.caseSize))
  if (candidate.waterResistance) params.set('waterResistance', stripUnits(candidate.waterResistance))
  const price = mapPriceToBucket(candidate.estimatedPrice)
  if (price) params.set('estimatedPrice', price)
  return `/upload?${params.toString()}`
}

export default function IdentifyClient() {
  const { isSignedIn, isLoaded } = useUser()
  const [preview, setPreview] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [status, setStatus] = useState<'idle' | 'processing' | 'done' | 'error'>('idle')
  const [result, setResult] = useState<IdentifyResult | null>(null)
  const [errorMsg, setErrorMsg] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleFile(raw: File) {
    setStatus('idle')
    setResult(null)
    setErrorMsg('')

    // Client-side compress before preview + upload
    let compressed = raw
    try {
      compressed = await imageCompression(raw, {
        maxSizeMB: 3,
        maxWidthOrHeight: 2400,
        useWebWorker: true,
        fileType: 'image/webp',
        initialQuality: 0.85,
      })
    } catch { /* keep original */ }

    const reader = new FileReader()
    reader.onload = () => setPreview(reader.result as string)
    reader.readAsDataURL(compressed)
    setFile(compressed)
  }

  function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (f) handleFile(f)
    if (fileRef.current) fileRef.current.value = ''
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(false)
    const f = e.dataTransfer.files?.[0]
    if (f) handleFile(f)
  }

  async function identify() {
    if (!file) return
    setStatus('processing')
    setErrorMsg('')
    try {
      const formData = new FormData()
      formData.append('photo', file)
      const res = await fetch('/api/photos/identify', { method: 'POST', body: formData })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Identification failed')
      }
      const data: IdentifyResult = await res.json()
      setResult(data)
      setStatus('done')
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong')
      setStatus('error')
    }
  }

  function reset() {
    setPreview(null)
    setFile(null)
    setStatus('idle')
    setResult(null)
    setErrorMsg('')
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-surfaceAlt flex items-center justify-center">
        <div className="animate-pulse text-textMuted">Loading...</div>
      </div>
    )
  }

  const candidate = result?.candidates?.[0] ?? null

  return (
    <main className="min-h-screen bg-surfaceAlt text-textPrimary">
      <div className="max-w-2xl mx-auto px-4 py-10 sm:py-14">

        <Link href="/" className="text-xs sm:text-sm text-textMuted hover:text-textPrimary mb-6 inline-block">
          &larr; Back to home
        </Link>

        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Identify a Watch</h1>
        <p className="text-textMuted text-sm mb-8">
          Upload any watch photo and our AI will tell you exactly what it is.
        </p>

        {!isSignedIn ? (
          <div className="bg-surface border border-borderStrong rounded-xl p-8 text-center shadow-sm">
            <div className="text-4xl mb-4">🔍</div>
            <p className="text-textSecond mb-5 text-sm">Sign in to identify watches with AI</p>
            <SignInButton mode="modal">
              <button className="px-6 py-2.5 bg-accent hover:bg-accentHover text-white rounded-lg font-medium transition-colors text-sm">
                Sign in to identify
              </button>
            </SignInButton>
          </div>
        ) : (
          <div className="space-y-5">

            {/* Drop zone / preview */}
            {!preview ? (
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileRef.current?.click()}
                className={`border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-colors py-16 ${
                  isDragging ? 'border-accent bg-accent/5' : 'border-borderStrong hover:border-accent bg-surface'
                }`}
              >
                <div className="text-5xl mb-4">🔍</div>
                <p className="text-textSecond font-medium text-sm mb-1">
                  {isDragging ? 'Drop photo here' : 'Drop a photo or click to browse'}
                </p>
                <p className="text-textMuted text-xs">JPEG, PNG, WebP · Up to 20MB</p>
              </div>
            ) : (
              <div className="bg-surface border border-borderStrong rounded-xl overflow-hidden shadow-sm">
                {/* Image */}
                <div className="relative bg-gray-100 aspect-[4/3] flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={preview} alt="Watch to identify" className="w-full h-full object-contain" />
                  {status === 'processing' && (
                    <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-3">
                      <span className="animate-spin inline-block w-8 h-8 border-3 border-white border-t-transparent rounded-full" />
                      <span className="text-white text-sm font-medium">Identifying watch...</span>
                    </div>
                  )}
                </div>

                {/* Actions below image */}
                <div className="p-4 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={reset}
                    className="text-xs text-textMuted hover:text-textPrimary underline underline-offset-2 transition-colors"
                  >
                    Use a different photo
                  </button>
                  {status !== 'done' && (
                    <button
                      type="button"
                      onClick={identify}
                      disabled={status === 'processing'}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        status === 'processing'
                          ? 'bg-neutral text-textMuted cursor-not-allowed'
                          : 'bg-accent hover:bg-accentHover text-white'
                      }`}
                    >
                      {status === 'processing' ? (
                        <>
                          <span className="animate-spin inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full" />
                          Identifying...
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                          </svg>
                          Identify with AI
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Error */}
            {status === 'error' && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
                {errorMsg || 'Identification failed — please try again.'}
              </div>
            )}

            {/* Results */}
            {status === 'done' && result && (
              <div className="space-y-4">

                {/* Not a watch */}
                {!result.isWatch && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5 text-center">
                    <p className="text-sm text-yellow-800 font-medium mb-1">No watch detected</p>
                    <p className="text-xs text-yellow-700">The AI couldn&apos;t find a watch in this photo. Try a clearer shot with the dial visible.</p>
                    <button onClick={reset} className="mt-3 text-xs underline underline-offset-2 text-yellow-700 hover:text-yellow-900">Try another photo</button>
                  </div>
                )}

                {/* AI-generated warning */}
                {result.isAiGenerated && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-xs text-amber-700">
                    ⚠️ This photo may be AI-generated. AI images can&apos;t be submitted to Watchems.
                  </div>
                )}

                {/* Primary candidate */}
                {candidate && (
                  <div className="bg-surface border border-borderStrong rounded-xl shadow-sm overflow-hidden">
                    <div className="px-5 pt-5 pb-4 border-b border-borderStrong flex items-start justify-between gap-3">
                      <div>
                        <h2 className="text-lg font-bold text-textPrimary">
                          {candidate.brand} {candidate.model}
                        </h2>
                        {candidate.reference && (
                          <p className="text-xs text-textMuted mt-0.5">Ref. {candidate.reference}</p>
                        )}
                      </div>
                      <span className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full capitalize ${confidenceBadge(candidate.confidence)}`}>
                        {candidate.confidence} confidence
                      </span>
                    </div>

                    {/* Specs grid */}
                    <dl className="grid grid-cols-2 gap-x-6 gap-y-3 px-5 py-4 text-sm">
                      {candidate.movement && (
                        <>
                          <dt className="text-textMuted">Movement</dt>
                          <dd className="text-textPrimary font-medium">{candidate.movement}</dd>
                        </>
                      )}
                      {candidate.caseSize && (
                        <>
                          <dt className="text-textMuted">Case size</dt>
                          <dd className="text-textPrimary font-medium">{stripUnits(candidate.caseSize)}mm</dd>
                        </>
                      )}
                      {candidate.caseMaterial && (
                        <>
                          <dt className="text-textMuted">Case material</dt>
                          <dd className="text-textPrimary font-medium">{candidate.caseMaterial}</dd>
                        </>
                      )}
                      {candidate.dialColor && (
                        <>
                          <dt className="text-textMuted">Dial</dt>
                          <dd className="text-textPrimary font-medium capitalize">{candidate.dialColor}</dd>
                        </>
                      )}
                      {candidate.strapType && (
                        <>
                          <dt className="text-textMuted">Strap / bracelet</dt>
                          <dd className="text-textPrimary font-medium">{candidate.strapType}</dd>
                        </>
                      )}
                      {candidate.waterResistance && (
                        <>
                          <dt className="text-textMuted">Water resistance</dt>
                          <dd className="text-textPrimary font-medium">{stripUnits(candidate.waterResistance)}m</dd>
                        </>
                      )}
                      {candidate.watchStyle && (
                        <>
                          <dt className="text-textMuted">Style</dt>
                          <dd className="text-textPrimary font-medium capitalize">{candidate.watchStyle}</dd>
                        </>
                      )}
                      {candidate.estimatedPrice && (
                        <>
                          <dt className="text-textMuted">Est. retail</dt>
                          <dd className="text-textPrimary font-medium">{mapPriceToBucket(candidate.estimatedPrice)}</dd>
                        </>
                      )}
                    </dl>

                    {/* Reasoning */}
                    {candidate.reasoning && (
                      <p className="px-5 pb-4 text-xs text-textMuted italic leading-relaxed">
                        &ldquo;{candidate.reasoning}&rdquo;
                      </p>
                    )}

                    {/* Upload CTA */}
                    <div className="px-5 pb-5 pt-1 border-t border-borderStrong flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-textPrimary">Is this your watch?</p>
                        <p className="text-xs text-textMuted">Add a wrist photo to the Watchems gallery.</p>
                      </div>
                      <Link
                        href={buildUploadUrl(candidate)}
                        className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                        </svg>
                        Upload this watch
                      </Link>
                    </div>
                  </div>
                )}

                {/* Alternative candidates */}
                {result.candidates.length > 1 && (
                  <div>
                    <p className="text-xs text-textMuted mb-2 font-medium uppercase tracking-wider">Other possibilities</p>
                    <div className="space-y-2">
                      {result.candidates.slice(1).map((c, i) => (
                        <div key={i} className="bg-surface border border-borderStrong rounded-lg px-4 py-3 flex items-center justify-between gap-3">
                          <div>
                            <p className="text-sm font-medium text-textPrimary">{c.brand} {c.model}</p>
                            {c.reference && <p className="text-xs text-textMuted">Ref. {c.reference}</p>}
                          </div>
                          <span className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full capitalize ${confidenceBadge(c.confidence)}`}>
                            {c.confidence}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Try another */}
                <button
                  onClick={reset}
                  className="w-full text-sm text-textMuted hover:text-textPrimary underline underline-offset-2 transition-colors py-1"
                >
                  Identify another watch
                </button>

              </div>
            )}

          </div>
        )}

        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          onChange={handleInput}
          className="hidden"
        />
      </div>
    </main>
  )
}
