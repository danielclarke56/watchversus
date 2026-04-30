export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { getPriceBySlug, prices } from '@/lib/priceData'
import { db } from '@/lib/db'
import { photos } from '@/lib/db/schema'
import { eq, and, ilike, or, desc } from 'drizzle-orm'
import { buildPhotoAltText } from '@/lib/photoAlt'

interface Props {
  params: { slug: string }
}

export function generateStaticParams() {
  return prices.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const entry = getPriceBySlug(params.slug)
  if (!entry) return { title: 'Not Found | Watchems' }

  const title = `${entry.name} — Buying Guide | Watchems`
  const description = `A guide to the best watches ${entry.shortLabel.toLowerCase()}. Notable models, what to expect at this price, and honest trade-offs — from the Watchems community.`

  return {
    title,
    description,
    alternates: {
      canonical: `https://watchems.com/buying-guide/${entry.slug}`,
    },
    openGraph: {
      title,
      description,
      url: `https://watchems.com/buying-guide/${entry.slug}`,
      type: 'article',
      siteName: 'Watchems',
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
  }
}

export default async function BuyingGuidePage({ params }: Props) {
  const entry = getPriceBySlug(params.slug)
  if (!entry) notFound()

  const brandNames = Array.from(new Set(entry.notableModels.map((m) => m.brandName)))
  const brandConditions = brandNames.map((b) => ilike(photos.brandName, b))

  let communityPhotos = await db
    .select({
      id: photos.id,
      slug: photos.slug,
      url: photos.url,
      thumbnailUrl: photos.thumbnailUrl,
      brandName: photos.brandName,
      modelName: photos.modelName,
      userName: photos.userName,
    })
    .from(photos)
    .where(and(eq(photos.status, 'approved'), or(...brandConditions)))
    .orderBy(desc(photos.createdAt))
    .limit(8)

  if (communityPhotos.length < 4) {
    communityPhotos = await db
      .select({
        id: photos.id,
        slug: photos.slug,
        url: photos.url,
        thumbnailUrl: photos.thumbnailUrl,
        brandName: photos.brandName,
        modelName: photos.modelName,
        userName: photos.userName,
      })
      .from(photos)
      .where(and(eq(photos.status, 'approved'), eq(photos.estimatedPrice, entry.dbValue)))
      .orderBy(desc(photos.createdAt))
      .limit(8)
  }

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://watchems.com' },
      { '@type': 'ListItem', position: 2, name: 'Buying Guides', item: 'https://watchems.com/buying-guides' },
      { '@type': 'ListItem', position: 3, name: entry.name, item: `https://watchems.com/buying-guide/${entry.slug}` },
    ],
  }

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: entry.name,
    description: entry.intro,
    url: `https://watchems.com/buying-guide/${entry.slug}`,
    dateModified: new Date().toISOString(),
    author: {
      '@type': 'Organization',
      name: 'Watchems Editorial',
      url: 'https://watchems.com',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Watchems',
      url: 'https://watchems.com',
      logo: { '@type': 'ImageObject', url: 'https://watchems.com/logo.svg' },
    },
  }

  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Notable watches ${entry.shortLabel.toLowerCase()}`,
    numberOfItems: entry.notableModels.length,
    itemListElement: entry.notableModels.map((m, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: m.name,
      description: m.reason,
    })),
  }

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: entry.faq.map(({ question, answer }) => ({
      '@type': 'Question',
      name: question,
      acceptedAnswer: { '@type': 'Answer', text: answer },
    })),
  }

  const speakableJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SpeakableSpecification',
    cssSelector: ['h1', '.guide-intro', '.price-hero-fact', '.price-overview', '.comparison-table', '.notable-models-list', '.faq-answer'],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(speakableJsonLd) }} />

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8">

        {/* Breadcrumb */}
        <nav className="text-xs text-gray-400 mb-8 flex items-center gap-1.5">
          <Link href="/" className="hover:text-gray-600 transition-colors">Home</Link>
          <span className="text-gray-300">/</span>
          <Link href="/buying-guides" className="hover:text-gray-600 transition-colors">Buying Guides</Link>
          <span className="text-gray-300">/</span>
          <span className="text-gray-500">{entry.shortLabel}</span>
        </nav>

        {/* Header */}
        <div className="mb-6">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-3">Buying Guide</p>
          <h1 className="text-3xl sm:text-4xl font-semibold text-gray-900 tracking-tight leading-tight mb-3">
            {entry.name}
          </h1>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400">Updated {entry.lastUpdated}</span>
            <span className="w-1 h-1 rounded-full bg-gray-300 inline-block" />
            <span className="text-xs text-gray-400">{entry.notableModels.length} picks</span>
          </div>
        </div>

        {/* Intro */}
        <p className="guide-intro text-base text-gray-600 leading-relaxed mb-8 border-l-2 border-gray-200 pl-4">
          {entry.intro}
        </p>

        {/* Hero fact */}
        <div className="bg-gray-900 rounded-xl p-6 mb-10">
          <p className="price-hero-fact text-sm font-medium text-gray-100 leading-relaxed italic">
            &ldquo;{entry.heroFact}&rdquo;
          </p>
        </div>

        {/* Overview */}
        <div className="price-overview mb-12 space-y-4">
          {entry.overview.split('\n\n').map((para, i) => (
            <p key={i} className="text-sm text-gray-600 leading-relaxed">
              {para.trim()}
            </p>
          ))}
        </div>

        {/* Divider */}
        <hr className="border-gray-100 mb-12" />

        {/* Pick by use case */}
        {entry.pickByUseCase && entry.pickByUseCase.length > 0 && (
          <div className="mb-12">
            <h2 className="text-base font-semibold text-gray-900 mb-4 uppercase tracking-wide text-xs text-gray-500">
              Quick picks
            </h2>
            <div className="rounded-xl border border-gray-100 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">I want&hellip;</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">Best pick</th>
                  </tr>
                </thead>
                <tbody>
                  {entry.pickByUseCase.map((row, i) => (
                    <tr
                      key={row.useCase}
                      className={`${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'} hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0`}
                    >
                      <td className="px-4 py-3 text-sm text-gray-500">{row.useCase}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{row.model}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Comparison table */}
        <div className="mb-12">
          <h2 className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-4">
            Side-by-side comparison
          </h2>
          <div className="comparison-table overflow-x-auto rounded-xl border border-gray-100">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-3 py-3 font-medium text-gray-400 uppercase tracking-wide whitespace-nowrap">Model</th>
                  <th className="px-3 py-3 font-medium text-gray-400 uppercase tracking-wide whitespace-nowrap">Price</th>
                  <th className="px-3 py-3 font-medium text-gray-400 uppercase tracking-wide whitespace-nowrap hidden sm:table-cell">Case</th>
                  <th className="px-3 py-3 font-medium text-gray-400 uppercase tracking-wide whitespace-nowrap hidden sm:table-cell">WR</th>
                  <th className="px-3 py-3 font-medium text-gray-400 uppercase tracking-wide whitespace-nowrap hidden md:table-cell">Crystal</th>
                  <th className="px-3 py-3 font-medium text-gray-400 uppercase tracking-wide whitespace-nowrap hidden md:table-cell">Movement</th>
                  <th className="px-3 py-3 font-medium text-gray-400 uppercase tracking-wide whitespace-nowrap">Best for</th>
                </tr>
              </thead>
              <tbody>
                {entry.notableModels.map((model, i) => (
                  <tr
                    key={model.name}
                    className={`${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'} hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0`}
                  >
                    <td className="px-3 py-3 font-medium text-gray-900 whitespace-nowrap">{model.name}</td>
                    <td className="px-3 py-3 font-semibold text-gray-900 whitespace-nowrap">{model.price}</td>
                    <td className="px-3 py-3 text-gray-500 hidden sm:table-cell whitespace-nowrap">{model.caseSize}</td>
                    <td className="px-3 py-3 text-gray-500 hidden sm:table-cell whitespace-nowrap">{model.waterResistance}</td>
                    <td className="px-3 py-3 text-gray-500 hidden md:table-cell whitespace-nowrap">{model.crystal}</td>
                    <td className="px-3 py-3 text-gray-500 hidden md:table-cell whitespace-nowrap">{model.movement}</td>
                    <td className="px-3 py-3 text-gray-400 whitespace-nowrap">{model.bestFor}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Community wrist shots */}
        {communityPhotos.length > 0 && (
          <div className="mb-12">
            <div className="flex items-baseline justify-between mb-4">
              <h2 className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                From the community
              </h2>
              <span className="text-xs text-gray-300">Real wrist shots</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {communityPhotos.map((photo) => (
                <Link
                  key={photo.id}
                  href={`/photo/${photo.slug ?? photo.id}`}
                  className="group block rounded-xl overflow-hidden border border-gray-100 hover:border-gray-300 transition-all hover:shadow-sm"
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
          </div>
        )}

        {/* Divider */}
        <hr className="border-gray-100 mb-12" />

        {/* Notable models */}
        {entry.notableModels.length > 0 && (
          <div className="mb-12">
            <h2 className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-6">
              Our picks — explained
            </h2>
            <ul className="notable-models-list space-y-3">
              {entry.notableModels.map((model, i) => (
                <li key={model.name} className="group rounded-xl border border-gray-100 hover:border-gray-200 transition-colors p-5">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div className="flex items-start gap-3">
                      <span className="text-xs font-medium text-gray-300 mt-0.5 w-4 shrink-0 tabular-nums">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <div>
                        <strong className="text-sm font-semibold text-gray-900 block leading-snug">{model.name}</strong>
                        <span className="text-xs text-gray-400 mt-0.5 block">{model.bestFor}</span>
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-gray-900 shrink-0 tabular-nums">{model.price}</span>
                  </div>
                  <p className="text-sm text-gray-500 leading-relaxed pl-7">{model.reason}</p>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Divider */}
        <hr className="border-gray-100 mb-12" />

        {/* FAQ */}
        {entry.faq.length > 0 && (
          <div className="mb-12">
            <h2 className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-6">
              Common questions
            </h2>
            <div className="space-y-0 border border-gray-100 rounded-xl overflow-hidden divide-y divide-gray-100">
              {entry.faq.map((item, i) => (
                <div key={i} className="p-5 bg-white hover:bg-gray-50/50 transition-colors">
                  <h3 className="text-sm font-semibold text-gray-800 mb-2 leading-snug">{item.question}</h3>
                  <p className="faq-answer text-sm text-gray-500 leading-relaxed">{item.answer}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Internal links */}
        {entry.internalLinks.length > 0 && (
          <div className="mb-10">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">Explore on Watchems</p>
            <div className="flex flex-wrap gap-2">
              {entry.internalLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-xs font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-full px-3 py-1.5 transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Sources */}
        {entry.sources && entry.sources.length > 0 && (
          <div className="mb-10 pt-6 border-t border-gray-100">
            <p className="text-xs font-medium text-gray-300 uppercase tracking-wide mb-3">Sources</p>
            <ul className="space-y-1.5">
              {entry.sources.map((source, i) => (
                <li key={i}>
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-gray-400 hover:text-gray-600 underline underline-offset-2 transition-colors"
                  >
                    {source.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Upload CTA */}
        <div className="rounded-xl border border-gray-100 bg-gray-50 p-6 mb-8">
          <p className="text-sm font-semibold text-gray-900 mb-1">Own one of these?</p>
          <p className="text-sm text-gray-500 mb-4">Show the community how it looks on your wrist. Real photos help buyers decide.</p>
          <Link
            href="/upload"
            className="inline-flex items-center gap-2 text-sm font-medium text-white bg-gray-900 hover:bg-gray-700 px-4 py-2.5 rounded-lg transition-colors"
          >
            Upload your wrist shot
          </Link>
        </div>

        {/* Back link */}
        <Link
          href="/buying-guides"
          className="text-sm text-gray-400 hover:text-gray-700 transition-colors flex items-center gap-1.5"
        >
          <span>←</span>
          <span>All buying guides</span>
        </Link>

      </main>
    </>
  )
}
