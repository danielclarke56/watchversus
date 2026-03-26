'use client'

import { watches, popularComparisons } from '@/lib/watches'
import { SearchForm } from '@/components/SearchForm'
import { Button } from '@/components/ui/Button'

export default function HeroSearch() {
  return (
    <section className="border-b border-border">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 text-center">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-textPrimary mb-4 leading-tight tracking-tight">
          See how watches look in real life.
        </h1>
        <p className="text-lg text-textSecond mb-8">
          Real photos from real owners — not press shots.
        </p>

        <SearchForm
          placeholder="Search watches..."
          watches={watches}
          comparisons={popularComparisons}
        />

        <div className="flex gap-3 justify-center">
          <Button href="/watches" variant="outline" size="lg">
            Browse all watches
          </Button>
          <Button href="/upload" variant="primary" size="lg">
            Upload yours
          </Button>
        </div>
      </div>
    </section>
  )
}
