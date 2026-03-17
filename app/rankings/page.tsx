import { Metadata } from 'next'
import { watches } from '@/lib/watches'
import WatchCard from '@/components/WatchCard'
import { inSizeBucket, topN } from '@/lib/rankings'

export const metadata: Metadata = {
  title: 'Best Watches — Rankings & Buyer\'s Guide | WatchVsWatch',
  description: 'Ranked by expert score, real owner satisfaction, and community votes. Find your next watch across 8 ranking categories.',
  openGraph: {
    title: 'Best Watches — Rankings & Buyer\'s Guide',
    description: 'Ranked by expert score, real owner satisfaction, and community votes',
    url: 'https://watchvswatch.com/rankings',
    type: 'website',
  },
}

function RankingSection({
  title,
  watches: sectionWatches,
}: {
  title: string
  watches: typeof watches
}) {
  if (sectionWatches.length < 2) return null

  return (
    <section className="mb-16">
      <h2 className="text-2xl md:text-3xl font-bold text-[#0f172a] mb-6">
        {title}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sectionWatches.map((watch) => (
          <WatchCard key={watch.id} watch={watch} />
        ))}
      </div>
    </section>
  )
}

export default function RankingsPage() {
  // 1. Top Ranked Overall — top 10 by score
  const topOverall = topN(watches, 10)

  // 2. Best Dive Watches — top 6
  const diveWatches = watches.filter((w) => w.primary_category === 'dive')
  const topDive = topN(diveWatches, 6)

  // 3. Best Dress Watches — top 6
  const dressWatches = watches.filter((w) => w.primary_category === 'dress')
  const topDress = topN(dressWatches, 6)

  // 4. Best Under $1,000 — top 6
  const under1k = watches.filter((w) => w.price_new_usd.min < 1000)
  const topUnder1k = topN(under1k, 6)

  // 5. Best Under $3,000 — top 6
  const under3k = watches.filter(
    (w) => w.price_new_usd.min >= 1000 && w.price_new_usd.min < 3000
  )
  const topUnder3k = topN(under3k, 6)

  // 6. Best Under $5,000 — top 6
  const under5k = watches.filter(
    (w) => w.price_new_usd.min >= 3000 && w.price_new_usd.min < 5000
  )
  const topUnder5k = topN(under5k, 6)

  // 7. Best 36mm–39mm — top 6
  const size36_39 = watches.filter(inSizeBucket(36, 39))
  const topSize36_39 = topN(size36_39, 6)

  // 8. Best 40mm–42mm — top 6
  const size40_42 = watches.filter(inSizeBucket(40, 42))
  const topSize40_42 = topN(size40_42, 6)

  return (
    <main className="min-h-screen bg-gradient-to-br from-white via-[#f8fafc] to-white">
      {/* Hero */}
      <section className="bg-white border-b border-[#e2e8f0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <h1 className="text-4xl md:text-5xl font-bold text-[#0f172a] mb-4">
            Best Watches — Rankings &amp; Buyer&apos;s Guide
          </h1>
          <p className="text-lg text-[#475569]">
            Ranked by expert score, real owner satisfaction, and community votes
          </p>
        </div>
      </section>

      {/* Rankings Content */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <RankingSection title="Top Ranked Overall" watches={topOverall} />
        <RankingSection title="Best Dive Watches" watches={topDive} />
        <RankingSection title="Best Dress Watches" watches={topDress} />
        <RankingSection title="Best Under $1,000" watches={topUnder1k} />
        <RankingSection title="Best $1,000–$3,000" watches={topUnder3k} />
        <RankingSection title="Best $3,000–$5,000" watches={topUnder5k} />
        <RankingSection title="Best 36mm–39mm" watches={topSize36_39} />
        <RankingSection title="Best 40mm–42mm" watches={topSize40_42} />
      </section>
    </main>
  )
}
