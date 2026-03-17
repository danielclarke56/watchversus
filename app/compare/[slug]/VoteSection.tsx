'use client'

import { useEffect, useState } from 'react'
import { VoteButton } from '@/components/ui/VoteButton'

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

  async function handleVote(choice: 'watch1' | 'watch2') {
    if (voted) return

    // Optimistic update
    setVotes((prev) => ({
      watch1: prev.watch1 + (choice === 'watch1' ? 1 : 0),
      watch2: prev.watch2 + (choice === 'watch2' ? 1 : 0),
      total: prev.total + 1,
    }))
    setVoted(choice)
    localStorage.setItem(`vote-${slug}`, choice)

    try {
      const res = await fetch(`/api/vote/${slug}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ choice }),
      })
      const data: VoteData = await res.json()
      setVotes(data)
    } catch {
      // keep optimistic state on error
    }
  }

  const pct1 = votes.total > 0 ? Math.round((votes.watch1 / votes.total) * 100) : 50
  const pct2 = 100 - pct1
  const votedName = voted === 'watch1' ? watch1Name : voted === 'watch2' ? watch2Name : null

  return (
    <div
      className="rounded-xl p-5 mt-2"
      style={{ background: '#fffbf0', border: '1px solid rgba(184,134,11,0.3)' }}
    >
      <div className="flex items-center gap-2 mb-1">
        <span className="text-[#b8860b] text-sm">🗳️</span>
        <span className="text-xs font-semibold text-[#0f172a] uppercase tracking-wide">WatchVsWatch Community Vote</span>
        {votes.total > 0 && (
          <span className="ml-auto text-xs text-[#475569]">{votes.total.toLocaleString()} vote{votes.total !== 1 ? 's' : ''}</span>
        )}
      </div>

      {voted && votedName && (
        <p className="text-xs text-[#b8860b] font-semibold mb-3 mt-1">
          You voted for {votedName}
        </p>
      )}

      {loading ? (
        <div className="text-xs text-[#94a3b8] py-2">Loading...</div>
      ) : (
        <div className="grid grid-cols-2 gap-3 my-3">
          <VoteButton
            side="left"
            watchName={watch1Name}
            votes={votes.watch1}
            userVote={voted === 'watch1' ? 'left' : voted === 'watch2' ? 'right' : null}
            onVote={(side) => {
              if (voted) return
              const choice = side === 'left' ? 'watch1' : 'watch2'
              handleVote(choice)
            }}
            disabled={voted !== null && voted !== 'watch1'}
          />
          <VoteButton
            side="right"
            watchName={watch2Name}
            votes={votes.watch2}
            userVote={voted === 'watch1' ? 'left' : voted === 'watch2' ? 'right' : null}
            onVote={(side) => {
              if (voted) return
              const choice = side === 'left' ? 'watch1' : 'watch2'
              handleVote(choice)
            }}
            disabled={voted !== null && voted !== 'watch2'}
          />
        </div>
      )}

      {votes.total > 0 && (
        <>
          <div className="flex h-2 rounded-full overflow-hidden bg-[#e2e8f0]">
            <div className="bg-[#b8860b] transition-all duration-500" style={{ width: `${pct1}%` }} />
            <div className="bg-[#cbd5e1] transition-all duration-500" style={{ width: `${pct2}%` }} />
          </div>
          <div className="flex justify-between text-xs mt-1.5">
            <span className="text-[#b8860b] font-bold">{pct1}%</span>
            <span className="text-[#94a3b8] font-bold">{pct2}%</span>
          </div>

          {/* Winner banner — show if one watch ≥55% and votes ≥5 */}
          {votes.total >= 5 && (pct1 >= 55 || pct2 >= 55) && (
            <div className="mt-4 p-3 rounded-lg bg-gradient-to-r from-[#b8860b]/20 to-[#b8860b]/10 border border-[#b8860b]/40">
              <p className="text-sm font-bold text-[#b8860b] text-center">
                🏆 {pct1 >= 55 ? watch1Name : watch2Name} is leading ({pct1 >= 55 ? pct1 : pct2}% of {votes.total} vote{votes.total !== 1 ? 's' : ''})
              </p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
