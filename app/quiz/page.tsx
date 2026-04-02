import type { Metadata } from 'next'
import { Suspense } from 'react'
import { watches } from '@/lib/watches'
import QuizClient from './QuizClient'

export const metadata: Metadata = {
  title: 'What Watch Should I Buy? — Free Quiz',
  description: 'Not sure which watch is right for you? Answer 5 quick questions and get personalized recommendations from 57 watches.',
  alternates: {
    canonical: 'https://watchvswatch.com/quiz',
  },
  openGraph: {
    title: 'What Watch Should I Buy? — Free Quiz',
    description: 'Not sure which watch is right for you? Answer 5 quick questions and get personalized recommendations from 57 watches.',
    url: 'https://watchvswatch.com/quiz',
    type: 'website',
    images: [{ url: 'https://watchvswatch.com/api/og?title=What+Watch+Should+I+Buy&subtitle=5+questions+to+your+perfect+watch', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'What Watch Should I Buy? — Free Quiz',
    description: 'Not sure which watch is right for you? Answer 5 quick questions and get personalized recommendations.',
    images: ['https://watchvswatch.com/api/og?title=What+Watch+Should+I+Buy&subtitle=5+questions+to+your+perfect+watch'],
  },
}

export default function QuizPage() {
  return (
    <>
      {/* Static SEO intro section */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-textPrimary mb-4">What Watch Should I Buy?</h1>
        <p className="text-textSecond text-lg mb-2">Not sure which watch is right for you? Answer 5 quick questions about your style, budget, and lifestyle — and get personalized recommendations from our database of 57 watches.</p>
      </div>

      {/* Quiz component */}
      <Suspense fallback={<div className="max-w-2xl mx-auto px-4 py-14 text-center text-textSecond">Loading quiz...</div>}>
        <QuizClient watches={watches} />
      </Suspense>

      {/* Static FAQ section */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <h2 className="text-2xl font-bold text-textPrimary mb-8 text-center">Frequently Asked Questions</h2>
        
        <div className="space-y-6">
          {/* Q1 */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-textPrimary mb-3">How does the watch finder quiz work?</h3>
            <p className="text-textSecond">The quiz uses a scoring algorithm that weights each answer based on your preferences. We evaluate your top answers against our database of 57 watches, using factors like price, movement type, and prestige to rank the best matches for your needs.</p>
          </div>

          {/* Q2 */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-textPrimary mb-3">How many watches are in the database?</h3>
            <p className="text-textSecond">Explore real owner photos of 57+ luxury watches across all price ranges, from affordable entry-level automatic watches to luxury Swiss timepieces. See how watches look on different wrist sizes with community-submitted photos from real collectors.</p>
          </div>

          {/* Q3 */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-textPrimary mb-3">Can I retake the quiz?</h3>
            <p className="text-textSecond">Yes! The quiz is completely free and unlimited. You can retake it as many times as you like to explore different preference combinations and find your perfect watch match.</p>
          </div>
        </div>
      </div>
    </>
  )
}
