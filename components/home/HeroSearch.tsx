'use client'

import Link from 'next/link'

export default function HeroSearch() {
  return (
    <section>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-5 sm:pt-8 sm:pb-6 flex flex-col sm:flex-row items-center justify-center gap-3">
        <h1 className="!text-lg sm:!text-2xl font-semibold text-gray-800 text-center">
          Real watch photos from real owners
        </h1>
        <Link
          href="/upload"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gray-900 hover:bg-gray-700 text-white text-sm font-medium transition-colors whitespace-nowrap"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
          </svg>
          Upload yours
        </Link>
      </div>
    </section>
  )
}
