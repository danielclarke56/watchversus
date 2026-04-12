import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { photos } from '@/lib/db/schema'
import { eq, and, desc } from 'drizzle-orm'

export const dynamic = 'force-dynamic'

/** GET /api/user/watches — returns distinct watches (one photo per watchId) for the current user */
export async function GET() {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Sign in required' }, { status: 401 })
  }

  try {
    // Get one representative photo per watchId (the one with highest sort order or newest)
    const rows = await db
      .select({
        photoId: photos.id,
        watchId: photos.watchId,
        brandName: photos.brandName,
        modelName: photos.modelName,
        thumbnailUrl: photos.thumbnailUrl,
        url: photos.url,
      })
      .from(photos)
      .where(and(eq(photos.userId, userId), eq(photos.status, 'approved')))
      .orderBy(desc(photos.createdAt))

    // Group by watchId — keep the first (newest) photo per watch
    const seen = new Set<string>()
    const watches = rows.filter((r) => {
      if (seen.has(r.watchId)) return false
      seen.add(r.watchId)
      return true
    })

    return NextResponse.json({ watches })
  } catch (error) {
    console.error('Error fetching user watches:', error)
    return NextResponse.json({ error: 'Failed to fetch watches' }, { status: 500 })
  }
}
