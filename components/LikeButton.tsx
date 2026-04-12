'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from '@clerk/nextjs'

interface LikeButtonProps {
  photoId: string
  variant?: 'card' | 'button'
}

export default function LikeButton({ photoId, variant = 'card' }: LikeButtonProps) {
  const { isSignedIn } = useAuth()
  const [liked, setLiked] = useState(false)
  const [animating, setAnimating] = useState(false)
  const fetchedRef = useRef(false)

  useEffect(() => {
    if (fetchedRef.current) return
    fetchedRef.current = true
    fetch(`/api/photo/${photoId}/like`)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { if (data) setLiked(data.liked) })
      .catch(() => {})
  }, [photoId])

  const handleLike = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      if (!isSignedIn) {
        window.location.href = '/sign-in'
        return
      }
      const wasLiked = liked
      setLiked(!wasLiked)
      setAnimating(true)
      setTimeout(() => setAnimating(false), 300)
      try {
        const res = await fetch(`/api/photo/${photoId}/like`, { method: 'POST' })
        if (res.ok) {
          const data = await res.json()
          setLiked(data.liked)
        } else {
          setLiked(wasLiked)
        }
      } catch {
        setLiked(wasLiked)
      }
    },
    [liked, photoId, isSignedIn]
  )

  const heartIcon = (
    <svg
      className={variant === 'card' ? 'w-3.5 h-3.5' : 'w-4 h-4'}
      fill={liked ? 'currentColor' : 'none'}
      stroke="currentColor"
      viewBox="0 0 24 24"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
    </svg>
  )

  if (variant === 'card') {
    return (
      <button
        type="button"
        onClick={handleLike}
        className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
          liked
            ? 'bg-red-500 text-white shadow-md'
            : 'bg-black/40 text-white opacity-0 group-hover:opacity-100 hover:bg-black/60'
        } ${animating ? 'scale-125' : 'scale-100'}`}
        aria-label={liked ? 'Unlike' : 'Like'}
      >
        {heartIcon}
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={handleLike}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
        liked
          ? 'bg-red-50 text-red-600 hover:bg-red-100'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      } ${animating ? 'scale-105' : 'scale-100'}`}
    >
      {heartIcon}
      {liked ? 'Liked' : 'Like'}
    </button>
  )
}
