import type { Metadata } from 'next'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { photos } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import Link from 'next/link'
import Image from 'next/image'

export const metadata: Metadata = {
  title: 'My Uploads | WatchVsWatch',
  description: 'View all of your uploaded watch photos.',
  robots: {
    index: false, // Don't index user-specific pages
    follow: false,
  },
  alternates: {
    canonical: 'https://watchvswatch.com/my-uploads',
  },
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date)
}

function getStatusBadge(status: string) {
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

export default async function MyUploadsPage() {
  const { userId } = await auth()

  // Redirect to sign-in if not authenticated
  if (!userId) {
    redirect('/sign-in')
  }

  // Fetch all photos for the current user, ordered by createdAt DESC
  const userPhotos = await db
    .select()
    .from(photos)
    .where(eq(photos.userId, userId))
    .orderBy((p) => p.createdAt)

  // Reverse to get descending order (most recent first)
  const sortedPhotos = userPhotos.reverse()

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Uploads</h1>
          <p className="text-gray-600">
            Manage all of your uploaded watch photos and their moderation status.
          </p>
        </div>

        {/* Empty state */}
        {sortedPhotos.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <div className="text-5xl mb-4">📸</div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              No uploads yet
            </h2>
            <p className="text-gray-600 mb-6">
              You haven&apos;t uploaded any watch photos yet. Start by uploading a photo of your watch!
            </p>
            <Link
              href="/upload"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
            >
              Upload a Photo
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedPhotos.map((photo) => {
              const statusBadge = getStatusBadge(photo.status)

              return (
                <div
                  key={photo.id}
                  className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
                >
                  {/* Thumbnail */}
                  <div className="relative w-full h-48 bg-gray-100">
                    {photo.url ? (
                      <Image
                        src={photo.url}
                        alt={`${photo.brandName} ${photo.modelName}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <span className="text-gray-400">No image</span>
                      </div>
                    )}
                  </div>

                  {/* Card body */}
                  <div className="p-4">
                    {/* Watch details */}
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {photo.brandName} {photo.modelName}
                    </h3>
                    {photo.referenceNumber && (
                      <p className="text-sm text-gray-500 mb-3">
                        Ref. {photo.referenceNumber}
                      </p>
                    )}

                    {/* Status badge */}
                    <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium mb-3 border ${statusBadge.bgColor} ${statusBadge.textColor} ${statusBadge.borderColor}`}>
                      <span>{statusBadge.icon}</span>
                      <span>{statusBadge.text}</span>
                    </div>

                    {/* Date */}
                    <p className="text-xs text-gray-500">
                      {formatDate(photo.createdAt)}
                    </p>

                    {/* Action for approved photos */}
                    {photo.status === 'approved' && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <Link
                          href="/gallery"
                          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                        >
                          View in Gallery →
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
