import Link from 'next/link'

export default function QuizCTA() {
  return (
    <div className="my-8 p-6 bg-accentLight border border-borderStrong rounded-lg text-center">
      <p className="text-sm font-semibold text-accent uppercase tracking-wide mb-1">
        Not sure which watch is right for you?
      </p>
      <h3 className="text-xl font-bold text-textPrimary mb-2">
        Take the 5-Question Watch Finder Quiz
      </h3>
      <p className="text-textSecond text-sm mb-4">
        Answer a few quick questions and get personalized recommendations from our database of 57 watches.
      </p>
      <Link
        href="/quiz"
        className="inline-block bg-accent hover:bg-accentHover text-white font-semibold px-6 py-3 rounded-lg transition-colors"
      >
        Find My Watch →
      </Link>
    </div>
  )
}
