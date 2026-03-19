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

function GuideCard({ guide }: { guide: typeof guides[0] }) {
  const previewWatches = guide.recommendations
    .map((rec) => watches.find((w) => w.slug === rec.slug))
    .filter((w): w is NonNullable<typeof w> & { image: string } => !!w && typeof w.image === 'string' && !w.image.endsWith('.svg'))
    .slice(0, 3)
  const hasImages = previewWatches.length > 0

  return (
    <Link
      href={`/guides/${guide.slug}`}
      className="card p-6 hover:border-[#b8860b]/40 transition-colors group"
    >
      {hasImages ? (
        <div className="flex gap-1 mb-3">
          {previewWatches.map((w) => (
            <div key={w.slug} className="h-14 w-14 rounded-lg bg-white border border-[#e2e8f0] overflow-hidden shrink-0">
              <Image src={w.image!} alt={w.name} width={56} height={56} className="h-14 w-14 object-contain" />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-2xl mb-3">{guide.emoji ?? '📖'}</div>
      )}
      <h3 className="text-[#0f172a] font-bold text-lg mb-2 group-hover:text-[#b8860b] transition-colors">
        {guide.h1}
      </h3>
      <p className="text-[#64748b] text-sm mb-2">{guide.tagline}</p>
      <p className="text-[#94a3b8] text-xs">{guide.recommendations.length} picks · Updated 2026</p>
    </Link>
  )
}

export default function GuidesPage() {
  const budgetGuides = guides.filter((g) => budgetSlugs.has(g.slug))
  const styleGuides = guides.filter((g) => !budgetSlugs.has(g.slug))

  // Feature the first guide as a hero card
  const featured = budgetGuides[0]
  const remainingBudget = budgetGuides.slice(1)

  const featuredPreviewWatches = featured
    ? featured.recommendations
        .map((rec) => watches.find((w) => w.slug === rec.slug))
        .filter((w): w is NonNullable<typeof w> & { image: string } => !!w && typeof w.image === 'string' && !w.image.endsWith('.svg'))
        .slice(0, 4)
    : []

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <nav className="text-sm text-[#94a3b8] mb-6 flex items-center gap-2" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-[#b8860b] transition-colors">Home</Link>
        <span aria-hidden="true" className="text-[#cbd5e1]">›</span>
        <span className="text-[#0f172a]">Guides</span>
      </nav>

      <h1 className="text-3xl md:text-4xl font-bold text-[#0f172a] mb-4">Watch Buying Guides</h1>
      <p className="text-[#475569] mb-10 leading-relaxed">
        Expert guides by category and budget — with honest recommendations, buying advice, and direct links to head-to-head comparisons.
      </p>

      {/* Featured Guide */}
      {featured && (
        <Link
          href={`/guides/${featured.slug}`}
          className="card p-8 hover:border-[#b8860b]/40 transition-colors group block mb-10"
        >
          <div className="flex flex-col sm:flex-row gap-6">
            {featuredPreviewWatches.length > 0 && (
              <div className="flex sm:flex-col gap-2 shrink-0">
                {featuredPreviewWatches.map((w) => (
                  <div key={w.slug} className="h-16 w-16 rounded-lg bg-white border border-[#e2e8f0] overflow-hidden shrink-0">
                    <Image src={w.image!} alt={w.name} width={64} height={64} className="h-16 w-16 object-contain" />
                  </div>
                ))}
              </div>
            )}
            <div>
              <span className="inline-block text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#b8860b]/10 text-[#b8860b] mb-3">
                Most Popular
              </span>
              <h2 className="text-[#0f172a] font-bold text-xl md:text-2xl mb-2 group-hover:text-[#b8860b] transition-colors">
                {featured.h1}
              </h2>
              <p className="text-[#64748b] text-sm mb-2">{featured.tagline}</p>
              <p className="text-[#94a3b8] text-xs">{featured.recommendations.length} picks · Updated 2026</p>
            </div>
          </div>
        </Link>
      )}

      {/* By Budget */}
      {remainingBudget.length > 0 && (
        <>
          <h2 className="text-xl font-bold text-[#0f172a] mb-4">By Budget</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
            {remainingBudget.map((guide) => (
              <GuideCard key={guide.slug} guide={guide} />
            ))}
          </div>
        </>
      )}

      {/* CTA between sections */}
      <div className="text-center bg-white border border-[#e2e8f0] rounded-xl p-6 mb-10">
        <p className="text-[#0f172a] font-semibold mb-1">Not sure where to start?</p>
        <p className="text-[#475569] text-sm mb-4">Take our quiz to get a personalized recommendation</p>
        <div className="flex justify-center gap-3">
          <Link href="/quiz" className="btn-gold">
            Take the Quiz
          </Link>
          <Link href="/compare" className="text-sm font-semibold text-[#b8860b] border border-[#b8860b]/30 hover:bg-[#b8860b]/5 px-4 py-2 rounded-md transition-colors">
            Compare Watches
          </Link>
        </div>
      </div>

      {/* By Style */}
      {styleGuides.length > 0 && (
        <>
          <h2 className="text-xl font-bold text-[#0f172a] mb-4">By Style</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {styleGuides.map((guide) => (
              <GuideCard key={guide.slug} guide={guide} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
