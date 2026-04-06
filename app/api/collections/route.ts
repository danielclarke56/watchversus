import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import crypto from 'crypto'
import { db } from '@/lib/db'
import { collections } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

/** GET /api/collections — list current user's collections */
export async function GET() {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Sign in to view collections' }, { status: 401 })
  }

  try {
    const rows = await db
      .select()
      .from(collections)
      .where(eq(collections.userId, userId))
      .orderBy(collections.createdAt)

    return NextResponse.json({ collections: rows })
  } catch (error) {
    console.error('Error fetching collections:', error)
    return NextResponse.json({ error: 'Failed to fetch collections' }, { status: 500 })
  }
}

/** POST /api/collections — create a new collection */
export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Sign in to create collections' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const name = typeof body.name === 'string' ? body.name.trim() : ''
    if (!name || name.length > 100) {
      return NextResponse.json({ error: 'Collection name is required (max 100 chars)' }, { status: 400 })
    }

    const id = crypto.randomUUID()
    await db.insert(collections).values({
      id,
      userId,
      name,
      createdAt: new Date(),
    })

    return NextResponse.json({ id, name }, { status: 201 })
  } catch (error) {
    console.error('Error creating collection:', error)
    return NextResponse.json({ error: 'Failed to create collection' }, { status: 500 })
  }
}
