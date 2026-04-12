import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { photoLikes, photos } from '@/lib/db/schema'
import { eq, and, desc } from 'drizzle-orm'

export const dynamic = 'force-dynamic'

/** GET /api/user/liked — returns photos the current user has liked */
export async function GET() {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Sign in required' }, { status: 401 })
  }

  try {
    const rows = await db
      .select({
        likeId: photoLikes.id,
        photoId: photos.id,
        slug: photos.slug,
        url: photos.url,
        thumbnailUrl: photos.thumbnailUrl,
        brandName: photos.brandName,
        modelName: photos.modelName,
        userName: photos.userName,
        watchId: photos.watchId,
        likedAt: photoLikes.createdAt,
      })
      .from(photoLikes)
      .innerJoin(photos, and(eq(photos.id, photoLikes.photoId), eq(photos.status, 'approved')))
      .where(eq(photoLikes.userId, userId))
      .orderBy(desc(photoLikes.createdAt))

    return NextResponse.json({ photos: rows })
  } catch (error) {
    console.error('Error fetching liked photos:', error)
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
  }
}
