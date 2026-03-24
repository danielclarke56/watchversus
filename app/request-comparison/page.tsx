import type { Metadata } from 'next'
import Link from 'next/link'
import ComparisonRequestForm from './ComparisonRequestForm'

export const metadata: Metadata = {
  title: 'Request a Watch Comparison | WatchVsWatch',
  description:
    'Want to see two watches compared head-to-head? Submit a comparison request and we will build it. Help shape the WatchVsWatch database.',
  alternates: { canonical: 'https://watchvswatch.com/request-comparison' },
}

export default function RequestComparisonPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <nav className="text-sm text-textMuted mb-6 flex items-center gap-2" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-accent transition-colors">Home</Link>
        <span aria-hidden="true">›</span>
        <span className="text-textPrimary">Request a Comparison</span>
      </nav>

      <h1 className="text-3xl font-bold text-textPrimary mb-3">Request a Watch Comparison</h1>
      <p className="text-textSecond text-base leading-relaxed mb-8">
        Can&apos;t find the matchup you&apos;re looking for? Tell us which two watches you want
        compared and we&apos;ll add it to our queue. The most-requested comparisons get built first.
      </p>

      <ComparisonRequestForm />

      <div className="mt-10 text-center">
        <p className="text-sm text-textMuted mb-3">Or browse our existing comparisons:</p>
        <Link href="/compare" className="btn-outline inline-flex items-center justify-center min-h-[48px] px-6">
          View All Comparisons
        </Link>
      </div>
    </div>
  )
}
