export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { photos } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { isValidSlug } from '@/lib/validation'
import type { ApprovedPhoto } from '@/lib/photos'

/** GET /api/photo/[id] — fetch single approved photo by id */
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!isValidSlug(params.id)) {
    return NextResponse.json({ error: 'Invalid photo ID' }, { status: 400 })
  }

  try {
    const photoRecord = await db
      .select()
      .from(photos)
      .where(eq(photos.id, params.id))
      .limit(1)

    if (photoRecord.length === 0 || photoRecord[0].status !== 'approved') {
      return NextResponse.json({ error: 'Photo not found' }, { status: 404 })
    }

    const p = photoRecord[0]
    const approved: ApprovedPhoto = {
      id: p.id,
      watchId: p.watchId,
      userId: p.userId,
      userName: p.userName,
      url: p.url,
      brandName: p.brandName ?? undefined,
      modelName: p.modelName ?? undefined,
      referenceNumber: p.referenceNumber ?? undefined,
      movement: p.movement ?? undefined,
      caseSize: p.caseSize ?? undefined,
      wristSize: p.wristSize ?? undefined,
      estimatedPrice: p.estimatedPrice ?? undefined,
      productionYear: p.productionYear ?? undefined,
      lugToLug: p.lugToLug ?? undefined,
      betweenLugs: p.betweenLugs ?? undefined,
      thickness: p.thickness ?? undefined,
      waterResistance: p.waterResistance ?? undefined,
      approved: true,
      createdAt: p.createdAt.toISOString(),
    }

    return NextResponse.json(approved)
  } catch (error) {
    console.error('Error fetching photo:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
