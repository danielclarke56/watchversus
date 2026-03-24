import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { isValidSlug } from '@/lib/validation'
import { getRedis } from '@/lib/redis'

type VoteData = { watch1: number; watch2: number; total: number; userVote: 'watch1' | 'watch2' | null }

// In-memory fallback for local dev when Redis env vars not set
const memoryStore = new Map<string, { watch1: number; watch2: number }>()
const memoryUserVotes = new Map<string, string>() // key: userId:slug, value: choice

async function getVotes(slug: string): Promise<{ watch1: number; watch2: number }> {
  try {
    const redis = getRedis()
    if (!redis) throw new Error('no redis')
    const raw = await redis.hgetall('votes:' + slug) as Record<string, string> | null
    if (!raw) return { watch1: 0, watch2: 0 }
    return {
      watch1: parseInt(raw.watch1 ?? '0', 10),
      watch2: parseInt(raw.watch2 ?? '0', 10),
    }
  } catch {
    return memoryStore.get(slug) ?? { watch1: 0, watch2: 0 }
  }
}

async function getUserVote(userId: string, slug: string): Promise<'watch1' | 'watch2' | null> {
  try {
    const redis = getRedis()
    if (!redis) throw new Error('no redis')
    const userVote = await redis.get(`user-vote:${userId}:${slug}`) as string | null
    return userVote === 'watch1' || userVote === 'watch2' ? userVote : null
  } catch {
    const userVote = memoryUserVotes.get(`${userId}:${slug}`)
    return userVote === 'watch1' || userVote === 'watch2' ? userVote : null
  }
}

async function incrementVote(slug: string, choice: 'watch1' | 'watch2', userId: string): Promise<{ watch1: number; watch2: number }> {
  try {
    const redis = getRedis()
    if (!redis) throw new Error('no redis')
    
    // Get prior vote if any
    const priorVote = await redis.get(`user-vote:${userId}:${slug}`) as string | null
    
    // If prior vote exists and is different, decrement the old choice
    if (priorVote && priorVote !== choice) {
      await redis.hincrby('votes:' + slug, priorVote, -1)
    }
    
    // Only increment if no prior vote OR prior vote was different choice
    if (!priorVote || priorVote !== choice) {
      await redis.hincrby('votes:' + slug, choice, 1)
    }
    
    // Store user's vote
    await redis.set(`user-vote:${userId}:${slug}`, choice)
    
    // Return updated totals
    const raw = await redis.hgetall('votes:' + slug) as Record<string, string> | null
    return {
      watch1: parseInt(raw?.watch1 ?? '0', 10),
      watch2: parseInt(raw?.watch2 ?? '0', 10),
    }
  } catch {
    const current = memoryStore.get(slug) ?? { watch1: 0, watch2: 0 }
    const priorVote = memoryUserVotes.get(`${userId}:${slug}`)
    
    if (priorVote && priorVote !== choice) {
      current[priorVote as 'watch1' | 'watch2'] -= 1
    }
    
    if (!priorVote || priorVote !== choice) {
      current[choice] += 1
    }
    
    memoryStore.set(slug, current)
    memoryUserVotes.set(`${userId}:${slug}`, choice)
    return current
  }
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { slug: string } }
) {
  if (!isValidSlug(params.slug)) {
    return NextResponse.json({ error: 'Invalid slug' }, { status: 400 })
  }
  
  const { userId } = await auth()
  const votes = await getVotes(params.slug)
  
  let userVote: 'watch1' | 'watch2' | null = null
  if (userId) {
    userVote = await getUserVote(userId, params.slug)
  }
  
  return NextResponse.json({
    ...votes,
    total: votes.watch1 + votes.watch2,
    userVote,
  })
}

export async function POST(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  if (!isValidSlug(params.slug)) {
    return NextResponse.json({ error: 'Invalid slug' }, { status: 400 })
  }

  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json() as { choice?: string }
  const choice = body.choice
  if (choice !== 'watch1' && choice !== 'watch2') {
    return NextResponse.json({ error: 'Invalid choice' }, { status: 400 })
  }

  const votes = await incrementVote(params.slug, choice, userId)
  const userVote = await getUserVote(userId, params.slug)
  
  return NextResponse.json({
    ...votes,
    total: votes.watch1 + votes.watch2,
    userVote,
  })
}
