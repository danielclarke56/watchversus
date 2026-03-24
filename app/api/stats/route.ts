import { NextResponse } from 'next/server'
import { getRedis } from '@/lib/redis'
import { comparisonTiers } from '@/lib/watches'

export const revalidate = 300 // cache for 5 minutes

interface VoteStat {
  slug: string
  slug1: string
  slug2: string
  watch1: number
  watch2: number
  total: number
}

export async function GET() {
  const redis = getRedis()
  
  // Fetch all vote data in parallel
  const statsPromises = comparisonTiers.map(async (tier) => {
    const slug = `${tier.slug1}-vs-${tier.slug2}`
    let watch1 = 0
    let watch2 = 0

    if (redis) {
      try {
        const raw = await redis.hgetall('votes:' + slug) as Record<string, string> | null
        if (raw) {
          watch1 = parseInt(raw.watch1 ?? '0', 10)
          watch2 = parseInt(raw.watch2 ?? '0', 10)
        }
      } catch {
        // skip on error
      }
    }

    return {
      slug,
      slug1: tier.slug1,
      slug2: tier.slug2,
      watch1,
      watch2,
      total: watch1 + watch2,
    }
  })

  const stats = await Promise.all(statsPromises)

  return NextResponse.json({ stats })
}
