'use client'

import Link from 'next/link'

export default function HeroSearch() {
  return (
    <section>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-3 pb-1 sm:pt-4 sm:pb-2">
        <h1 className="text-xs sm:text-sm font-medium text-gray-500 text-center">
          Real watch photos from real owners
          <span className="hidden sm:inline">
            <span className="mx-1.5 text-gray-300">·</span>
            <Link href="/upload" className="text-gray-400 hover:text-gray-600 underline">
              Upload yours
            </Link>
          </span>
        </h1>
      </div>
    </section>
  )
}
