import Link from 'next/link'
import Image from 'next/image'
import { watches, popularComparisons, comparisonTiers, getWatchBySlug } from '@/lib/watches'
import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { SearchForm } from '@/components/SearchForm'
import type { Metadata } from 'next'

const faqItems = [
  {
    q: 'How do I compare two watches on WatchVsWatch?',
    a: `Use the search bar on the homepage or visit the Compare page to pick any two watches. You'll see side-by-side specs, key differences, community votes, and an expert verdict — all on one page.`,
  },
  {
    q: 'What brands does WatchVsWatch cover?',
    a: 'We cover watches at every price point — from affordable favourites like Seiko, Casio, Orient, and Tissot to mid-range brands like Hamilton, Longines, and Oris, all the way up to Rolex, Omega, Tudor, Breitling, IWC, Cartier, Grand Seiko, and beyond. New watches and brands are added regularly.',
  },
  {
    q: 'Is WatchVsWatch free to use?',
    a: 'Yes, WatchVsWatch is completely free. We have no affiliate links and no sponsored content — every comparison and recommendation is independent.',
  },
  {
    q: 'How are watches rated and compared?',
    a: 'Each comparison includes verified specifications, an analysis of real-world differences (movement, water resistance, case size, price), community votes from watch enthusiasts, and an editorial verdict summarising who each watch is best for.',
  },
  {
    q: 'Can WatchVsWatch help me choose my first watch?',
    a: 'Absolutely. Take our Watch Finder Quiz to get a personalised recommendation in under a minute, or browse our buying guides organised by budget, style, and occasion — whether your budget is $100 or $10,000.',
  },
  {
    q: 'Does WatchVsWatch have watch buying guides?',
    a: 'Yes. WatchVsWatch publishes independent buying guides organised by budget (best watches under $500, under $1,000, under $5,000), by style (dive watches, dress watches, chronographs, field watches), and by occasion. Each guide includes curated picks with specs and a clear recommendation — no affiliate links and no sponsored placements.',
  },
]

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqItems.map((item) => ({
    '@type': 'Question',
    name: item.q,
    acceptedAnswer: {
      '@type': 'Answer',
      text: item.a,
    },
  })),
}

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'WatchVsWatch',
  url: 'https://watchvswatch.com',
  logo: 'https://watchvswatch.com/icon.png',
  description: 'WatchVsWatch is an independent watch research resource covering side-by-side watch comparisons, buying guides by budget and style, detailed watch profiles, community ratings, and a Watch Finder Quiz. It covers watches at every price point from Seiko and Casio to Rolex and Patek Philippe, with no affiliate links or sponsored content.',
  knowsAbout: [
    'Watch comparisons', 'Watch buying guides', 'Watch specifications', 'Luxury watches',
    'Dive watches', 'Dress watches', 'Chronograph watches', 'Watch reviews',
    'Watch recommendations', 'Rolex', 'Omega', 'Tudor', 'Seiko', 'TAG Heuer', 'Grand Seiko',
  ],
  sameAs: [],
}

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'WatchVsWatch',
  url: 'https://watchvswatch.com',
  description: 'Independent watch research resource: comparisons, buying guides, watch profiles, and the Watch Finder Quiz.',
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: 'https://watchvswatch.com/watches?q={search_term_string}',
    },
    'query-input': 'required name=search_term_string',
  },
}

// Load top 6 Tier 1 comparisons from comparison-tiers.json
const featuredComparisons = comparisonTiers
  .filter((c) => c.tier === 1)
  .slice(0, 6)
  .map((c) => ({
    slug1: c.slug1,
    slug2: c.slug2,
    tagline: `${getWatchBySlug(c.slug1)?.brand ?? ''} ${getWatchBySlug(c.slug1)?.name ?? ''} vs ${getWatchBySlug(c.slug2)?.brand ?? ''} ${getWatchBySlug(c.slug2)?.name ?? ''}`,
  }))

// ItemList JSON-LD for featured comparisons (rich results)
const itemListJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'Popular Watch Comparisons',
  itemListElement: featuredComparisons.map((c, i) => {
    const wa = getWatchBySlug(c.slug1)
    const wb = getWatchBySlug(c.slug2)
    return {
      '@type': 'ListItem',
      position: i + 1,
      name: `${wa?.brand ?? ''} ${wa?.name ?? c.slug1} vs ${wb?.brand ?? ''} ${wb?.name ?? c.slug2}`,
      url: `https://watchvswatch.com/compare/${c.slug1}-vs-${c.slug2}`,
    }
  }),
}

// Recently added comparisons (last 6 from the comparison tiers data)
const recentComparisons = comparisonTiers.slice(-6).reverse()

const researchCards = [
  {
    icon: '⚔️',
    title: 'Compare Watches',
    desc: 'Side-by-side specs, real differences, and community votes.',
    href: '/compare',
  },
  {
    icon: '🧭',
    title: 'Take the Quiz',
    desc: 'Answer 5 quick questions to find your match.',
    href: '/quiz',
  },
  {
    icon: '⌚',
    title: 'Browse All Watches',
    desc: `${watches.length} watches with full specs, pros & cons, and ratings.`,
    href: '/watches',
  },
  {
    icon: '📖',
    title: 'Buying Guides',
    desc: 'Best watches by budget, style, and occasion.',
    href: '/guides',
  },
]

// Quick-link pills for the hero
const quickLinks = [
  { label: 'Rolex vs Omega', href: '/compare/rolex-submariner-41-vs-omega-seamaster-300m' },
  { label: 'Rolex vs Tudor', href: '/compare/rolex-submariner-41-vs-tudor-black-bay-58' },
  { label: 'Seiko vs Orient', href: '/watches?brand=Seiko' },
  { label: 'Speedmaster vs Navitimer', href: '/compare/omega-speedmaster-moonwatch-vs-breitling-navitimer-b01-42' },
  { label: 'Cartier vs Omega', href: '/compare/cartier-santos-vs-omega-aqua-terra-38' },
  { label: 'Best Dive Watches', href: '/guides/best-dive-watches-under-5000' },
  { label: 'Best Under $1,000', href: '/guides/best-watches-under-1000' },
  { label: 'Watch Finder Quiz', href: '/quiz' },
  { label: 'Grand Seiko vs Omega', href: '/compare/grand-seiko-sbga211-snowflake-vs-omega-aqua-terra-38' },
]

// Top brands from the database for Browse by Brand
const topBrands = ['Rolex', 'Omega', 'Tudor', 'Seiko', 'TAG Heuer', 'Grand Seiko']

// How it works steps
const howItWorksSteps = [
  { icon: '🔍', title: 'Research Any Watch', desc: 'Browse 50+ watch profiles with full specs, pros & cons, and community ratings.' },
  { icon: '⚔️', title: 'Compare Side by Side', desc: 'Run any head-to-head matchup: specs, real-world differences, community votes, and an expert verdict.' },
  { icon: '✅', title: 'Buy With Confidence', desc: 'Use buying guides by budget and style, or take the Watch Finder Quiz for a personalised pick in under a minute.' },
]

export const metadata: Metadata = {
  title: 'Watch Reviews, Comparisons & Buying Guides | WatchVsWatch',
  description:
    'The independent watch research resource. Compare watches side by side, explore buying guides, use the Watch Finder Quiz, and browse full specs for 50+ watches. No affiliate links. No sponsored content.',
  alternates: {
    canonical: 'https://watchvswatch.com',
  },
  openGraph: {
    type: 'website',
    siteName: 'WatchVsWatch',
    title: 'Watch Reviews, Comparisons & Buying Guides | WatchVsWatch',
    description: 'Independent watch research: side-by-side comparisons, buying guides by budget and style, Watch Finder Quiz, and detailed watch profiles. Every price point, no affiliate links.',
    url: 'https://watchvswatch.com',
    images: [{ url: 'https://watchvswatch.com/api/og?title=WatchVsWatch&subtitle=Compare+Watches+Side+by+Side', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Watch Reviews, Comparisons & Buying Guides | WatchVsWatch',
    description: 'Independent watch research: side-by-side comparisons, buying guides by budget and style, Watch Finder Quiz, and detailed watch profiles. Every price point, no affiliate links.',
  },
}

export default function HomePage() {
  return (
    <>
      {/* JSON-LD Schemas */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />

      {/* HERO */}
      <section className="relative bg-gradient-to-br from-white to-surfaceAlt border-b border-border">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-accent opacity-5 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-accent opacity-5 blur-3xl" />
        </div>
        <Container className="py-10 sm:py-16 md:py-24">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl sm:text-5xl md:text-7xl font-bold text-textPrimary mb-6 leading-tight tracking-tight">
              Find, Compare &amp; Choose Your Next Watch
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-textSecond mb-8 leading-relaxed max-w-2xl mx-auto">
              Side-by-side comparisons, buying guides for every budget, detailed watch profiles, and a personalised Watch Finder Quiz — all independent, no affiliate links.
            </p>

            {/* Search Input — primary CTA */}
            <SearchForm placeholder="Search watches or comparisons..." watches={watches} comparisons={popularComparisons} />

            {/* Quick Links — pill buttons */}
            <div className="flex flex-wrap gap-3 justify-center">
              {quickLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-full bg-surfaceAlt border border-border px-4 py-2 text-sm text-textPrimary hover:bg-accent hover:text-white transition"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* HOW IT WORKS */}
      <Section py="md" bg="surface">
        <Container>
          <h2 className="text-2xl sm:text-3xl font-bold text-textPrimary text-center mb-8 sm:mb-12">
            How It Works
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {howItWorksSteps.map((step, i) => (
              <div key={i} className="text-center">
                <div className="text-4xl mb-3">{step.icon}</div>
                <h3 className="text-lg font-semibold text-textPrimary mb-2">
                  <span className="text-accent mr-1">{i + 1}.</span>
                  {step.title}
                </h3>
                <p className="text-sm text-textSecond">{step.desc}</p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* POPULAR WATCH COMPARISONS */}
      <Section py="md">
        <Container>
          <h2 className="text-2xl sm:text-3xl font-bold text-textPrimary mb-8 sm:mb-12">
            Popular Watch Comparisons
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {featuredComparisons.map((c) => {
              const wa = getWatchBySlug(c.slug1)
              const wb = getWatchBySlug(c.slug2)
              if (!wa || !wb) return null
              return (
                <Card
                  key={`${c.slug1}-${c.slug2}`}
                  hover
                  className="p-5 group"
                  as="article"
                >
                  <Link
                    href={`/compare/${c.slug1}-vs-${c.slug2}`}
                    className="block h-full"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex-1 min-w-0 flex items-center gap-3">
                        {wa.image && (
                          <div className="relative shrink-0 group/thumb">
                            <div className="w-12 h-12 rounded bg-surfaceAlt border border-border overflow-hidden flex items-center justify-center">
                              <Image src={wa.image} alt={wa.imageAlt ?? `${wa.brand} ${wa.name}`} width={48} height={48} className="w-full h-full object-contain p-1" />
                            </div>
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-40 h-40 rounded-lg bg-white border border-border shadow-xl p-3 hidden md:group-hover/thumb:flex items-center justify-center z-50 pointer-events-none">
                              <Image src={wa.image} alt={wa.imageAlt ?? `${wa.brand} ${wa.name}`} width={160} height={160} className="w-full h-full object-contain" />
                            </div>
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-xs text-textMuted">{wa.brand}</p>
                          <p className="text-textPrimary font-semibold group-hover:text-accent transition-colors">
                            {wa.name}
                          </p>
                        </div>
                      </div>
                      <div className="text-accent font-bold text-sm shrink-0">
                        VS
                      </div>
                      <div className="flex-1 min-w-0 flex items-center justify-end gap-3">
                        <div className="min-w-0 text-right">
                          <p className="text-xs text-textMuted">{wb.brand}</p>
                          <p className="text-textPrimary font-semibold group-hover:text-accent transition-colors">
                            {wb.name}
                          </p>
                        </div>
                        {wb.image && (
                          <div className="relative shrink-0 group/thumb">
                            <div className="w-12 h-12 rounded bg-surfaceAlt border border-border overflow-hidden flex items-center justify-center">
                              <Image src={wb.image} alt={wb.imageAlt ?? `${wb.brand} ${wb.name}`} width={48} height={48} className="w-full h-full object-contain p-1" />
                            </div>
                            <div className="absolute bottom-full right-0 mb-2 w-40 h-40 rounded-lg bg-white border border-border shadow-xl p-3 hidden md:group-hover/thumb:flex items-center justify-center z-50 pointer-events-none">
                              <Image src={wb.image} alt={wb.imageAlt ?? `${wb.brand} ${wb.name}`} width={160} height={160} className="w-full h-full object-contain" />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-textSecond mb-3">
                      {c.tagline}
                    </p>
                    <p className="text-sm text-accent font-medium">
                      View comparison →
                    </p>
                  </Link>
                </Card>
              )
            })}
          </div>
          <div className="text-center mt-8">
            <Link
              href="/compare"
              className="text-accent hover:text-accentHover font-medium transition-colors"
            >
              See all {comparisonTiers.length}+ comparisons →
            </Link>
          </div>
        </Container>
      </Section>

      {/* RECENTLY ADDED COMPARISONS */}
      <Section py="md" bg="surface">
        <Container>
          <h2 className="text-2xl sm:text-3xl font-bold text-textPrimary mb-8 sm:mb-12">
            Recently Added Comparisons
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentComparisons.map((c) => {
              const wa = getWatchBySlug(c.slug1)
              const wb = getWatchBySlug(c.slug2)
              if (!wa || !wb) return null
              return (
                <Card key={`${c.slug1}-${c.slug2}`} hover className="p-4">
                  <Link href={`/compare/${c.slug1}-vs-${c.slug2}`} className="block h-full">
                    <div className="flex items-center gap-2 mb-2">
                      {wa.image && (
                        <div className="w-10 h-10 rounded bg-surfaceAlt border border-border overflow-hidden flex items-center justify-center shrink-0">
                          <Image src={wa.image} alt={wa.imageAlt ?? `${wa.brand} ${wa.name}`} width={40} height={40} className="w-full h-full object-contain p-0.5" />
                        </div>
                      )}
                      <span className="text-accent font-bold text-xs">VS</span>
                      {wb.image && (
                        <div className="w-10 h-10 rounded bg-surfaceAlt border border-border overflow-hidden flex items-center justify-center shrink-0">
                          <Image src={wb.image} alt={wb.imageAlt ?? `${wb.brand} ${wb.name}`} width={40} height={40} className="w-full h-full object-contain p-0.5" />
                        </div>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-textPrimary mb-1">
                      {wa.brand} {wa.name} vs {wb.brand} {wb.name}
                    </p>
                    <p className="text-sm text-accent font-medium">
                      View comparison →
                    </p>
                  </Link>
                </Card>
              )
            })}
          </div>
        </Container>
      </Section>

      {/* BROWSE BY CATEGORY */}
      <Section py="md">
        <Container>
          <h2 className="text-2xl sm:text-3xl font-bold text-textPrimary mb-8 sm:mb-12">
            Browse Watches by Category
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* By Price Range */}
            <div>
              <h3 className="text-lg font-semibold text-textPrimary mb-4">By Price Range</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/watches?price=under-500" className="text-accent hover:text-accentHover transition-colors text-sm font-medium">
                    Under $500 →
                  </Link>
                </li>
                <li>
                  <Link href="/watches?price=500-2000" className="text-accent hover:text-accentHover transition-colors text-sm font-medium">
                    $500 – $2,000 →
                  </Link>
                </li>
                <li>
                  <Link href="/watches?price=2000-5000" className="text-accent hover:text-accentHover transition-colors text-sm font-medium">
                    $2,000 – $5,000 →
                  </Link>
                </li>
                <li>
                  <Link href="/watches?price=5000-plus" className="text-accent hover:text-accentHover transition-colors text-sm font-medium">
                    $5,000+ →
                  </Link>
                </li>
              </ul>
            </div>
            {/* By Style */}
            <div>
              <h3 className="text-lg font-semibold text-textPrimary mb-4">By Style</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/watches?style=dress" className="text-accent hover:text-accentHover transition-colors text-sm font-medium">
                    Dress Watches →
                  </Link>
                </li>
                <li>
                  <Link href="/watches?style=dive" className="text-accent hover:text-accentHover transition-colors text-sm font-medium">
                    Dive Watches →
                  </Link>
                </li>
                <li>
                  <Link href="/watches?style=chronograph" className="text-accent hover:text-accentHover transition-colors text-sm font-medium">
                    Chronographs →
                  </Link>
                </li>
                <li>
                  <Link href="/watches?style=field" className="text-accent hover:text-accentHover transition-colors text-sm font-medium">
                    Field Watches →
                  </Link>
                </li>
              </ul>
            </div>
            {/* By Brand */}
            <div>
              <h3 className="text-lg font-semibold text-textPrimary mb-4">By Brand</h3>
              <ul className="space-y-2">
                {topBrands.map((brand) => (
                  <li key={brand}>
                    <Link href={`/watches?brand=${encodeURIComponent(brand)}`} className="text-accent hover:text-accentHover transition-colors text-sm font-medium">
                      {brand} Watches →
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Container>
      </Section>

      {/* WATCH BUYING TOOLS & GUIDES */}
      <Section py="md" bg="surface">
        <Container>
          <h2 className="text-2xl sm:text-3xl font-bold text-textPrimary text-center mb-8 sm:mb-12">
            Watch Buying Tools &amp; Guides
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
            {researchCards.map((card) => (
              <Card key={card.href} hover className="p-5">
                <Link href={card.href} className="block h-full">
                  <div className="text-2xl mb-2">{card.icon}</div>
                  <h3 className="text-lg font-semibold text-textPrimary mb-1">
                    {card.title}
                  </h3>
                  <p className="text-sm text-textSecond">{card.desc}</p>
                </Link>
              </Card>
            ))}
          </div>
        </Container>
      </Section>

      {/* TRUST STRIP */}
      <div className="border-y border-border py-8">
        <Container>
          <p className="text-textSecond text-sm text-center">
            {watches.length} watches &middot; {comparisonTiers.length}+ head-to-head comparisons &middot; Independent &amp; unbiased &middot; Community-powered ratings &middot; Real specs from manufacturers
          </p>
        </Container>
      </div>

      {/* SEO CONTENT — WHY WATCHVSWATCH */}
      <Section py="md">
        <Container>
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-textPrimary mb-6">
              Your Independent Watch Research Resource
            </h2>
            <div className="prose prose-lg text-textSecond space-y-4">
              <p>
                WatchVsWatch is an independent watch research resource covering every stage of the watch-buying journey — from initial research through to a confident purchase decision. Whether you are comparing Rolex vs Omega, looking for the best dive watches under $5,000, using the Watch Finder Quiz to narrow down a budget, or reading a full brand breakdown, everything on this site is editorially independent with no affiliate links and no sponsored placements.
              </p>
              <p>
                The site covers four core content areas: <strong>watch comparisons</strong> (side-by-side specs, community votes, and expert verdicts), <strong>buying guides</strong> (curated recommendations by budget, style, and occasion), <strong>watch profiles</strong> (individual watch pages with verified specs, ratings, and pros &amp; cons), and the <strong>Watch Finder Quiz</strong> (five questions to a personalised recommendation).
              </p>
              <p>
                <strong>What makes WatchVsWatch different:</strong> specifications are sourced directly from manufacturer documentation and cross-referenced for accuracy. Community ratings are real votes from watch enthusiasts — not seeded scores. Editorial verdicts are written independently with no commercial interest in which watch you choose. Buying guide recommendations are based on build quality, value, and use-case fit — not commission rates.
              </p>
              <p>
                Watch brands covered include Seiko, Casio, Orient, Citizen, Tissot, Hamilton, Longines, TAG Heuer, Oris, Tudor, Omega, Rolex, Breitling, IWC, Cartier, Panerai, Grand Seiko, and more — at every price point from under $100 to six-figure luxury, with new watches and comparisons added regularly.
              </p>
            </div>
          </div>
        </Container>
      </Section>

      {/* FAQ SECTION */}
      <Section py="md" bg="surface">
        <Container>
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-textPrimary mb-8">
              Frequently Asked Questions
            </h2>
            <div className="space-y-6">
              {faqItems.map((item, i) => (
                <div key={i} className="border-b border-border pb-6 last:border-0">
                  <h3 className="text-lg font-semibold text-textPrimary mb-2">
                    {item.q}
                  </h3>
                  <p className="text-textSecond leading-relaxed">
                    {item.a}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </Section>

      {/* FINAL CTA */}
      <section className="bg-textPrimary">
        <Container className="py-16 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to find your next watch?
          </h2>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button
              href="/compare"
              variant="outline"
              size="lg"
              className="text-white border-white hover:bg-white hover:text-textPrimary"
            >
              Compare watches
            </Button>
            <Link
              href="/quiz"
              className="inline-flex items-center text-white underline text-base px-7 py-3 font-medium hover:opacity-80 transition-opacity"
            >
              Take the quiz
            </Link>
          </div>
        </Container>
      </section>
    </>
  )
}
