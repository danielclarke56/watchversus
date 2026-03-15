import { NextRequest, NextResponse } from 'next/server'

type VoteData = { watch1: number; watch2: number }

// In-memory fallback for local dev when Redis env vars not set
const memoryStore = new Map<string, VoteData>()

function getRedis() {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) return null
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { Redis } = require('@upstash/redis')
  return new Redis({ url, token })
}

async function getVotes(slug: string): Promise<VoteData> {
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

async function incrementVote(slug: string, choice: 'watch1' | 'watch2'): Promise<VoteData> {
  try {
    const redis = getRedis()
    if (!redis) throw new Error('no redis')
    await redis.hincrby('votes:' + slug, choice, 1)
    const raw = await redis.hgetall('votes:' + slug) as Record<string, string> | null
    return {
      watch1: parseInt(raw?.watch1 ?? '0', 10),
      watch2: parseInt(raw?.watch2 ?? '0', 10),
    }
  } catch {
    const current = memoryStore.get(slug) ?? { watch1: 0, watch2: 0 }
    current[choice] += 1
    memoryStore.set(slug, current)
    return current
  }
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const votes = await getVotes(params.slug)
  return NextResponse.json({ ...votes, total: votes.watch1 + votes.watch2 })
}

export async function POST(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const body = await req.json() as { choice?: string }
  const choice = body.choice
  if (choice !== 'watch1' && choice !== 'watch2') {
    return NextResponse.json({ error: 'Invalid choice' }, { status: 400 })
  }

  const votes = await incrementVote(params.slug, choice)
  return NextResponse.json({ ...votes, total: votes.watch1 + votes.watch2 })
}
