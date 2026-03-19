'use client'

import { useState, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import type { Watch } from '@/lib/types'
import { formatPrice } from '@/lib/watches'

interface Props {
  watches: Watch[]
}

const QUESTIONS = [
  {
    id: 'style',
    question: 'What style are you drawn to?',
    options: [
      { value: 'dress', label: 'Dress / Formal', icon: '🎩' },
      { value: 'sport', label: 'Sport / Active', icon: '🏃' },
      { value: 'dive', label: 'Dive Watch', icon: '🤿' },
      { value: 'field', label: 'Field / Military', icon: '🧭' },
      { value: 'gmt', label: 'GMT / Travel', icon: '✈️' },
      { value: 'casual', label: 'Casual / Everyday', icon: '⌚' },
    ],
  },
  {
    id: 'usecase',
    question: 'How will you wear it?',
    options: [
      { value: 'daily', label: 'Daily beater', icon: '📅' },
      { value: 'special', label: 'Special occasions', icon: '🥂' },
      { value: 'both', label: 'Both', icon: '🌟' },
    ],
  },
  {
    id: 'movement',
    question: 'Do you have a movement preference?',
    options: [
      { value: 'automatic', label: 'Automatic (winds itself)', icon: '⚙️' },
      { value: 'manual', label: 'Manual Wind', icon: '🔧' },
      { value: 'quartz', label: 'Quartz (battery)', icon: '⚡' },
      { value: 'any', label: 'No preference', icon: '🔄' },
    ],
  },
  {
    id: 'prestige',
    question: 'What matters more to you?',
    options: [
      { value: 'prestige', label: 'Maximum prestige / brand name', icon: '👑' },
      { value: 'value', label: 'Best value for money', icon: '📊' },
      { value: 'indie', label: 'Independent / microbrand', icon: '🛠️' },
    ],
  },
  {
    id: 'budget',
    question: 'What is your budget?',
    options: [
      { value: 'u500', label: 'Under $500', icon: '💰' },
      { value: '500-2000', label: '$500 - $2,000', icon: '💰💰' },
      { value: '2000-5000', label: '$2,000 - $5,000', icon: '💰💰💰' },
      { value: '5000p', label: '$5,000+', icon: '👑' },
    ],
  },
]

function countWatchesInBudget(watches: Watch[], budget: string): number {
  return watches.filter((w) => budgetMatches(w, budget)).length
}

function budgetMatches(watch: Watch, budget: string): boolean {
  const min = watch.price_new_usd.min
  if (budget === 'u500') return min < 500
  if (budget === '500-2000') return min >= 500 && min < 2000
  if (budget === '2000-5000') return min >= 2000 && min < 5000
  if (budget === '5000p') return min >= 5000
  return true
}

function scoreWatch(watch: Watch, answers: Record<string, string>): number {
  let score = 0

  const midPrice = (watch.price_new_usd.min + watch.price_new_usd.max) / 2
  if (answers.budget === 'u500' && midPrice < 500) score += 30
  else if (answers.budget === '500-2000' && midPrice >= 500 && midPrice <= 2000) score += 30
  else if (answers.budget === '2000-5000' && midPrice >= 2000 && midPrice <= 5000) score += 30
  else if (answers.budget === '5000p' && midPrice >= 5000) score += 30
  else score += 5

  if (answers.style && watch.style.includes(answers.style)) score += 25

  if (answers.movement && answers.movement !== 'any') {
    if (watch.movement_type === answers.movement) score += 20
  } else {
    score += 10
  }

  if (answers.usecase === 'daily') {
    if (watch.water_resistance_m >= 100) score += 10
    if (watch.case_diameter_mm <= 42) score += 5
  } else if (answers.usecase === 'special') {
    if (watch.style.includes('dress') || watch.style.includes('luxury')) score += 10
  } else {
    score += 5
  }

  const prestigeBrands = ['Rolex', 'Audemars Piguet', 'Patek Philippe', 'Vacheron Constantin']
  const valueBrands = ['Seiko', 'Tissot', 'Hamilton', 'Longines', 'Mido']
  const indieBrands = ['Baltic', 'Halios', 'Christopher Ward', 'Nomos Glashütte']

  if (answers.prestige === 'prestige' && prestigeBrands.includes(watch.brand)) score += 15
  else if (answers.prestige === 'value' && valueBrands.includes(watch.brand)) score += 15
  else if (answers.prestige === 'indie' && indieBrands.includes(watch.brand)) score += 15
  else score += 2

  return score
}

export default function QuizClient({ watches }: Props) {
  const [started, setStarted] = useState(false)
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [showResults, setShowResults] = useState(false)

  const currentQ = QUESTIONS[step]
  const progress = ((step) / QUESTIONS.length) * 100

  const budgetCounts = useMemo(() => ({
    'u500': countWatchesInBudget(watches, 'u500'),
    '500-2000': countWatchesInBudget(watches, '500-2000'),
    '2000-5000': countWatchesInBudget(watches, '2000-5000'),
    '5000p': countWatchesInBudget(watches, '5000p'),
  }), [watches])

  const handleAnswer = (value: string) => {
    const newAnswers = { ...answers, [currentQ.id]: value }
    setAnswers(newAnswers)
    if (step < QUESTIONS.length - 1) {
      setStep(step + 1)
    } else {
      setShowResults(true)
    }
  }

  const handleSkip = () => {
    if (step < QUESTIONS.length - 1) {
      setStep(step + 1)
    } else {
      setShowResults(true)
    }
  }

  const { topMatches, closeMatches } = useMemo(() => {
    if (!showResults) return { topMatches: [], closeMatches: [] }

    const pool = answers.budget
      ? watches.filter((w) => budgetMatches(w, answers.budget))
      : watches

    const scored = pool
      .map((w) => ({ watch: w, score: scoreWatch(w, answers) }))
      .sort((a, b) => b.score - a.score)

    const top = scored.slice(0, 3)

    // If fewer than 3 exact matches in budget, pull close matches from adjacent tiers
    let close: typeof scored = []
    if (top.length < 3 && answers.budget) {
      const remaining = watches
        .filter((w) => !budgetMatches(w, answers.budget))
        .map((w) => ({ watch: w, score: scoreWatch(w, answers) }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 3 - top.length)
      close = remaining
    } else if (top.length >= 3) {
      // Show 2 close matches outside the top 3 from the same pool
      close = scored.slice(3, 5)
    }

    return { topMatches: top, closeMatches: close }
  }, [showResults, watches, answers])

  // --- Intro screen ---
  if (!started) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="w-14 h-14 rounded-full bg-[#b8860b]/15 border border-[#b8860b]/25 flex items-center justify-center mx-auto mb-6">
          <svg className="w-7 h-7 text-[#b8860b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-[#0f172a] mb-3">
          Find Your Perfect Watch
        </h1>
        <p className="text-[#475569] text-lg mb-2">
          Answer 5 quick questions. Get personalized recommendations from {watches.length}+ watches.
        </p>
        <p className="text-[#94a3b8] text-sm mb-8">
          No signup required. Takes under 60 seconds.
        </p>

        <button
          onClick={() => setStarted(true)}
          className="btn-gold text-base px-8 py-3 rounded-lg font-semibold"
        >
          Start Quiz
        </button>

        <p className="text-[#94a3b8] text-xs mt-8">
          Powered by community ratings from watch enthusiasts
        </p>

        <div className="mt-6">
          <Link href="/watches" className="text-[#475569] hover:text-[#b8860b] text-sm transition-colors">
            Or browse all watches &rarr;
          </Link>
        </div>
      </div>
    )
  }

  // --- Results screen ---
  if (showResults) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="text-center mb-10">
          <div className="w-12 h-12 rounded-full bg-[#b8860b]/20 border border-[#b8860b]/30 flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-[#b8860b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-[#0f172a] mb-2">Your Top Matches</h1>
          <p className="text-[#475569]">Based on your preferences, here are your best watch options</p>
        </div>

        <div className="space-y-5 mb-8">
          {topMatches.map(({ watch }, i) => (
            <div key={watch.id} className="card p-6 border-[#e2e8f0] hover:border-[#b8860b]/30 transition-colors">
              {watch.image && (
                <div className="flex justify-center mb-5">
                  <div className="bg-[#f8fafc] rounded-xl border border-[#e2e8f0] w-36 h-36 flex items-center justify-center overflow-hidden">
                    <Image
                      src={watch.image}
                      alt={watch.imageAlt ?? `${watch.brand} ${watch.name}`}
                      width={144}
                      height={144}
                      className="w-full h-full object-contain p-3"
                    />
                  </div>
                </div>
              )}
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[#b8860b] font-bold text-sm">#{i + 1}</span>
                    <span className="text-xs text-[#b8860b] font-semibold uppercase tracking-wider">{watch.brand}</span>
                  </div>
                  <h2 className="text-xl font-bold text-[#0f172a]">{watch.name}</h2>
                  <p className="text-[#475569] text-sm">Ref. {watch.reference}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-[#94a3b8]">New</p>
                  <p className="text-[#b8860b] font-bold">{formatPrice(watch.price_new_usd)}</p>
                </div>
              </div>

              <p className="text-[#475569] text-sm leading-relaxed mb-4">{watch.description}</p>

              <div className="bg-[#f8fafc] rounded-lg p-3 mb-4">
                <p className="text-xs text-[#94a3b8] uppercase tracking-wider mb-2">Why it matches</p>
                <ul className="space-y-1">
                  {answers.style && watch.style.includes(answers.style) && (
                    <li className="text-sm text-[#475569] flex items-center gap-2">
                      <span className="text-[#b8860b]">&#10003;</span> {answers.style} style watch
                    </li>
                  )}
                  {(answers.movement === 'any' || watch.movement_type === answers.movement) && (
                    <li className="text-sm text-[#475569] flex items-center gap-2">
                      <span className="text-[#b8860b]">&#10003;</span> {watch.movement_type} movement
                    </li>
                  )}
                  <li className="text-sm text-[#475569] flex items-center gap-2">
                    <span className="text-[#b8860b]">&#10003;</span> {watch.case_diameter_mm}mm case, {watch.water_resistance_m}m water resistance
                  </li>
                </ul>
              </div>

              <div className="flex gap-3">
                <Link href={`/watches/${watch.slug}`} className="btn-gold text-sm flex-1 text-center">
                  View Full Specs
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Close matches */}
        {closeMatches.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-[#0f172a] mb-4">Also Worth a Look</h2>
            <div className="space-y-3">
              {closeMatches.map(({ watch }) => (
                <Link
                  key={watch.id}
                  href={`/watches/${watch.slug}`}
                  className="card p-4 border-[#e2e8f0] hover:border-[#b8860b]/30 transition-colors flex items-center gap-4"
                >
                  {watch.image && (
                    <div className="bg-[#f8fafc] rounded-lg border border-[#e2e8f0] w-16 h-16 flex items-center justify-center overflow-hidden shrink-0">
                      <Image
                        src={watch.image}
                        alt={watch.imageAlt ?? `${watch.brand} ${watch.name}`}
                        width={64}
                        height={64}
                        className="w-full h-full object-contain p-1"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-[#b8860b] font-semibold uppercase tracking-wider">{watch.brand}</p>
                    <p className="text-sm font-bold text-[#0f172a] truncate">{watch.name}</p>
                    <p className="text-xs text-[#475569]">{formatPrice(watch.price_new_usd)}</p>
                  </div>
                  <span className="text-[#94a3b8] text-sm shrink-0">&rarr;</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="text-center space-y-3">
          <button
            onClick={() => { setStep(0); setAnswers({}); setShowResults(false); setStarted(true) }}
            className="text-[#475569] hover:text-[#0f172a] text-sm transition-colors"
          >
            &larr; Retake Quiz
          </button>
          <div>
            <Link href="/watches" className="text-[#475569] hover:text-[#b8860b] text-sm transition-colors">
              Browse all watches &rarr;
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // --- Quiz questions ---
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
      {/* Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[#475569] text-sm">Question {step + 1} of {QUESTIONS.length}</span>
          <span className="text-[#475569] text-sm">{Math.round(progress)}% complete</span>
        </div>
        <div className="h-1.5 bg-[#e2e8f0] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#5C5C5C] to-[#8A8A8A] rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="text-center mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-[#0f172a]">{currentQ.question}</h1>
      </div>

      {/* Options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {currentQ.options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => handleAnswer(opt.value)}
            className="card p-5 text-left hover:border-[#b8860b]/50 hover:bg-[#b8860b]/5 transition-all group"
          >
            <span className="text-2xl mb-2 block">{opt.icon}</span>
            <span className="text-[#0f172a] font-medium group-hover:text-[#b8860b] transition-colors">{opt.label}</span>
            {currentQ.id === 'budget' && (
              <span className="block text-xs text-[#94a3b8] mt-1">
                {budgetCounts[opt.value as keyof typeof budgetCounts]} watches
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Navigation: back + skip + browse */}
      <div className="flex items-center justify-between mt-6">
        <div>
          {step > 0 && (
            <button
              onClick={() => setStep(step - 1)}
              className="text-[#475569] hover:text-[#0f172a] text-sm transition-colors"
            >
              &larr; Back
            </button>
          )}
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={handleSkip}
            className="text-[#94a3b8] hover:text-[#475569] text-sm transition-colors"
          >
            Skip
          </button>
          <Link href="/watches" className="text-[#94a3b8] hover:text-[#b8860b] text-sm transition-colors">
            Browse all &rarr;
          </Link>
        </div>
      </div>
    </div>
  )
}
