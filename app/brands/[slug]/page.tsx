'use client'

import { useState } from 'react'
import { brands } from '@/lib/brandData'
import { watches } from '@/lib/watches'
import Link from 'next/link'

interface Props {
  params: {
    slug: string
  }
}

export default function BrandPage({ params }: Props) {
  const [openFAQs, setOpenFAQs] = useState<number[]>([])
  const brand = brands.find((b) => b.slug === params.slug)
  const brandWatches = watches.filter((w) => w.brand === brand?.watchBrand)

  if (!brand) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <h1 className="text-4xl font-bold text-textPrimary mb-4">Brand Not Found</h1>
          <p className="text-lg text-textSecond mb-6">
            The brand you&apos;re looking for doesn&apos;t exist in our database.
          </p>
          <Link href="/brands" className="text-accent hover:text-accentHover font-semibold">
            ← Back to Brands
          </Link>
        </div>
      </div>
    )
  }

  const toggleFAQ = (index: number) => {
    setOpenFAQs((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/brands" className="text-accent hover:text-accentHover font-semibold">
            ← Back to Brands
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-surfaceAlt to-neutral border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-5xl font-bold text-textPrimary mb-4">{brand.name}</h1>
              <div className="flex gap-6 text-textSecond mb-6">
                <div className="flex items-center gap-2">
                  <span>📍</span>
                  <span>{brand.country}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>📅</span>
                  <span>Founded {brand.founded}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-accentLight border-l-4 border-accent p-4 rounded">
            <p className="text-lg font-semibold text-textPrimary">{brand.heroFact}</p>
          </div>
        </div>
      </div>

      {/* Overview Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-3xl font-bold text-textPrimary mb-6">Heritage &amp; Overview</h2>
        <div className="prose prose-lg max-w-none">
          <p className="text-textSecond leading-relaxed text-lg">{brand.overview}</p>
        </div>
      </div>

      {/* Related Watches Section */}
      {brandWatches.length > 0 && (
        <div className="bg-surfaceAlt border-t border-border">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h2 className="text-3xl font-bold text-textPrimary mb-8">
              {brand.name} Watches in Our Database
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {brandWatches.map((watch) => (
                <Link key={watch.id} href={`/watches/${watch.slug}`}>
                  <div className="bg-white rounded-sm shadow-sm hover:shadow-md transition-shadow p-6 cursor-pointer border border-border">
                    <h3 className="text-xl font-bold text-textPrimary mb-2">{watch.name}</h3>
                    <p className="text-textSecond mb-4">{watch.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-textMuted">
                        {watch.movement_type
                          ? watch.movement_type.charAt(0).toUpperCase() + watch.movement_type.slice(1)
                          : 'N/A'}
                      </span>
                      <span className="text-sm text-accent font-semibold">View Details →</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* FAQ Section */}
      {brand.faq && brand.faq.length > 0 && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h2 className="text-3xl font-bold text-textPrimary mb-8">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {brand.faq.map((item, index) => (
              <div key={index} className="border border-border rounded-sm">
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-surfaceAlt transition-colors"
                >
                  <h3 className="text-lg font-semibold text-textPrimary text-left">
                    {item.question}
                  </h3>
                  <span
                    className={`text-textSecond transition-transform flex-shrink-0 ml-4 inline-block ${
                      openFAQs.includes(index) ? 'rotate-180' : ''
                    }`}
                  >
                    ▼
                  </span>
                </button>
                {openFAQs.includes(index) && (
                  <div className="px-6 py-4 bg-surfaceAlt border-t border-border">
                    <p className="text-textSecond leading-relaxed">{item.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Compare Section */}
      <div className="bg-accentLight border-t border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h2 className="text-3xl font-bold text-textPrimary mb-4">Compare {brand.name}</h2>
          <p className="text-textSecond mb-6">
            Want to see how {brand.name} compares to other luxury watch brands? Head to our
            compare tool to explore side-by-side specifications and analysis.
          </p>
          <Link
            href="/compare"
            className="inline-block bg-accent text-white px-6 py-3 rounded-sm font-semibold hover:bg-accentHover transition-colors"
          >
            Explore Comparisons
          </Link>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="bg-white border-t border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h2 className="text-2xl font-bold text-textPrimary mb-4">More Information</h2>
          <p className="text-textSecond mb-6">
            For more detailed information about {brand.name} watches, market positioning, and where
            to buy, explore our comprehensive brand database and comparison tools.
          </p>
          <div className="flex gap-4">
            <Link
              href="/brands"
              className="px-6 py-3 border border-borderStrong rounded-sm font-semibold text-textPrimary hover:bg-surfaceAlt transition-colors"
            >
              All Brands
            </Link>
            <Link
              href="/compare"
              className="px-6 py-3 bg-accent text-white rounded-sm font-semibold hover:bg-accentHover transition-colors"
            >
              Compare Watches
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
