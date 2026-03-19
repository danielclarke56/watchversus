'use client'

import { useState } from 'react'
import { useUser, SignInButton } from '@clerk/nextjs'

interface Props {
  watchId: string
  watchName: string
  onSuccess?: () => void
}

export default function ReviewFormContent({ watchId, watchName, onSuccess }: Props) {
  const { isSignedIn, isLoaded } = useUser()
  const [rating, setRating] = useState(0)
  const [hovered, setHovered] = useState(0)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [ownerFor, setOwnerFor] = useState('')
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (rating === 0) { setErrorMsg('Please select a star rating.'); return }
    if (title.trim().length === 0) { setErrorMsg('Please enter a title.'); return }
    if (body.length < 50) { setErrorMsg('Review must be at least 50 characters.'); return }

    setStatus('submitting')
    setErrorMsg('')

    try {
      const res = await fetch(`/api/reviews/${watchId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating,
          title: title.trim(),
          body: body.trim(),
          ownerFor: ownerFor.trim() || undefined,
        }),
      })
      const data = await res.json() as { error?: string }
      if (!res.ok) {
        setErrorMsg(data.error ?? 'Something went wrong.')
        setStatus('error')
      } else {
        setStatus('success')
        onSuccess?.()
      }
    } catch {
      setErrorMsg('Network error — please try again.')
      setStatus('error')
    }
  }

  if (!isLoaded) return null

  if (!isSignedIn) {
    return (
      <div className="card p-6 text-center">
        <h3 className="text-textPrimary font-semibold mb-2">Write a Review</h3>
        <p className="text-textSecond text-sm mb-4">Sign in to share your experience with the {watchName}.</p>
        <SignInButton mode="modal">
          <button className="btn-outline px-6 py-2 text-sm">Sign In to Review</button>
        </SignInButton>
      </div>
    )
  }

  if (status === 'success') {
    return (
      <div className="card p-6 text-center border-borderStrong bg-neutral">
        <div className="text-accent text-3xl mb-3">★</div>
        <h3 className="text-textPrimary font-semibold mb-1">Review submitted!</h3>
        <p className="text-textSecond text-sm">Your review is pending approval and will appear shortly.</p>
      </div>
    )
  }

  const displayRating = hovered || rating

  return (
    <div className="card p-6">
      <h3 className="text-textPrimary font-semibold text-lg mb-5">Write a Review</h3>
      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Star rating */}
        <div>
          <label className="block text-textSecond text-sm mb-2">
            Overall Rating <span className="text-loser">*</span>
          </label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHovered(star)}
                onMouseLeave={() => setHovered(0)}
                className="text-3xl leading-none transition-colors"
                style={{ color: star <= displayRating ? 'var(--accent)' : 'var(--border)' }}
                aria-label={`Rate ${star} star${star !== 1 ? 's' : ''}`}
              >
                ★
              </button>
            ))}
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="block text-textSecond text-sm mb-2">
            Review Title <span className="text-loser">*</span>
            <span className="ml-2 text-textMuted">{title.length}/80</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={80}
            placeholder="Summarise your experience in a few words"
            className="w-full bg-surfaceAlt border border-border rounded-sm px-4 py-2.5 text-textPrimary placeholder-textMuted text-sm focus:outline-none focus:border-accent transition-colors"
          />
        </div>

        {/* Body */}
        <div>
          <label className="block text-textSecond text-sm mb-2">
            Your Review <span className="text-loser">*</span>
            <span className="ml-2 text-textMuted">
              {body.length}/1000
              {body.length > 0 && body.length < 50 && (
                <span className="text-accent"> (min 50)</span>
              )}
            </span>
          </label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            maxLength={1000}
            rows={5}
            placeholder="Tell others what you think — build quality, daily wearability, value for money..."
            className="w-full bg-surfaceAlt border border-border rounded-sm px-4 py-2.5 text-textPrimary placeholder-textMuted text-sm focus:outline-none focus:border-accent transition-colors resize-none"
          />
        </div>

        {/* Owner for */}
        <div>
          <label className="block text-textSecond text-sm mb-2">
            How long have you owned it?{' '}
            <span className="text-textMuted">(optional)</span>
          </label>
          <input
            type="text"
            value={ownerFor}
            onChange={(e) => setOwnerFor(e.target.value)}
            placeholder="e.g. 2 years, 6 months"
            className="w-full bg-surfaceAlt border border-border rounded-sm px-4 py-2.5 text-textPrimary placeholder-textMuted text-sm focus:outline-none focus:border-accent transition-colors"
          />
        </div>

        {errorMsg && (
          <p className="text-red-500 text-sm">{errorMsg}</p>
        )}

        <button
          type="submit"
          disabled={status === 'submitting'}
          className="btn-gold w-full py-2.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {status === 'submitting' ? 'Submitting…' : 'Submit Review'}
        </button>
      </form>
    </div>
  )
}
