import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import ReactMarkdown from 'react-markdown'
import { getAllPosts, getPostBySlug } from '@/lib/blog'
import type { Metadata } from 'next'

export async function generateStaticParams() {
  const posts = getAllPosts()
  return posts.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Promise<Metadata> {
  const post = getPostBySlug(params.slug)
  if (!post) return {}

  const canonical = `https://watchvswatch.com/blog/${post.slug}`

  return {
    title: `${post.title} | WatchVsWatch`,
    description: post.description,
    alternates: { canonical },
    openGraph: {
      title: post.title,
      description: post.description,
      url: canonical,
      type: 'article',
      publishedTime: post.date,
      ...(post.heroImage ? { images: [{ url: `https://watchvswatch.com${post.heroImage}` }] } : {}),
    },
  }
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = getPostBySlug(params.slug)
  if (!post) notFound()

  const allPosts = getAllPosts()
  const related = allPosts.filter((p) => p.slug !== post.slug).slice(0, 2)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://watchvswatch.com' },
          { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://watchvswatch.com/blog' },
          { '@type': 'ListItem', position: 3, name: post.title, item: `https://watchvswatch.com/blog/${post.slug}` },
        ],
      },
      {
        '@type': 'Article',
        headline: post.title,
        description: post.description,
        datePublished: post.date,
        dateModified: post.date,
        author: {
          '@type': 'Organization',
          name: 'WatchVsWatch',
        },
        publisher: {
          '@type': 'Organization',
          name: 'WatchVsWatch',
          url: 'https://watchvswatch.com',
        },
        ...(post.heroImage ? { image: `https://watchvswatch.com${post.heroImage}` } : {}),
      },
    ],
  }

  return (
    <main className="bg-white min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-textMuted mb-8">
          <Link href="/" className="hover:text-accent transition-colors">Home</Link>
          <span>/</span>
          <Link href="/blog" className="hover:text-accent transition-colors">Blog</Link>
          <span>/</span>
          <span className="text-textSecond truncate max-w-[200px] sm:max-w-none">{post.title}</span>
        </nav>

        {/* Hero image */}
        {post.heroImage && (
          <div className="relative w-full max-h-[480px] overflow-hidden rounded-sm mb-10">
            <Image
              src={post.heroImage}
              alt={post.title}
              width={1200}
              height={480}
              className="w-full max-h-[480px] object-cover rounded-sm"
              priority
            />
          </div>
        )}

        {/* Post header */}
        <header className="max-w-3xl mx-auto mb-8">
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <time dateTime={post.date} className="text-xs text-textMuted font-medium">
              {formatDate(post.date)}
            </time>
            <span className="text-border">·</span>
            <span className="text-xs text-textMuted font-medium">{post.readingTime}</span>
            <span className="text-border">·</span>
            <div className="flex gap-1.5 flex-wrap">
              {post.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="text-xs bg-accentLight text-accent px-2.5 py-0.5 rounded-full font-semibold"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-textPrimary leading-tight mb-4">
            {post.title}
          </h1>
          <p className="text-lg text-textSecond leading-relaxed">{post.description}</p>
        </header>

        <hr className="border-border max-w-3xl mx-auto mb-10" />

        {/* Article body */}
        <article className="max-w-3xl mx-auto prose prose-lg prose-slate
          prose-headings:font-bold prose-headings:text-textPrimary
          prose-h2:border-l-4 prose-h2:border-accent prose-h2:pl-4 prose-h2:ml-0
          prose-p:text-textSecond prose-p:leading-8 prose-p:text-[1.05rem]
          prose-strong:text-textPrimary
          prose-blockquote:italic prose-blockquote:border-l-4 prose-blockquote:border-accent prose-blockquote:bg-accentLight prose-blockquote:px-6 prose-blockquote:py-4 prose-blockquote:rounded-r-sm prose-blockquote:text-textSecond prose-blockquote:not-italic
          prose-li:text-textSecond
          prose-a:text-accent prose-a:no-underline hover:prose-a:underline
          prose-hr:border-border
          max-w-none"
        >
          <ReactMarkdown>{post.content}</ReactMarkdown>
        </article>

        {/* Related articles */}
        {related.length > 0 && (
          <section className="max-w-3xl mx-auto mt-16 pt-10 border-t border-border">
            <h2 className="text-xl font-bold text-textPrimary mb-6">Related Articles</h2>
            <div className="flex flex-col sm:flex-row gap-6">
              {related.map((rel) => (
                <Link
                  key={rel.slug}
                  href={`/blog/${rel.slug}`}
                  className="group flex gap-4 items-center flex-1 rounded-sm border border-border p-4 hover:shadow-md transition-shadow"
                >
                  {rel.heroImage && (
                    <div className="relative w-20 h-16 flex-shrink-0 rounded-sm overflow-hidden">
                      <Image
                        src={rel.heroImage}
                        alt={rel.title}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-textPrimary leading-snug group-hover:text-accent transition-colors line-clamp-2">
                      {rel.title}
                    </p>
                    <span className="text-xs text-accent font-medium mt-1 inline-block">Read →</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Footer actions */}
        <div className="max-w-3xl mx-auto mt-12 pt-6 border-t border-border flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <Link
            href="/blog"
            className="text-sm font-semibold text-accent hover:underline"
          >
            ← Back to Blog
          </Link>

          <Link
            href="/compare"
            className="flex-1 block bg-accent text-white font-bold text-center px-6 py-4 rounded-sm hover:bg-accentHover transition-colors"
          >
            Compare watches side by side →
          </Link>
        </div>

      </div>
    </main>
  )
}
