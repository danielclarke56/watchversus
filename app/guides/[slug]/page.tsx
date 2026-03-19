import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { watches, popularComparisons, formatPrice } from '@/lib/watches'
import { guides } from '@/lib/guideData'
import { getRelatedGuidesByBrand, getBrandsInGuide } from '@/lib/relatedContent'
import GuideTableOfContents from '@/app/components/GuideTableOfContents'

export async function generateStaticParams() {
  return guides.map((g) => ({ slug: g.slug }))
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const guide = guides.find((g) => g.slug === params.slug)
  if (!guide) return {}
  return {
    title: guide.title,
    description: guide.description,
    alternates: {
      canonical: `https://watchvswatch.com/guides/${guide.slug}`,
    },
    openGraph: {
      title: `${guide.title} | WatchVsWatch`,
      description: guide.description,
      url: `https://watchvswatch.com/guides/${guide.slug}`,
      type: 'article',
    },
  }
}

export default function GuidePage({ params }: { params: { slug: string } }) {
  const guide = guides.find((g) => g.slug === params.slug)
  if (!guide) notFound()

  const recommendedWatches = guide.recommendations.map((rec) => {
    const watch = watches.find((w) => w.slug === rec.slug)
    return { rec, watch }
  }).filter((item): item is { rec: typeof guide.recommendations[0]; watch: NonNullable<typeof watches[0]> } => item.watch !== undefined)

  // Find comparisons that involve any recommended watch slug
  const relatedSlugs = new Set(guide.recommendations.map((r) => r.slug))
  const relatedComparisons = popularComparisons
    .filter((c) => relatedSlugs.has(c.slug1) || relatedSlugs.has(c.slug2))
    .slice(0, 6)

  // Compute all pairs between recommended watches that exist in popularComparisons
  const recSlugList = guide.recommendations.map((r) => r.slug)
  const internalComparisons: typeof popularComparisons = []
  for (let i = 0; i < recSlugList.length; i++) {
    for (let j = i + 1; j < recSlugList.length; j++) {
      const found = popularComparisons.find(
        (c) =>
          (c.slug1 === recSlugList[i] && c.slug2 === recSlugList[j]) ||
          (c.slug1 === recSlugList[j] && c.slug2 === recSlugList[i])
      )
      if (found) internalComparisons.push(found)
    }
  }
  // Merge internal pairs first, then other related Ã¢â‚¬â€ dedupe, max 6
  const seenComps = new Set<string>()
  const topComparisons = [...internalComparisons, ...relatedComparisons]
    .filter((c) => {
      const key = `${c.slug1}-${c.slug2}`
      if (seenComps.has(key)) return false
      seenComps.add(key)
      return true
    })
    .slice(0, 6)

  // Find related guides and brands
  const relatedGuides = getRelatedGuidesByBrand(guide.slug)
  const brandsInThisGuide = getBrandsInGuide(guide)
  // Get up to 4 brands mentioned in this guide
  const featuredBrands = brandsInThisGuide.slice(0, 4)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://watchvswatch.com' },
          { '@type': 'ListItem', position: 2, name: 'Guides', item: 'https://watchvswatch.com/guides' },
          { '@type': 'ListItem', position: 3, name: guide.h1, item: `https://watchvswatch.com/guides/${guide.slug}` },
        ],
      },
      {
        '@type': 'Article',
        headline: guide.h1,
        description: guide.description,
        url: `https://watchvswatch.com/guides/${guide.slug}`,
        publisher: {
          '@type': 'Organization',
          name: 'WatchVsWatch',
          url: 'https://watchvswatch.com',
        },
      },
      {
        '@type': 'FAQPage',
        mainEntity: [...guide.faq, ...(guide.paa ?? [])].map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: item.answer,
          },
        })),
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-neutral to-surface border-b border-border mb-0">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">`n          {/* Breadcrumb */}
          <nav className="text-sm text-textMuted mb-6 flex items-center gap-2">
            <Link href="/" className="hover:text-accent transition-colors">Home</Link>
            <span>/</span>
            <Link href="/guides" className="hover:text-accent transition-colors">Guides</Link>
            <span>/</span>
            <span className="text-textPrimary">{guide.h1}</span>
          </nav>

          {/* Category Badge + H1 */}
          {(() => {
            const allText = [
              guide.h1,
              guide.intro,
              guide.description,
              ...guide.buyingGuide.map(s => s.heading + ' ' + s.content),
              ...guide.faq.map(f => f.question + ' ' + f.answer),
              guide.conclusion,
            ].join(' ')
            const readTime = Math.ceil(allText.split(' ').length / 200)
            return (
              <div className="flex items-center gap-3 mb-4">
                <span className="inline-block text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-accent/10 text-accent border border-accent/30">
                  Buying Guide
                </span>
                <span className="text-xs text-textMuted flex items-center gap-1">
                  Ã°Å¸â€œâ€“ {readTime} min read
                </span>
              </div>
            )
          })()}

          <h1 className="text-3xl md:text-5xl font-heading font-bold text-textPrimary mb-4">{guide.h1}</h1>
          <p className="text-lg text-textSecond leading-relaxed">{guide.description}</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex gap-8">
        {/* Sticky TOC Sidebar */}
        <GuideTableOfContents
          sections={[
            { id: 'our-picks', label: 'Our Picks' },
            ...(topComparisons.length > 0 ? [{ id: 'compare-head-to-head', label: 'Compare Head-to-Head' }] : []),
            { id: 'buying-guide', label: 'Buying Guide' },
            { id: 'faq', label: 'FAQ' },
            ...(guide.paa && guide.paa.length > 0 ? [{ id: 'people-also-ask', label: 'People Also Ask' }] : []),
            ...(relatedGuides.length > 0 ? [{ id: 'more-guides', label: 'More Guides' }] : []),
          ]}
        />
        <div className="flex-1 min-w-0">
        {/* Intro */}
        <div className="text-textSecond leading-relaxed mb-10 space-y-4">
          {guide.intro.split('\n\n').map((para, i) => (
            <p key={i}>{para.trim()}</p>
          ))}
        </div>

        {/* Rankings Strip */}
        <div className="mb-8 flex items-center justify-between bg-neutral border border-border rounded-xl px-5 py-3">
          <p className="text-sm text-textSecond">See how these watches rank against the full database</p>
          <Link href="/rankings" className="text-sm font-semibold text-accent hover:underline shrink-0 ml-4">
            View Rankings Ã¢â€ â€™
          </Link>
        </div>

        {/* Recommendations */}
        <section id="our-picks" className="mb-12 scroll-mt-24">
          <h2 className="text-2xl font-heading font-bold text-textPrimary mb-6">Our Picks</h2>
          <div className="space-y-6">
            {recommendedWatches.map(({ rec, watch }, index) => (
              <div key={watch.slug} className="card p-6">
                <div className="flex items-start gap-4">
                  <div className="shrink-0 w-10 h-10 bg-accent/20 border border-accent/40 rounded-full flex items-center justify-center">
                    <span className="text-accent font-bold text-sm">{index + 1}</span>
                  </div>
                  {watch.image && !watch.image.endsWith('.svg') && (
                    <div className="shrink-0 w-20 h-20 rounded-lg bg-neutral border border-border overflow-hidden">
                      <Image src={watch.image} alt={watch.name} width={80} height={80} className="w-20 h-20 object-contain" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-xs text-accent font-bold uppercase tracking-wider">{watch.brand}</span>
                      <span className="text-textPrimary font-bold text-lg">{watch.name}</span>
                    </div>
                    <div className="flex flex-wrap gap-3 text-xs text-textMuted mb-3">
                      <span>{watch.case_diameter_mm}mm</span>
                      <span>{watch.movement_type}</span>
                      <span>{formatPrice(watch.price_new_usd)} new</span>
                      {watch.water_resistance_m >= 100 && <span>{watch.water_resistance_m}m WR</span>}
                    </div>
                    <p className="text-textSecond text-sm leading-relaxed mb-4">{rec.highlight}</p>
                    <div className="flex flex-wrap gap-3">
                      <Link
                        href={`/watches/${watch.slug}`}
                        className="text-xs text-accent hover:underline"
                      >
                        Full specs Ã¢â€ â€™
                      </Link>
                      {popularComparisons
                        .filter((c) => c.slug1 === watch.slug || c.slug2 === watch.slug)
                        .slice(0, 2)
                        .map((comp) => {
                          const otherSlug = comp.slug1 === watch.slug ? comp.slug2 : comp.slug1
                          const otherWatch = watches.find((w) => w.slug === otherSlug)
                          if (!otherWatch) return null
                          return (
                            <Link
                              key={`${comp.slug1}-${comp.slug2}`}
                              href={`/compare/${comp.slug1}-vs-${comp.slug2}`}
                              className="text-xs text-textSecond hover:text-accent hover:underline transition-colors"
                            >
                              vs {otherWatch.brand} {otherWatch.name} Ã¢â€ â€™
                            </Link>
                          )
                        })}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Compare These Watches Ã¢â‚¬â€ surfaced above buying guide */}
        {topComparisons.length > 0 && (
          <section id="compare-head-to-head" className="mb-12 scroll-mt-24">
            <h2 className="text-xl font-heading font-bold text-textPrimary mb-2">Compare These Watches Head-to-Head</h2>
            <p className="text-sm text-textSecond mb-5">Side-by-side specs, community votes, and expert scores</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {topComparisons.map((c) => {
                const wa = watches.find((w) => w.slug === c.slug1)
                const wb = watches.find((w) => w.slug === c.slug2)
                if (!wa || !wb) return null
                return (
                  <Link
                    key={`${c.slug1}-${c.slug2}`}
                    href={`/compare/${c.slug1}-vs-${c.slug2}`}
                    className="card p-4 hover:border-accent/40 hover:-translate-y-0.5 hover:shadow-md transition-all group"
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] text-textMuted uppercase">{wa.brand}</p>
                        <p className="text-textPrimary text-xs font-semibold truncate">{wa.name}</p>
                      </div>
                      <div className="text-accent font-bold text-xs shrink-0">VS</div>
                      <div className="flex-1 min-w-0 text-right">
                        <p className="text-[10px] text-textMuted uppercase">{wb.brand}</p>
                        <p className="text-textPrimary text-xs font-semibold truncate">{wb.name}</p>
                      </div>
                    </div>
                    <p className="text-[10px] text-accent font-medium mt-2">Compare Ã¢â€ â€™</p>
                  </Link>
                )
              })}
            </div>
          </section>
        )}

        {/* Buying Guide */}
        <section id="buying-guide" className="mb-12 scroll-mt-24">
          <h2 className="text-2xl font-heading font-bold text-textPrimary mb-6">Buying Guide</h2>
          <div className="space-y-6">
            {guide.buyingGuide.map((section) => (
              <div key={section.heading} className="card p-6">
                <h3 className="text-textPrimary font-heading font-semibold text-lg mb-3">{section.heading}</h3>
                <p className="text-textSecond text-sm leading-relaxed">{section.content}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="mb-12 scroll-mt-24">
          <h2 className="text-2xl font-heading font-bold text-textPrimary mb-6">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {guide.faq.map((item, i) => (
              <details key={i} className="card p-5 group cursor-pointer">
                <summary className="text-textPrimary font-semibold flex justify-between items-center list-none">
                  <span>{item.question}</span>
                  <span className="text-accent group-open:rotate-180 transition-transform ml-4 shrink-0">Ã¢â€“Â¼</span>
                </summary>
                <p className="text-textSecond text-sm mt-4 leading-relaxed">{item.answer}</p>
              </details>
            ))}
          </div>
        </section>

        {/* Conclusion */}
        <section className="mb-12 bg-neutral border border-border rounded-xl p-6">
          <p className="text-textSecond text-sm leading-relaxed">{guide.conclusion}</p>
        </section>

        {/* Related Comparisons */}
        {relatedComparisons.length > 0 && (
          <section className="mb-12">
            <h2 className="text-xl font-heading font-bold text-textPrimary mb-5">Related Comparisons</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {relatedComparisons.map((c) => {
                const wa = watches.find((w) => w.slug === c.slug1)
                const wb = watches.find((w) => w.slug === c.slug2)
                if (!wa || !wb) return null
                return (
                  <Link
                    key={`${c.slug1}-${c.slug2}`}
                    href={`/compare/${c.slug1}-vs-${c.slug2}`}
                    className="card p-4 hover:border-accent/40 hover:-translate-y-0.5 hover:shadow-md transition-all group"
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] text-textMuted uppercase">{wa.brand}</p>
                        <p className="text-textPrimary text-xs font-semibold truncate">{wa.name}</p>
                      </div>
                      <div className="text-accent font-bold text-xs shrink-0">VS</div>
                      <div className="flex-1 min-w-0 text-right">
                        <p className="text-[10px] text-textMuted uppercase">{wb.brand}</p>
                        <p className="text-textPrimary text-xs font-semibold truncate">{wb.name}</p>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </section>
        )}

        {/* People Also Ask */}
        {guide.paa && guide.paa.length > 0 && (
          <section id="people-also-ask" className="mb-12 scroll-mt-24">
            <h2 className="text-2xl font-heading font-bold text-textPrimary mb-6">People Also Ask</h2>
            <div className="space-y-3">
              {guide.paa.map((item, i) => (
                <details key={i} className="card p-5 group cursor-pointer">
                  <summary className="text-textPrimary font-semibold flex justify-between items-center list-none">
                    <span>{item.question}</span>
                    <span className="text-accent group-open:rotate-180 transition-transform ml-4 shrink-0">Ã¢â€“Â¼</span>
                  </summary>
                  <p className="text-textSecond text-sm mt-3 leading-relaxed">{item.answer}</p>
                </details>
              ))}
            </div>
          </section>
        )}

        {/* Related Guides Footer */}
        {relatedGuides.length > 0 && (
          <section id="more-guides" className="mb-12 scroll-mt-24">
            <h2 className="text-xl font-heading font-bold text-textPrimary mb-5">More Buying Guides</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {relatedGuides.map((g) => (
                <Link
                  key={g.slug}
                  href={`/guides/${g.slug}`}
                  className="card p-5 hover:border-accent/40 hover:-translate-y-0.5 hover:shadow-md transition-all group"
                >
                  <p className="text-xs uppercase text-textMuted font-semibold mb-2">Buying Guide</p>
                  <h3 className="text-sm font-bold text-textPrimary group-hover:text-accent transition-colors line-clamp-2">
                    {g.title}
                  </h3>
                  <p className="text-xs text-textSecond mt-3 line-clamp-1">{g.description}</p>
                  <p className="text-xs text-accent font-medium mt-4 inline-block">Read Guide Ã¢â€ â€™</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Related Brands Footer */}
        {featuredBrands.length > 0 && (
          <section className="mb-12">
            <h2 className="text-xl font-heading font-bold text-textPrimary mb-5">Brands Featured in This Guide</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {featuredBrands.map((b) => (
                <Link
                  key={b.slug}
                  href={`/brands/${b.slug}`}
                  className="card p-4 hover:border-accent/40 hover:-translate-y-0.5 hover:shadow-md transition-all group text-center"
                >
                  <h3 className="text-sm font-bold text-textPrimary group-hover:text-accent transition-colors">
                    {b.name}
                  </h3>
                  <p className="text-xs text-textSecond mt-2 line-clamp-2">{b.heroFact}</p>
                  <p className="text-xs text-accent font-medium mt-3 inline-block">Explore Brand Ã¢â€ â€™</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* CTA */}
        <div className="text-center bg-neutral border border-border rounded-xl p-8">
          <h3 className="text-textPrimary font-heading font-semibold text-lg mb-2">Compare Any Two Watches</h3>
          <p className="text-textSecond text-sm mb-5">Head-to-head specs, community ratings, and pricing side by side</p>
          <Link href="/compare" className="btn-gold">
            Start a Comparison
          </Link>
        </div>
        </div>
      </div>
    </>
  )
}
