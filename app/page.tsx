import Link from 'next/link'
import Image from 'next/image'
import { getWatchBySlug } from '@/lib/watches'
import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { SearchForm } from '@/components/SearchForm'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'WatchVsWatch — Discover, Compare & Choose the Right Watch',
  description:
    'Compare 160+ luxury watch matchups side by side. Specs, real differences, community votes, and buying guides. Find the right watch faster.',
  alternates: {
    canonical: 'https://watchvswatch.com',
  },
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
    desc: '56 watches with full specs, pros & cons, and ratings.',
    href: '/watches',
  },
  {
    icon: '📖',
    title: 'Buying Guides',
    desc: 'Best watches by budget, style, and occasion.',
    href: '/guides',
  },
]

export default function HomePage() {
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-white to-surfaceAlt border-b border-border">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-accent opacity-5 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-accent opacity-5 blur-3xl" />
        </div>
        <Container className="py-16 md:py-24">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl md:text-7xl font-bold text-textPrimary mb-6 leading-tight tracking-tight">
              Discover, compare, and choose the right watch.
            </h1>
            <p className="text-xl md:text-2xl text-textSecond mb-8 leading-relaxed max-w-2xl mx-auto">
              Side-by-side matchups, community insights, and buying guides —
              everything you need to decide with confidence.
            </p>

            {/* Search Input — primary CTA */}
            <SearchForm placeholder="Search watches or comparisons..." />

            {/* Quick Links — pill buttons */}
            <div className="flex flex-wrap gap-3 justify-center">
              <Link
                href="/compare/rolex-submariner-41-vs-omega-seamaster-300m"
                className="rounded-full bg-surfaceAlt border border-border px-4 py-2 text-sm text-textPrimary hover:bg-accent hover:text-white transition"
              >
                Submariner vs Seamaster
              </Link>
              <Link
                href="/guides/best-dive-watches-under-5000"
                className="rounded-full bg-surfaceAlt border border-border px-4 py-2 text-sm text-textPrimary hover:bg-accent hover:text-white transition"
              >
                Best Dive Watches
              </Link>
              <Link
                href="/quiz"
                className="rounded-full bg-surfaceAlt border border-border px-4 py-2 text-sm text-textPrimary hover:bg-accent hover:text-white transition"
              >
                Take the Quiz
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* POPULAR COMPARISONS */}
      <Section py="md">
        <Container>
          <h2 className="text-3xl font-bold text-textPrimary mb-12">
            Popular Comparisons
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
                          <div className="w-12 h-12 rounded bg-surfaceAlt border border-border overflow-hidden shrink-0 flex items-center justify-center transition-transform duration-200 hover:scale-150 hover:z-10 hover:shadow-lg">
                            <Image src={wa.image} alt={wa.imageAlt ?? `${wa.brand} ${wa.name}`} width={48} height={48} className="w-full h-full object-contain p-1" />
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
                          <div className="w-12 h-12 rounded bg-surfaceAlt border border-border overflow-hidden shrink-0 flex items-center justify-center transition-transform duration-200 hover:scale-150 hover:z-10 hover:shadow-lg">
                            <Image src={wb.image} alt={wb.imageAlt ?? `${wb.brand} ${wb.name}`} width={48} height={48} className="w-full h-full object-contain p-1" />
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
              See all 160+ comparisons →
            </Link>
          </div>
        </Container>
      </Section>

      {/* YOUR WATCH RESEARCH STARTS HERE */}
      <Section py="md" bg="surface">
        <Container>
          <h2 className="text-3xl font-bold text-textPrimary text-center mb-12">
            Your watch research starts here
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 max-w-3xl mx-auto">
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
            56 watches · 160+ comparisons · Curated guides · Community-driven ·
            No sponsored content
          </p>
        </Container>
      </div>

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
