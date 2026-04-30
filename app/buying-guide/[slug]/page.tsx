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

  // 1. Try photos matching any of the notable model brand names in this tier
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

  // 2. Fallback: any photo tagged with this price tier
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

  // Schema
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
    publisher: {
      '@type': 'Organization',
      name: 'Watchems',
      url: 'https://watchems.com',
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

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">

        {/* Breadcrumb */}
        <nav className="text-xs text-gray-400 mb-6 flex items-center gap-1.5">
          <Link href="/" className="hover:text-gray-600 transition-colors">Home</Link>
          <span>/</span>
          <Link href="/buying-guides" className="hover:text-gray-600 transition-colors">Buying Guides</Link>
          <span>/</span>
          <span className="text-gray-600">{entry.name}</span>
        </nav>

        {/* H1 + last updated */}
        <div className="mb-3">
          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">
            {entry.name}
          </h1>
          <p className="text-xs text-gray-400 mt-1.5">Last updated: {entry.lastUpdated}</p>
        </div>

        {/* Intro — who is this for */}
        <p className="guide-intro text-sm text-gray-600 leading-relaxed mb-8">
          {entry.intro}
        </p>

        {/* Hero fact — speakable */}
        <div className="bg-gray-50 rounded-xl border border-gray-100 p-5 mb-8">
          <p className="price-hero-fact text-sm font-medium text-gray-700 italic leading-relaxed">
            &ldquo;{entry.heroFact}&rdquo;
          </p>
        </div>

        {/* Overview prose — speakable */}
        <div className="price-overview mb-10 space-y-4">
          {entry.overview.split('\n\n').map((para, i) => (
            <p key={i} className="text-sm text-gray-600 leading-relaxed">
              {para.trim()}
            </p>
          ))}
        </div>

        {/* Comparison table */}
        <div className="mb-10">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Quick comparison
          </h2>
          <div className="comparison-table overflow-x-auto rounded-xl border border-gray-100">
            <table className="w-full text-xs text-left">
              <thead className="bg-gray-50 text-gray-500 uppercase tracking-wide">
                <tr>
                  <th className="px-3 py-2.5 font-medium">Model</th>
                  <th className="px-3 py-2.5 font-medium">Price</th>
                  <th className="px-3 py-2.5 font-medium hidden sm:table-cell">Case</th>
                  <th className="px-3 py-2.5 font-medium hidden sm:table-cell">WR</th>
                  <th className="px-3 py-2.5 font-medium hidden md:table-cell">Crystal</th>
                  <th className="px-3 py-2.5 font-medium hidden md:table-cell">Movement</th>
                  <th className="px-3 py-2.5 font-medium">Best for</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {entry.notableModels.map((model) => (
                  <tr key={model.name} className="bg-white hover:bg-gray-50 transition-colors">
                    <td className="px-3 py-2.5 font-medium text-gray-900 whitespace-nowrap">{model.name}</td>
                    <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap">{model.price}</td>
                    <td className="px-3 py-2.5 text-gray-600 hidden sm:table-cell whitespace-nowrap">{model.caseSize}</td>
                    <td className="px-3 py-2.5 text-gray-600 hidden sm:table-cell whitespace-nowrap">{model.waterResistance}</td>
                    <td className="px-3 py-2.5 text-gray-600 hidden md:table-cell whitespace-nowrap">{model.crystal}</td>
                    <td className="px-3 py-2.5 text-gray-600 hidden md:table-cell whitespace-nowrap">{model.movement}</td>
                    <td className="px-3 py-2.5 text-gray-500 whitespace-nowrap">{model.bestFor}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Community wrist shots */}
        {communityPhotos.length > 0 && (
          <div className="mb-10">
            <h2 className="text-lg font-semibold text-gray-900 mb-1">
              Wrist shots from the community
            </h2>
            <p className="text-xs text-gray-400 mb-4">Real owner photos of watches in this price range — submitted by Watchems members</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {communityPhotos.map((photo) => (
                <Link
                  key={photo.id}
                  href={`/photo/${photo.slug ?? photo.id}`}
                  className="group block rounded-xl overflow-hidden border border-gray-100 hover:border-gray-300 transition-colors"
                >
                  <div className="aspect-square bg-gray-50 overflow-hidden relative">
                    <Image
                      src={photo.thumbnailUrl ?? photo.url}
                      alt={buildPhotoAltText(photo)}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 640px) 50vw, 25vw"
                    />
                  </div>
                  <div className="px-2 py-1.5">
                    <p className="text-xs text-gray-500 truncate">
                      {[photo.brandName, photo.modelName].filter(Boolean).join(' ') || 'Unknown'}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Notable models — AEO named list, speakable */}
        {entry.notableModels.length > 0 && (
          <div className="mb-10">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Our picks — explained
            </h2>
            <ul className="notable-models-list space-y-4">
              {entry.notableModels.map((model) => (
                <li key={model.name} className="rounded-xl border border-gray-100 p-4">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <strong className="text-sm font-semibold text-gray-900">{model.name}</strong>
                    <span className="text-xs font-medium text-gray-500 shrink-0">{model.price}</span>
                  </div>
                  <p className="text-xs text-gray-400 mb-2">{model.bestFor}</p>
                  <p className="text-sm text-gray-600 leading-relaxed">{model.reason}</p>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* FAQ — speakable */}
        {entry.faq.length > 0 && (
          <div className="mb-10">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Common questions
            </h2>
            <div className="space-y-4">
              {entry.faq.map((item, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-100 p-5">
                  <h3 className="text-sm font-semibold text-gray-800 mb-2">{item.question}</h3>
                  <p className="faq-answer text-sm text-gray-600 leading-relaxed">{item.answer}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Internal links */}
        {entry.internalLinks.length > 0 && (
          <div className="mb-10 rounded-xl border border-gray-100 p-5">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Explore on Watchems</p>
            <div className="flex flex-wrap gap-2">
              {entry.internalLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-xs font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-full px-3 py-1.5 transition-colors"
                >
                  {link.label} →
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <Link
            href="/buying-guides"
            className="text-sm text-gray-500 hover:text-gray-800 underline underline-offset-2 transition-colors"
          >
            ← All buying guides
          </Link>
          <Link
            href="/upload"
            className="text-sm font-medium text-white bg-gray-900 hover:bg-gray-700 px-4 py-2 rounded-lg transition-colors"
          >
            Upload your watch
          </Link>
        </div>

      </main>
    </>
  )
}
