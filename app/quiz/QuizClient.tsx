'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { Watch } from '@/lib/types'
import { formatPrice } from '@/lib/watches'

interface Props {
  watches: Watch[]
}

const QUESTIONS = [
  {
    id: 'budget',
    question: 'What is your budget?',
    options: [
      { value: 'u500', label: 'Under $500', icon: '💰' },
      { value: '500-2000', label: '$500 – $2,000', icon: '💰💰' },
      { value: '2000-5000', label: '$2,000 – $5,000', icon: '💰💰💰' },
      { value: '5000p', label: '$5,000+', icon: '👑' },
    ],
  },
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
    id: 'usecase',
    question: 'How will you wear it?',
    options: [
      { value: 'daily', label: 'Daily beater', icon: '📅' },
      { value: 'special', label: 'Special occasions', icon: '🥂' },
      { value: 'both', label: 'Both', icon: '🌟' },
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
]

function budgetMatches(watch: Watch, budget: string): boolean {
  const min = watch.price_new_usd.min
  const max = watch.price_new_usd.max
  // A watch qualifies if its minimum price is within the selected budget tier
  // (we use min so watches straddling a boundary lean toward lower tier)
  if (budget === 'u500') return min < 500
  if (budget === '500-2000') return min >= 400 && min <= 2500
  if (budget === '2000-5000') return min >= 1500 && min <= 6000
  if (budget === '5000p') return max >= 5000
  return true
}

function scoreWatch(watch: Watch, answers: Record<string, string>): number {
  let score = 0

  // Budget — hard-filtered before scoring, but still reward exact matches
  const midPrice = (watch.price_new_usd.min + watch.price_new_usd.max) / 2
  if (answers.budget === 'u500' && midPrice < 500) score += 30
  else if (answers.budget === '500-2000' && midPrice >= 500 && midPrice <= 2000) score += 30
  else if (answers.budget === '2000-5000' && midPrice >= 2000 && midPrice <= 5000) score += 30
  else if (answers.budget === '5000p' && midPrice >= 5000) score += 30
  else score += 5 // edge-of-range bonus (won't appear unless no exact-match candidates)

  // Style
  if (answers.style && watch.style.includes(answers.style)) score += 25

  // Movement
  if (answers.movement && answers.movement !== 'any') {
    if (watch.movement_type === answers.movement) score += 20
  } else {
    score += 10 // neutral
  }

  // Use case
  if (answers.usecase === 'daily') {
    if (watch.water_resistance_m >= 100) score += 10
    if (watch.case_diameter_mm <= 42) score += 5
  } else if (answers.usecase === 'special') {
    if (watch.style.includes('dress') || watch.style.includes('luxury')) score += 10
  } else {
    score += 5
  }

  // Prestige
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
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [showResults, setShowResults] = useState(false)

  const currentQ = QUESTIONS[step]
  const progress = ((step) / QUESTIONS.length) * 100

  const handleAnswer = (value: string) => {
    const newAnswers = { ...answers, [currentQ.id]: value }
    setAnswers(newAnswers)
    if (step < QUESTIONS.length - 1) {
      setStep(step + 1)
    } else {
      setShowResults(true)
    }
  }

  const results = showResults
    ? (() => {
        // Hard-filter by budget — never show watches outside the selected range
        const pool = answers.budget
          ? watches.filter((w) => budgetMatches(w, answers.budget))
          : watches
        return pool
          .map((w) => ({ watch: w, score: scoreWatch(w, answers) }))
          .sort((a, b) => b.score - a.score)
          .slice(0, 3)
      })()
    : []

  if (showResults) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="text-center mb-10">
          <div className="w-12 h-12 rounded-full bg-[#d4a853]/20 border border-[#d4a853]/30 flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-[#d4a853]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Your Top Matches</h1>
          <p className="text-slate-400">Based on your preferences, here are your best watch options</p>
        </div>

        <div className="space-y-5 mb-8">
          {results.map(({ watch }, i) => (
            <div key={watch.id} className="card p-6 border-[#334155] hover:border-[#d4a853]/30 transition-colors">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[#d4a853] font-bold text-sm">#{i + 1}</span>
                    <span className="text-xs text-[#d4a853] font-semibold uppercase tracking-wider">{watch.brand}</span>
                  </div>
                  <h2 className="text-xl font-bold text-white">{watch.name}</h2>
                  <p className="text-slate-400 text-sm">Ref. {watch.reference}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-slate-500">New</p>
                  <p className="text-[#d4a853] font-bold">{formatPrice(watch.price_new_usd)}</p>
                </div>
              </div>

              <p className="text-slate-400 text-sm leading-relaxed mb-4">{watch.description}</p>

              {/* Why it matches */}
              <div className="bg-[#0f172a] rounded-lg p-3 mb-4">
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Why it matches</p>
                <ul className="space-y-1">
                  {watch.style.includes(answers.style) && (
                    <li className="text-sm text-slate-300 flex items-center gap-2">
                      <span className="text-[#d4a853]">✓</span> {watch.style.includes(answers.style) ? `${answers.style} style` : ''} watch
                    </li>
                  )}
                  {(answers.movement === 'any' || watch.movement_type === answers.movement) && (
                    <li className="text-sm text-slate-300 flex items-center gap-2">
                      <span className="text-[#d4a853]">✓</span> {watch.movement_type} movement
                    </li>
                  )}
                  <li className="text-sm text-slate-300 flex items-center gap-2">
                    <span className="text-[#d4a853]">✓</span> {watch.case_diameter_mm}mm case, {watch.water_resistance_m}m water resistance
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

        <div className="text-center">
          <button
            onClick={() => { setStep(0); setAnswers({}); setShowResults(false) }}
            className="text-slate-400 hover:text-white text-sm transition-colors"
          >
            ← Retake Quiz
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
      {/* Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-slate-400 text-sm">Question {step + 1} of {QUESTIONS.length}</span>
          <span className="text-slate-400 text-sm">{Math.round(progress)}% complete</span>
        </div>
        <div className="h-1.5 bg-[#334155] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#d4a853] to-[#e4c07a] rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="text-center mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-white">{currentQ.question}</h1>
      </div>

      {/* Options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {currentQ.options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => handleAnswer(opt.value)}
            className="card p-5 text-left hover:border-[#d4a853]/50 hover:bg-[#d4a853]/5 transition-all group"
          >
            <span className="text-2xl mb-2 block">{opt.icon}</span>
            <span className="text-white font-medium group-hover:text-[#d4a853] transition-colors">{opt.label}</span>
          </button>
        ))}
      </div>

      {step > 0 && (
        <div className="text-center mt-6">
          <button
            onClick={() => setStep(step - 1)}
            className="text-slate-400 hover:text-white text-sm transition-colors"
          >
            ← Back
          </button>
        </div>
      )}
    </div>
  )
}
