'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import EmptyState from '@/components/ui/EmptyState'

interface LikedPhoto {
  likeId: string
  photoId: string
  slug: string | null
  url: string
  thumbnailUrl: string | null
  brandName: string | null
  modelName: string | null
  userName: string
  watchId: string
  likedAt: string
}

export default function LikedClient() {
  const [photos, setPhotos] = useState<LikedPhoto[]>([])
  const [loading, setLoading] = useState(true)

  const fetchLiked = useCallback(async () => {
    try {
      const res = await fetch('/api/user/liked')
      if (res.ok) {
        const data = await res.json()
        setPhotos(data.photos)
      }
    } catch (err) {
      console.error('Failed to fetch liked photos:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchLiked() }, [fetchLiked])

  async function handleUnlike(photoId: string) {
    try {
      await fetch(`/api/photo/${photoId}/like`, { method: 'POST' })
      setPhotos((prev) => prev.filter((p) => p.photoId !== photoId))
    } catch (err) {
      console.error('Failed to unlike:', err)
    }
  }

  return (
    <div className="py-6 sm:py-8 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Liked Watches</h1>
          <p className="text-gray-600 text-sm mt-1">
            Photos you liked across the gallery.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="aspect-square rounded-xl bg-gray-200 animate-pulse" />
            ))}
          </div>
        ) : photos.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="p-4 sm:p-6">
              <EmptyState
                icon="❤️"
                title="No liked watches yet"
                message="Tap the heart icon on any photo in the gallery to save it here."
                actionUrl="/"
                actionText="Browse Gallery"
                actionStyle="blue"
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {photos.map((photo) => (
              <div key={photo.likeId} className="group relative rounded-xl overflow-hidden border border-gray-100 hover:border-gray-300 transition-colors bg-white">
                <Link href={`/photo/${photo.slug ?? photo.photoId}`}>
                  <div className="aspect-square bg-gray-50">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photo.thumbnailUrl || photo.url}
                      alt={`${photo.brandName || 'Watch'} ${photo.modelName || ''}`}
                      className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                </Link>
                <div className="p-2 flex items-center justify-between gap-1">
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-gray-900 truncate">
                      {[photo.brandName, photo.modelName].filter(Boolean).join(' ') || 'Watch'}
                    </p>
                    <p className="text-[11px] text-gray-500 truncate">by {photo.userName}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleUnlike(photo.photoId)}
                    className="text-red-400 hover:text-red-600 transition-colors shrink-0"
                    aria-label="Unlike"
                  >
                    <svg className="w-4 h-4" fill="currentColor" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
