import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import fs from 'fs'
import path from 'path'
import { isValidSlug } from '@/lib/validation'
import { checkAdmin } from '@/lib/admin'
import { db } from '@/lib/db'
import { photos } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

/** GET /api/admin/photos — list pending or approved photos (?status=pending|approved) */
export async function GET(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!checkAdmin(userId)) {
    return NextResponse.json({ error: 'Forbidden', yourUserId: userId }, { status: 403 })
  }

  const status = req.nextUrl.searchParams.get('status') === 'approved' ? 'approved' : 'pending'

  try {
    const rows = await db
      .select()
      .from(photos)
      .where(eq(photos.status, status))
      .orderBy((p) => p.createdAt)

    const result = rows.map((p) => ({
      id: p.id,
      watchId: p.watchId,
      userId: p.userId,
      userName: p.userName,
      url: p.url,
      brandName: p.brandName,
      modelName: p.modelName,
      referenceNumber: p.referenceNumber,
      movement: p.movement,
      caseSize: p.caseSize,
      wristSize: p.wristSize,
      estimatedPrice: p.estimatedPrice,
      productionYear: p.productionYear,
      lugToLug: p.lugToLug,
      betweenLugs: p.betweenLugs,
      thickness: p.thickness,
      waterResistance: p.waterResistance,
      createdAt: p.createdAt.toISOString(),
      approved: status === 'approved',
    }))

    // Sort by createdAt descending
    result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching photos:', error)
    return NextResponse.json({ error: 'Failed to fetch photos' }, { status: 500 })
  }
}

/** POST /api/admin/photos — approve or delete a pending photo */
export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!checkAdmin(userId)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = (await req.json()) as { action: 'approve' | 'delete' | 'reject' | 'delete-approved'; watchId: string; photoId: string }
  const { action, watchId, photoId } = body

  if (!action || !watchId || !photoId) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }
  if (action !== 'approve' && action !== 'delete' && action !== 'reject' && action !== 'delete-approved') {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  }
  if (!isValidSlug(watchId)) {
    return NextResponse.json({ error: 'Invalid watch ID' }, { status: 400 })
  }

  try {
    // Find the photo — for delete-approved, look for approved; otherwise pending
    const expectedStatus = action === 'delete-approved' ? 'approved' : 'pending'
    const photo = await db
      .select()
      .from(photos)
      .where(and(eq(photos.id, photoId), eq(photos.status, expectedStatus)))
      .limit(1)

    if (!photo || photo.length === 0) {
      return NextResponse.json({ error: 'Photo not found' }, { status: 404 })
    }

    const photoRecord = photo[0]

    if (action === 'approve') {
      // Update photo status to approved
      await db.update(photos).set({ status: 'approved' }).where(eq(photos.id, photoId))
    } else if (action === 'delete' || action === 'reject' || action === 'delete-approved') {
      // Delete photo from R2 or filesystem
      const url = photoRecord.url
      if (url.startsWith('/images/')) {
        // Local filesystem
        const filePath = path.join(process.cwd(), 'public', url)
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath)
        }
      } else {
        // Try to delete from R2
        try {
          const { deletePhotoFromR2, isR2Configured } = await import('@/lib/r2')
          if (isR2Configured) {
            await deletePhotoFromR2(url)
          }
        } catch (error) {
          console.error('Failed to delete from R2:', error)
          // Continue anyway
        }
      }

      // Update photo status to rejected
      await db.update(photos).set({ status: 'rejected' }).where(eq(photos.id, photoId))
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error processing photo action:', error)
    return NextResponse.json({ error: 'Failed to process photo' }, { status: 500 })
  }
}

/** PATCH /api/admin/photos — update metadata fields on a photo */
export async function PATCH(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!checkAdmin(userId)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = (await req.json()) as {
    photoId: string
    fields: Record<string, string | undefined>
  }
  const { photoId, fields } = body

  if (!photoId || !fields || typeof fields !== 'object') {
    return NextResponse.json({ error: 'Missing photoId or fields' }, { status: 400 })
  }

  // Allowlist of editable columns
  const allowedKeys: Record<string, keyof typeof photos> = {
    brandName: 'brandName',
    modelName: 'modelName',
    referenceNumber: 'referenceNumber',
    movement: 'movement',
    caseSize: 'caseSize',
    wristSize: 'wristSize',
    estimatedPrice: 'estimatedPrice',
    productionYear: 'productionYear',
    lugToLug: 'lugToLug',
    betweenLugs: 'betweenLugs',
    thickness: 'thickness',
    waterResistance: 'waterResistance',
  }

  // Build the set object with only allowed, provided fields
  const updates: Record<string, string> = {}
  for (const [key, value] of Object.entries(fields)) {
    if (allowedKeys[key] && typeof value === 'string') {
      updates[key] = value
    }
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
  }

  try {
    // Verify photo exists
    const existing = await db.select({ id: photos.id }).from(photos).where(eq(photos.id, photoId)).limit(1)
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
