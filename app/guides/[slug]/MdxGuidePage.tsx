import Link from 'next/link'
import { getRelatedGuidesByBrand } from '@/lib/relatedContent'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { guides } from '@/lib/guideData'
import MdxContent from '@/app/components/mdx/MdxContent'
import type { MdxGuideData } from '@/lib/mdxGuides'

interface MdxGuidePageProps {
  mdxGuide: MdxGuideData
}

export default function MdxGuidePage({ mdxGuide }: MdxGuidePageProps) {
  const { frontmatter, content } = mdxGuide
  const slug = frontmatter.slug

  // Get related guides (from both legacy and MDX)
  const relatedGuides = getRelatedGuidesByBrand(slug).slice(0, 3)

  // Build FAQ schema
  const faqSchema =
    frontmatter.faq && frontmatter.faq.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: frontmatter.faq.map((item) => ({
            '@type': 'Question',
            name: item.question,
            acceptedAnswer: {
              '@type': 'Answer',
              text: item.answer,
            },
          })),
        }
      : null

  // Build Article schema
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: frontmatter.h1 || frontmatter.title,
    description: frontmatter.description,
    url: `https://watchvswatch.com/guides/${slug}`,
    publisher: {
      '@type': 'Organization',
      name: 'WatchVsWatch',
      url: 'https://watchvswatch.com',
    },
    ...(frontmatter.datePublished && { datePublished: frontmatter.datePublished }),
    ...(frontmatter.dateModified && { dateModified: frontmatter.dateModified }),
  }

  return (
    <>
      {/* Breadcrumbs */}
      <nav className="max-w-4xl mx-auto px-4 pt-6 pb-2" aria-label="Breadcrumb">
        <ol className="flex items-center gap-1.5 text-xs text-textMuted">
          <li>
            <Link href="/" className="hover:text-accent transition-colors">
              Home
            </Link>
          </li>
          <li className="before:content-['/'] before:mx-1.5">
            <Link href="/guides" className="hover:text-accent transition-colors">
              Guides
            </Link>
          </li>
          <li className="before:content-['/'] before:mx-1.5 text-textPrimary font-medium truncate max-w-[200px]">
            {frontmatter.title}
          </li>
        </ol>
      </nav>

      {/* Hero */}
      <header className="max-w-4xl mx-auto px-4 pt-6 pb-8">
        {frontmatter.emoji && (
          <span className="text-4xl mb-4 block" role="img" aria-hidden>
            {frontmatter.emoji}
          </span>
        )}
        <h1 className="text-3xl sm:text-4xl font-bold text-textPrimary mb-3 leading-tight">
          {frontmatter.h1 || frontmatter.title}
        </h1>
        {frontmatter.tagline && (
          <p className="text-lg text-accent font-medium mb-3">{frontmatter.tagline}</p>
        )}
        <p className="text-textSecond text-lg leading-relaxed max-w-3xl">{frontmatter.intro}</p>
      </header>

      {/* Main Content */}
      <article className="max-w-4xl mx-auto px-4 pb-12">
        <div className="prose-wvw">
          <MdxContent source={content} />
        </div>

        {/* FAQ Section (from frontmatter) */}
        {frontmatter.faq && frontmatter.faq.length > 0 && (
          <section className="mt-12 pt-8 border-t border-border">
            <h2
              id="faq"
              className="text-2xl font-bold text-textPrimary mb-6"
            >
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {frontmatter.faq.map((item, i) => (
                <details key={i} className="card p-4 group">
                  <summary className="font-semibold text-textPrimary cursor-pointer list-none flex items-center justify-between">
                    <span>{item.question}</span>
                    <span className="text-textMuted group-open:rotate-180 transition-transform text-xs ml-2">
                      ▼
                    </span>
                  </summary>
                  <p className="mt-3 text-textSecond text-sm leading-relaxed">
                    {item.answer}
                  </p>
                </details>
              ))}
            </div>
          </section>
        )}

        {/* Conclusion (from frontmatter) */}
        {frontmatter.conclusion && (
          <section className="mt-12 pt-8 border-t border-border">
            <h2 className="text-2xl font-bold text-textPrimary mb-4">Final Thoughts</h2>
            <p className="text-textSecond leading-relaxed">{frontmatter.conclusion}</p>
          </section>
        )}

        {/* Related Guides */}
        {relatedGuides.length > 0 && (
          <section className="mt-12 pt-8 border-t border-border">
            <h2 className="text-xl font-bold text-textPrimary mb-6">Related Guides</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {relatedGuides.map((rg) => (
                <Link
                  key={rg.slug}
                  href={`/guides/${rg.slug}`}
                  className="card p-4 hover:border-accent transition-colors"
                >
                  {rg.emoji && <span className="text-2xl mb-2 block">{rg.emoji}</span>}
                  <h3 className="font-semibold text-textPrimary text-sm mb-1">
                    {rg.title}
                  </h3>
                  <p className="text-xs text-textMuted line-clamp-2">{rg.description}</p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </article>

      {/* Schema markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
    </>
  )
}
