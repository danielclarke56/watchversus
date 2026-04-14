'use client'

import Link from 'next/link'

export default function HeroSearch() {
  return (
    <section>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-2 sm:pt-8 sm:pb-3">
        <h1 className="text-lg sm:text-2xl font-semibold text-gray-800 text-center">
          Real watch photos from real owners
          <span className="mx-2 text-gray-300">·</span>
          <Link href="/upload" className="text-gray-400 hover:text-gray-600 underline underline-offset-2">
            Upload yours
          </Link>
        </h1>
      </div>
    </section>
  )
}
