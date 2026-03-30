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
      <div className="relative w-full h-48 bg-gray-100">
        <PhotoThumbnail url={photo.url} alt={alt} />
      </div>
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

type TabId = 'approved' | 'pending' | 'rejected'

const TABS: { id: TabId; label: string; emptyText: string }[] = [
  { id: 'approved', label: 'Approved', emptyText: 'No approved photos yet.' },
  { id: 'pending', label: 'Pending Review', emptyText: 'No photos pending review.' },
  { id: 'rejected', label: 'Rejected', emptyText: 'No rejected photos.' },
]

export default function PhotoGrid({ photos }: { photos: Photo[] }) {
  const [activeTab, setActiveTab] = useState<TabId>('approved')

  const groups: Record<TabId, Photo[]> = {
    approved: photos.filter((p) => p.status === 'approved'),
    pending: photos.filter((p) => p.status === 'pending'),
    rejected: photos.filter((p) => p.status === 'rejected'),
  }

  const visiblePhotos = groups[activeTab]

  return (
    <div>
      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        {TABS.map((tab) => {
          const count = groups[tab.id].length
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors -mb-px ${
                isActive
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                  isActive
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-500'
                }`}
              >
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Tab Content */}
      {visiblePhotos.length === 0 ? (
        <p className="text-sm text-gray-400 italic py-6">
          {TABS.find((t) => t.id === activeTab)?.emptyText}
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visiblePhotos.map((photo) => (
            <PhotoCard key={photo.id} photo={photo} />
          ))}
        </div>
      )}
    </div>
  )
}
