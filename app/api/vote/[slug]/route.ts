import { NextRequest, NextResponse } from 'next/server'

type VoteData = { watch1: number; watch2: number }

// In-memory fallback for local dev
const memoryStore = new Map<string, VoteData>()

async function getVotes(slug: string): Promise<VoteData> {
  try {
    const { getStore } = await import('@netlify/blobs')
    const store = getStore('votes')
    const raw = await store.get(slug, { type: 'text' })
    if (!raw) return { watch1: 0, watch2: 0 }
    return JSON.parse(raw) as VoteData
  } catch {
    return memoryStore.get(slug) ?? { watch1: 0, watch2: 0 }
  }
}

async function setVotes(slug: string, data: VoteData): Promise<void> {
  try {
    const { getStore } = await import('@netlify/blobs')
    const store = getStore('votes')
    await store.set(slug, JSON.stringify(data))
  } catch {
    memoryStore.set(slug, data)
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

  const votes = await getVotes(params.slug)
  votes[choice] += 1
  await setVotes(params.slug, votes)

  return NextResponse.json({ ...votes, total: votes.watch1 + votes.watch2 })
}
