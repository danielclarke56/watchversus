'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Heart } from 'lucide-react'
import { useUser } from '@clerk/nextjs'
import ShareDropdown from './ShareDropdown'

interface SocialActionsProps {
  photoId: string
  /** SEO slug for share URLs (falls back to photoId if not provided) */
  photoSlug?: string
  /** 'card' = small overlay on gallery card hover, 'lightbox' = row below lightbox image */
  variant: 'card' | 'lightbox'
}

export default function SocialActions({ photoId, photoSlug, variant }: SocialActionsProps) {
  const { isSignedIn } = useUser()
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [animating, setAnimating] = useState(false)
  const fetchedRef = useRef(false)

  // Fetch initial like state
  useEffect(() => {
    if (fetchedRef.current) return
    fetchedRef.current = true

    fetch(`/api/photo/${photoId}/like`)
      .then((r) => r.json())
      .then((data) => {
        setLiked(data.liked)
        setLikeCount(data.count)
      })
      .catch(() => {})

  }, [photoId])

  const handleLike = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation()

      if (!isSignedIn) {
        window.location.href = '/sign-in'
        return
      }

      // Optimistic update
      const wasLiked = liked
      setLiked(!wasLiked)
      setLikeCount((c) => c + (wasLiked ? -1 : 1))
      setAnimating(true)
      setTimeout(() => setAnimating(false), 300)

      try {
        const res = await fetch(`/api/photo/${photoId}/like`, { method: 'POST' })
        if (res.ok) {
          const data = await res.json()
          setLiked(data.liked)
          setLikeCount(data.count)
        } else {
          // Revert
          setLiked(wasLiked)
          setLikeCount((c) => c + (wasLiked ? 1 : -1))
        }
      } catch {
        setLiked(wasLiked)
        setLikeCount((c) => c + (wasLiked ? 1 : -1))
      }
    },
    [liked, photoId, isSignedIn]
  )

  const iconSize = variant === 'card' ? 14 : 16

  return (
    <div
      className={`flex items-center ${variant === 'card' ? 'gap-1.5' : 'gap-2'}`}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Like */}
      <button
        type="button"
        onClick={handleLike}
        className={`rounded-full flex items-center justify-center transition-all ${
          variant === 'card' ? 'w-8 h-8 backdrop-blur-sm' : 'w-9 h-9'
        } ${
          variant === 'card'
            ? liked
              ? 'text-red-500 bg-black/50 hover:bg-black/70'
              : 'text-white bg-black/50 hover:bg-black/70'
            : liked
              ? 'text-red-500 bg-gray-100 hover:bg-gray-200'
              : 'text-gray-500 bg-gray-100 hover:bg-gray-200'
        } ${animating ? 'scale-125' : 'scale-100'}`}
        aria-label={liked ? 'Unlike' : 'Like'}
      >
        <Heart size={iconSize} fill={liked ? 'currentColor' : 'none'} />
      </button>
      {likeCount > 0 && (
        <span className={`text-xs font-medium ${variant === 'card' ? 'text-white drop-shadow-sm -ml-0.5 mr-0.5' : 'text-gray-600 -ml-1 mr-0.5'}`}>
          {likeCount}
        </span>
      )}

      {/* Share */}
      <ShareDropdown
        photoSlug={photoSlug ?? photoId}
        iconSize={iconSize}
        className={variant === 'card' ? '[&>button]:w-8 [&>button]:h-8' : '[&>button]:bg-gray-100 [&>button]:hover:bg-gray-200 [&>button]:text-gray-500 [&>button]:hover:text-gray-700'}
      />

    </div>
  )
}
