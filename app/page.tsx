import Link from 'next/link'
import Image from 'next/image'
import { watches, getAllReviews, popularComparisons, getWatchBySlug, formatPrice } from '@/lib/watches'
import { brands } from '@/lib/brandData'
import WatchCard from '@/components/WatchCard'
import ReviewCard from '@/components/ReviewCard'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'WatchVsWatch — Find Your Perfect Watch',
  description:
    'Compare luxury watches, dive watches & sport watches head-to-head. Read honest reviews from the watch community. Find your perfect timepiece with expert insights.',
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
      <section className="relative overflow-hidden bg-gradient-to-br from-white to-[#f1f5f9] border-b border-[#e2e8f0]">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-[#b8860b] opacity-5 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-[#b8860b] opacity-5 blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 flex items-center gap-12">
          <div className="max-w-3xl flex-1">
            <div className="inline-flex items-center gap-2 bg-[#b8860b]/10 border border-[#b8860b]/20 rounded-full px-4 py-1.5 text-sm text-[#b8860b] mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-[#b8860b] animate-pulse inline-block" />
              Community-Driven Watch Intelligence
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-[#0f172a] mb-5 leading-tight tracking-tight">
              Find Your <span className="text-[#b8860b]">Perfect Watch</span>
            </h1>
            <p className="text-lg md:text-xl text-[#475569] mb-8 leading-relaxed max-w-2xl">
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
          {/* Hero watch showcase — desktop only */}
          <div className="hidden md:flex flex-col shrink-0 gap-4">
            <div className="flex gap-4">
              {[w1, w2].map((w) => (
                <div key={w.id} className="bg-white rounded-2xl border border-[#e2e8f0] p-4 flex flex-col items-center" style={{ boxShadow: '0 0 24px 2px rgba(184,134,11,0.08)' }}>
                  <div className="w-36 h-36 flex items-center justify-center rounded-xl bg-[#f8fafc] overflow-hidden mb-3">
                    <Image
                      src={w.image!}
                      alt={w.name}
                      width={144}
                      height={144}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <p className="text-[#0f172a] text-xs font-semibold text-center leading-snug max-w-[9rem]">{w.name}</p>
                </div>
              ))}
            </div>
            <p className="text-center text-xs text-[#b8860b] tracking-wider font-semibold">VS</p>
          </div>
        </div>
      </section>

      {/* Search bar */}
      <section className="bg-white border-b border-[#e2e8f0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <form action="/watches" method="get" className="flex gap-3 max-w-2xl">
            <input
              type="text"
              name="search"
              placeholder="Search by watch name or brand (e.g. Rolex, Seamaster)..."
              className="flex-1 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg px-4 py-2.5 text-sm text-[#0f172a] placeholder-[#94a3b8] focus:outline-none focus:border-[#b8860b] transition-colors"
            />
            <button type="submit" className="btn-gold px-5 py-2.5 text-sm">
              Search
            </button>
          </form>
        </div>
      </section>

      {/* Featured comparison */}
      <section className="bg-white border-y border-[#e2e8f0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-[#0f172a]">Featured Comparison</h2>
              <p className="text-[#475569] text-sm mt-1">The most popular head-to-head</p>
            </div>
            <Link href="/compare/rolex-submariner-41-vs-tudor-black-bay-58" className="text-sm text-[#b8860b] hover:text-[#d4a853] transition-colors hidden sm:block">
              View full comparison →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
            {[w1, w2].map((w) => (
              <div key={w.id} className="bg-[#f8fafc] rounded-xl p-5 border border-[#e2e8f0]">
                <div className="relative w-full h-40 flex items-center justify-center rounded-lg bg-white border border-[#e2e8f0] mb-4 overflow-hidden">
                  <Image
                    src={w.image!}
                    alt={w.name}
                    fill
                    className="object-contain"
                  />
                </div>
                <span className="text-xs text-[#b8860b] font-bold uppercase tracking-wider">{w.brand}</span>
                <h3 className="text-[#0f172a] text-xl font-bold mt-1 mb-3">{w.name}</h3>
                <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                  {[
                    ['Case', `${w.case_diameter_mm}mm`],
                    ['Movement', w.movement_type],
                    ['WR', `${w.water_resistance_m}m`],
                    ['Price', formatPrice(w.price_new_usd)],
                  ].map(([k, v]) => (
                    <div key={k} className="bg-white rounded-lg p-2 border border-[#e2e8f0]">
                      <p className="text-[#94a3b8] text-xs">{k}</p>
                      <p className="text-[#0f172a] font-medium capitalize">{v}</p>
                    </div>
                  ))}
                </div>
                <Link href={`/watches/${w.slug}`} className="text-[#b8860b] text-sm hover:underline">
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
            <h2 className="text-2xl font-bold text-[#0f172a]">Popular Comparisons</h2>
            <p className="text-[#475569] text-sm mt-1">Community&apos;s most-viewed head-to-heads</p>
          </div>
          <Link href="/compare" className="text-sm text-[#b8860b] hover:text-[#d4a853] hidden sm:block">
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
                className="card p-4 hover:border-[#b8860b]/40 transition-colors group"
              >
                <div className="flex justify-center gap-3 mb-3">
                  {[wa, wb].map((w) => (
                    <div key={w.id} className="w-12 h-12 rounded-lg bg-[#f8fafc] flex items-center justify-center overflow-hidden border border-[#e2e8f0]">
                      {w.image ? (
                        <Image src={w.image!} alt={w.name} width={48} height={48} className="w-full h-full object-contain" />
                      ) : (
                        <svg className="w-6 h-6 text-[#e2e8f0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-[#94a3b8]">{wa.brand}</p>
                    <p className="text-[#0f172a] text-sm font-semibold truncate group-hover:text-[#b8860b] transition-colors">
                      {wa.name}
                    </p>
                  </div>
                  <div className="text-[#b8860b] font-bold text-sm shrink-0">VS</div>
                  <div className="flex-1 min-w-0 text-right">
                    <p className="text-xs text-[#94a3b8]">{wb.brand}</p>
                    <p className="text-[#0f172a] text-sm font-semibold truncate group-hover:text-[#b8860b] transition-colors">
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
      <section className="bg-white border-y border-[#e2e8f0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-[#0f172a]">Recent Community Reviews</h2>
              <p className="text-[#475569] text-sm mt-1">Real owners, honest opinions</p>
            </div>
            <Link href="/reviews" className="text-sm text-[#b8860b] hover:text-[#d4a853] hidden sm:block">
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
            <h2 className="text-2xl font-bold text-[#0f172a]">Explore Watches</h2>
            <p className="text-[#475569] text-sm mt-1">Every category and budget covered</p>
          </div>
          <Link href="/watches" className="text-sm text-[#b8860b] hover:text-[#d4a853] hidden sm:block">
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

      {/* Explore by Brand — Topic Cluster Architecture */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-[#0f172a]">Explore by Brand</h2>
            <p className="text-[#475569] text-sm mt-1">Discover our complete brand guides and pillar pages</p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {brands.map((brand) => {
            const brandWatchCount = watches.filter(w => w.brand === brand.name).length
            return (
              <Link
                key={brand.slug}
                href={`/brands/${brand.slug}`}
                className="group card p-4 text-center hover:border-[#b8860b] hover:shadow-md transition-all duration-200"
              >
                <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-[#f8fafc] border border-[#e2e8f0] mb-3 mx-auto group-hover:bg-[#fffbf0] group-hover:border-[#b8860b]/30 transition-colors">
                  <span className="text-lg">🏛️</span>
                </div>
                <h3 className="font-bold text-[#0f172a] text-sm group-hover:text-[#b8860b] transition-colors">
                  {brand.name}
                </h3>
                <p className="text-xs text-[#94a3b8] mt-2">{brandWatchCount} watches</p>
              </Link>
            )
          })}
        </div>
      </section>

      {/* Quiz CTA */}
      <section className="bg-gradient-to-r from-[#b8860b]/10 to-[#d4a853]/10 border-y border-[#b8860b]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 text-center">
          <h2 className="text-3xl font-bold text-[#0f172a] mb-3">Not Sure Where to Start?</h2>
          <p className="text-[#475569] text-lg mb-7 max-w-xl mx-auto">
            Answer 5 quick questions and we&apos;ll recommend your perfect watch based on your needs.
          </p>
          <Link href="/quiz" className="btn-gold text-base px-8 py-3">
            Take the 2-Minute Quiz →
          </Link>
        </div>
      </section>
    </>
  )
}
