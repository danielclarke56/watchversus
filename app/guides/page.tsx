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

export default function GuidesPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <nav className="text-sm text-[#94a3b8] mb-6 flex items-center gap-2">
        <Link href="/" className="hover:text-[#b8860b] transition-colors">Home</Link>
        <span>/</span>
        <span className="text-[#0f172a]">Guides</span>
      </nav>

      <h1 className="text-3xl md:text-4xl font-bold text-[#0f172a] mb-4">Watch Buying Guides</h1>
      <p className="text-[#475569] mb-10 leading-relaxed">
        Expert guides by category and budget — with honest recommendations, buying advice, and direct links to head-to-head comparisons.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {guides.map((guide) => {
          const previewWatches = guide.recommendations
            .map((rec) => watches.find((w) => w.slug === rec.slug))
            .filter((w): w is NonNullable<typeof w> & { image: string } => !!w && typeof w.image === 'string' && !w.image.endsWith('.svg'))
            .slice(0, 3)
          return (
            <Link
              key={guide.slug}
              href={`/guides/${guide.slug}`}
              className="card p-6 hover:border-[#b8860b]/40 transition-colors group"
            >
              {previewWatches.length > 0 && (
                <div className="flex gap-1 mb-3">
                  {previewWatches.map((w) => (
                    <div key={w.slug} className="h-14 w-14 rounded-lg bg-white border border-[#e2e8f0] overflow-hidden shrink-0">
                      <Image src={w.image!} alt={w.name} width={56} height={56} className="h-14 w-14 object-contain" />
                    </div>
                  ))}
                </div>
              )}
              <div className="text-2xl mb-3">{guide.emoji ?? '📖'}</div>
              <h2 className="text-[#0f172a] font-bold text-lg mb-2 group-hover:text-[#b8860b] transition-colors">
                {guide.h1}
              </h2>
              <p className="text-[#94a3b8] text-sm">{guide.tagline}</p>
            </Link>
          )
        })}
      </div>

      <div className="mt-12 text-center bg-white border border-[#e2e8f0] rounded-xl p-8">
        <h3 className="text-[#0f172a] font-semibold text-lg mb-2">Ready to Compare?</h3>
        <p className="text-[#475569] text-sm mb-5">Put any two watches head-to-head with full specs and community ratings</p>
        <Link href="/compare" className="btn-gold">
          Compare Watches
        </Link>
      </div>
    </div>
  )
}
