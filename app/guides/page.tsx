import type { Metadata } from 'next'
import Link from 'next/link'
import { guides } from '@/lib/guideData'

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

const guideCategories = [
  { slug: 'best-watches-under-500', emoji: '💰', tagline: 'Best automatic & quartz picks under $500 new or preowned' },
  { slug: 'best-watches-under-1000', emoji: '⚙️', tagline: 'The sweet spot — Swiss-made, Japanese excellence, top microbrands' },
  { slug: 'best-dive-watches', emoji: '🤿', tagline: 'From sub-$400 Seiko to Rolex Submariner — every budget covered' },
  { slug: 'best-dress-watches', emoji: '🎩', tagline: 'Elegance at every price — Nomos, Cartier, Grand Seiko, and more' },
  { slug: 'best-field-watches', emoji: '🧭', tagline: 'Military heritage and modern performance from Hamilton to Rolex' },
  { slug: 'best-gmt-watches', emoji: '✈️', tagline: 'Track two time zones — Rolex Pepsi, Tudor GMT, and value alternatives' },
]

export default function GuidesPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <nav className="text-sm text-slate-500 mb-6 flex items-center gap-2">
        <Link href="/" className="hover:text-[#d4a853] transition-colors">Home</Link>
        <span>/</span>
        <span className="text-white">Guides</span>
      </nav>

      <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">Watch Buying Guides</h1>
      <p className="text-slate-400 mb-10 leading-relaxed">
        Expert guides by category and budget — with honest recommendations, buying advice, and direct links to head-to-head comparisons.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {guideCategories.map((cat) => {
          const guide = guides.find((g) => g.slug === cat.slug)
          if (!guide) return null
          return (
            <Link
              key={cat.slug}
              href={`/guides/${cat.slug}`}
              className="card p-6 hover:border-[#d4a853]/40 transition-colors group"
            >
              <div className="text-2xl mb-3">{cat.emoji}</div>
              <h2 className="text-white font-bold text-lg mb-2 group-hover:text-[#d4a853] transition-colors">
                {guide.h1}
              </h2>
              <p className="text-slate-500 text-sm">{cat.tagline}</p>
            </Link>
          )
        })}
      </div>

      <div className="mt-12 text-center bg-[#1e293b] border border-[#334155] rounded-xl p-8">
        <h3 className="text-white font-semibold text-lg mb-2">Ready to Compare?</h3>
        <p className="text-slate-400 text-sm mb-5">Put any two watches head-to-head with full specs and community ratings</p>
        <Link href="/compare" className="btn-gold">
          Compare Watches
        </Link>
      </div>
    </div>
  )
}
