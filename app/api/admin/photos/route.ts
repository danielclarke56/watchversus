import { NextRequest, NextResponse } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'
import fs from 'fs'
import path from 'path'
import { isValidSlug } from '@/lib/validation'
import { checkAdmin } from '@/lib/admin'
import { db } from '@/lib/db'
import { photos } from '@/lib/db/schema'
import { eq, and, sql, inArray } from 'drizzle-orm'
import { sendPhotoApprovedEmail } from '@/lib/email'

export const dynamic = 'force-dynamic'

/** GET /api/admin/photos - list pending or approved photos (?status=pending|approved) */
export async function GET(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!checkAdmin(userId)) {
    return NextResponse.json({ error: 'Forbidden', yourUserId: userId }, { status: 403 })
  }

  const statusParam = req.nextUrl.searchParams.get('status')
  const status = statusParam === 'approved' ? 'approved' : statusParam === 'rejected' ? 'rejected' : 'pending'

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
      dialColor: p.dialColor,
      bezelColor: p.bezelColor,
      caseMaterial: p.caseMaterial,
      strapType: p.strapType,
      watchStyle: p.watchStyle,
      sortOrder: p.sortOrder,
      createdAt: p.createdAt.toISOString(),
      approved: status === 'approved',
    }))

    // Sort by sortOrder asc, then createdAt descending
    result.sort((a, b) => {
      if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching photos:', error)
    return NextResponse.json({ error: 'Failed to fetch photos' }, { status: 500 })
  }
}

/** POST /api/admin/photos - approve or delete a pending photo */
export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!checkAdmin(userId)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = (await req.json()) as { action: 'approve' | 'delete' | 'reject' | 'delete-approved' | 'restore' | 'delete-pending'; watchId: string; photoId: string }
  const { action, watchId, photoId } = body

  if (!action || !watchId || !photoId) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }
  if (!['approve', 'delete', 'reject', 'delete-approved', 'restore', 'delete-pending'].includes(action)) {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  }
  if (!isValidSlug(watchId)) {
    return NextResponse.json({ error: 'Invalid watch ID' }, { status: 400 })
  }

  try {
    // Find the photo with the expected status based on action
    const expectedStatus =
      action === 'delete-approved' ? 'approved' :
      action === 'restore' ? 'rejected' :
      action === 'delete' ? 'rejected' :
      action === 'delete-pending' ? 'pending' :
      'pending'
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

      // Send approval notification email via Resend (non-blocking)
      if (photoRecord.userId) {
        try {
          const clerk = await clerkClient()
          const user = await clerk.users.getUser(photoRecord.userId)
          const email = user.emailAddresses?.[0]?.emailAddress
          if (email) {
            await sendPhotoApprovedEmail(email, {
              firstName: user.firstName ?? undefined,
              brandName: photoRecord.brandName ?? undefined,
              modelName: photoRecord.modelName ?? undefined,
              referenceNumber: photoRecord.referenceNumber ?? undefined,
              slug: photoRecord.slug ?? undefined,
              imageUrl: photoRecord.thumbnailUrl ?? photoRecord.url,
            })
          }
        } catch (emailError) {
          console.error('[Resend] Failed to send approval email:', emailError)
        }
      }
    } else if (action === 'reject') {
      // Only update status to rejected - do NOT delete the file
      await db.update(photos).set({ status: 'rejected' }).where(eq(photos.id, photoId))
    } else if (action === 'restore') {
      // Restore a rejected photo back to pending
      await db.update(photos).set({ status: 'pending' }).where(eq(photos.id, photoId))
    } else if (action === 'delete') {
      // Delete rejected photo entry only — do NOT remove images from R2
      await db.delete(photos).where(eq(photos.id, photoId))
    } else if (action === 'delete-pending') {
      // Delete pending photo entry — do NOT remove images from R2
      await db.delete(photos).where(eq(photos.id, photoId))
    } else if (action === 'delete-approved') {
      // For approved photos, check if this is the last photo
      const approvedPhotoCount = await db
        .select({ count: sql<number>`count(*)` })
        .from(photos)
        .where(and(eq(photos.watchId, watchId), eq(photos.status, 'approved')))
        .then((result) => result[0]?.count || 0)

      if (approvedPhotoCount <= 1) {
        return NextResponse.json(
          { error: 'Cannot delete the last photo - a watch must have at least one photo' },
          { status: 400 }
        )
      }

      // Delete photo from R2 or filesystem
      const url = photoRecord.url
      const thumbUrl = photoRecord.thumbnailUrl
      if (url.startsWith('/images/')) {
        const filePath = path.join(process.cwd(), 'public', url)
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath)
        }
      } else {
        try {
          const { deletePhotoFromR2, isR2Configured } = await import('@/lib/r2')
          if (isR2Configured) {
            await deletePhotoFromR2(url)
            if (thumbUrl) {
              await deletePhotoFromR2(thumbUrl)
            }
          }
        } catch (error) {
          console.error('Failed to delete from R2:', error)
        }
      }

      await db.delete(photos).where(eq(photos.id, photoId))
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error processing photo action:', error)
    return NextResponse.json({ error: 'Failed to process photo' }, { status: 500 })
  }
}

/** PATCH /api/admin/photos - update metadata fields on a photo */
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
    watchId: 'watchId',
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
    dialColor: 'dialColor',
    bezelColor: 'bezelColor',
    caseMaterial: 'caseMaterial',
    strapType: 'strapType',
    watchStyle: 'watchStyle',
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

/** PUT /api/admin/photos - reorder approved photos for a watch */
export async function PUT(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!checkAdmin(userId)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = (await req.json()) as { watchId: string; photoIds: string[] }
  const { watchId, photoIds } = body

  if (!watchId || !Array.isArray(photoIds) || photoIds.length === 0) {
    return NextResponse.json({ error: 'Missing or invalid watchId/photoIds' }, { status: 400 })
  }

  try {
    // Verify all photos exist and belong to the watch
    const existing = await db.select({ id: photos.id }).from(photos).where(and(eq(photos.watchId, watchId), inArray(photos.id, photoIds)))
    if (existing.length !== photoIds.length) {
      return NextResponse.json({ error: 'Not all photos found or do not belong to this watch' }, { status: 400 })
    }

    // Update sortOrder for each photo in the provided order
    for (let i = 0; i < photoIds.length; i++) {
      await db.update(photos).set({ sortOrder: i }).where(eq(photos.id, photoIds[i]))
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error reordering photos:', error)
    return NextResponse.json({ error: 'Failed to reorder photos' }, { status: 500 })
  }
}
