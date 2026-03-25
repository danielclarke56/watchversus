'use client'

import Link from 'next/link'
import Image from 'next/image'
import { guides } from '@/lib/guideData'
import { watches } from '@/lib/watches'
import { getRelatedGuidesByBrand } from '@/lib/relatedContent'

interface RelatedGuidesProps {
  currentSlug: string
}

export default function RelatedGuides({ currentSlug }: RelatedGuidesProps) {
  const relatedGuides = getRelatedGuidesByBrand(currentSlug)

  if (relatedGuides.length === 0) {
    return null
  }

  return (
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
  )
}
