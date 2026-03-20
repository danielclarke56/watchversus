import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { guides } from '@/lib/guideData'
import { watches } from '@/lib/watches'

export const metadata: Metadata = {
  title: 'Watch Buying Guides — WatchVsWatch',
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

const budgetSlugs = new Set([
  'best-watches-under-500',
  'best-watches-under-1000',
  'best-watches-under-3000',
  'best-watches-under-5000',
  'best-luxury-watches-under-10000',
  'best-dive-watches-under-1000',
  'best-dress-watches-under-500',
  'best-chronograph-watches-under-5000',
])

// Short display titles for the index grid (full SEO titles stay on the guide pages)
const shortTitles: Record<string, string> = {
  'best-watches-under-1000': 'Best Watches Under $1,000',
  'best-watches-under-3000': 'Best Watches Under $3,000',
  'best-watches-under-5000': 'Best Watches Under $5,000',
  'best-luxury-watches-under-10000': 'Best Watches Under $10,000',
  'best-dive-watches-under-1000': 'Best Dive Watches Under $1,000',
  'best-dress-watches-under-500': 'Best Dress Watches Under $500',
  'best-chronograph-watches-under-5000': 'Chronographs Under $5,000',
  'best-dive-watches': 'Best Dive Watches',
  'best-dress-watches': 'Best Dress Watches',
  'best-field-watches': 'Best Field Watches',
  'best-gmt-watches': 'Best GMT Watches',
  'best-pilot-watches': 'Best Pilot Watches',
  'best-sports-watches': 'Best Sports Watches',
  'best-watches-for-beginners': 'Best Watches for Beginners',
  'rolex-new-vs-pre-owned-buying-guide': 'Rolex: New vs Pre-Owned',
}

// Price badge labels for budget guides
const priceBadges: Record<string, string> = {
  'best-watches-under-1000': 'Under $1K',
  'best-watches-under-3000': 'Under $3K',
  'best-watches-under-5000': 'Under $5K',
  'best-luxury-watches-under-10000': 'Under $10K',
  'best-dive-watches-under-1000': 'Under $1K',
  'best-dress-watches-under-500': 'Under $500',
  'best-chronograph-watches-under-5000': 'Under $5K',
}

function GuideCard({ guide, badge }: { guide: typeof guides[0]; badge?: string }) {
  const previewWatches = guide.recommendations
    .map((rec) => watches.find((w) => w.slug === rec.slug))
    .filter((w): w is NonNullable<typeof w> & { image: string } => !!w && typeof w.image === 'string' && !w.image.endsWith('.svg'))
    .slice(0, 3)
  const hasImages = previewWatches.length > 0
  const count = guide.recommendations.length
  const displayTitle = shortTitles[guide.slug] ?? guide.h1

  return (
    <Link
      href={`/guides/${guide.slug}`}
      className="card p-6 hover:border-borderStrong transition-colors group"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        {hasImages ? (
          <div className="flex gap-1">
            {previewWatches.map((w) => (
              <div key={w.slug} className="h-14 w-14 rounded-sm bg-surface border border-border overflow-hidden shrink-0">
                <Image src={w.image!} alt={w.name} width={56} height={56} className="h-14 w-14 object-contain" />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-2xl">{guide.emoji ?? '📖'}</div>
        )}
        {badge && (
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full bg-accentLight text-accent border border-borderStrong shrink-0">
            {badge}
          </span>
        )}
      </div>
      <h3 className="text-textPrimary font-bold text-base mb-2 group-hover:text-accent transition-colors leading-snug">
        {displayTitle}
      </h3>
      <p className="text-textSecond text-sm mb-2">{guide.tagline}</p>
      <p className="text-textMuted text-xs">{count} {count === 1 ? 'pick' : 'picks'} · Updated 2026</p>
    </Link>
  )
}

export default function GuidesPage() {
  const budgetGuides = guides.filter((g) => budgetSlugs.has(g.slug))
  const styleGuidesRaw = guides.filter((g) => !budgetSlugs.has(g.slug))

  // Move "Beginners" guide to front of style section
  const beginnersIdx = styleGuidesRaw.findIndex((g) => g.slug === 'best-watches-for-beginners')
  const styleGuides = [...styleGuidesRaw]
  if (beginnersIdx > 0) {
    const [beginners] = styleGuides.splice(beginnersIdx, 1)
    styleGuides.unshift(beginners)
  }

  // Feature the first budget guide as hero
  const featured = budgetGuides[0]
  const remainingBudget = budgetGuides.slice(1)
  const featuredCount = featured?.recommendations.length ?? 0

  const featuredPreviewWatches = featured
    ? featured.recommendations
        .map((rec) => watches.find((w) => w.slug === rec.slug))
        .filter((w): w is NonNullable<typeof w> & { image: string } => !!w && typeof w.image === 'string' && !w.image.endsWith('.svg'))
        .slice(0, 3)
    : []

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <nav className="text-sm text-textMuted mb-6 flex items-center gap-2" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-accent transition-colors">Home</Link>
        <span aria-hidden="true" className="text-border">›</span>
        <span className="text-textPrimary">Guides</span>
      </nav>

      <h1 className="text-3xl md:text-4xl font-bold text-textPrimary mb-3">Watch Buying Guides</h1>
      <p className="text-textSecond mb-2 leading-relaxed">
        Expert guides by category and budget — with honest recommendations, buying advice, and direct links to head-to-head comparisons.
      </p>
      <p className="text-textMuted text-sm mb-10">
        Each guide includes expert picks, head-to-head comparisons, and a buying checklist.
      </p>

      {/* Featured Guide */}
      {featured && (
        <Link
          href={`/guides/${featured.slug}`}
          className="card p-8 hover:border-borderStrong transition-colors group block mb-10"
        >
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            {featuredPreviewWatches.length > 0 && (
              <div className="flex gap-2 shrink-0">
                {featuredPreviewWatches.map((w) => (
                  <div key={w.slug} className="h-16 w-16 rounded-sm bg-surface border border-border overflow-hidden shrink-0">
                    <Image src={w.image!} alt={w.name} width={64} height={64} className="h-16 w-16 object-contain" />
                  </div>
                ))}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="inline-block text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm bg-accentLight text-accent">
                  Most Popular
                </span>
                <span className="inline-block text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm bg-neutral text-textSecond">
                  Under $500
                </span>
              </div>
              <h2 className="text-textPrimary font-bold text-xl md:text-2xl mb-2 group-hover:text-accent transition-colors">
                {featured.h1}
              </h2>
              <p className="text-textSecond text-sm mb-2">{featured.tagline}</p>
              <p className="text-textMuted text-xs">{featuredCount} {featuredCount === 1 ? 'pick' : 'picks'} · Updated 2026</p>
            </div>
          </div>
        </Link>
      )}

      {/* By Budget */}
      {remainingBudget.length > 0 && (
        <>
          <h2 className="text-xl font-bold text-textPrimary mb-4">By Budget</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
            {remainingBudget.map((guide) => (
              <GuideCard key={guide.slug} guide={guide} badge={priceBadges[guide.slug]} />
            ))}
          </div>
        </>
      )}

      {/* CTA between sections */}
      <div className="text-center bg-surface border border-border rounded-sm p-6 mb-10">
        <p className="text-textPrimary font-semibold mb-1">Not sure where to start?</p>
        <p className="text-textSecond text-sm mb-4">Answer a few questions and get a personalized recommendation</p>
        <Link href="/quiz" className="btn-gold">
          Take the Quiz
        </Link>
      </div>

      {/* By Style */}
      {styleGuides.length > 0 && (
        <>
          <h2 className="text-xl font-bold text-textPrimary mb-4">By Style</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {styleGuides.map((guide, i) => (
              <GuideCard
                key={guide.slug}
                guide={guide}
                badge={i === 0 && guide.slug === 'best-watches-for-beginners' ? 'Start Here' : undefined}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
