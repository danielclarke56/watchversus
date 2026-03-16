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

  return (
    <main className="bg-white min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-[#94a3b8] mb-8">
          <Link href="/" className="hover:text-[#b8860b] transition-colors">Home</Link>
          <span>/</span>
          <Link href="/blog" className="hover:text-[#b8860b] transition-colors">Blog</Link>
          <span>/</span>
          <span className="text-[#475569] truncate max-w-[200px] sm:max-w-none">{post.title}</span>
        </nav>

        {/* Hero image */}
        {post.heroImage && (
          <div className="relative w-full max-h-[480px] overflow-hidden rounded-xl mb-10">
            <Image
              src={post.heroImage}
              alt={post.title}
              width={1200}
              height={480}
              className="w-full max-h-[480px] object-cover rounded-xl"
              priority
            />
          </div>
        )}

        {/* Post header */}
        <header className="max-w-3xl mx-auto mb-8">
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <time dateTime={post.date} className="text-xs text-[#94a3b8] font-medium">
              {formatDate(post.date)}
            </time>
            <span className="text-[#e2e8f0]">·</span>
            <span className="text-xs text-[#94a3b8] font-medium">{post.readingTime}</span>
            <span className="text-[#e2e8f0]">·</span>
            <div className="flex gap-1.5 flex-wrap">
              {post.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="text-xs bg-[#fdf3dc] text-[#b8860b] px-2.5 py-0.5 rounded-full font-semibold"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-[#0f172a] leading-tight mb-4">
            {post.title}
          </h1>
          <p className="text-lg text-[#475569] leading-relaxed">{post.description}</p>
        </header>

        <hr className="border-[#e2e8f0] max-w-3xl mx-auto mb-10" />

        {/* Article body */}
        <article className="max-w-3xl mx-auto prose prose-lg prose-slate
          prose-headings:font-bold prose-headings:text-[#0f172a]
          prose-h2:border-l-4 prose-h2:border-[#d4a853] prose-h2:pl-4 prose-h2:ml-0
          prose-p:text-[#334155] prose-p:leading-8 prose-p:text-[1.05rem]
          prose-strong:text-[#0f172a]
          prose-blockquote:italic prose-blockquote:border-l-4 prose-blockquote:border-[#d4a853] prose-blockquote:bg-[#fdf3dc] prose-blockquote:px-6 prose-blockquote:py-4 prose-blockquote:rounded-r-lg prose-blockquote:text-[#475569] prose-blockquote:not-italic
          prose-li:text-[#334155]
          prose-a:text-[#b8860b] prose-a:no-underline hover:prose-a:underline
          prose-hr:border-[#e2e8f0]
          max-w-none"
        >
          <ReactMarkdown>{post.content}</ReactMarkdown>
        </article>

        {/* Related articles */}
        {related.length > 0 && (
          <section className="max-w-3xl mx-auto mt-16 pt-10 border-t border-[#e2e8f0]">
            <h2 className="text-xl font-bold text-[#0f172a] mb-6">Related Articles</h2>
            <div className="flex flex-col sm:flex-row gap-6">
              {related.map((rel) => (
                <Link
                  key={rel.slug}
                  href={`/blog/${rel.slug}`}
                  className="group flex gap-4 items-center flex-1 rounded-xl border border-[#e2e8f0] p-4 hover:shadow-md transition-shadow"
                >
                  {rel.heroImage && (
                    <div className="relative w-20 h-16 flex-shrink-0 rounded-lg overflow-hidden">
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
                    <p className="text-sm font-semibold text-[#0f172a] leading-snug group-hover:text-[#b8860b] transition-colors line-clamp-2">
                      {rel.title}
                    </p>
                    <span className="text-xs text-[#b8860b] font-medium mt-1 inline-block">Read →</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Footer actions */}
        <div className="max-w-3xl mx-auto mt-12 pt-6 border-t border-[#e2e8f0] flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <Link
            href="/blog"
            className="text-sm font-semibold text-[#b8860b] hover:underline"
          >
            ← Back to Blog
          </Link>

          <Link
            href="/compare"
            className="flex-1 block bg-[#d4a853] text-[#0f172a] font-bold text-center px-6 py-4 rounded-xl hover:bg-[#c49a42] transition-colors"
          >
            Compare watches side by side →
          </Link>
        </div>

      </div>
    </main>
  )
}
