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
  description: 'Independent watch comparison platform — compare specs, community ratings, and expert verdicts side by side.',
  sameAs: [],
}

const featuredComparisons: {
  slug1: string
  slug2: string
  tagline: string
}[] = [
  {
    slug1: 'rolex-submariner-41',
    slug2: 'omega-seamaster-300m',
    tagline: 'The ultimate luxury diver showdown',
  },
  {
    slug1: 'rolex-submariner-41',
    slug2: 'tudor-black-bay-58',
    tagline: 'Heritage meets value — same DNA, different price',
  },
  {
    slug1: 'omega-speedmaster-moonwatch',
    slug2: 'breitling-navitimer-b01-42',
    tagline: 'Two iconic chronographs, very different philosophies',
  },
  {
    slug1: 'rolex-datejust-36',
    slug2: 'omega-aqua-terra-38',
    tagline: 'Dress-sport classics compared',
  },
  {
    slug1: 'omega-seamaster-300m',
    slug2: 'tudor-black-bay-58',
    tagline: 'Mid-range vs entry luxury dive',
  },
  {
    slug1: 'rolex-submariner-41',
    slug2: 'tudor-pelagos-39',
    tagline: "Rolex royalty vs Tudor's titanium challenger",
  },
]

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
  { icon: '🔍', title: 'Pick Two Watches', desc: 'Search or browse our database of 57+ watches from top brands.' },
  { icon: '📊', title: 'Compare Specs & Votes', desc: 'See side-by-side specs, community ratings, and real-world differences.' },
  { icon: '✅', title: 'Read the Verdict', desc: 'Get an expert summary of who each watch is best for — and decide.' },
]

export const metadata: Metadata = {
  title: 'Compare Watches Side by Side — Specs, Reviews & Verdicts | WatchVsWatch',
  description:
    `Compare ${comparisonTiers.length}+ watch matchups side by side — from Seiko and Hamilton to Rolex and Omega. Specs, real differences, community votes, and buying guides to help you choose the right watch at any budget.`,
  alternates: {
    canonical: 'https://watchvswatch.com',
  },
  openGraph: {
    type: 'website',
    siteName: 'WatchVsWatch',
    title: 'Compare Watches Side by Side — Specs, Reviews & Verdicts | WatchVsWatch',
    description: `Side-by-side specs, community votes, and expert verdicts for ${comparisonTiers.length}+ watch matchups. Every budget, every style.`,
    url: 'https://watchvswatch.com',
    images: [{ url: 'https://watchvswatch.com/api/og?title=WatchVsWatch&subtitle=Compare+Watches+Side+by+Side', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Compare Watches Side by Side — Specs, Reviews & Verdicts | WatchVsWatch',
    description: `Side-by-side specs, community votes, and expert verdicts for ${comparisonTiers.length}+ watch matchups.`,
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
              Compare Watches Side by Side
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-textSecond mb-8 leading-relaxed max-w-2xl mx-auto">
              {comparisonTiers.length}+ head-to-head matchups with specs, community votes, and expert verdicts — from Seiko and Tissot to Rolex and Patek Philippe, at every price point.
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
            {watches.length} watches · {comparisonTiers.length}+ comparisons · Curated guides · Community-driven ·
            No sponsored content
          </p>
        </Container>
      </div>

      {/* SEO CONTENT — WHY WATCHVSWATCH */}
      <Section py="md">
        <Container>
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-textPrimary mb-6">
              The Independent Watch Comparison Platform
            </h2>
            <div className="prose prose-lg text-textSecond space-y-4">
              <p>
                Whether you&apos;re choosing between a Seiko Presage and a Hamilton Khaki Field,
                weighing up the Rolex Submariner against the Omega Seamaster, or deciding if a
                Grand Seiko is worth the step up from a Tissot PRX — WatchVsWatch puts the
                details that matter into clear, head-to-head comparisons. Movement type, water
                resistance, case dimensions, price, and real-world wearability, all in one place.
              </p>
              <p>
                Every matchup includes verified specifications sourced from manufacturer data, an
                editorial breakdown of what sets each watch apart, and community votes from watch
                enthusiasts who own or have tried the watches in question. We cover brands at
                every price point — Seiko, Casio, Orient, Tissot, Hamilton, Longines, Oris,
                Tudor, Omega, Rolex, Breitling, TAG Heuer, IWC, Cartier, Panerai, Grand Seiko,
                and more — with new watches added regularly.
              </p>
              <p>
                Unlike review sites that rely on affiliate commissions, WatchVsWatch has no
                affiliate links and no sponsored placements. Our recommendations are based solely
                on specs, value, and community feedback — so whether you&apos;re spending $200 or
                $20,000, you can trust what you read.
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
            Still deciding? Start exploring.
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
