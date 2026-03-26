'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import type { ApprovedPhoto } from '@/lib/photos'
import { watches } from '@/lib/watches'

interface ProfileClientProps {
  userId: string
}

export function ProfileClient({ userId }: ProfileClientProps) {
  const [photos, setPhotos] = useState<ApprovedPhoto[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadPhotos()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  async function loadPhotos() {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/profile/${userId}/photos`)
      const data = (await res.json()) as ApprovedPhoto[]
      setPhotos(data)
    } catch (error) {
      console.error('Failed to load user photos:', error)
    } finally {
      setIsLoading(false)
    }
  }

  function getWatchName(watchId: string): string {
    const watch = watches.find((w) => w.slug === watchId)
    return watch ? `${watch.brand} ${watch.name}` : watchId
  }

  return (
    <Section>
      <Container>
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-textPrimary mb-2">Watch Collector</h1>
          <p className="text-lg text-textSecond">
            {photos.length} photo{photos.length !== 1 ? 's' : ''} uploaded
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-16">
            <div className="inline-block">
              <div className="w-8 h-8 border-4 border-border border-t-accent rounded-full animate-spin" />
            </div>
            <p className="text-textSecond mt-4">Loading photos...</p>
          </div>
        ) : photos.length === 0 ? (
          <div className="card p-12 text-center">
            <div className="text-5xl mb-4">📷</div>
            <h2 className="text-xl font-semibold text-textPrimary mb-2">No photos yet</h2>
            <p className="text-textSecond mb-4">This user hasn&apos;t uploaded any photos yet.</p>
            <Link href="/explore" className="btn-outline px-6 py-2">
              Explore Other Photos
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {photos.map((photo) => {
                const watchName = getWatchName(photo.watchId)
                return (
                  <Link
                    key={photo.id}
                    href={`/watches/${photo.watchId}`}
                    className="group relative aspect-square bg-surfaceAlt rounded-sm overflow-hidden border border-border hover:border-borderStrong transition-colors"
                  >
                    <Image
                      src={photo.url}
                      alt={photo.caption || watchName}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    />
                    {/* Overlay with watch name */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                      <p className="text-white text-xs font-semibold truncate">{watchName}</p>
                    </div>
                  </Link>
                )
              })}
            </div>

            <div className="text-center mt-8">
              <Link href="/explore" className="text-accent hover:text-accentDark transition-colors font-medium">
                ← Back to all photos
              </Link>
            </div>
          </>
        )}
      </Container>
    </Section>
  )
}
