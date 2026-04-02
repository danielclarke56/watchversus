import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { clerkClient } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { photos } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import Image from 'next/image'
import Link from 'next/link'
import ProfileClient from './ProfileClient'

export async function generateMetadata(
  { params }: { params: { userId: string } }
): Promise<Metadata> {
  try {
    const user = await (await clerkClient()).users.getUser(params.userId)
    const displayName = user.firstName
      ? `${user.firstName}${user.lastName ? ' ' + user.lastName : ''}`
      : user.username || 'User'

    return {
      title: `${displayName}'s Watch Collection | Watchems`,
      description: `View ${displayName}'s watch collection on Watchems — real wrist shots from real owners.`,
      robots: {
        index: true,
        follow: true,
      },
      alternates: {
        canonical: `https://watchems.com/profile/${params.userId}`,
      },
    }
  } catch {
    return {
      title: 'User Profile | Watchems',
      description: 'View a watch collection on Watchems.',
    }
  }
}

export default async function ProfilePage({ params }: { params: { userId: string } }) {
  // Fetch user from Clerk
  let user
  try {
    user = await (await clerkClient()).users.getUser(params.userId)
  } catch {
    notFound()
  }

  // Fetch approved photos for this user
  const photoRecords = await db
    .select()
    .from(photos)
    .where(and(eq(photos.userId, params.userId), eq(photos.status, 'approved')))

  // Group photos by watchId
  const groupedPhotos: Record<string, typeof photoRecords> = {}
  photoRecords.forEach((photo) => {
    if (!groupedPhotos[photo.watchId]) {
      groupedPhotos[photo.watchId] = []
    }
    groupedPhotos[photo.watchId].push(photo)
  })

  const watches = Object.entries(groupedPhotos).map(([watchId, watchPhotos]) => ({
    watchId,
    photos: watchPhotos,
  }))

  // Get display name and avatar
  const displayName = user.firstName
    ? `${user.firstName}${user.lastName ? ' ' + user.lastName : ''}`
    : user.username || 'User'

  const avatar = user.imageUrl

  const initials = displayName
    .split(' ')
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join('')

  return (
    <main className="min-h-screen bg-surfaceAlt text-textPrimary">
      <div className="max-w-[80rem] mx-auto px-4 py-12">
        {/* Back link */}
        <Link href="/" className="text-sm text-textMuted hover:text-textPrimary mb-8 inline-block">
          &larr; Back to home
        </Link>

        {/* User header */}
        <div className="bg-surface border border-borderStrong rounded-2xl p-8 mb-12 shadow-sm">
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div className="flex-shrink-0">
              {avatar ? (
                <Image
                  src={avatar}
                  alt={displayName}
                  width={120}
                  height={120}
                  className="w-28 h-28 rounded-full object-cover border-2 border-borderStrong"
                />
              ) : (
                <div className="w-28 h-28 rounded-full bg-gradient-to-br from-accent to-accentHover flex items-center justify-center text-white text-4xl font-bold border-2 border-borderStrong">
                  {initials || '?'}
                </div>
              )}
            </div>

            {/* User info */}
            <div className="flex-1">
              <h1 className="text-4xl font-bold mb-2">{displayName}</h1>
              <p className="text-textMuted mb-4">Watch Collector</p>
              <div className="text-sm text-textSecond">
                <p>
                  <span className="font-semibold text-textPrimary">{watches.length}</span> {watches.length === 1 ? 'watch' : 'watches'} in collection
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Collection section */}
        {watches.length === 0 ? (
          <div className="bg-surface border border-borderStrong rounded-xl p-12 text-center">
            <p className="text-textMuted mb-4">No watches in collection yet</p>
            <Link
              href="/"
              className="inline-block text-accent hover:text-accentHover font-medium transition-colors"
            >
              View all watches →
            </Link>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-bold mb-6">Collection</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {watches.map(({ watchId, photos: watchPhotos }) => (
                <ProfileClient
                  key={watchId}
                  watchId={watchId}
                  photos={watchPhotos}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  )
}
