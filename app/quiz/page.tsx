import type { Metadata } from 'next'
import { watches } from '@/lib/watches'
import QuizClient from './QuizClient'

export const metadata: Metadata = {
  title: 'Find My Watch — Personalized Watch Quiz',
  description: 'Answer 5 quick questions and get personalized watch recommendations based on your budget, style, and preferences.',
}

export default function QuizPage() {
  return <QuizClient watches={watches} />
}
