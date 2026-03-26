'use client'

import { useState, useRef, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useUser, SignInButton } from '@clerk/nextjs'
import Link from 'next/link'
import { watches } from '@/lib/watches'
import type { Watch } from '@/lib/types'

export default function UploadClient() {
  const { isSignedIn, isLoaded } = useUser()
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [selectedWatch, setSelectedWatch] = useState<Watch | null>(null)
  const [showDropdown, setShowDropdown] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [caption, setCaption] = useState('')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [preview, setPreview] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const filtered = useMemo(() => {
    if (!search.trim()) return watches.slice(0, 20)
    const q = search.toLowerCase()
    return watches.filter(
      (w) =>
        w.brand.toLowerCase().includes(q) ||
        w.name.toLowerCase().includes(q) ||
        `${w.brand} ${w.name}`.toLowerCase().includes(q)
    ).slice(0, 20)
  }, [search])

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    if (f.size > 5 * 1024 * 1024) {
      setError('File must be under 5MB')
      return
    }
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(f.type)) {
      setError('Only JPEG, PNG, or WebP images are allowed')
      return
    }
    setFile(f)
    setError('')
    const reader = new FileReader()
    reader.onload = () => setPreview(reader.result as string)
    reader.readAsDataURL(f)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedWatch || !file) return
    setUploading(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('file', file)
      if (caption.trim()) formData.append('caption', caption.trim())

      const res = await fetch(`/api/photos/${selectedWatch.slug}`, {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Upload failed')
      }

      router.push(`/watches/${selectedWatch.slug}#gallery`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-surfaceAlt flex items-center justify-center">
        <div className="animate-pulse text-textMuted">Loading...</div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-surfaceAlt text-textPrimary">
      <div className="max-w-xl mx-auto px-4 py-16">
        <Link href="/" className="text-sm text-textMuted hover:text-textPrimary mb-8 inline-block">
          ← Back to home
        </Link>

        <h1 className="text-3xl font-bold mb-2">Upload Your Watch Photo</h1>
        <p className="text-textMuted mb-8">
          Share a real wrist shot. Help others see how this watch looks in real life.
        </p>

        {!isSignedIn ? (
          <div className="bg-surface border border-border rounded-xl p-8 text-center shadow-sm">
            <p className="text-textSecond mb-4">Sign in to upload your watch photos</p>
            <SignInButton mode="modal">
              <button className="px-6 py-3 bg-accent hover:bg-accentHover text-white rounded-lg font-medium transition-colors">
                Sign in to upload
              </button>
            </SignInButton>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Watch Selector */}
            <div className="relative">
              <label className="block text-sm font-medium text-textSecond mb-2">
                Select your watch
              </label>
              {selectedWatch ? (
                <div className="flex items-center justify-between bg-surface border border-borderStrong rounded-lg p-3 shadow-sm">
                  <span className="text-textPrimary">
                    {selectedWatch.brand} {selectedWatch.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedWatch(null)
                      setSearch('')
                    }}
                    className="text-textMuted hover:text-textPrimary text-sm"
                  >
                    Change
                  </button>
                </div>
              ) : (
                <>
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value)
                      setShowDropdown(true)
                    }}
                    onFocus={() => setShowDropdown(true)}
                    placeholder="Search by brand or model..."
                    className="w-full bg-surface border border-borderStrong rounded-lg px-4 py-3 text-textPrimary placeholder-textMuted focus:outline-none focus:border-accent shadow-sm"
                  />
                  {showDropdown && filtered.length > 0 && (
                    <ul className="absolute z-10 w-full mt-1 bg-surface border border-borderStrong rounded-lg max-h-60 overflow-y-auto shadow-md">
                      {filtered.map((w) => (
                        <li key={w.slug}>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedWatch(w)
                              setShowDropdown(false)
                              setSearch('')
                            }}
                            className="w-full text-left px-4 py-2 hover:bg-neutral text-textSecond hover:text-textPrimary transition-colors"
                          >
                            <span className="font-medium">{w.brand}</span>{' '}
                            <span className="text-textMuted">{w.name}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              )}
            </div>

            {/* Upload form (shown after watch selection) */}
            {selectedWatch && (
              <>
                <div>
                  <label className="block text-sm font-medium text-textSecond mb-2">
                    Photo
                  </label>
                  <div
                    onClick={() => fileRef.current?.click()}
                    className="border-2 border-dashed border-borderStrong rounded-lg p-8 text-center cursor-pointer hover:border-accent transition-colors"
                  >
                    {preview ? (
                      <img
                        src={preview}
                        alt="Preview"
                        className="max-h-64 mx-auto rounded-lg"
                      />
                    ) : (
                      <div>
                        <p className="text-textMuted mb-1">Click to select a photo</p>
                        <p className="text-textMuted text-sm">JPEG, PNG, or WebP · Max 5MB</p>
                      </div>
                    )}
                  </div>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-textSecond mb-2">
                    Caption <span className="text-textMuted">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="e.g. 7.25 inch wrist, daily wear for 2 years"
                    maxLength={200}
                    className="w-full bg-surface border border-borderStrong rounded-lg px-4 py-3 text-textPrimary placeholder-textMuted focus:outline-none focus:border-accent shadow-sm"
                  />
                </div>

                {error && (
                  <p className="text-red-500 text-sm">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={!file || uploading}
                  className="w-full py-3 bg-accent hover:bg-accentHover disabled:bg-neutral disabled:text-textMuted text-white rounded-lg font-medium transition-colors"
                >
                  {uploading ? 'Uploading...' : 'Upload Photo'}
                </button>
              </>
            )}
          </form>
        )}
      </div>
    </main>
  )
}
