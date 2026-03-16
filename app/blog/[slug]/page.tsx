import { notFound } from 'next/navigation'
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

export default function BlogPost({ params }: { params: { slug: string } }) {
  const post = getPostBySlug(params.slug)
  if (!post) notFound()

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <header className="mb-10">
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <time dateTime={post.date} className="text-xs text-[#94a3b8] font-medium">
            {formatDate(post.date)}
          </time>
          <span className="text-[#e2e8f0]">·</span>
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs bg-[#fdf3dc] text-[#b8860b] px-2 py-0.5 rounded-full font-medium"
            >
              {tag}
            </span>
          ))}
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-[#0f172a] leading-tight mb-4">
          {post.title}
        </h1>
        <p className="text-lg text-[#475569] leading-relaxed">{post.description}</p>
      </header>

      <hr className="border-[#e2e8f0] mb-10" />

      {/* Article body */}
      <article className="prose prose-slate max-w-none prose-headings:text-[#0f172a] prose-a:text-[#b8860b] prose-a:no-underline hover:prose-a:underline prose-strong:text-[#0f172a] prose-hr:border-[#e2e8f0] prose-blockquote:border-l-[#d4a853] prose-blockquote:text-[#475569]">
        <ReactMarkdown>{post.content}</ReactMarkdown>
      </article>

      {/* Back link */}
      <div className="mt-12 pt-6 border-t border-[#e2e8f0]">
        <a
          href="/blog"
          className="text-sm font-semibold text-[#b8860b] hover:underline"
        >
          ← Back to Blog
        </a>
      </div>
    </main>
  )
}
