import type { Metadata } from 'next'
import Link from 'next/link'
import { guides, type Guide } from '@/lib/guideData'
import { watches } from '@/lib/watches'
import { getAllMdxGuideListings } from '@/lib/mdxGuides'
import GuidesClient from './GuidesClient'

export const metadata: Metadata = {
  title: 'Watch Buying Guides',
  description: 'Expert watch buying guides by category and budget. Best dive watches, dress watches, GMT watches, field watches, and top picks under $500 and $1,000.',
  alternates: {
    canonical: 'https://watchvswatch.com/guides',
  },
  openGraph: {
    title: 'Watch Buying Guides | WatchVsWatch',
    description: 'Expert watch buying guides by category and budget.',
    url: 'https://watchvswatch.com/guides',
    type: 'website',
    images: [{ url: 'https://watchvswatch.com/api/og?type=guide&title=Watch+Buying+Guides', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Watch Buying Guides | WatchVsWatch',
    description: 'Expert watch buying guides by category and budget.',
    images: ['https://watchvswatch.com/api/og?type=guide&title=Watch+Buying+Guides'],
  },
}

export default function GuidesPage() {
  // Merge MDX guides with legacy guides (MDX overrides legacy for same slug)
  const legacySlugs = new Set(guides.map((g) => g.slug))
  const mdxListings = getAllMdxGuideListings()
  const mdxOnlyGuides: Guide[] = mdxListings
    .filter((m) => !legacySlugs.has(m.slug))
    .map((m) => ({
      slug: m.slug,
      title: m.title,
      description: m.description,
      h1: m.h1,
      intro: m.description,
      emoji: m.emoji,
      tagline: m.tagline,
      recommendations: m.recommendations ?? [],
      buyingGuide: [],
      faq: [],
      conclusion: '',
    }))
  const mergedGuides = [...guides, ...mdxOnlyGuides]

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://watchvswatch.com' },
      { '@type': 'ListItem', position: 2, name: 'Guides', item: 'https://watchvswatch.com/guides' },
    ],
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <nav className="text-sm text-textMuted mb-6 flex items-center gap-2" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-accent transition-colors">Home</Link>
        <span aria-hidden="true" className="text-border">›</span>
        <span className="text-textPrimary">Guides</span>
      </nav>

      <h1 className="text-3xl md:text-4xl font-bold text-textPrimary mb-3">Watch Buying Guides</h1>
      <p className="text-textSecond mb-2 leading-relaxed">
        Expert guides by category and budget — with honest recommendations, buying advice, and direct links to head-to-head comparisons.
      </p>
      <p className="text-textMuted text-sm mb-8">
        Each guide includes expert picks, head-to-head comparisons, and a buying checklist.
      </p>

      <GuidesClient guides={mergedGuides} watches={watches} />
    </div>
  )
}
