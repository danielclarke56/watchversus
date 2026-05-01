export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { getGuideBySlug, buyingGuides, type BuyingGuideData } from '@/lib/buyingGuideData'
import { db } from '@/lib/db'
import { photos } from '@/lib/db/schema'
import { eq, and, ilike, or, desc } from 'drizzle-orm'
import { buildPhotoAltText } from '@/lib/photoAlt'

interface Props {
  params: { slug: string }
}

export function generateStaticParams() {
  return buyingGuides.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const entry = getGuideBySlug(params.slug)
  if (!entry) return { title: 'Not Found | Watchems' }

  const title = `${entry.name} — Buying Guide | Watchems`
  const description = `A buying guide for watches ${entry.shortLabel.toLowerCase()}. Notable models for different use cases, what to expect at this price, and honest trade-offs — from the Watchems community.`

  return {
    title,
    description,
    alternates: { canonical: `https://watchems.com/buying-guide/${entry.slug}` },
    openGraph: { title, description, url: `https://watchems.com/buying-guide/${entry.slug}`, type: 'article', siteName: 'Watchems' },
    twitter: { card: 'summary', title, description },
  }
}

export default async function BuyingGuidePage({ params }: Props) {
  const entry = getGuideBySlug(params.slug) as BuyingGuideData
  if (!entry) notFound()

  // Adjacent price tiers for navigation strip
  const currentIndex = buyingGuides.findIndex((p) => p.slug === entry.slug)
  const otherTiers = buyingGuides.filter((_, i) => i !== currentIndex)

  const brandNames = Array.from(new Set(entry.notableModels.map((m) => m.brandName)))
  const brandConditions = brandNames.map((b) => ilike(photos.brandName, b))

  let communityPhotos = await db
    .select({ id: photos.id, slug: photos.slug, url: photos.url, thumbnailUrl: photos.thumbnailUrl, brandName: photos.brandName, modelName: photos.modelName, userName: photos.userName })
    .from(photos)
    .where(and(eq(photos.status, 'approved'), or(...brandConditions)))
    .orderBy(desc(photos.createdAt))
    .limit(8)

  if (communityPhotos.length < 4) {
    communityPhotos = await db
      .select({ id: photos.id, slug: photos.slug, url: photos.url, thumbnailUrl: photos.thumbnailUrl, brandName: photos.brandName, modelName: photos.modelName, userName: photos.userName })
      .from(photos)
      .where(and(eq(photos.status, 'approved'), eq(photos.estimatedPrice, entry.dbValue)))
      .orderBy(desc(photos.createdAt))
      .limit(8)
  }

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://watchems.com' },
      { '@type': 'ListItem', position: 2, name: 'Buying Guides', item: 'https://watchems.com/buying-guides' },
      { '@type': 'ListItem', position: 3, name: entry.name, item: `https://watchems.com/buying-guide/${entry.slug}` },
    ],
  }

  const articleJsonLd = {
    '@context': 'https://schema.org', '@type': 'Article',
    headline: entry.name, description: entry.intro,
    url: `https://watchems.com/buying-guide/${entry.slug}`,
    dateModified: new Date().toISOString(),
    author: { '@type': 'Organization', name: 'Watchems Editorial', url: 'https://watchems.com' },
    publisher: { '@type': 'Organization', name: 'Watchems', url: 'https://watchems.com', logo: { '@type': 'ImageObject', url: 'https://watchems.com/logo.svg' } },
  }

  const itemListJsonLd = {
    '@context': 'https://schema.org', '@type': 'ItemList',
    name: `Notable watches ${entry.shortLabel.toLowerCase()}`,
    numberOfItems: entry.notableModels.length,
    itemListElement: entry.notableModels.map((m, i) => ({ '@type': 'ListItem', position: i + 1, name: m.name, description: m.reason })),
  }

  const faqJsonLd = {
    '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: entry.faq.map(({ question, answer }) => ({ '@type': 'Question', name: question, acceptedAnswer: { '@type': 'Answer', text: answer } })),
  }

  const speakableJsonLd = {
    '@context': 'https://schema.org', '@type': 'SpeakableSpecification',
    cssSelector: ['h1', '.guide-intro', '.price-hero-fact', '.price-overview', '.comparison-table', '.notable-models-list', '.faq-answer'],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(speakableJsonLd) }} />

      {/* Page shell — wider outer container, narrower prose column */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6">

        {/* ── HEADER ZONE ── */}
        <div className="pt-8 pb-10 border-b border-gray-100">

          {/* Breadcrumb */}
          <nav className="text-xs text-gray-400 mb-8 flex items-center gap-1.5">
            <Link href="/" className="hover:text-gray-600 transition-colors">Home</Link>
            <span className="text-gray-300">/</span>
            <Link href="/buying-guides" className="hover:text-gray-600 transition-colors">Buying Guides</Link>
            <span className="text-gray-300">/</span>
            <span className="text-gray-500">{entry.shortLabel}</span>
          </nav>

          {/* Eyebrow + Title */}
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">
            Watchems Guide
          </p>
          <h1 className="text-4xl sm:text-5xl font-semibold text-gray-900 tracking-tight leading-[1.1] mb-5">
            {entry.name}
          </h1>

          {/* Meta row */}
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <span>Updated {entry.lastUpdated}</span>
            <span className="w-px h-3 bg-gray-200" />
            <span>{entry.notableModels.length} picks verified</span>
            <span className="w-px h-3 bg-gray-200" />
            <span>Watchems Editorial</span>
          </div>
        </div>

        {/* ── TIER NAVIGATION STRIP ── */}
        <nav className="py-4 border-b border-gray-100 overflow-x-auto scrollbar-hide">
          <div className="flex items-center gap-1 min-w-max">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest mr-2 shrink-0">Other budgets</span>
            {otherTiers.map((tier) => (
              <Link
                key={tier.slug}
                href={`/buying-guide/${tier.slug}`}
                className="text-xs font-medium text-gray-500 hover:text-gray-900 bg-white hover:bg-gray-50 border border-gray-200 hover:border-gray-300 rounded-full px-3 py-1 transition-colors whitespace-nowrap"
              >
                {tier.shortLabel}
              </Link>
            ))}
          </div>
        </nav>

        {/* ── PROSE ZONE — constrained reading column ── */}
        <div className="max-w-2xl py-10">

          {/* Lede / intro — typographically distinct */}
          <p className="guide-intro text-lg text-gray-900 leading-relaxed font-normal mb-8">
            {entry.intro}
          </p>

          {/* Hero fact — dark pull-quote */}
          <figure className="my-10 -mx-4 sm:-mx-6">
            <blockquote className="bg-gray-900 px-6 sm:px-8 py-7">
              <p className="price-hero-fact text-base font-medium text-white leading-relaxed italic">
                &ldquo;{entry.heroFact}&rdquo;
              </p>
            </blockquote>
          </figure>

          {/* Overview — editorial prose */}
          <div className="price-overview space-y-5 mb-12">
            {entry.overview.split('\n\n').map((para, i) => (
              <p key={i} className="text-base text-gray-600 leading-[1.8]">
                {para.trim()}
              </p>
            ))}
          </div>

          {/* Who it's for */}
          {entry.whoItIsFor && entry.whoItIsFor.length > 0 && (
            <div className="mt-10 pt-8 border-t border-gray-100">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-5">Who this guide is for</p>
              <ul className="space-y-4">
                {entry.whoItIsFor.map((item) => (
                  <li key={item.profile} className="flex gap-4">
                    <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-gray-300 shrink-0 mt-2" />
                    <div>
                      <span className="text-base font-semibold text-gray-900">{item.profile}. </span>
                      <span className="text-base text-gray-600 leading-relaxed">{item.description}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

        </div>

        {/* ── DATA ZONE — full 3xl width ── */}

        {/* Section: Quick picks */}
        {entry.pickByUseCase && entry.pickByUseCase.length > 0 && (
          <section className="mb-14">
            <div className="flex items-center gap-3 mb-5">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">By use case</span>
              <span className="flex-1 h-px bg-gray-100" />
            </div>
            <div className="border border-gray-100 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-widest">If you want&hellip;</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-widest">Worth considering</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {entry.pickByUseCase.map((row) => (
                    <tr key={row.useCase} className="bg-white hover:bg-gray-50/60 transition-colors">
                      <td className="px-5 py-3.5 text-base text-gray-600">{row.useCase}</td>
                      <td className="px-5 py-3.5 text-base font-semibold text-gray-900">{row.model}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Section: Comparison table */}
        <section className="mb-14">
          <div className="flex items-center gap-3 mb-5">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Side-by-side</span>
            <span className="flex-1 h-px bg-gray-100" />
          </div>
          <div className="comparison-table overflow-x-auto border border-gray-100 rounded-xl">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-widest whitespace-nowrap">Model</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-widest whitespace-nowrap">Price</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-widest whitespace-nowrap hidden sm:table-cell">Case</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-widest whitespace-nowrap hidden sm:table-cell">WR</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-widest whitespace-nowrap hidden md:table-cell">Crystal</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-widest whitespace-nowrap hidden md:table-cell">Movement</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-widest whitespace-nowrap">Best for</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {entry.notableModels.map((model) => (
                  <tr key={model.name} className="bg-white hover:bg-gray-50/60 transition-colors">
                    <td className="px-4 py-3.5 font-semibold text-gray-900 whitespace-nowrap">{model.name}</td>
                    <td className="px-4 py-3.5 font-semibold text-gray-900 whitespace-nowrap tabular-nums">{model.price}</td>
                    <td className="px-4 py-3.5 text-gray-500 hidden sm:table-cell whitespace-nowrap">{model.caseSize}</td>
                    <td className="px-4 py-3.5 text-gray-500 hidden sm:table-cell whitespace-nowrap">{model.waterResistance}</td>
                    <td className="px-4 py-3.5 text-gray-500 hidden md:table-cell whitespace-nowrap">{model.crystal}</td>
                    <td className="px-4 py-3.5 text-gray-500 hidden md:table-cell whitespace-nowrap">{model.movement}</td>
                    <td className="px-4 py-3.5 text-gray-400 whitespace-nowrap">{model.bestFor}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Section: Community wrist shots */}
        {communityPhotos.length > 0 && (
          <section className="mb-14">
            <div className="flex items-center gap-3 mb-5">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">From the community</span>
              <span className="flex-1 h-px bg-gray-100" />
              <span className="text-xs text-gray-400 uppercase tracking-widest">Real wrist shots</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {communityPhotos.map((photo) => (
                <Link
                  key={photo.id}
                  href={`/photo/${photo.slug ?? photo.id}`}
                  className="group block rounded-lg overflow-hidden border border-gray-100 hover:border-gray-300 transition-all hover:shadow-md"
                >
                  <div className="aspect-square bg-gray-50 overflow-hidden relative">
                    <Image
                      src={photo.thumbnailUrl ?? photo.url}
                      alt={buildPhotoAltText(photo)}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 640px) 50vw, 25vw"
                    />
                  </div>
                  <div className="px-2.5 py-2">
                    <p className="text-xs text-gray-400 truncate">
                      {[photo.brandName, photo.modelName].filter(Boolean).join(' ') || 'Unknown'}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Section: Our picks explained — with spec badges */}
        {entry.notableModels.length > 0 && (
          <section className="mb-14">
            <div className="flex items-center gap-3 mb-5">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Notable watches — explained</span>
              <span className="flex-1 h-px bg-gray-100" />
            </div>
            <ul className="notable-models-list space-y-3">
              {entry.notableModels.map((model, i) => (
                <li key={model.name} className="border border-gray-100 hover:border-gray-200 rounded-xl p-5 transition-colors">

                  {/* Top row: index + name + price */}
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <span className="text-xs font-medium text-gray-400 tabular-nums mt-0.5 shrink-0">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <div className="min-w-0">
                        <strong className="text-base font-semibold text-gray-900 block leading-snug">{model.name}</strong>
                        <span className="text-xs text-gray-400 block mt-0.5">{model.bestFor}</span>
                      </div>
                    </div>
                    <span className="text-base font-semibold text-gray-900 shrink-0 tabular-nums">{model.price}</span>
                  </div>

                  {/* Spec badges */}
                  <div className="flex flex-wrap gap-1.5 mb-3 pl-6">
                    <span className="inline-flex items-center text-xs font-medium text-gray-600 bg-gray-50 border border-gray-100 rounded-full px-2.5 py-1 leading-none">
                      {model.caseSize}
                    </span>
                    <span className="inline-flex items-center text-xs font-medium text-gray-600 bg-gray-50 border border-gray-100 rounded-full px-2.5 py-1 leading-none">
                      {model.waterResistance}
                    </span>
                    <span className="inline-flex items-center text-xs font-medium text-gray-600 bg-gray-50 border border-gray-100 rounded-full px-2.5 py-1 leading-none">
                      {model.crystal}
                    </span>
                    <span className="inline-flex items-center text-xs font-medium text-gray-600 bg-gray-50 border border-gray-100 rounded-full px-2.5 py-1 leading-none">
                      {model.movement}
                    </span>
                  </div>

                  {/* Editorial reason */}
                  <p className="text-base text-gray-600 leading-relaxed pl-6">{model.reason}</p>

                  {/* Community signal */}
                  {model.communitySignal && (
                    <p className="mt-3 pl-6 text-sm text-gray-400 italic leading-relaxed border-l-2 border-gray-100 ml-6">
                      {model.communitySignal}
                    </p>
                  )}

                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Section: FAQ */}
        {entry.faq.length > 0 && (
          <section className="mb-14">
            <div className="flex items-center gap-3 mb-5">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Common questions</span>
              <span className="flex-1 h-px bg-gray-100" />
            </div>
            <div className="border border-gray-100 rounded-xl overflow-hidden divide-y divide-gray-100">
              {entry.faq.map((item, i) => (
                <div key={i} className="px-6 py-5 hover:bg-gray-50/40 transition-colors">
                  <h3 className="text-base font-semibold text-gray-900 mb-2 leading-snug">{item.question}</h3>
                  <p className="faq-answer text-base text-gray-600 leading-[1.75]">{item.answer}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Section: Explore links */}
        {entry.internalLinks.length > 0 && (
          <section className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Explore on Watchems</span>
              <span className="flex-1 h-px bg-gray-100" />
            </div>
            <div className="flex flex-wrap gap-2">
              {entry.internalLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-xs font-medium text-gray-600 bg-white hover:bg-gray-50 border border-gray-200 hover:border-gray-300 rounded-full px-3.5 py-1.5 transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Sources */}
        {entry.sources && entry.sources.length > 0 && (
          <section className="mb-12 pt-6 border-t border-gray-100">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Sources</p>
            <ul className="space-y-2">
              {entry.sources.map((source, i) => (
                <li key={i}>
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-gray-400 hover:text-gray-600 underline underline-offset-2 transition-colors"
                  >
                    {source.label}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Upload CTA */}
        <section className="mb-10">
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-7">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Own one of these?</p>
            <p className="text-base font-semibold text-gray-900 mb-1">Show it on your wrist.</p>
            <p className="text-base text-gray-600 mb-5 leading-relaxed">
              Real owner photos help buyers make better decisions. Add yours to the Watchems community gallery.
            </p>
            <Link
              href="/upload"
              className="inline-flex items-center gap-2 text-sm font-semibold text-white bg-gray-900 hover:bg-gray-700 px-5 py-2.5 rounded-lg transition-colors"
            >
              Upload your wrist shot
            </Link>
          </div>
        </section>

        {/* Back nav */}
        <div className="pb-12">
          <Link
            href="/buying-guides"
            className="text-sm text-gray-400 hover:text-gray-700 transition-colors inline-flex items-center gap-2"
          >
            <span>←</span>
            <span>All buying guides</span>
          </Link>
        </div>

      </div>
    </>
  )
}
