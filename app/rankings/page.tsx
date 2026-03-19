import { Metadata } from 'next'
import Link from 'next/link'
import { watches } from '@/lib/watches'
import WatchCard from '@/components/WatchCard'
import { topN, inPriceBucket, inSizeBucket } from '@/lib/rankings'

export const metadata: Metadata = {
  title: 'Best Watches — Rankings & Buyer\'s Guide | WatchVsWatch',
  description: 'Ranked by expert score, real owner satisfaction, and community votes. Find your next watch across dive, dress, sport, field, and every budget.',
  alternates: {
    canonical: 'https://watchvswatch.com/rankings',
  },
  openGraph: {
    title: 'Best Watches — Rankings & Buyer\'s Guide',
    description: 'Ranked by expert score, real owner satisfaction, and community votes.',
    url: 'https://watchvswatch.com/rankings',
    type: 'website',
  },
}

/* ── Data-driven ranking definitions ────────────────────────── */

interface RankingDef {
  id: string
  title: string
  filter: (w: typeof watches) => typeof watches
  limit: number
}

// Derive category sections from the data — any new primary_category auto-appears
const categoryLabels: Record<string, string> = {
  dive: 'Best Dive Watches',
  dress: 'Best Dress Watches',
  sport: 'Best Sport Watches',
  field: 'Best Field Watches',
  gmt: 'Best GMT / Travel Watches',
  casual: 'Best Casual Watches',
}

const uniqueCategories = Array.from(new Set(watches.map((w) => w.primary_category))).sort()

const categoryRankings: RankingDef[] = uniqueCategories.map((cat) => ({
  id: `cat-${cat}`,
  title: categoryLabels[cat] ?? `Best ${cat.charAt(0).toUpperCase() + cat.slice(1)} Watches`,
  filter: (all) => all.filter((w) => w.primary_category === cat),
  limit: 6,
}))

const priceRankings: RankingDef[] = [
  { id: 'price-u1k', title: 'Best Under $1,000', filter: (all) => all.filter(inPriceBucket(0, 1000)), limit: 6 },
  { id: 'price-1k-3k', title: 'Best $1,000–$3,000', filter: (all) => all.filter(inPriceBucket(1000, 3000)), limit: 6 },
  { id: 'price-3k-5k', title: 'Best $3,000–$5,000', filter: (all) => all.filter(inPriceBucket(3000, 5000)), limit: 6 },
  { id: 'price-5k-15k', title: 'Best $5,000–$15,000', filter: (all) => all.filter(inPriceBucket(5000, 15000)), limit: 6 },
  { id: 'price-15kp', title: 'Best Over $15,000', filter: (all) => all.filter(inPriceBucket(15000, 999999)), limit: 6 },
]

const sizeRankings: RankingDef[] = [
  { id: 'size-36-39', title: 'Best 36mm–39mm', filter: (all) => all.filter(inSizeBucket(36, 39)), limit: 6 },
  { id: 'size-40-42', title: 'Best 40mm–42mm', filter: (all) => all.filter(inSizeBucket(40, 42)), limit: 6 },
  { id: 'size-43p', title: 'Best 43mm+', filter: (all) => all.filter(inSizeBucket(43, 50)), limit: 6 },
]

const allRankings: RankingDef[] = [
  { id: 'top-overall', title: 'Top Ranked Overall', filter: (all) => all, limit: 10 },
  ...categoryRankings,
  ...priceRankings,
  ...sizeRankings,
]

// Resolve each section
const resolvedSections = allRankings
  .map((def) => ({
    ...def,
    watches: topN(def.filter(watches), def.limit),
  }))
  .filter((s) => s.watches.length >= 2)

/* ── Helper: make comparison slug from top 2 watches ────────── */
function makeCompareSlug(a: string, b: string): string {
  const sorted = [a, b].sort()
  return `${sorted[0]}-vs-${sorted[1]}`
}

/* ── Page ───────────────────────────────────────────────────── */

export default function RankingsPage() {
  // JSON-LD: one ItemList per section
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': resolvedSections.map((section) => ({
      '@type': 'ItemList',
      name: section.title,
      numberOfItems: section.watches.length,
      itemListElement: section.watches.map((w, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: `https://watchvswatch.com/watches/${w.slug}`,
        name: `${w.brand} ${w.name}`,
      })),
    })),
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-white via-[#f8fafc] to-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero */}
      <section className="bg-white border-b border-[#e2e8f0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <h1 className="text-4xl md:text-5xl font-bold text-[#0f172a] mb-4">
            Best Watches — Rankings &amp; Buyer&apos;s Guide
          </h1>
          <p className="text-lg text-[#475569] mb-8">
            Ranked by expert score, real owner satisfaction, and community votes
          </p>

          {/* Anchor Nav */}
          <div className="flex flex-wrap gap-2">
            {resolvedSections.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="text-xs font-medium px-3 py-1.5 rounded-full border border-[#e2e8f0] text-[#475569] hover:border-[#b8860b] hover:text-[#b8860b] transition-colors"
              >
                {section.title}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Rankings Content */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        {resolvedSections.map((section) => {
          const top2 = section.watches.slice(0, 2)
          const compareSlug = top2.length === 2
            ? makeCompareSlug(top2[0].slug, top2[1].slug)
            : null

          return (
            <section key={section.id} id={section.id} className="mb-16 scroll-mt-24">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl md:text-3xl font-bold text-[#0f172a]">
                  {section.title}
                </h2>
                {compareSlug && (
                  <Link
                    href={`/compare/${compareSlug}`}
                    className="hidden sm:inline-flex text-sm text-[#b8860b] hover:underline font-medium"
                  >
                    Compare top 2 →
                  </Link>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {section.watches.map((watch) => (
                  <WatchCard key={watch.id} watch={watch} />
                ))}
              </div>

              {compareSlug && (
                <Link
                  href={`/compare/${compareSlug}`}
                  className="block text-center text-sm text-[#b8860b] hover:underline font-medium mt-4 sm:hidden"
                >
                  Compare top 2 →
                </Link>
              )}
            </section>
          )
        })}
      </section>
    </main>
  )
}
