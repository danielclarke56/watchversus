import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { watches, popularComparisons, formatPrice } from '@/lib/watches'
import { guides } from '@/lib/guideData'

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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Breadcrumb */}
        <nav className="text-sm text-[#94a3b8] mb-6 flex items-center gap-2">
          <Link href="/" className="hover:text-[#b8860b] transition-colors">Home</Link>
          <span>/</span>
          <Link href="/guides" className="hover:text-[#b8860b] transition-colors">Guides</Link>
          <span>/</span>
          <span className="text-[#0f172a]">{guide.h1}</span>
        </nav>

        {/* H1 + Intro */}
        <h1 className="text-3xl md:text-4xl font-bold text-[#0f172a] mb-6">{guide.h1}</h1>
        <div className="text-[#475569] leading-relaxed mb-10 space-y-4">
          {guide.intro.split('\n\n').map((para, i) => (
            <p key={i}>{para.trim()}</p>
          ))}
        </div>

        {/* Recommendations */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-[#0f172a] mb-6">Our Picks</h2>
          <div className="space-y-6">
            {recommendedWatches.map(({ rec, watch }, index) => (
              <div key={watch.slug} className="card p-6">
                <div className="flex items-start gap-4">
                  <div className="shrink-0 w-10 h-10 bg-[#b8860b]/20 border border-[#b8860b]/40 rounded-full flex items-center justify-center">
                    <span className="text-[#b8860b] font-bold text-sm">{index + 1}</span>
                  </div>
                  {!watch.image.endsWith('.svg') && (
                    <div className="shrink-0 w-20 h-20 rounded-lg bg-white border border-[#e2e8f0] overflow-hidden">
                      <Image src={watch.image} alt={watch.name} width={80} height={80} className="w-20 h-20 object-contain" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-xs text-[#b8860b] font-bold uppercase tracking-wider">{watch.brand}</span>
                      <span className="text-[#0f172a] font-bold text-lg">{watch.name}</span>
                    </div>
                    <div className="flex flex-wrap gap-3 text-xs text-[#94a3b8] mb-3">
                      <span>{watch.case_diameter_mm}mm</span>
                      <span>{watch.movement_type}</span>
                      <span>{formatPrice(watch.price_new_usd)} new</span>
                      {watch.water_resistance_m >= 100 && <span>{watch.water_resistance_m}m WR</span>}
                    </div>
                    <p className="text-[#475569] text-sm leading-relaxed mb-4">{rec.highlight}</p>
                    <div className="flex flex-wrap gap-3">
                      <Link
                        href={`/watches/${watch.slug}`}
                        className="text-xs text-[#b8860b] hover:underline"
                      >
                        Full specs →
                      </Link>
                      {(() => {
                        const comp = popularComparisons.find(
                          (c) => c.slug1 === watch.slug || c.slug2 === watch.slug
                        )
                        if (!comp) return null
                        const otherSlug = comp.slug1 === watch.slug ? comp.slug2 : comp.slug1
                        const otherWatch = watches.find((w) => w.slug === otherSlug)
                        if (!otherWatch) return null
                        return (
                          <Link
                            href={`/compare/${comp.slug1}-vs-${comp.slug2}`}
                            className="text-xs text-[#475569] hover:text-[#b8860b] hover:underline transition-colors"
                          >
                            Compare vs {otherWatch.brand} {otherWatch.name} →
                          </Link>
                        )
                      })()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Buying Guide */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-[#0f172a] mb-6">Buying Guide</h2>
          <div className="space-y-6">
            {guide.buyingGuide.map((section) => (
              <div key={section.heading} className="card p-6">
                <h3 className="text-[#0f172a] font-semibold text-lg mb-3">{section.heading}</h3>
                <p className="text-[#475569] text-sm leading-relaxed">{section.content}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-[#0f172a] mb-6">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {guide.faq.map((item, i) => (
              <details key={i} className="card p-5 group cursor-pointer">
                <summary className="text-[#0f172a] font-semibold flex justify-between items-center list-none">
                  <span>{item.question}</span>
                  <span className="text-[#b8860b] group-open:rotate-180 transition-transform ml-4 shrink-0">▼</span>
                </summary>
                <p className="text-[#475569] text-sm mt-4 leading-relaxed">{item.answer}</p>
              </details>
            ))}
          </div>
        </section>

        {/* Conclusion */}
        <section className="mb-12 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-6">
          <p className="text-[#475569] text-sm leading-relaxed">{guide.conclusion}</p>
        </section>

        {/* Related Comparisons */}
        {relatedComparisons.length > 0 && (
          <section className="mb-12">
            <h2 className="text-xl font-bold text-[#0f172a] mb-5">Related Comparisons</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {relatedComparisons.map((c) => {
                const wa = watches.find((w) => w.slug === c.slug1)
                const wb = watches.find((w) => w.slug === c.slug2)
                if (!wa || !wb) return null
                return (
                  <Link
                    key={`${c.slug1}-${c.slug2}`}
                    href={`/compare/${c.slug1}-vs-${c.slug2}`}
                    className="card p-4 hover:border-[#b8860b]/40 transition-colors group"
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] text-[#94a3b8] uppercase">{wa.brand}</p>
                        <p className="text-[#0f172a] text-xs font-semibold truncate">{wa.name}</p>
                      </div>
                      <div className="text-[#b8860b] font-bold text-xs shrink-0">VS</div>
                      <div className="flex-1 min-w-0 text-right">
                        <p className="text-[10px] text-[#94a3b8] uppercase">{wb.brand}</p>
                        <p className="text-[#0f172a] text-xs font-semibold truncate">{wb.name}</p>
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
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-[#0f172a] mb-6">People Also Ask</h2>
            <div className="space-y-3">
              {guide.paa.map((item, i) => (
                <details key={i} className="card p-5 group cursor-pointer">
                  <summary className="text-[#0f172a] font-semibold flex justify-between items-center list-none">
                    <span>{item.question}</span>
                    <span className="text-[#b8860b] group-open:rotate-180 transition-transform ml-4 shrink-0">▼</span>
                  </summary>
                  <p className="text-[#475569] text-sm mt-3 leading-relaxed">{item.answer}</p>
                </details>
              ))}
            </div>
          </section>
        )}

        {/* CTA */}
        <div className="text-center bg-white border border-[#e2e8f0] rounded-xl p-8">
          <h3 className="text-[#0f172a] font-semibold text-lg mb-2">Compare Any Two Watches</h3>
          <p className="text-[#475569] text-sm mb-5">Head-to-head specs, community ratings, and pricing side by side</p>
          <Link href="/compare" className="btn-gold">
            Start a Comparison
          </Link>
        </div>
      </div>
    </>
  )
}
