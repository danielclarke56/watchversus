'use client'

import { watches, popularComparisons } from '@/lib/watches'
import { SearchForm } from '@/components/SearchForm'

export default function HeroSearch() {
  return (
    <section>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-6 sm:pt-14 sm:pb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 text-center mb-3">
          Real watches. Real life.
        </h1>
        <p className="text-base sm:text-lg text-gray-500 text-center mb-6">
          Browse real photos from watch owners around the world
        </p>
        <SearchForm
          placeholder="Search watches (Rolex, Omega, Tudor...)"
          watches={watches}
          comparisons={popularComparisons}
        />
      </div>
    </section>
  )
}
