import Link from 'next/link'
import { watches, getAllReviews, popularComparisons, getWatchBySlug, formatPrice } from '@/lib/watches'
import WatchCard from '@/components/WatchCard'
import ReviewCard from '@/components/ReviewCard'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'WatchVsWatch — Find Your Perfect Watch',
  description:
    'Compare any two watches head-to-head, read community reviews, and take our quiz to find your perfect watch. Honest, community-driven insights.',
}

export default function HomePage() {
  const recentReviews = getAllReviews().slice(0, 3)
  const featuredWatches = watches.slice(0, 4)
  const topComparisons = popularComparisons.slice(0, 6)
  const w1 = getWatchBySlug('rolex-submariner-41')!
  const w2 = getWatchBySlug('tudor-black-bay-58')!

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] border-b border-[#334155]">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-[#d4a853] opacity-5 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-[#d4a853] opacity-5 blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-[#d4a853]/10 border border-[#d4a853]/20 rounded-full px-4 py-1.5 text-sm text-[#d4a853] mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-[#d4a853] animate-pulse inline-block" />
              Community-Driven Watch Intelligence
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-5 leading-tight tracking-tight">
              Find Your <span className="text-[#d4a853]">Perfect Watch</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-400 mb-8 leading-relaxed max-w-2xl">
              Compare watches head-to-head, read real community reviews, and get personalized
              recommendations. 50+ watches. Honest insights. No fluff.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/quiz" className="btn-gold text-base px-7 py-3">
                Take the Quiz →
              </Link>
              <Link href="/compare" className="btn-outline text-base px-7 py-3">
                Compare Watches
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Search bar */}
      <section className="bg-[#1e293b] border-b border-[#334155]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <form action="/watches" method="get" className="flex gap-3 max-w-2xl">
            <input
              type="text"
              name="search"
              placeholder="Search by watch name or brand (e.g. Rolex, Seamaster)..."
              className="flex-1 bg-[#0f172a] border border-[#334155] rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#d4a853] transition-colors"
            />
            <button type="submit" className="btn-gold px-5 py-2.5 text-sm">
              Search
            </button>
          </form>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <h2 className="text-2xl font-bold text-white mb-8 text-center">How WatchVsWatch Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              step: '01',
              title: 'Compare',
              desc: 'Pick any two watches and see them side-by-side across every spec that matters.',
              path: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
            },
            {
              step: '02',
              title: 'Review',
              desc: 'Share your owner experience and read honest community reviews from real enthusiasts.',
              path: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z',
            },
            {
              step: '03',
              title: 'Decide',
              desc: 'Use honest comparisons and community ratings to confidently choose the right watch.',
              path: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
            },
          ].map((item) => (
            <div key={item.step} className="card p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-[#d4a853]/10 border border-[#d4a853]/20 flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-[#d4a853]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.path} />
                </svg>
              </div>
              <div className="text-xs text-[#d4a853] font-bold tracking-widest mb-2">{item.step}</div>
              <h3 className="text-white font-semibold text-lg mb-2">{item.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured comparison */}
      <section className="bg-[#1e293b] border-y border-[#334155]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white">Featured Comparison</h2>
              <p className="text-slate-400 text-sm mt-1">The most popular head-to-head</p>
            </div>
            <Link href="/compare/rolex-submariner-41-vs-tudor-black-bay-58" className="text-sm text-[#d4a853] hover:text-[#e4c07a] transition-colors hidden sm:block">
              View full comparison →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
            {[w1, w2].map((w) => (
              <div key={w.id} className="bg-[#0f172a] rounded-xl p-5 border border-[#334155]">
                <span className="text-xs text-[#d4a853] font-bold uppercase tracking-wider">{w.brand}</span>
                <h3 className="text-white text-xl font-bold mt-1 mb-3">{w.name}</h3>
                <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                  {[
                    ['Case', `${w.case_diameter_mm}mm`],
                    ['Movement', w.movement_type],
                    ['WR', `${w.water_resistance_m}m`],
                    ['Price', formatPrice(w.price_new_usd)],
                  ].map(([k, v]) => (
                    <div key={k} className="bg-[#1e293b] rounded-lg p-2">
                      <p className="text-slate-500 text-xs">{k}</p>
                      <p className="text-white font-medium capitalize">{v}</p>
                    </div>
                  ))}
                </div>
                <Link href={`/watches/${w.slug}`} className="text-[#d4a853] text-sm hover:underline">
                  View full specs →
                </Link>
              </div>
            ))}
          </div>
          <div className="text-center">
            <Link href="/compare/rolex-submariner-41-vs-tudor-black-bay-58" className="btn-gold">
              See Full Side-by-Side Comparison
            </Link>
          </div>
        </div>
      </section>

      {/* Popular comparisons */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">Popular Comparisons</h2>
            <p className="text-slate-400 text-sm mt-1">Community&apos;s most-viewed head-to-heads</p>
          </div>
          <Link href="/compare" className="text-sm text-[#d4a853] hover:text-[#e4c07a] hidden sm:block">
            Create your own →
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {topComparisons.map((c) => {
            const wa = getWatchBySlug(c.slug1)
            const wb = getWatchBySlug(c.slug2)
            if (!wa || !wb) return null
            return (
              <Link
                key={`${c.slug1}-${c.slug2}`}
                href={`/compare/${c.slug1}-vs-${c.slug2}`}
                className="card p-4 hover:border-[#d4a853]/40 transition-colors group"
              >
                <div className="flex items-center gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-500">{wa.brand}</p>
                    <p className="text-white text-sm font-semibold truncate group-hover:text-[#d4a853] transition-colors">
                      {wa.name}
                    </p>
                  </div>
                  <div className="text-[#d4a853] font-bold text-sm shrink-0">VS</div>
                  <div className="flex-1 min-w-0 text-right">
                    <p className="text-xs text-slate-500">{wb.brand}</p>
                    <p className="text-white text-sm font-semibold truncate group-hover:text-[#d4a853] transition-colors">
                      {wb.name}
                    </p>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      {/* Recent reviews */}
      <section className="bg-[#1e293b] border-y border-[#334155]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white">Recent Community Reviews</h2>
              <p className="text-slate-400 text-sm mt-1">Real owners, honest opinions</p>
            </div>
            <Link href="/reviews" className="text-sm text-[#d4a853] hover:text-[#e4c07a] hidden sm:block">
              All reviews →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recentReviews.map((r) => (
              <ReviewCard key={r.id} review={r} />
            ))}
          </div>
        </div>
      </section>

      {/* Watch grid teaser */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">Explore Watches</h2>
            <p className="text-slate-400 text-sm mt-1">50 watches across every category and budget</p>
          </div>
          <Link href="/watches" className="text-sm text-[#d4a853] hover:text-[#e4c07a] hidden sm:block">
            Browse all 50 →
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {featuredWatches.map((w) => (
            <WatchCard key={w.id} watch={w} />
          ))}
        </div>
        <div className="text-center mt-8">
          <Link href="/watches" className="btn-outline">
            Browse All 50 Watches
          </Link>
        </div>
      </section>

      {/* Quiz CTA */}
      <section className="bg-gradient-to-r from-[#d4a853]/10 to-[#b8863a]/10 border-y border-[#d4a853]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 text-center">
          <h2 className="text-3xl font-bold text-white mb-3">Not Sure Where to Start?</h2>
          <p className="text-slate-400 text-lg mb-7 max-w-xl mx-auto">
            Answer 5 quick questions and we&apos;ll recommend your perfect watch from our database.
          </p>
          <Link href="/quiz" className="btn-gold text-base px-8 py-3">
            Take the 2-Minute Quiz →
          </Link>
        </div>
      </section>
    </>
  )
}
