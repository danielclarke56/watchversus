'use client'

import Link from 'next/link'
import { watches, popularComparisons } from '@/lib/watches'
import { SearchForm } from '@/components/SearchForm'

export default function HeroSearch() {
  return (
    <section>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-6 sm:pt-14 sm:pb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 text-center mb-3">
          Watches worn in real life
        </h1>
        <p className="text-base sm:text-lg text-gray-500 text-center mb-6">
          Browse real photos from watch owners around the world
        </p>
        <div className="flex items-start gap-2">
          <div className="flex-1 [&>div]:mb-0">
            <SearchForm
              placeholder="Search watches (Rolex, Omega, Tudor...)"
              watches={watches}
              comparisons={popularComparisons}
            />
          </div>
          <Link
            href="/upload"
            className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-700 transition-colors whitespace-nowrap"
          >
            Upload a photo
          </Link>
        </div>
      </div>
    </section>
  )
}
