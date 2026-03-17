import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { watches, popularComparisons, formatPrice } from '@/lib/watches'
import { brands } from '@/lib/brandData'
import { getGuidesForBrand, getRelatedBrandsByContext, getAllComparisonsForWatch, getComparisonSlug } from '@/lib/relatedContent'

export async function generateStaticParams() {
  return brands.map((b) => ({ slug: b.slug }))
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const brand = brands.find((b) => b.slug === params.slug)
  if (!brand) return {}
  return {
    title: `${brand.name} Watches — Reviews, Specs & Comparisons`,
    description: `Explore all ${brand.name} watches with full specs, community ratings, and head-to-head comparisons. Find your perfect ${brand.name} timepiece with honest reviews.`,
    alternates: {
      canonical: `https://watchvswatch.com/brands/${brand.slug}`,
    },
    openGraph: {
      title: `${brand.name} Watches | WatchVsWatch`,
      description: `Compare ${brand.name} watches side-by-side. Full specs, community ratings, and expert analysis.`,
      url: `https://watchvswatch.com/brands/${brand.slug}`,
      type: 'website',
    },
  }
}

export default function BrandPage({ params }: { params: { slug: string } }) {
  const brand = brands.find((b) => b.slug === params.slug)
  if (!brand) notFound()

  // Filter watches by brand
  const brandWatches = watches.filter((w) => w.brand === brand.watchBrand)

  // Find comparisons that involve this brand's watches
  const brandSlugs = new Set(brandWatches.map((w) => w.slug))
  const brandComparisons = popularComparisons
    .filter((c) => brandSlugs.has(c.slug1) || brandSlugs.has(c.slug2))
    .slice(0, 6)

  // Find relevant guides and related brands
  const relevantGuides = getGuidesForBrand(brand.name).slice(0, 3)
  const relatedBrands = getRelatedBrandsByContext(brand.name).slice(0, 4)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://watchvswatch.com' },
          { '@type': 'ListItem', position: 2, name: 'Brands', item: 'https://watchvswatch.com/brands' },
          { '@type': 'ListItem', position: 3, name: brand.name, item: `https://watchvswatch.com/brands/${brand.slug}` },
        ],
      },
      {
        '@type': 'Organization',
        name: brand.name,
        foundingDate: String(brand.founded),
        foundingLocation: brand.country,
        description: brand.overview,
      },
      {
        '@type': 'FAQPage',
        mainEntity: brand.faq.map((item) => ({
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
          <Link href="/brands" className="hover:text-[#b8860b] transition-colors">Brands</Link>
          <span>/</span>
          <span className="text-[#0f172a]">{brand.name}</span>
        </nav>

        {/* Brand Hero */}
        <div className="mb-10">
          <div className="flex items-start gap-4 mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xs text-[#b8860b] font-bold uppercase tracking-wider border border-[#b8860b]/30 rounded px-2 py-0.5">
                  Est. {brand.founded}
                </span>
                <span className="text-xs text-[#94a3b8]">{brand.country}</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-[#0f172a] mb-3">{brand.name}</h1>
              <p className="text-[#b8860b] text-sm italic mb-4">{brand.heroFact}</p>
            </div>
          </div>
          <div className="text-[#475569] text-sm leading-relaxed">
            {brand.overview.split('\n\n').map((para, i) => (
              <p key={i} className={i > 0 ? 'mt-3' : ''}>{para.trim()}</p>
            ))}
          </div>
        </div>

        {/* Watches in Database with Comparisons */}
        {brandWatches.length > 0 ? (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-[#0f172a] mb-6">
              {brand.name} Watches in Our Database
              <span className="ml-3 text-sm font-normal text-[#94a3b8]">({brandWatches.length} model{brandWatches.length !== 1 ? 's' : ''})</span>
            </h2>
            <div className="space-y-6">
              {brandWatches.map((watch) => {
                const watchComparisons = getAllComparisonsForWatch(watch.slug).slice(0, 4)
                return (
                  <div key={watch.slug}>
                    <Link
                      href={`/watches/${watch.slug}`}
                      className="card p-4 flex items-center gap-4 hover:border-[#b8860b]/40 transition-colors group"
                    >
                      <div className="w-14 h-14 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] flex items-center justify-center overflow-hidden shrink-0">
                        {watch.image ? (
                          <Image
                            src={watch.image}
                            alt={watch.imageAlt ?? `${watch.brand} ${watch.name}`}
                            width={56}
                            height={56}
                            className="w-full h-full object-contain p-1"
                          />
                        ) : (
                          <span className="text-[#cbd5e1] text-xl">⌚</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[#0f172a] font-semibold group-hover:text-[#b8860b] transition-colors">{watch.name}</p>
                        <div className="flex flex-wrap gap-3 mt-1 text-xs text-[#94a3b8]">
                          <span>Ref. {watch.reference}</span>
                          <span>{watch.case_diameter_mm}mm</span>
                          <span className="capitalize">{watch.movement_type}</span>
                          <span>{watch.water_resistance_m}m WR</span>
                        </div>
                      </div>
                      <div className="text-right ml-2 shrink-0">
                        <p className="text-[#b8860b] font-semibold text-sm">{formatPrice(watch.price_new_usd)}</p>
                        <p className="text-[#94a3b8] text-xs">new</p>
                      </div>
                    </Link>
                    
                    {/* Watch-specific comparisons */}
                    {watchComparisons.length > 0 && (
                      <div className="ml-4 mt-2 pl-4 border-l-2 border-[#e2e8f0]">
                        <p className="text-xs font-semibold text-[#94a3b8] mb-2 uppercase">Compare with:</p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {watchComparisons.map(([s1, s2]) => {
                            const otherWatch = watches.find((w) => w.slug === (s1 === watch.slug ? s2 : s1))
                            if (!otherWatch) return null
                            const compSlug = getComparisonSlug(s1, s2)
                            return (
                              <Link
                                key={compSlug}
                                href={`/compare/${compSlug}`}
                                className="text-xs bg-[#f8fafc] border border-[#e2e8f0] rounded px-3 py-2 hover:bg-[#eff6ff] hover:border-[#b8860b]/40 transition-colors text-[#475569] hover:text-[#b8860b] font-medium truncate"
                              >
                                vs {otherWatch.name}
                              </Link>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </section>
        ) : (
          <section className="mb-12">
            <div className="card p-6 text-center">
              <p className="text-[#475569] text-sm mb-2">
                We do not yet have {brand.name} watches in our comparison database.
              </p>
              <p className="text-[#94a3b8] text-xs">
                We are continually expanding — check back soon.
              </p>
            </div>
          </section>
        )}

        {/* Popular Comparisons */}
        {brandComparisons.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-[#0f172a] mb-6">Popular {brand.name} Comparisons</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {brandComparisons.map((c) => {
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
                        <p className="text-[#0f172a] text-xs font-semibold truncate group-hover:text-[#b8860b] transition-colors">
                          {wa.name}
                        </p>
                      </div>
                      <div className="text-[#b8860b] font-bold text-xs shrink-0">VS</div>
                      <div className="flex-1 min-w-0 text-right">
                        <p className="text-[10px] text-[#94a3b8] uppercase">{wb.brand}</p>
                        <p className="text-[#0f172a] text-xs font-semibold truncate group-hover:text-[#b8860b] transition-colors">
                          {wb.name}
                        </p>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </section>
        )}

        {/* FAQ */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-[#0f172a] mb-6">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {brand.faq.map((item, i) => (
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

        {/* Relevant Guides Footer */}
        {relevantGuides.length > 0 && (
          <section className="mb-12">
            <h2 className="text-xl font-bold text-[#0f172a] mb-5">Buying Guides Featuring {brand.name}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {relevantGuides.map((g) => (
                <Link
                  key={g.slug}
                  href={`/guides/${g.slug}`}
                  className="card p-5 hover:border-[#b8860b]/40 transition-colors group"
                >
                  <p className="text-xs uppercase text-[#94a3b8] font-semibold mb-2">Buying Guide</p>
                  <h3 className="text-sm font-bold text-[#0f172a] group-hover:text-[#b8860b] transition-colors line-clamp-2">
                    {g.title}
                  </h3>
                  <p className="text-xs text-[#475569] mt-3 line-clamp-1">{g.description}</p>
                  <p className="text-xs text-[#b8860b] font-medium mt-4 inline-block">Read Guide →</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Related Brands Footer */}
        {relatedBrands.length > 0 && (
          <section className="mb-12">
            <h2 className="text-xl font-bold text-[#0f172a] mb-5">Similar Brands to Explore</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {relatedBrands.map((b) => (
                <Link
                  key={b.slug}
                  href={`/brands/${b.slug}`}
                  className="card p-4 hover:border-[#b8860b]/40 transition-colors group text-center"
                >
                  <h3 className="text-sm font-bold text-[#0f172a] group-hover:text-[#b8860b] transition-colors">
                    {b.name}
                  </h3>
                  <p className="text-xs text-[#475569] mt-2 line-clamp-2">{b.heroFact}</p>
                  <p className="text-xs text-[#b8860b] font-medium mt-3 inline-block">Explore Brand →</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* CTA */}
        <div className="text-center bg-white border border-[#e2e8f0] rounded-xl p-8">
          <h3 className="text-[#0f172a] font-semibold text-lg mb-2">Compare {brand.name} Watches</h3>
          <p className="text-[#475569] text-sm mb-5">
            Head-to-head specs, community ratings, and pricing against any watch in our database
          </p>
          <Link href="/compare" className="btn-gold">
            Start a Comparison
          </Link>
        </div>
      </div>
    </>
  )
}
