import type { Metadata } from 'next'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { photos } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import Link from 'next/link'
import PhotoGrid from './PhotoGrid'

export const metadata: Metadata = {
  title: 'Dashboard | WatchVsWatch',
  description: 'Manage your watch photo uploads and account.',
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: 'https://watchvswatch.com/dashboard',
  },
}


export default async function DashboardPage() {
  const { userId } = await auth()

  // Redirect to sign-in if not authenticated
  if (!userId) {
    redirect('/sign-in')
  }

  // Fetch all photos for the current user, most recent first
  const sortedPhotos = await db
    .select()
    .from(photos)
    .where(eq(photos.userId, userId))
    .orderBy(desc(photos.createdAt))

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-4xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2 text-sm sm:text-base">Manage your watch photos and contributions to WatchVsWatch.</p>
          <div className="mt-4">
            <Link
              href={`/profile/${userId}`}
              className="text-blue-600 hover:text-blue-700 font-semibold underline transition-colors inline-block"
            >
              View your public profile →
            </Link>
          </div>
        </div>

        {/* My Uploads Section */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {/* Section Header */}
          <div className="border-b border-gray-200 p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">My Uploads</h2>
              <p className="text-gray-600 text-xs sm:text-sm mt-1">
                Your submitted watch photos and their moderation status.
              </p>
            </div>
            <Link
              href="/upload"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors shrink-0 text-center w-full sm:w-auto"
            >
              Upload a Watch
            </Link>
          </div>

          {/* Section Content */}
          <div className="p-4 sm:p-6">
            {sortedPhotos.length === 0 ? (
              // Empty State
              <div className="text-center py-8 sm:py-12">
                <div className="text-4xl sm:text-5xl mb-4">📸</div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                  No uploads yet
                </h3>
                <p className="text-gray-600 mb-6 text-sm sm:text-base">
                  You haven&apos;t uploaded any watch photos yet. Start contributing to the WatchVsWatch community!
                </p>
                <Link
                  href="/upload"
                  className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors text-sm sm:text-base"
                >
                  Upload Your First Watch
                </Link>
              </div>
            ) : (
              // Photo Grid (client component — handles image errors gracefully)
              <PhotoGrid photos={sortedPhotos} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
