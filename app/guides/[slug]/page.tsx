import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { watches, popularComparisons, formatPrice } from '@/lib/watches'
import { guides } from '@/lib/guideData'
import { getRelatedGuidesByBrand } from '@/lib/relatedContent'
import GuideTableOfContents from '@/app/components/GuideTableOfContents'
import { getMdxGuideSlugs, hasMdxGuide, getMdxGuide } from '@/lib/mdxGuides'
import MdxGuidePage from './MdxGuidePage'
import RelatedGuides from '@/components/guides/RelatedGuides'
import FeaturedComparisons from '@/components/guides/FeaturedComparisons'

export async function generateStaticParams() {
  const legacySlugs = guides.map((guide) => ({ slug: guide.slug }))
  const mdxSlugs = getMdxGuideSlugs()
    .filter((s) => !guides.some((g) => g.slug === s))
    .map((s) => ({ slug: s }))
  return [...legacySlugs, ...mdxSlugs]
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const guide = guides.find((g) => g.slug === params.slug)

  // Fallback to MDX frontmatter if no legacy guide
  const title = guide?.title ?? getMdxGuide(params.slug)?.frontmatter.title
  const description = guide?.description ?? getMdxGuide(params.slug)?.frontmatter.description
  if (!title) return {}

  return {
    title,
    description,
    alternates: {
      canonical: `https://watchvswatch.com/guides/${params.slug}`,
    },
    openGraph: {
      title: `${title} | WatchVsWatch`,
      description: description ?? '',
      url: `https://watchvswatch.com/guides/${params.slug}`,
      type: 'article',
      images: [{ url: `https://watchvswatch.com/api/og?type=guide&title=${encodeURIComponent(title)}`, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: (description ?? '').slice(0, 200),
      images: [`https://watchvswatch.com/api/og?type=guide&title=${encodeURIComponent(title)}`],
    },
  }
}

export default function GuidePage({ params }: { params: { slug: string } }) {
  // MDX guides take priority
  if (hasMdxGuide(params.slug)) {
    const mdxGuide = getMdxGuide(params.slug)
    if (mdxGuide) return <MdxGuidePage mdxGuide={mdxGuide} />
  }

  const guide = guides.find((g) => g.slug === params.slug)
  if (!guide) notFound()

  // Map recommendations — some may not exist in our watch database
  const recommendedWatches = guide.recommendations.map((rec) => {
    const watch = rec.slug ? watches.find((w) => w.slug === rec.slug) : undefined
    return { rec, watch: watch ?? null }
  })

  // Find comparisons that involve any recommended watch slug (only for DB watches)
  const relatedSlugs = new Set(guide.recommendations.map((r) => r.slug).filter(Boolean) as string[])
  const relatedComparisons = popularComparisons
    .filter((c) => relatedSlugs.has(c.slug1) || relatedSlugs.has(c.slug2))
    .slice(0, 6)

  // Compute all pairs between recommended watches that exist in popularComparisons
  const recSlugList = guide.recommendations.map((r) => r.slug).filter(Boolean) as string[]
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
  // Merge internal pairs first, then other related — dedupe, max 6
  const seenComps = new Set<string>()
  const topComparisons = [...internalComparisons, ...relatedComparisons]
    .filter((c) => {
      const key = `${c.slug1}-${c.slug2}`
      if (seenComps.has(key)) return false
      seenComps.add(key)
      return true
    })
    .slice(0, 6)

  // Prioritize cross-brand comparisons, limit to 4
  const crossBrandComps = topComparisons.filter((c) => {
    const wa = watches.find((w) => w.slug === c.slug1)
    const wb = watches.find((w) => w.slug === c.slug2)
    return wa && wb && wa.brand !== wb.brand
  })
  const sameBrandComps = topComparisons.filter((c) => {
    const wa = watches.find((w) => w.slug === c.slug1)
    const wb = watches.find((w) => w.slug === c.slug2)
    return wa && wb && wa.brand === wb.brand
  })
  const curatedComparisons = [...crossBrandComps, ...sameBrandComps].slice(0, 4)

  // Find related guides and brands
  const relatedGuides = getRelatedGuidesByBrand(guide.slug)
// Compute read time and stats
  const allText = [
    guide.h1,
    guide.intro,
    guide.description,
    ...guide.buyingGuide.map(s => s.heading + ' ' + s.content),
    ...guide.faq.map(f => f.question + ' ' + f.answer),
    guide.conclusion,
  ].join(' ')
  const readTime = Math.ceil(allText.split(' ').length / 200)

  // Merge FAQ + PAA into one list for display
  const allQuestions = [
    ...guide.faq.map((q) => ({ ...q, source: 'faq' as const })),
    ...(guide.paa ?? []).map((q) => ({ ...q, source: 'paa' as const })),
  ]

  // Generate IDs for buying guide subsections
  const buyingGuideSectionIds = guide.buyingGuide.map((section) => ({
    id: `guide-${section.heading.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}`,
    heading: section.heading,
  }))

  // TOC sections
  const tocSections = [
    { id: 'quick-specs', label: 'Quick Specs' },
    { id: 'our-picks', label: 'Our Picks' },
    ...(curatedComparisons.length > 0 ? [{ id: 'compare-head-to-head', label: 'Compare Head-to-Head' }] : []),
    { id: 'buying-guide', label: 'Buying Guide' },
    { id: 'faq', label: 'Common Questions' },
    { id: 'verdict', label: 'Our Verdict' },
    ...(relatedGuides.length > 0 ? [{ id: 'more-guides', label: 'More Guides' }] : []),
  ]

  // Find the first watch image for schema
  const schemaImage = recommendedWatches.find(({ watch }) => watch?.image && !watch.image.endsWith('.svg'))?.watch?.image

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
        datePublished: '2026-01-15',
        dateModified: '2026-03-20',
        author: {
          '@type': 'Organization',
          name: 'WatchVsWatch',
          url: 'https://watchvswatch.com',
        },
        publisher: {
          '@type': 'Organization',
          name: 'WatchVsWatch',
          url: 'https://watchvswatch.com',
          logo: {
            '@type': 'ImageObject',
            url: 'https://watchvswatch.com/logo.png',
          },
        },
        ...(schemaImage ? { image: `https://watchvswatch.com${schemaImage}` } : {}),
      },
      {
        '@type': 'FAQPage',
        mainEntity: allQuestions.map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: item.answer,
          },
        })),
      },
      {
        '@type': 'ItemList',
        itemListElement: recommendedWatches.map(({ rec, watch }, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: watch ? `${watch.brand} ${watch.name}` : `${rec.brand ?? ''} ${rec.name ?? ''}`.trim(),
          ...(watch ? { url: `https://watchvswatch.com/watches/${watch.slug}` } : {}),
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          {/* Breadcrumb */}
          <nav className="text-sm text-textMuted mb-6 flex items-center gap-2" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-accent transition-colors">Home</Link>
            <span aria-hidden="true" className="text-textMuted">›</span>
            <Link href="/guides" className="hover:text-accent transition-colors">Guides</Link>
            <span aria-hidden="true" className="text-textMuted">›</span>
            <span className="text-textPrimary">{guide.h1}</span>
          </nav>

          {/* Category Badge */}
          <div className="flex items-center gap-3 mb-4">
            <span className="inline-block text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-accentLight text-accent border border-borderStrong">
              Buying Guide
            </span>
            <span className="text-xs text-textMuted flex items-center gap-1">
              📖 {readTime} min read
            </span>
          </div>

          <h1 className="text-3xl md:text-5xl font-heading font-bold text-textPrimary mb-4">{guide.h1}</h1>
          <p className="text-lg text-textSecond leading-relaxed mb-6">{guide.description}</p>

          {/* Stats bar */}
          <div className="flex flex-wrap gap-4 text-sm text-textSecond">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-accent"></span>
              {recommendedWatches.length} watches reviewed
            </span>
            {curatedComparisons.length > 0 && (
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-accent"></span>
                {curatedComparisons.length} head-to-head comparisons
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-accent"></span>
              Updated 2026
            </span>
          </div>
        </div>
      </div>

      {/* Mobile TOC */}
      <div className="lg:hidden sticky top-16 z-40 bg-white/95 backdrop-blur border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="flex gap-4 overflow-x-auto py-2.5 scrollbar-hide">
            {tocSections.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="text-xs text-textSecond hover:text-accent whitespace-nowrap shrink-0 transition-colors"
              >
                {s.label}
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex gap-8">
        {/* Sticky TOC Sidebar */}
        <GuideTableOfContents sections={tocSections} />
        <div className="flex-1 min-w-0">
        {/* Intro — collapsed to first paragraph with expand */}
        {(() => {
          const paragraphs = guide.intro.split('\n\n')
          const firstPara = paragraphs[0]
          const restParas = paragraphs.slice(1)
          return (
            <div className="text-textSecond leading-relaxed mb-10 space-y-4">
              <p>{firstPara.trim()}</p>
              {restParas.length > 0 && (
                <details className="group">
                  <summary className="text-sm text-accent cursor-pointer hover:underline list-none inline-flex items-center gap-1">
                    Read more about this category
                    <span className="group-open:rotate-180 transition-transform">▾</span>
                  </summary>
                  <div className="mt-4 space-y-4">
                    {restParas.map((para, i) => (
                      <p key={i}>{para.trim()}</p>
                    ))}
                  </div>
                </details>
              )}
            </div>
          )
        })()}

        {/* Quick Specs Table */}
        {recommendedWatches.length > 1 && (
          <section id="quick-specs" className="mb-12 scroll-mt-24">
            <h2 className="text-2xl font-heading font-bold text-textPrimary mb-4">At a Glance</h2>
            <p className="text-sm text-textSecond mb-4">Compare key specs across all picks in this guide</p>
            <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
              <table className="w-full text-sm border border-border rounded-sm overflow-hidden">
                <thead>
                  <tr className="bg-neutral text-textPrimary text-left">
                    <th className="px-3 py-2.5 font-semibold text-xs uppercase tracking-wider border-b border-border">Watch</th>
                    <th className="px-3 py-2.5 font-semibold text-xs uppercase tracking-wider border-b border-border">Price</th>
                    <th className="px-3 py-2.5 font-semibold text-xs uppercase tracking-wider border-b border-border">Size</th>
                    <th className="px-3 py-2.5 font-semibold text-xs uppercase tracking-wider border-b border-border">Movement</th>
                    <th className="px-3 py-2.5 font-semibold text-xs uppercase tracking-wider border-b border-border">WR</th>
                    <th className="px-3 py-2.5 font-semibold text-xs uppercase tracking-wider border-b border-border">Crystal</th>
                  </tr>
                </thead>
                <tbody>
                  {recommendedWatches.map(({ rec, watch }, i) => {
                    const brand = watch?.brand ?? rec.brand ?? ''
                    const name = watch?.name ?? rec.name ?? ''
                    const price = watch ? formatPrice(watch.price_new_usd) : rec.priceRange ?? '—'
                    const size = watch?.case_diameter_mm ?? rec.caseSizeMm
                    const movement = watch?.movement_type ?? rec.movementType ?? '—'
                    const wr = watch?.water_resistance_m ?? rec.waterResistanceM
                    const crystal = watch?.crystal ?? rec.crystal ?? '—'
                    const key = watch?.slug ?? `ext-${i}`
                    return (
                      <tr key={key} className={`border-b border-border ${i % 2 === 0 ? 'bg-surface' : 'bg-surfaceAlt'}`}>
                        <td className="px-3 py-2.5">
                          {watch ? (
                            <Link href={`/watches/${watch.slug}`} className="text-accent hover:underline font-medium whitespace-nowrap">
                              {brand} {name}
                            </Link>
                          ) : (
                            <span className="font-medium whitespace-nowrap text-textPrimary">{brand} {name}</span>
                          )}
                        </td>
                        <td className="px-3 py-2.5 text-textSecond whitespace-nowrap">{price}</td>
                        <td className="px-3 py-2.5 text-textSecond whitespace-nowrap">{size ? `${size}mm` : '—'}</td>
                        <td className="px-3 py-2.5 text-textSecond capitalize whitespace-nowrap">{movement}</td>
                        <td className="px-3 py-2.5 text-textSecond whitespace-nowrap">{wr ? `${wr}m` : '—'}</td>
                        <td className="px-3 py-2.5 text-textSecond capitalize whitespace-nowrap">{crystal}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Recommendations */}
        <section id="our-picks" className="mb-12 scroll-mt-24">
          <h2 className="text-2xl font-heading font-bold text-textPrimary mb-6">Our Picks</h2>
          <div className="space-y-6">
            {recommendedWatches.map(({ rec, watch }, index) => {
              const brand = watch?.brand ?? rec.brand ?? ''
              const name = watch?.name ?? rec.name ?? ''
              const size = watch?.case_diameter_mm ?? rec.caseSizeMm
              const movement = watch?.movement_type ?? rec.movementType
              const price = watch ? formatPrice(watch.price_new_usd) : rec.priceRange
              const wr = watch?.water_resistance_m ?? rec.waterResistanceM
              const hasImage = watch?.image && !watch.image.endsWith('.svg')
              const key = watch?.slug ?? `ext-${index}`
              return (
                <div key={key} className="card p-6">
                  <div className="flex items-start gap-4">
                    <div className="shrink-0 w-10 h-10 bg-accentLight border border-borderStrong rounded-full flex items-center justify-center">
                      <span className="text-accent font-bold text-sm">{index + 1}</span>
                    </div>
                    {hasImage && (
                      <div className="shrink-0 w-20 h-20 rounded-sm bg-neutral border border-border overflow-hidden">
                        <Image src={watch!.image!} alt={name} width={80} height={80} className="w-20 h-20 object-contain" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="text-xs text-accent font-bold uppercase tracking-wider">{brand}</span>
                        <span className="text-textPrimary font-bold text-lg">{name}</span>
                        {rec.reference && <span className="text-xs text-textMuted">({rec.reference})</span>}
                      </div>
                      <div className="flex flex-wrap gap-3 text-xs text-textMuted mb-3">
                        {size && <span>{size}mm case</span>}
                        {movement && <span>{movement}</span>}
                        {price && <span>{price}{watch ? ' new' : ''}</span>}
                        {wr && wr >= 50 && <span>{wr}m WR</span>}
                      </div>
                      <p className="text-textSecond text-sm leading-relaxed mb-4">{rec.highlight}</p>
                      {watch && (
                        <div className="flex flex-wrap gap-3">
                          <Link
                            href={`/watches/${watch.slug}`}
                            className="text-xs text-accent hover:underline font-medium"
                          >
                            Full specs →
                          </Link>
                          <Link
                            href={`/compare?a=${watch.slug}`}
                            className="text-xs text-textMuted hover:text-accent hover:underline font-medium transition-colors"
                          >
                            Compare →
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* Compare These Watches — cross-brand prioritized, capped at 4 */}
        {curatedComparisons.length > 0 && (
          <section id="compare-head-to-head" className="mb-12 scroll-mt-24">
            <h2 className="text-xl font-heading font-bold text-textPrimary mb-2">Compare These Watches Head-to-Head</h2>
            <p className="text-sm text-textSecond mb-5">Side-by-side specs, community votes, and expert scores</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {curatedComparisons.map((c) => {
                const wa = watches.find((w) => w.slug === c.slug1)
                const wb = watches.find((w) => w.slug === c.slug2)
                if (!wa || !wb) return null
                return (
                  <Link
                    key={`${c.slug1}-${c.slug2}`}
                    href={`/compare/${c.slug1}-vs-${c.slug2}`}
                    className="card p-4 hover:border-borderStrong hover:-translate-y-0.5 hover:shadow-md transition-all group"
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
                    <p className="text-[10px] text-accent font-medium mt-2">Compare →</p>
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
            {guide.buyingGuide.map((section, idx) => (
              <div key={section.heading} id={buyingGuideSectionIds[idx].id} className="card p-6 scroll-mt-24">
                <h3 className="text-textPrimary font-heading font-semibold text-lg mb-3">{section.heading}</h3>
                <div className="text-textSecond text-sm leading-relaxed space-y-3">
                  {section.content.split('\n\n').map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Merged FAQ + PAA as "Common Questions" */}
        {allQuestions.length > 0 && (
          <section id="faq" className="mb-12 scroll-mt-24">
            <h2 className="text-2xl font-heading font-bold text-textPrimary mb-6">Common Questions</h2>
            <div className="space-y-4">
              {allQuestions.map((item, i) => (
                <details key={i} className="card p-5 group cursor-pointer">
                  <summary className="text-textPrimary font-semibold flex justify-between items-center list-none">
                    <span>{item.question}</span>
                    <span className="text-accent group-open:rotate-180 transition-transform ml-4 shrink-0">▼</span>
                  </summary>
                  <div className="text-textSecond text-sm mt-4 leading-relaxed space-y-3">
                    {item.answer.split('\n\n').map((para, pi) => (
                      <p key={pi}>{para}</p>
                    ))}
                  </div>
                </details>
              ))}
            </div>
          </section>
        )}

        {/* Conclusion / Verdict */}
        <section id="verdict" className="mb-12 bg-neutral border border-border rounded-sm p-6 scroll-mt-24">
          <h2 className="text-lg font-heading font-bold text-textPrimary mb-3">Our Verdict</h2>
          <div className="text-textSecond text-sm leading-relaxed space-y-3">
            {guide.conclusion.split('\n\n').map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        </section>

        {/* Browse All Strip — moved below content */}
        <div className="mb-12 flex items-center justify-between bg-neutral border border-border rounded-sm px-5 py-3">
          <p className="text-sm text-textSecond">Browse and filter the full watch database by score, price, and style</p>
          <Link href="/watches?sort=score" className="text-sm font-semibold text-accent hover:underline shrink-0 ml-4">
            Browse All Watches →
          </Link>
        </div>

        {/* Related Guides Footer */}
        {relatedGuides.length > 0 && (
          <section id="more-guides" className="mb-12 scroll-mt-24">
            <h2 className="text-xl font-heading font-bold text-textPrimary mb-5">More Buying Guides</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {relatedGuides.map((g) => {
                const gFull = guides.find((gd) => gd.slug === g.slug)
                const previewWatches = gFull
                  ? gFull.recommendations
                      .map((rec) => rec.slug ? watches.find((w) => w.slug === rec.slug) : undefined)
                      .filter((w): w is NonNullable<typeof w> & { image: string } => !!w && typeof w.image === 'string' && !w.image.endsWith('.svg'))
                      .slice(0, 3)
                  : []
                return (
                  <Link
                    key={g.slug}
                    href={`/guides/${g.slug}`}
                    className="card p-5 hover:border-borderStrong hover:-translate-y-0.5 hover:shadow-md transition-all group"
                  >
                    {previewWatches.length > 0 && (
                      <div className="flex gap-1 mb-3">
                        {previewWatches.map((w) => (
                          <div key={w.slug} className="h-10 w-10 rounded-md bg-surface border border-border overflow-hidden shrink-0">
                            <Image src={w.image!} alt={w.name} width={40} height={40} className="h-10 w-10 object-contain" />
                          </div>
                        ))}
                      </div>
                    )}
                    <p className="text-xs uppercase text-textMuted font-semibold mb-2">Buying Guide</p>
                    <h3 className="text-sm font-bold text-textPrimary group-hover:text-accent transition-colors line-clamp-2">
                      {g.title}
                    </h3>
                    <p className="text-xs text-textSecond mt-3 line-clamp-1">{g.description}</p>
                    <p className="text-xs text-accent font-medium mt-4 inline-block">Read Guide →</p>
                  </Link>
                )
              })}
            </div>
          </section>
        )}

{/* CTA */}
        <div className="text-center bg-neutral border border-border rounded-sm p-8">
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
