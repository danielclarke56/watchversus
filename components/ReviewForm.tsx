'use client'

import { useState, FormEvent, ChangeEvent } from 'react'
import { Review } from '@/lib/reviews'

interface ReviewFormProps {
  watchSlug: string
  onSubmitSuccess: (review: Review) => void
}

export default function ReviewForm({ watchSlug, onSubmitSuccess }: ReviewFormProps) {
  const [rating, setRating] = useState<number>(5)
  const [title, setTitle] = useState<string>('')
  const [body, setBody] = useState<string>('')
  const [pros, setPros] = useState<string[]>([''])
  const [cons, setCons] = useState<string[]>([''])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>('')
  const [success, setSuccess] = useState<boolean>(false)

  const handleProChange = (index: number, value: string): void => {
    const newPros = [...pros]
    newPros[index] = value
    setPros(newPros)
  }

  const handleConChange = (index: number, value: string): void => {
    const newCons = [...cons]
    newCons[index] = value
    setCons(newCons)
  }

  const addProField = (): void => {
    setPros([...pros, ''])
  }

  const addConField = (): void => {
    setCons([...cons, ''])
  }

  const removeProField = (index: number): void => {
    setPros(pros.filter((_, i) => i !== index))
  }

  const removeConField = (index: number): void => {
    setCons(cons.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()
    setError('')
    setSuccess(false)
    setLoading(true)

    try {
      const filteredPros = pros.filter((p) => p.trim().length > 0)
      const filteredCons = cons.filter((c) => c.trim().length > 0)

      if (filteredPros.length === 0 || filteredCons.length === 0) {
        setError('Please add at least one pro and one con')
        setLoading(false)
        return
      }

      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          watchSlug,
          rating,
          title,
          body,
          pros: filteredPros,
          cons: filteredCons,
        }),
      })

      if (!response.ok) {
        const data = (await response.json()) as { error: string }
        throw new Error(data.error || 'Failed to submit review')
      }

      const data = (await response.json()) as { review: Review }
      onSubmitSuccess(data.review)
      setSuccess(true)
      setTitle('')
      setBody('')
      setPros([''])
      setCons([''])
      setRating(5)

      setTimeout(() => setSuccess(false), 5000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold mb-4">Write a Review</h3>

      {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">{error}</div>}
      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded text-green-700 text-sm">
          Review submitted! It will appear after moderation.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Rating */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Rating: <span className="text-lg font-semibold">{rating}/5</span>
          </label>
          <input
            type="range"
            min="1"
            max="5"
            value={rating}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setRating(parseInt(e.target.value, 10))}
            className="w-full"
          />
        </div>

        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-2">
            Review Title
          </label>
          <input
            id="title"
            type="text"
            required
            minLength={3}
            maxLength={100}
            value={title}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
            placeholder="e.g., Excellent value for the price"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            {title.length}/100
          </p>
        </div>

        {/* Body */}
        <div>
          <label htmlFor="body" className="block text-sm font-medium mb-2">
            Review Details
          </label>
          <textarea
            id="body"
            required
            minLength={10}
            maxLength={2000}
            value={body}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setBody(e.target.value)}
            placeholder="Tell us what you think about this watch..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={4}
          />
          <p className="text-xs text-gray-500 mt-1">
            {body.length}/2000
          </p>
        </div>

        {/* Pros */}
        <div>
          <label className="block text-sm font-medium mb-2">Pros</label>
          {pros.map((pro, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="text"
                value={pro}
                onChange={(e: ChangeEvent<HTMLInputElement>) => handleProChange(index, e.target.value)}
                placeholder={`Pro ${index + 1}`}
                maxLength={100}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {pros.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeProField(index)}
                  className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-md text-sm"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addProField}
            className="mt-2 text-sm text-blue-600 hover:underline"
          >
            + Add Pro
          </button>
        </div>

        {/* Cons */}
        <div>
          <label className="block text-sm font-medium mb-2">Cons</label>
          {cons.map((con, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="text"
                value={con}
                onChange={(e: ChangeEvent<HTMLInputElement>) => handleConChange(index, e.target.value)}
                placeholder={`Con ${index + 1}`}
                maxLength={100}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {cons.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeConField(index)}
                  className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-md text-sm"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addConField}
            className="mt-2 text-sm text-blue-600 hover:underline"
          >
            + Add Con
          </button>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-md font-medium hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? 'Submitting...' : 'Submit Review'}
        </button>
      </form>
    </div>
  )
}
