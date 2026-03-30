'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'

interface Photo {
  id: string
  url: string
  brandName: string | null
  modelName: string | null
  referenceNumber: string | null
  status: string
  createdAt: Date
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date)
}

function PhotoThumbnail({ url, alt }: { url: string; alt: string }) {
  const [error, setError] = useState(false)

  if (error || !url || url.startsWith('/')) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-1 text-gray-400">
        <span className="text-3xl">🖼️</span>
        <span className="text-xs">Image unavailable</span>
      </div>
    )
  }

  return (
    <Image
      src={url}
      alt={alt}
      fill
      className="object-cover"
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      onError={() => setError(true)}
    />
  )
}

function PhotoCard({ photo }: { photo: Photo }) {
  const alt = [photo.brandName, photo.modelName].filter(Boolean).join(' ') || 'Watch photo'

  return (
    <div className="rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow bg-white">
      {/* Thumbnail */}
      <div className="relative w-full h-48 bg-gray-100">
        <PhotoThumbnail url={photo.url} alt={alt} />
      </div>

      {/* Card Content */}
      <div className="p-4">
        <h3 className="text-base font-semibold text-gray-900 mb-1">{alt}</h3>
        {photo.referenceNumber && (
          <p className="text-sm text-gray-500 mb-2">Ref. {photo.referenceNumber}</p>
        )}
        <p className="text-xs text-gray-400">{formatDate(photo.createdAt)}</p>

        {photo.status === 'approved' && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <Link href="/" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              View in Gallery →
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

interface SectionProps {
  title: string
  icon: string
  count: number
  color: string
  photos: Photo[]
  emptyText: string
}

function PhotoSection({ title, icon, count, color, photos, emptyText }: SectionProps) {
  return (
    <div>
      {/* Section Header */}
      <div className={`flex items-center gap-3 mb-4 pb-3 border-b ${color}`}>
        <span className="text-xl">{icon}</span>
        <h3 className="text-lg font-bold text-gray-900">{title}</h3>
        <span className="ml-auto text-sm font-medium text-gray-500 bg-gray-100 px-2.5 py-0.5 rounded-full">
          {count}
        </span>
      </div>

      {photos.length === 0 ? (
        <p className="text-sm text-gray-400 italic py-4">{emptyText}</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {photos.map((photo) => (
            <PhotoCard key={photo.id} photo={photo} />
          ))}
        </div>
      )}
    </div>
  )
}

export default function PhotoGrid({ photos }: { photos: Photo[] }) {
  const approved = photos.filter((p) => p.status === 'approved')
  const pending = photos.filter((p) => p.status === 'pending')
  const rejected = photos.filter((p) => p.status === 'rejected')

  return (
    <div className="space-y-10">
      <PhotoSection
        title="Approved"
        icon="✅"
        count={approved.length}
        color="border-green-200"
        photos={approved}
        emptyText="No approved photos yet."
      />
      <PhotoSection
        title="Pending Review"
        icon="🟡"
        count={pending.length}
        color="border-yellow-200"
        photos={pending}
        emptyText="No photos pending review."
      />
      <PhotoSection
        title="Rejected"
        icon="❌"
        count={rejected.length}
        color="border-red-200"
        photos={rejected}
        emptyText="No rejected photos."
      />
    </div>
  )
}
