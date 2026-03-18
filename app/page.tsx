import Link from 'next/link'
import Image from 'next/image'
import { popularComparisons, getWatchBySlug } from '@/lib/watches'
import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { SearchForm } from '@/components/SearchForm'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'WatchVsWatch — Find Your Perfect Watch',
  description:
    'Compare luxury watches, dive watches & sport watches head-to-head. Read honest reviews from the watch community. Find your perfect timepiece with expert insights.',
}

export default function HomePage() {
  const topComparisons = popularComparisons.slice(0, 8)

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
              Compare watches. Pick the right one in seconds.
            </h1>
            <p className="text-xl md:text-2xl text-textSecond mb-8 leading-relaxed max-w-2xl mx-auto">
              Side-by-side comparisons with real differences, pricing, and clear verdicts.
            </p>
            <Button href="/compare" variant="primary" size="lg" className="mb-12">
              Compare watches
            </Button>

            {/* Search Input */}
            <SearchForm />

            {/* Quick Links */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center text-sm">
              <Link 
                href="/compare/rolex-submariner-41-vs-omega-seamaster-300m"
                className="text-accent hover:text-accentHover transition-colors underline"
              >
                Submariner vs Seamaster →
              </Link>
              <span className="text-textMuted hidden sm:inline">•</span>
              <Link 
                href="/compare/rolex-datejust-36-vs-omega-aqua-terra-38"
                className="text-accent hover:text-accentHover transition-colors underline"
              >
                Datejust vs Aqua Terra →
              </Link>
              <span className="text-textMuted hidden sm:inline">•</span>
              <Link 
                href="/compare/omega-speedmaster-moonwatch-vs-breitling-navitimer-b01-42"
                className="text-accent hover:text-accentHover transition-colors underline"
              >
                Speedmaster vs Navitimer →
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* HOW IT WORKS */}
      <Section py="md" bg="surface">
        <Container>
          <h2 className="text-3xl font-bold text-textPrimary text-center mb-12">How it works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { num: '1', title: 'Pick two watches', desc: 'Choose any watches from our database.' },
              { num: '2', title: 'See side-by-side comparison', desc: 'Specs, price, and features aligned.' },
              { num: '3', title: 'Get a clear winner + verdict', desc: 'Expert analysis and community votes.' },
            ].map((step) => (
              <div key={step.num} className="text-center">
                <div className="w-12 h-12 rounded-full bg-accent text-white flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {step.num}
                </div>
                <h3 className="text-xl font-semibold text-textPrimary mb-2">{step.title}</h3>
                <p className="text-textSecond text-sm">{step.desc}</p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* POPULAR COMPARISONS */}
      <Section py="md">
        <Container>
          <h2 className="text-3xl font-bold text-textPrimary mb-12">Popular comparisons</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
                      <div className="text-accent font-bold text-xs shrink-0">VS</div>
                      <div className="flex-1 min-w-0 text-right">
                        <p className="text-xs text-textMuted">{wb.brand}</p>
                        <p className="text-textPrimary text-sm font-semibold truncate group-hover:text-accent transition-colors">
                          {wb.name}
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-accent font-medium mt-3 text-center">View comparison →</p>
                  </Link>
                </Card>
              )
            })}
          </div>
        </Container>
      </Section>

      {/* WHY USE THIS */}
      <Section py="md" bg="surface">
        <Container>
          <h2 className="text-3xl font-bold text-textPrimary text-center mb-12">Why WatchVsWatch</h2>
          <div className="max-w-2xl mx-auto space-y-4">
            {[
              'No fluff — only what matters',
              'Clear winners, not endless specs',
              'Real-world differences, not marketing',
              'Updated pricing and data',
            ].map((point, i) => (
              <div key={i} className="flex gap-4 items-start">
                <div className="w-6 h-6 rounded-full bg-accent text-white flex items-center justify-center text-sm font-bold shrink-0">
                  ✓
                </div>
                <p className="text-lg text-textPrimary pt-1">{point}</p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* BUILT FOR CLARITY */}
      <Section py="md">
        <Container>
          <h2 className="text-3xl font-bold text-textPrimary text-center mb-12">Built for clarity</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <p className="text-4xl md:text-5xl font-bold text-accent mb-2">50+</p>
              <p className="text-textSecond">watches analyzed</p>
            </div>
            <div>
              <p className="text-4xl md:text-5xl font-bold text-accent mb-2">160+</p>
              <p className="text-textSecond">comparisons</p>
            </div>
            <div>
              <p className="text-4xl md:text-5xl font-bold text-accent mb-2">📅</p>
              <p className="text-textSecond">Updated regularly</p>
            </div>
          </div>
        </Container>
      </Section>

      {/* FINAL CTA */}
      <section className="bg-textPrimary">
        <Container className="py-16 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Find the right watch faster</h2>
          <Button href="/compare" variant="outline" size="lg" className="text-white border-white hover:bg-white hover:text-textPrimary">
            Start comparing
          </Button>
        </Container>
      </section>
    </>
  )
}
