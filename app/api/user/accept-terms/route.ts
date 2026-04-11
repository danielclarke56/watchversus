import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export const dynamic = 'force-dynamic'

/** POST /api/user/accept-terms — record the user's terms acceptance */
export async function POST() {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date()

  // Upsert: create user if new, update termsAcceptedAt if existing
  const existing = await db
    .select({ clerkId: users.clerkId })
    .from(users)
    .where(eq(users.clerkId, userId))
    .limit(1)

  if (existing.length > 0) {
    await db.update(users).set({ termsAcceptedAt: now }).where(eq(users.clerkId, userId))
  } else {
    await db.insert(users).values({ clerkId: userId, termsAcceptedAt: now })
  }

  return NextResponse.json({ success: true, acceptedAt: now.toISOString() })
}

/** GET /api/user/accept-terms — check if the current user has accepted terms */
export async function GET() {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const row = await db
    .select({ termsAcceptedAt: users.termsAcceptedAt })
    .from(users)
    .where(eq(users.clerkId, userId))
    .limit(1)

  const accepted = row.length > 0 && row[0].termsAcceptedAt !== null

  return NextResponse.json({ accepted })
}
