import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { watches, popularComparisons, formatPrice } from '@/lib/watches'
import { brands } from '@/lib/brandData'
import { getGuidesForBrand, getRelatedBrandsByContext, getAllComparisonsForWatch, getComparisonSlug } from '@/lib/relatedContent'
import BrandWatchCard from '@/components/BrandWatchCard'

const categoryMeta: Record<string, { label: string; description: string }> = {
  dive: { label: 'Dive Watches', description: 'Built for the water — robust, legible, and rated for serious depth resistance.' },
  dress: { label: 'Dress Watches', description: 'Elegant timepieces designed for formal occasions and refined everyday wear.' },
  sport: { label: 'Sport Watches', description: 'Versatile and durable — equally at home on the wrist during active pursuits.' },
  gmt: { label: 'GMT & Travel', description: 'Dual-timezone capability for frequent travelers and global professionals.' },
  field: { label: 'Field Watches', description: 'Military-inspired designs built for legibility and outdoor durability.' },
  casual: { label: 'Casual & Everyday', description: 'Approachable designs for daily wear — style without the formality.' },
  chronograph: { label: 'Chronographs', description: 'Precision timing with stopwatch functionality and sporty aesthetics.' },
}

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

  // Group watches by primary_category for collection-style display
  const collections: Record<string, typeof brandWatches> = {}
  brandWatches.forEach((w) => {
    const cat = w.primary_category || 'other'
    if (!collections[cat]) collections[cat] = []
    collections[cat].push(w)
  })

  // Sort collection keys: larger groups first
  const sortedCategories = Object.keys(collections).sort(
    (a, b) => collections[b].length - collections[a].length
  )

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

  // Whether we have enough watches to warrant grouping (2+ categories with watches)
  const useGrouping = sortedCategories.length > 1

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Breadcrumb */}
        <nav className="text-sm text-textMuted mb-8 flex items-center gap-2">
          <Link href="/" className="hover:text-accent transition-colors">Home</Link>
          <span className="text-border">/</span>
          <Link href="/brands" className="hover:text-accent transition-colors">Brands</Link>
          <span className="text-border">/</span>
          <span className="text-textPrimary font-medium">{brand.name}</span>
        </nav>

        {/* Brand Hero */}
        <header className="mb-12">
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <span className="text-xs text-accent font-bold uppercase tracking-wider border border-accent/30 rounded-full px-3 py-1">
              Est. {brand.founded}
            </span>
            <span className="text-xs text-textMuted">{brand.country}</span>
            {brandWatches.length > 0 && (
              <span className="text-xs text-textSecond bg-neutral px-3 py-1 rounded-full">
                {brandWatches.length} model{brandWatches.length !== 1 ? 's' : ''} in database
              </span>
            )}
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-textPrimary mb-4 tracking-tight">
            {brand.name}
          </h1>
          <p className="text-accent text-sm italic mb-6 max-w-2xl">{brand.heroFact}</p>
          <div className="text-textSecond text-sm leading-relaxed max-w-3xl">
            {brand.overview.split('\n\n').map((para, i) => (
              <p key={i} className={i > 0 ? 'mt-3' : ''}>{para.trim()}</p>
            ))}
          </div>
        </header>

        {/* Watch Collections */}
        {brandWatches.length > 0 ? (
          <section className="mb-16">
            <div className="flex items-baseline justify-between mb-8">
              <h2 className="text-2xl font-heading font-bold text-textPrimary">
                {brand.name} Collection
              </h2>
              {useGrouping && (
                <p className="text-xs text-textMuted hidden sm:block">
                  {sortedCategories.length} categories
                </p>
              )}
            </div>

            {useGrouping ? (
              /* Grouped by collection/category */
              <div className="space-y-12">
                {sortedCategories.map((cat) => {
                  const meta = categoryMeta[cat] ?? { label: cat.charAt(0).toUpperCase() + cat.slice(1), description: '' }
                  const catWatches = collections[cat]
                  return (
                    <div key={cat}>
                      <div className="mb-5">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-lg font-heading font-bold text-textPrimary">
                            {meta.label}
                          </h3>
                          <span className="text-xs text-textMuted bg-neutral px-2 py-0.5 rounded-full">
                            {catWatches.length}
                          </span>
                        </div>
                        {meta.description && (
                          <p className="text-xs text-textSecond max-w-xl">{meta.description}</p>
                        )}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {catWatches.map((watch) => (
                          <BrandWatchCard key={watch.slug} watch={watch} />
                        ))}
                      </div>

                      {/* Per-collection comparison links */}
                      {catWatches.length > 0 && (() => {
                        const catComparisons = catWatches.flatMap(watch => {
                          return getAllComparisonsForWatch(watch.slug).slice(0, 2).map(([s1, s2]) => {
                            const otherSlug = s1 === watch.slug ? s2 : s1
                            const other = watches.find(w => w.slug === otherSlug)
                            if (!other) return null
                            return { s1, s2, watchName: watch.name, otherName: other.name, otherBrand: other.brand }
                          }).filter(Boolean)
                        }).slice(0, 4)
                        if (catComparisons.length === 0) return null
                        return (
                          <div className="mt-4 flex flex-wrap gap-2">
                            {catComparisons.map((c) => {
                              if (!c) return null
                              const slug = getComparisonSlug(c.s1, c.s2)
                              return (
                                <Link
                                  key={slug}
                                  href={`/compare/${slug}`}
                                  className="text-xs bg-neutral border border-border rounded-full px-3 py-1.5 hover:bg-accentLight hover:border-accent/30 transition-colors text-textSecond hover:text-accent font-medium"
                                >
                                  {c.watchName} vs {c.otherName}
                                </Link>
                              )
                            })}
                          </div>
                        )
                      })()}
                    </div>
                  )
                })}
              </div>
            ) : (
              /* Single category — flat grid */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {brandWatches.map((watch) => (
                  <BrandWatchCard key={watch.slug} watch={watch} />
                ))}
              </div>
            )}
          </section>
        ) : (
          <section className="mb-16">
            <div className="bg-surface border border-border rounded-lg p-8 text-center">
              <p className="text-textSecond text-sm mb-2">
                We do not yet have {brand.name} watches in our comparison database.
              </p>
              <p className="text-textMuted text-xs">
                We are continually expanding — check back soon.
              </p>
            </div>
          </section>
        )}

        {/* Popular Comparisons */}
        {brandComparisons.length > 0 && (
          <section className="mb-16">
            <h2 className="text-2xl font-heading font-bold text-textPrimary mb-6">
              Popular {brand.name} Comparisons
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {brandComparisons.map((c) => {
                const wa = watches.find((w) => w.slug === c.slug1)
                const wb = watches.find((w) => w.slug === c.slug2)
                if (!wa || !wb) return null
                return (
                  <Link
                    key={`${c.slug1}-${c.slug2}`}
                    href={`/compare/${c.slug1}-vs-${c.slug2}`}
                    className="bg-surface border border-border rounded-lg p-5 hover:border-accent/40 hover:-translate-y-0.5 hover:shadow-md transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] text-textMuted uppercase tracking-wider">{wa.brand}</p>
                        <p className="text-textPrimary text-sm font-semibold truncate group-hover:text-accent transition-colors">
                          {wa.name}
                        </p>
                        <p className="text-xs text-accent font-medium mt-0.5">{formatPrice(wa.price_new_usd)}</p>
                      </div>
                      <div className="text-accent font-bold text-xs shrink-0 bg-neutral w-8 h-8 rounded-full flex items-center justify-center">
                        VS
                      </div>
                      <div className="flex-1 min-w-0 text-right">
                        <p className="text-[10px] text-textMuted uppercase tracking-wider">{wb.brand}</p>
                        <p className="text-textPrimary text-sm font-semibold truncate group-hover:text-accent transition-colors">
                          {wb.name}
                        </p>
                        <p className="text-xs text-accent font-medium mt-0.5">{formatPrice(wb.price_new_usd)}</p>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </section>
        )}

        {/* FAQ */}
        <section className="mb-16">
          <h2 className="text-2xl font-heading font-bold text-textPrimary mb-6">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {brand.faq.map((item, i) => (
              <details key={i} className="bg-surface border border-border rounded-lg p-5 group cursor-pointer">
                <summary className="text-textPrimary font-semibold text-sm flex justify-between items-center list-none">
                  <span>{item.question}</span>
                  <span className="text-accent group-open:rotate-180 transition-transform ml-4 shrink-0 text-xs">▼</span>
                </summary>
                <p className="text-textSecond text-sm mt-4 leading-relaxed">{item.answer}</p>
              </details>
            ))}
          </div>
        </section>

        {/* Relevant Guides */}
        {relevantGuides.length > 0 && (
          <section className="mb-16">
            <h2 className="text-xl font-heading font-bold text-textPrimary mb-5">Buying Guides Featuring {brand.name}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {relevantGuides.map((g) => (
                <Link
                  key={g.slug}
                  href={`/guides/${g.slug}`}
                  className="bg-surface border border-border rounded-lg p-5 hover:border-accent/40 hover:-translate-y-0.5 hover:shadow-md transition-all group"
                >
                  <p className="text-[10px] uppercase text-textMuted font-semibold tracking-wider mb-2">Buying Guide</p>
                  <h3 className="text-sm font-bold text-textPrimary group-hover:text-accent transition-colors line-clamp-2">
                    {g.title}
                  </h3>
                  <p className="text-xs text-textSecond mt-3 line-clamp-2">{g.description}</p>
                  <p className="text-xs text-accent font-medium mt-4 inline-block">Read Guide →</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Related Brands */}
        {relatedBrands.length > 0 && (
          <section className="mb-16">
            <h2 className="text-xl font-heading font-bold text-textPrimary mb-5">Similar Brands to Explore</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {relatedBrands.map((b) => (
                <Link
                  key={b.slug}
                  href={`/brands/${b.slug}`}
                  className="bg-surface border border-border rounded-lg p-5 hover:border-accent/40 hover:-translate-y-0.5 hover:shadow-md transition-all group text-center"
                >
                  <h3 className="text-sm font-bold text-textPrimary group-hover:text-accent transition-colors">
                    {b.name}
                  </h3>
                  <p className="text-xs text-textSecond mt-2 line-clamp-2">{b.heroFact}</p>
                  <p className="text-xs text-accent font-medium mt-3 inline-block">Explore →</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* CTA */}
        <div className="text-center bg-neutral border border-border rounded-xl p-10">
          <h3 className="text-textPrimary font-heading font-bold text-xl mb-3">Compare {brand.name} Watches</h3>
          <p className="text-textSecond text-sm mb-6 max-w-md mx-auto">
            Head-to-head specs, community ratings, and pricing against any watch in our database.
          </p>
          <Link href="/compare" className="btn-gold">
            Start a Comparison
          </Link>
        </div>
      </div>
    </>
  )
}
