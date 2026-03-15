'use client'

import { useEffect, useState } from 'react'

interface VoteSectionProps {
  slug: string
  watch1Name: string
  watch2Name: string
}

interface VoteData {
  watch1: number
  watch2: number
  total: number
}

export default function VoteSection({ slug, watch1Name, watch2Name }: VoteSectionProps) {
  const [votes, setVotes] = useState<VoteData>({ watch1: 0, watch2: 0, total: 0 })
  const [voted, setVoted] = useState<'watch1' | 'watch2' | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem(`vote-${slug}`) as 'watch1' | 'watch2' | null
    setVoted(stored)

    fetch(`/api/vote/${slug}`)
      .then((r) => r.json())
      .then((data: VoteData) => setVotes(data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [slug])

  function handleVote(choice: 'watch1' | 'watch2') {
    if (voted) return

    // Optimistic update
    setVotes((prev) => ({
      watch1: prev.watch1 + (choice === 'watch1' ? 1 : 0),
      watch2: prev.watch2 + (choice === 'watch2' ? 1 : 0),
      total: prev.total + 1,
    }))
    setVoted(choice)
    localStorage.setItem(`vote-${slug}`, choice)

    fetch(`/api/vote/${slug}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ choice }),
    })
      .then((r) => r.json())
      .then((data: VoteData) => setVotes(data))
      .catch(() => {})
  }

  const pct1 = votes.total > 0 ? Math.round((votes.watch1 / votes.total) * 100) : 50
  const pct2 = 100 - pct1

  return (
    <div className="border-t border-[#d4a853]/20 pt-4 mt-4">
      <div className="flex justify-between items-center mb-3">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">WatchVsWatch Community Vote</span>
        {votes.total > 0 && (
          <span className="text-xs text-slate-500">{votes.total} vote{votes.total !== 1 ? 's' : ''}</span>
        )}
      </div>

      {voted ? (
        <>
          <p className="text-xs text-[#d4a853] mb-3 font-semibold">
            You voted for {voted === 'watch1' ? watch1Name : watch2Name}
          </p>
          <div className="flex h-2 rounded-full overflow-hidden bg-[#334155] mb-2">
            <div className="bg-[#d4a853] transition-all" style={{ width: `${pct1}%` }} />
            <div className="bg-[#475569] transition-all" style={{ width: `${pct2}%` }} />
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-[#d4a853] font-bold">{watch1Name} {pct1}%</span>
            <span className="text-slate-500 font-bold">{watch2Name} {pct2}%</span>
          </div>
        </>
      ) : (
        <div className="flex gap-3">
          {loading ? (
            <div className="text-xs text-slate-500">Loading...</div>
          ) : (
            <>
              <button
                onClick={() => handleVote('watch1')}
                className="flex-1 py-2 px-3 rounded-lg border border-[#d4a853]/40 text-sm font-semibold text-white hover:border-[#d4a853] hover:bg-[#d4a853]/10 transition-all text-center"
              >
                {watch1Name}
              </button>
              <div className="flex items-center text-[#d4a853] font-bold text-sm shrink-0">VS</div>
              <button
                onClick={() => handleVote('watch2')}
                className="flex-1 py-2 px-3 rounded-lg border border-[#475569] text-sm font-semibold text-white hover:border-[#d4a853] hover:bg-[#d4a853]/10 transition-all text-center"
              >
                {watch2Name}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}
