import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { photos } from '@/lib/db/schema'
import { and, eq } from 'drizzle-orm'

export const dynamic = 'force-dynamic'

/** DELETE /api/user/photos/[photoId] — delete the user's own photo */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ photoId: string }> }
) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { photoId } = await params
  if (!photoId) return NextResponse.json({ error: 'Missing photoId' }, { status: 400 })

  try {
    const existing = await db
      .select({ id: photos.id })
      .from(photos)
      .where(and(eq(photos.id, photoId), eq(photos.userId, userId)))
      .limit(1)

    if (!existing || existing.length === 0) {
      return NextResponse.json({ error: 'Photo not found' }, { status: 404 })
    }

    await db.delete(photos).where(eq(photos.id, photoId))
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting photo:', error)
    return NextResponse.json({ error: 'Failed to delete photo' }, { status: 500 })
  }
}

/** PATCH /api/user/photos/[photoId] — update metadata fields on the user's own photo */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ photoId: string }> }
) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { photoId } = await params

  if (!photoId) {
    return NextResponse.json({ error: 'Missing photoId' }, { status: 400 })
  }

  const body = (await req.json()) as { fields: Record<string, string | undefined> }
  const { fields } = body

  if (!fields || typeof fields !== 'object') {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  // Allowlist of editable columns
  const allowedKeys = new Set([
    'brandName',
    'modelName',
    'referenceNumber',
    'movement',
    'caseSize',
    'wristSize',
    'estimatedPrice',
    'productionYear',
    'lugToLug',
    'betweenLugs',
    'thickness',
    'waterResistance',
  ])

  const updates: Record<string, string> = {}
  for (const [key, value] of Object.entries(fields)) {
    if (allowedKeys.has(key) && typeof value === 'string') {
      updates[key] = value
    }
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
  }

  try {
    // Verify the photo belongs to this user
    const existing = await db
      .select({ id: photos.id })
      .from(photos)
      .where(and(eq(photos.id, photoId), eq(photos.userId, userId)))
      .limit(1)

    if (!existing || existing.length === 0) {
      return NextResponse.json({ error: 'Photo not found' }, { status: 404 })
    }

    await db.update(photos).set(updates).where(eq(photos.id, photoId))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating photo metadata:', error)
    return NextResponse.json({ error: 'Failed to update photo' }, { status: 500 })
  }
}
