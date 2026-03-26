'use client'

import { watches, popularComparisons } from '@/lib/watches'
import { SearchForm } from '@/components/SearchForm'

export default function HeroSearch() {
  return (
    <section>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-6 sm:pt-14 sm:pb-8">
        <SearchForm
          placeholder="Search watches (Rolex, Omega, Tudor...)"
          watches={watches}
          comparisons={popularComparisons}
        />
      </div>
    </section>
  )
}
