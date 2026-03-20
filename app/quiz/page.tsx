import type { Metadata } from 'next'
import { watches } from '@/lib/watches'
import QuizClient from './QuizClient'

export const metadata: Metadata = {
  title: 'Find My Watch — Personalized Watch Quiz',
  description: 'Answer 5 quick questions and get personalized watch recommendations based on your budget, style, and preferences.',
  alternates: {
    canonical: 'https://watchvswatch.com/quiz',
  },
  openGraph: {
    title: 'Find My Watch Quiz | WatchVsWatch',
    description: 'Answer 5 quick questions and get personalized watch recommendations.',
    url: 'https://watchvswatch.com/quiz',
    type: 'website',
    images: [{ url: 'https://watchvswatch.com/api/og?title=Find+My+Watch+Quiz&subtitle=5+questions+to+your+perfect+watch+recommendation', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Find My Watch Quiz | WatchVsWatch',
    description: 'Answer 5 quick questions and get personalized watch recommendations.',
    images: ['https://watchvswatch.com/api/og?title=Find+My+Watch+Quiz&subtitle=5+questions+to+your+perfect+watch+recommendation'],
  },
}

export default function QuizPage() {
  return <QuizClient watches={watches} />
}
