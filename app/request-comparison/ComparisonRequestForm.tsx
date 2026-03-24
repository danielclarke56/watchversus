'use client'

import { useState } from 'react'

export default function ComparisonRequestForm() {
  const [watch1, setWatch1] = useState('')
  const [watch2, setWatch2] = useState('')
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    setErrorMsg('')

    try {
      const res = await fetch('/api/comparison-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ watch1: watch1.trim(), watch2: watch2.trim(), email: email.trim() || undefined }),
      })
      const data = await res.json()
      if (!res.ok) {
        setErrorMsg(data.error || 'Something went wrong')
        setStatus('error')
        return
      }
      setStatus('success')
      setWatch1('')
      setWatch2('')
      setEmail('')
    } catch {
      setErrorMsg('Network error. Please try again.')
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className="card p-8 text-center">
        <p className="text-lg font-bold text-winner mb-2">Request Submitted!</p>
        <p className="text-sm text-textSecond mb-4">
          Thanks for your suggestion. We review requests regularly and prioritize the most popular ones.
        </p>
        <button
          onClick={() => setStatus('idle')}
          className="btn-outline text-sm px-4 py-2"
        >
          Submit Another
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="card p-6 space-y-5">
      <div>
        <label htmlFor="watch1" className="block text-sm font-semibold text-textPrimary mb-1.5">
          Watch 1
        </label>
        <input
          id="watch1"
          type="text"
          required
          minLength={2}
          maxLength={100}
          placeholder="e.g. Rolex Submariner"
          value={watch1}
          onChange={(e) => setWatch1(e.target.value)}
          className="w-full border border-border rounded-sm px-3 py-2.5 text-sm text-textPrimary placeholder:text-textMuted focus:outline-none focus:border-accent transition-colors"
        />
      </div>

      <div>
        <label htmlFor="watch2" className="block text-sm font-semibold text-textPrimary mb-1.5">
          Watch 2
        </label>
        <input
          id="watch2"
          type="text"
          required
          minLength={2}
          maxLength={100}
          placeholder="e.g. Omega Seamaster 300M"
          value={watch2}
          onChange={(e) => setWatch2(e.target.value)}
          className="w-full border border-border rounded-sm px-3 py-2.5 text-sm text-textPrimary placeholder:text-textMuted focus:outline-none focus:border-accent transition-colors"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-semibold text-textPrimary mb-1.5">
          Email <span className="text-textMuted font-normal">(optional — get notified when it&apos;s live)</span>
        </label>
        <input
          id="email"
          type="email"
          maxLength={200}
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-border rounded-sm px-3 py-2.5 text-sm text-textPrimary placeholder:text-textMuted focus:outline-none focus:border-accent transition-colors"
        />
      </div>

      {status === 'error' && (
        <p className="text-sm text-loser">{errorMsg}</p>
      )}

      <button
        type="submit"
        disabled={status === 'loading'}
        className="btn-gold w-full text-sm py-3 rounded-md font-semibold disabled:opacity-50"
      >
        {status === 'loading' ? 'Submitting...' : 'Submit Request'}
      </button>
    </form>
  )
}
