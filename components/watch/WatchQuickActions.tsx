'use client'

import { useState } from 'react'
import type { Watch } from '@/lib/types'

interface WatchQuickActionsProps {
  watch: Watch
}

/**
 * Quick Actions - Two fast, frictionless voting options
 * 1. Rate this watch (👍 👎)
 * 2. Would you buy again? (Yes / No)
 *
 * Hooks into Upstash Redis if available, otherwise local state stub
 */
export default function WatchQuickActions({ watch }: WatchQuickActionsProps) {
  const [rateVote, setRateVote] = useState<'up' | 'down' | null>(null)
  const [buyAgainVote, setBuyAgainVote] = useState<'yes' | 'no' | null>(null)
  const [showRateThank, setShowRateThank] = useState(false)
  const [showBuyThank, setShowBuyThank] = useState(false)

  const handleRateClick = async (vote: 'up' | 'down') => {
    setRateVote(vote)
    setShowRateThank(true)

    // TODO: Hook into Upstash Redis voting via /api/vote endpoint
    // For now, local state + stub
    console.log(`Voted ${vote} on ${watch.slug}`)

    setTimeout(() => setShowRateThank(false), 3000)
  }

  const handleBuyAgainClick = async (vote: 'yes' | 'no') => {
    setBuyAgainVote(vote)
    setShowBuyThank(true)

    // TODO: Hook into Upstash Redis voting via /api/vote endpoint
    console.log(`Buy again: ${vote} on ${watch.slug}`)

    setTimeout(() => setShowBuyThank(false), 3000)
  }

  return (
    <section className="py-6 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Rate This Watch */}
          <div className="card p-5">
            <p className="text-sm font-semibold text-textPrimary mb-3">Rate this watch</p>
            <div className="flex gap-3 items-center">
              <button
                onClick={() => handleRateClick('up')}
                className={`flex-1 py-2 px-4 rounded-md font-semibold transition-all ${
                  rateVote === 'up'
                    ? 'bg-accent text-white'
                    : 'bg-surfaceAlt text-textPrimary hover:bg-accentLight'
                }`}
              >
                👍 Yes
              </button>
              <button
                onClick={() => handleRateClick('down')}
                className={`flex-1 py-2 px-4 rounded-md font-semibold transition-all ${
                  rateVote === 'down'
                    ? 'bg-red-400 text-white'
                    : 'bg-surfaceAlt text-textPrimary hover:bg-red-50'
                }`}
              >
                👎 No
              </button>
            </div>
            {showRateThank && (
              <p className="text-sm text-winner mt-2 animate-pulse">Thanks for voting!</p>
            )}
          </div>

          {/* Would You Buy Again? */}
          <div className="card p-5">
            <p className="text-sm font-semibold text-textPrimary mb-3">Would you buy again?</p>
            <div className="flex gap-3 items-center">
              <button
                onClick={() => handleBuyAgainClick('yes')}
                className={`flex-1 py-2 px-4 rounded-md font-semibold transition-all ${
                  buyAgainVote === 'yes'
                    ? 'bg-winner text-white'
                    : 'bg-surfaceAlt text-textPrimary hover:bg-winnerBg'
                }`}
              >
                Yes
              </button>
              <button
                onClick={() => handleBuyAgainClick('no')}
                className={`flex-1 py-2 px-4 rounded-md font-semibold transition-all ${
                  buyAgainVote === 'no'
                    ? 'bg-red-300 text-white'
                    : 'bg-surfaceAlt text-textPrimary hover:bg-red-50'
                }`}
              >
                No
              </button>
            </div>
            {showBuyThank && (
              <p className="text-sm text-winner mt-2 animate-pulse">Thanks for voting!</p>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
