import Link from 'next/link'
import Image from 'next/image'
import { watches, getAllReviews, popularComparisons, getWatchBySlug, formatPrice } from '@/lib/watches'
import { brands } from '@/lib/brandData'
import { topN } from '@/lib/rankings'
import WatchCard from '@/components/WatchCard'
import ReviewCard from '@/components/ReviewCard'
import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
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
  const topRankedWatches = topN(watches, 6)
  const w1 = getWatchBySlug('rolex-submariner-41')!
  const w2 = getWatchBySlug('tudor-black-bay-58')!

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-white to-surfaceAlt border-b border-border">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-accent opacity-5 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-accent opacity-5 blur-3xl" />
        </div>
        <Container className="py-20 md:py-28 flex items-center gap-12">
          <div className="max-w-3xl flex-1">
            <div className="inline-flex items-center gap-2 bg-accent/10 border border-accent/20 rounded-full px-4 py-1.5 text-sm text-accent mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse inline-block" />
              Community-Driven Watch Intelligence
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-textPrimary mb-5 leading-tight tracking-tight">
              Find Your <span className="text-accent">Perfect Watch</span>
            </h1>
            <p className="text-lg md:text-xl text-textSecond mb-8 leading-relaxed max-w-2xl">
              Compare watches head-to-head, read real community reviews, and get personalized
              recommendations. 50+ watches. Honest insights. No fluff.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button href="/quiz" variant="primary" size="lg">
                Take the Quiz →
              </Button>
              <Button href="/compare" variant="outline" size="lg">
                Compare Watches
              </Button>
            </div>
          </div>
          {/* Hero watch showcase — desktop only */}
          <div className="hidden md:flex flex-col shrink-0 gap-4">
            <div className="flex gap-4">
              {[w1, w2].map((w) => (
                <div key={w.id} className="bg-surface rounded-2xl border border-border p-4 flex flex-col items-center shadow-sm">
                  <div className="w-36 h-36 flex items-center justify-center rounded-xl bg-surfaceAlt overflow-hidden mb-3">
                    <Image
                      src={w.image!}
                      alt={w.name}
                      width={144}
                      height={144}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <p className="text-textPrimary text-xs font-semibold text-center leading-snug max-w-[9rem]">{w.name}</p>
                </div>
              ))}
            </div>
            <p className="text-center text-xs text-accent tracking-wider font-semibold">VS</p>
          </div>
        </Container>
      </section>

      {/* Search bar */}
      <Section bg="surface">
        <Container>
          <form action="/watches" method="get" className="flex gap-3 max-w-2xl py-5">
            <Input
              type="text"
              name="search"
              placeholder="Search by watch name or brand (e.g. Rolex, Seamaster)..."
              className="flex-1"
            />
            <Button variant="secondary" size="md">
              Search
            </Button>
          </form>
        </Container>
      </Section>

      {/* Featured comparison */}
      <Section bg="surface" border py="md">
        <Container>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-textPrimary">Featured Comparison</h2>
              <p className="text-textSecond text-sm mt-1">The most popular head-to-head</p>
            </div>
            <Link href="/compare/rolex-submariner-41-vs-tudor-black-bay-58" className="text-sm text-accent hover:text-accentHover transition-colors hidden sm:block">
              View full comparison →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
            {[w1, w2].map((w) => (
              <div key={w.id} className="bg-surfaceAlt rounded-xl p-5 border border-border">
                <div className="relative w-full h-40 flex items-center justify-center rounded-lg bg-surface border border-border mb-4 overflow-hidden">
                  <Image
                    src={w.image!}
                    alt={w.name}
                    fill
                    className="object-contain"
                  />
                </div>
                <span className="text-xs text-accent font-bold uppercase tracking-wider">{w.brand}</span>
                <h3 className="text-textPrimary text-xl font-bold mt-1 mb-3">{w.name}</h3>
                <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                  {[
                    ['Case', `${w.case_diameter_mm}mm`],
                    ['Movement', w.movement_type],
                    ['WR', `${w.water_resistance_m}m`],
                    ['Price', formatPrice(w.price_new_usd)],
                  ].map(([k, v]) => (
                    <div key={k} className="bg-surface rounded-lg p-2 border border-border">
                      <p className="text-textMuted text-xs">{k}</p>
                      <p className="text-textPrimary font-medium capitalize">{v}</p>
                    </div>
                  ))}
                </div>
                <Link href={`/watches/${w.slug}`} className="text-accent text-sm hover:underline">
                  View full specs →
                </Link>
              </div>
            ))}
          </div>
          <div className="text-center">
            <Button href="/compare/rolex-submariner-41-vs-tudor-black-bay-58" variant="outline">
              See Full Side-by-Side Comparison
            </Button>
          </div>
        </Container>
      </Section>

      {/* Popular comparisons */}
      <Section py="md">
        <Container>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-textPrimary">Popular Comparisons</h2>
              <p className="text-textSecond text-sm mt-1">Community&apos;s most-viewed head-to-heads</p>
            </div>
            <Link href="/compare" className="text-sm text-accent hover:text-accentHover hidden sm:block">
              Create your own →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {topComparisons.map((c) => {
              const wa = getWatchBySlug(c.slug1)
              const wb = getWatchBySlug(c.slug2)
              if (!wa || !wb) return null
              return (
                <Card
                  key={`${c.slug1}-${c.slug2}`}
                  hover
                  className="p-4 group"
                  as="article"
                >
                  <Link href={`/compare/${c.slug1}-vs-${c.slug2}`} className="block h-full">
                <div className="flex justify-center gap-3 mb-3">
                  {[wa, wb].map((w) => (
                    <div key={w.id} className="w-12 h-12 rounded-lg bg-surfaceAlt flex items-center justify-center overflow-hidden border border-border">
                      {w.image ? (
                        <Image src={w.image!} alt={w.name} width={48} height={48} className="w-full h-full object-contain" />
                      ) : (
                        <svg className="w-6 h-6 text-border" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-textMuted">{wa.brand}</p>
                    <p className="text-textPrimary text-sm font-semibold truncate group-hover:text-accent transition-colors">
                      {wa.name}
                    </p>
                  </div>
                  <div className="text-accent font-bold text-sm shrink-0">VS</div>
                  <div className="flex-1 min-w-0 text-right">
                    <p className="text-xs text-textMuted">{wb.brand}</p>
                    <p className="text-textPrimary text-sm font-semibold truncate group-hover:text-accent transition-colors">
                      {wb.name}
                    </p>
                  </div>
                </div>
                  </Link>
                </Card>
              )
            })}
          </div>
        </Container>
      </Section>

      {/* Best Watches by Budget */}
      <Section bg="surface" border py="md">
        <Container>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-textPrimary">Best Watches by Budget</h2>
              <p className="text-textSecond text-sm mt-1">Expert picks at every price point</p>
            </div>
            <Link href="/guides" className="text-sm text-accent hover:text-accentHover hidden sm:block">
              All buying guides →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { href: '/guides/best-watches-under-500', label: 'Under $500', sub: 'Best value picks' },
              { href: '/guides/best-watches-under-1000', label: 'Under $1,000', sub: 'The sweet spot' },
              { href: '/guides/best-watches-under-3000', label: 'Under $3,000', sub: 'Premium territory' },
              { href: '/guides/best-watches-under-5000', label: 'Under $5,000', sub: 'Luxury entry' },
            ].map(({ href, label, sub }) => (
              <Card
                key={href}
                hover
                as="article"
                className="p-5 text-center group"
              >
                <Link href={href} className="block">
                  <p className="text-2xl mb-2">⌚</p>
                  <p className="text-textPrimary font-bold text-sm group-hover:text-accent transition-colors">{label}</p>
                  <p className="text-xs text-textSecond mt-1">{sub}</p>
                  <p className="text-xs text-accent font-medium mt-3">See Picks →</p>
                </Link>
              </Card>
            ))}
          </div>
        </Container>
      </Section>

      {/* Recent reviews */}
      <Section bg="surface" border py="md">
        <Container>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-textPrimary">Recent Community Reviews</h2>
              <p className="text-textSecond text-sm mt-1">Real owners, honest opinions</p>
            </div>
            <Link href="/reviews" className="text-sm text-accent hover:text-accentHover hidden sm:block">
              All reviews →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recentReviews.map((r) => (
              <ReviewCard key={r.id} review={r} />
            ))}
          </div>
        </Container>
      </Section>

      {/* Top Ranked Watches */}
      <Section py="md">
        <Container>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-textPrimary">Top Ranked Watches</h2>
            <p className="text-textSecond text-sm mt-1">Highest-rated across specs, value, and community scores</p>
          </div>
          <Link href="/rankings" className="text-sm text-accent hover:text-accentHover hidden sm:block">
            Full rankings →
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {topRankedWatches.map((w) => (
            <WatchCard key={w.id} watch={w} />
          ))}
        </div>
        <div className="text-center mt-8">
          <Button href="/rankings" variant="outline">
            View All Rankings
          </Button>
        </div>
        </Container>
      </Section>

      {/* Watch grid teaser */}
      <Section py="md">
        <Container>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-textPrimary">Explore Watches</h2>
            <p className="text-textSecond text-sm mt-1">Every category and budget covered</p>
          </div>
          <Link href="/watches" className="text-sm text-accent hover:text-accentHover hidden sm:block">
            Browse all 50 →
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {featuredWatches.map((w) => (
            <WatchCard key={w.id} watch={w} />
          ))}
        </div>
        <div className="text-center mt-8">
          <Button href="/watches" variant="outline">
            Browse All 50 Watches
          </Button>
        </div>
        </Container>
      </Section>

      {/* Explore by Brand — Topic Cluster Architecture */}
      <Section py="md">
        <Container>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-textPrimary">Explore by Brand</h2>
            <p className="text-textSecond text-sm mt-1">Discover our complete brand guides and pillar pages</p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {brands.map((brand) => {
            const brandWatchCount = watches.filter(w => w.brand === brand.name).length
            return (
              <Card
                key={brand.slug}
                hover
                as="article"
                className="p-4 text-center group"
              >
                <Link href={`/brands/${brand.slug}`} className="block">
                  <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-surfaceAlt border border-border mb-3 mx-auto group-hover:bg-accentLight group-hover:border-accent/30 transition-colors">
                    <span className="text-lg">🏛️</span>
                  </div>
                  <h3 className="font-bold text-textPrimary text-sm group-hover:text-accent transition-colors">
                    {brand.name}
                  </h3>
                  <p className="text-xs text-textMuted mt-2">{brandWatchCount} watches</p>
                </Link>
              </Card>
            )
          })}
        </div>
        </Container>
      </Section>

      {/* Compare Any Two Watches CTA */}
      <section className="bg-textPrimary">
        <Container className="py-14 text-center">
          <h2 className="text-3xl font-bold text-white mb-3">Compare Any Two Watches</h2>
          <p className="text-textMuted text-lg mb-7 max-w-xl mx-auto">
            Side-by-side specs, community votes, and an expert verdict — in seconds.
          </p>
          <Button href="/compare" variant="outline" size="lg">
            Start Comparing →
          </Button>
        </Container>
      </section>

      {/* Quiz CTA */}
      <section className="bg-gradient-to-r from-accent/10 to-accentLight border-y border-accent/20">
        <Container className="py-14 text-center">
          <h2 className="text-3xl font-bold text-textPrimary mb-3">Not Sure Where to Start?</h2>
          <p className="text-textSecond text-lg mb-7 max-w-xl mx-auto">
            Answer 5 quick questions and we&apos;ll recommend your perfect watch based on your needs.
          </p>
          <Button href="/quiz" variant="outline" size="lg">
            Take the 2-Minute Quiz →
          </Button>
        </Container>
      </section>
    </>
  )
}
