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

interface StatusBadge {
  icon: string
  text: string
  bgColor: string
  textColor: string
  borderColor: string
}

function getStatusBadge(status: string): StatusBadge {
  switch (status) {
    case 'approved':
      return {
        icon: '✅',
        text: 'Approved',
        bgColor: 'bg-green-50',
        textColor: 'text-green-700',
        borderColor: 'border-green-200',
      }
    case 'rejected':
      return {
        icon: '❌',
        text: 'Rejected',
        bgColor: 'bg-red-50',
        textColor: 'text-red-700',
        borderColor: 'border-red-200',
      }
    case 'pending':
    default:
      return {
        icon: '🟡',
        text: 'Pending Review',
        bgColor: 'bg-yellow-50',
        textColor: 'text-yellow-700',
        borderColor: 'border-yellow-200',
      }
  }
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

  if (error || !url) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-1 text-gray-400">
        <span className="text-3xl">🖼️</span>
        <span className="text-xs">Image unavailable</span>
      </div>
    )
  }

  // Local paths (dev fallback) won't exist on Vercel — show fallback immediately
  const isLocal = url.startsWith('/')
  if (isLocal) {
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

export default function PhotoGrid({ photos }: { photos: Photo[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {photos.map((photo) => {
        const statusBadge = getStatusBadge(photo.status)
        const alt = [photo.brandName, photo.modelName].filter(Boolean).join(' ') || 'Watch photo'

        return (
          <div
            key={photo.id}
            className="rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow bg-white"
          >
            {/* Thumbnail */}
            <div className="relative w-full h-48 bg-gray-100">
              <PhotoThumbnail url={photo.url} alt={alt} />
            </div>

            {/* Card Content */}
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">{alt}</h3>
              {photo.referenceNumber && (
                <p className="text-sm text-gray-500 mb-3">Ref. {photo.referenceNumber}</p>
              )}

              {/* Status Badge */}
              <div
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium mb-3 border ${statusBadge.bgColor} ${statusBadge.textColor} ${statusBadge.borderColor}`}
              >
                <span>{statusBadge.icon}</span>
                <span>{statusBadge.text}</span>
              </div>

              {/* Date */}
              <p className="text-xs text-gray-500">{formatDate(photo.createdAt)}</p>

              {/* Action for Approved Photos */}
              {photo.status === 'approved' && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <Link href="/gallery" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                    View in Gallery →
                  </Link>
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
