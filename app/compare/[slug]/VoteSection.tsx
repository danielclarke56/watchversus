'use client'

import { useEffect, useState } from 'react'
import { VoteButton } from '@/components/ui/VoteButton'

interface VoteSectionProps {
  slug: string
  watch1Name: string
  watch2Name: string
  watch1Brand: string
  watch2Brand: string
}

interface VoteData {
  watch1: number
  watch2: number
  total: number
}

export default function VoteSection({ slug, watch1Name, watch2Name, watch1Brand, watch2Brand }: VoteSectionProps) {
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

  const leadingName = pct1 >= pct2 ? `${watch1Brand} ${watch1Name}` : `${watch2Brand} ${watch2Name}`
  const leadingPct = Math.max(pct1, pct2)

  return (
    <div className="rounded-sm border border-borderStrong bg-neutral p-5 mt-2">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-accent text-sm">🗳️</span>
        <span className="text-xs font-semibold text-textPrimary uppercase tracking-wide">Community Vote</span>
        {votes.total > 0 && (
          <span className="ml-auto text-xs text-textSecond">{votes.total.toLocaleString()} vote{votes.total !== 1 ? 's' : ''}</span>
        )}
      </div>

      {/* Citation-ready headline when votes exist */}
      {votes.total >= 3 && !loading && (
        <p className="text-sm text-textPrimary font-semibold mt-2 mb-3 leading-snug">
          In {votes.total.toLocaleString()} head-to-head votes on WatchVsWatch, {leadingName} leads with {leadingPct}%.
        </p>
      )}

      {votes.total > 0 && votes.total < 3 && !loading && (
        <p className="text-xs text-textSecond mt-1 mb-3">
          Early results from {votes.total} vote{votes.total !== 1 ? 's' : ''} — cast yours to help the community decide.
        </p>
      )}

      {voted && votedName && (
        <p className="text-xs text-accent font-semibold mb-3">
          You voted for {votedName}
        </p>
      )}

      {loading ? (
        <div className="text-xs text-textMuted py-2">Loading...</div>
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
          <div className="flex h-2 rounded-full overflow-hidden bg-border">
            <div className="bg-accent transition-all duration-500" style={{ width: `${pct1}%` }} />
            <div className="bg-borderStrong transition-all duration-500" style={{ width: `${pct2}%` }} />
          </div>
          <div className="flex justify-between text-xs mt-1.5">
            <span className="text-accent font-bold">{watch1Name} {pct1}%</span>
            <span className="text-textMuted font-bold">{pct2}% {watch2Name}</span>
          </div>

          {votes.total >= 5 && (pct1 >= 55 || pct2 >= 55) && (
            <div className="mt-4 p-3 rounded-sm bg-winnerBg border border-winner/30">
              <p className="text-sm font-bold text-winner text-center">
                {pct1 >= 55 ? pct1 : pct2}% of the WatchVsWatch community prefers the {pct1 >= 55 ? `${watch1Brand} ${watch1Name}` : `${watch2Brand} ${watch2Name}`} — based on {votes.total.toLocaleString()} votes
              </p>
            </div>
          )}
        </>
      )}

      {votes.total === 0 && !loading && (
        <p className="text-xs text-textMuted mt-2">Be the first to vote in this comparison.</p>
      )}
    </div>
  )
}
