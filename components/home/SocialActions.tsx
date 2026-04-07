'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Heart } from 'lucide-react'
import { useUser } from '@clerk/nextjs'
import ShareDropdown from './ShareDropdown'
import SaveModal from './SaveModal'

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
  const [saved, setSaved] = useState(false)
  const [animating, setAnimating] = useState(false)
  const fetchedRef = useRef(false)

  // Fetch initial like + saved state
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

    if (isSignedIn) {
      fetch(`/api/photo/${photoId}/saved`)
        .then((r) => r.json())
        .then((data) => {
          setSaved((data.savedIn || []).length > 0)
        })
        .catch(() => {})
    }
  }, [photoId, isSignedIn])

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

  const handleSavedChange = useCallback((isSaved: boolean) => {
    setSaved(isSaved)
  }, [])

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
        className={`backdrop-blur-sm rounded-full flex items-center justify-center transition-all ${
          variant === 'card' ? 'w-8 h-8' : 'w-9 h-9'
        } ${
          liked
            ? 'text-red-500 bg-black/50 hover:bg-black/70'
            : 'text-white bg-black/50 hover:bg-black/70'
        } ${animating ? 'scale-125' : 'scale-100'}`}
        aria-label={liked ? 'Unlike' : 'Like'}
      >
        <Heart size={iconSize} fill={liked ? 'currentColor' : 'none'} />
      </button>
      {likeCount > 0 && (
        <span className={`text-white text-xs font-medium drop-shadow-sm ${variant === 'card' ? '-ml-0.5 mr-0.5' : '-ml-1 mr-0.5'}`}>
          {likeCount}
        </span>
      )}

      {/* Share */}
      <ShareDropdown
        photoSlug={photoSlug ?? photoId}
        iconSize={iconSize}
        className={variant === 'card' ? '[&>button]:w-8 [&>button]:h-8' : ''}
      />

      {/* Save */}
      <SaveModal
        photoId={photoId}
        iconSize={iconSize}
        isSaved={saved}
        onSavedChange={handleSavedChange}
        className={variant === 'card' ? '[&>button]:w-8 [&>button]:h-8' : ''}
      />
    </div>
  )
}
