'use client'

import { useState, useMemo, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
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
  const searchParams = useSearchParams()
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [showResults, setShowResults] = useState(false)
  const [showEmailCapture, setShowEmailCapture] = useState(false)
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState('')
  const [emailSubmitting, setEmailSubmitting] = useState(false)
  const [copied, setCopied] = useState(false)

  // Load answers from URL params on mount
  useEffect(() => {
    const style = searchParams.get('style')
    const usecase = searchParams.get('usecase')
    const movement = searchParams.get('movement')
    const prestige = searchParams.get('prestige')
    const budget = searchParams.get('budget')

    if (style || usecase || movement || prestige || budget) {
      const loadedAnswers: Record<string, string> = {}
      if (style) loadedAnswers.style = style
      if (usecase) loadedAnswers.usecase = usecase
      if (movement) loadedAnswers.movement = movement
      if (prestige) loadedAnswers.prestige = prestige
      if (budget) loadedAnswers.budget = budget

      setAnswers(loadedAnswers)
      setShowResults(true)
    }
  }, [searchParams])

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
      // Show email capture before results
      setShowEmailCapture(true)
    }
  }

  const handleSkip = () => {
    if (step < QUESTIONS.length - 1) {
      setStep(step + 1)
    } else {
      setShowEmailCapture(true)
    }
  }

  const handleEmailSubmit = async () => {
    if (!email.trim()) {
      setEmailError('Please enter your email')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email')
      return
    }

    setEmailSubmitting(true)
    setEmailError('')

    try {
      const response = await fetch('/api/quiz/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      if (response.ok) {
        setTimeout(() => {
          setShowEmailCapture(false)
          setShowResults(true)
        }, 500)
      } else {
        setEmailError('Failed to save email. Please try again.')
      }
    } catch (error) {
      console.error('Error submitting email:', error)
      setEmailError('An error occurred. Please try again.')
    } finally {
      setEmailSubmitting(false)
    }
  }

  const handleEmailSkip = () => {
    setShowEmailCapture(false)
    setShowResults(true)
  }

  const buildResultsUrl = () => {
    const params = new URLSearchParams()
    if (answers.style) params.set('style', answers.style)
    if (answers.usecase) params.set('usecase', answers.usecase)
    if (answers.movement) params.set('movement', answers.movement)
    if (answers.prestige) params.set('prestige', answers.prestige)
    if (answers.budget) params.set('budget', answers.budget)
    return `/quiz?${params.toString()}`
  }

  const copyResultsLink = async () => {
    try {
      const url = typeof window !== 'undefined' ? `${window.location.origin}${buildResultsUrl()}` : buildResultsUrl()
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy link:', error)
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

  // --- Email capture screen ---
  if (showEmailCapture && !showResults) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="card p-8">
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">🎉</div>
            <h2 className="text-3xl font-bold text-textPrimary mb-2">Your results are ready</h2>
            <p className="text-textSecond">Enter your email to see your top 3 watch matches</p>
          </div>

          <div className="space-y-4 mb-6">
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                setEmailError('')
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && email && !emailSubmitting) {
                  handleEmailSubmit()
                }
              }}
              disabled={emailSubmitting}
              className="w-full px-4 py-3 border border-border rounded-lg bg-surface text-textPrimary placeholder-textSecond focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent disabled:opacity-50"
            />
            {emailError && (
              <p className="text-red-500 text-sm">{emailError}</p>
            )}
          </div>

          <button
            onClick={handleEmailSubmit}
            disabled={emailSubmitting}
            className="w-full bg-accent hover:bg-accentHover text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 mb-4"
          >
            {emailSubmitting ? 'Saving...' : 'Show My Results'}
          </button>

          <button
            onClick={handleEmailSkip}
            disabled={emailSubmitting}
            className="w-full text-accent hover:text-accentHover text-sm font-medium transition-colors"
          >
            Skip for now
          </button>
        </div>
      </div>
    )
  }

  // --- Results screen ---
  if (showResults) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="text-center mb-10">
          <div className="w-12 h-12 rounded-full bg-accentLight border border-borderStrong flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-textPrimary mb-2">Your Top Matches</h1>
          <p className="text-textSecond">Based on your preferences, here are your best watch options</p>
        </div>

        <div className="space-y-5 mb-8">
          {topMatches.map(({ watch }, i) => (
            <div key={watch.id} className="card p-6 border-border hover:border-borderStrong transition-colors">
              {watch.image && (
                <div className="flex justify-center mb-5">
                  <div className="bg-surfaceAlt rounded-sm border border-border w-36 h-36 flex items-center justify-center overflow-hidden">
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
                    <span className="text-accent font-bold text-sm">#{i + 1}</span>
                    <span className="text-xs text-accent font-semibold uppercase tracking-wider">{watch.brand}</span>
                  </div>
                  <h2 className="text-xl font-bold text-textPrimary">{watch.name}</h2>
                  <p className="text-textSecond text-sm">Ref. {watch.reference}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-textMuted">New</p>
                  <p className="text-accent font-bold">{formatPrice(watch.price_new_usd)}</p>
                </div>
              </div>

              <p className="text-textSecond text-sm leading-relaxed mb-4">{watch.description}</p>

              <div className="bg-surfaceAlt rounded-sm p-3 mb-4">
                <p className="text-xs text-textMuted uppercase tracking-wider mb-2">Why it matches</p>
                <ul className="space-y-1">
                  {answers.style && watch.style.includes(answers.style) && (
                    <li className="text-sm text-textSecond flex items-center gap-2">
                      <span className="text-accent">&#10003;</span> {answers.style} style watch
                    </li>
                  )}
                  {(answers.movement === 'any' || watch.movement_type === answers.movement) && (
                    <li className="text-sm text-textSecond flex items-center gap-2">
                      <span className="text-accent">&#10003;</span> {watch.movement_type} movement
                    </li>
                  )}
                  <li className="text-sm text-textSecond flex items-center gap-2">
                    <span className="text-accent">&#10003;</span> {watch.case_diameter_mm}mm case, {watch.water_resistance_m}m water resistance
                  </li>
                </ul>
              </div>

            </div>
          ))}
        </div>

        {/* Close matches */}
        {closeMatches.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-textPrimary mb-4">Also Worth a Look</h2>
            <div className="space-y-3">
              {closeMatches.map(({ watch }) => (
                <div
                  key={watch.id}
                  className="card p-4 border-border flex items-center gap-4"
                >
                  {watch.image && (
                    <div className="bg-surfaceAlt rounded-sm border border-border w-16 h-16 flex items-center justify-center overflow-hidden shrink-0">
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
                    <p className="text-xs text-accent font-semibold uppercase tracking-wider">{watch.brand}</p>
                    <p className="text-sm font-bold text-textPrimary truncate">{watch.name}</p>
                    <p className="text-xs text-textSecond">{formatPrice(watch.price_new_usd)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="text-center space-y-3">
          <div className="flex gap-4">
            <button
              onClick={() => { setStep(0); setAnswers({}); setShowResults(false); setShowEmailCapture(false); setEmail(''); setEmailError('') }}
              className="text-textSecond hover:text-textPrimary text-sm transition-colors"
            >
              &larr; Retake Quiz
            </button>
            <button
              onClick={copyResultsLink}
              className="text-textSecond hover:text-accent text-sm transition-colors flex items-center gap-1"
              title="Copy results link"
            >
              📋 {copied ? 'Copied!' : 'Share results'}
            </button>
          </div>
          <div>
            <Link href="/guides" className="text-textSecond hover:text-accent text-sm transition-colors">
              Read our buying guides &rarr;
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // --- Quiz questions ---
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
      {/* Intro header on first question */}
      {step === 0 && (
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-textPrimary mb-2">
            Find Your Perfect Watch
          </h1>
          <p className="text-textSecond text-sm">
            {watches.length}+ watches &middot; 5 questions &middot; under 60 seconds
          </p>
        </div>
      )}

      {/* Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-textSecond text-sm">Question {step + 1} of {QUESTIONS.length}</span>
          <span className="text-textSecond text-sm">{Math.round(progress)}% complete</span>
        </div>
        <div className="h-1.5 bg-border rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-accent to-accentHover rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="text-center mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-textPrimary">{currentQ.question}</h1>
      </div>

      {/* Options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {currentQ.options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => handleAnswer(opt.value)}
            className="card p-5 text-left hover:border-borderStrong hover:bg-neutral transition-all group"
          >
            <span className="text-2xl mb-2 block">{opt.icon}</span>
            <span className="text-textPrimary font-medium group-hover:text-accent transition-colors">{opt.label}</span>
            {currentQ.id === 'budget' && (
              <span className="block text-xs text-textMuted mt-1">
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
              className="text-textSecond hover:text-textPrimary text-sm transition-colors"
            >
              &larr; Back
            </button>
          )}
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={handleSkip}
            className="text-textMuted hover:text-textSecond text-sm transition-colors"
          >
            Skip
          </button>
          <Link href="/" className="text-textMuted hover:text-accent text-sm transition-colors">
            Browse gallery &rarr;
          </Link>
        </div>
      </div>
    </div>
  )
}
