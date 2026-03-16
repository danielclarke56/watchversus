import Link from 'next/link'
import { getAllPosts } from '@/lib/blog'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Watch Blog — Buying Guides, Reviews & Advice | WatchVsWatch',
  description:
    'In-depth watch articles: buying guides, movement breakdowns, brand reviews, and value-for-money analysis from the WatchVsWatch team.',
  alternates: { canonical: 'https://watchvswatch.com/blog' },
  openGraph: {
    title: 'Watch Blog | WatchVsWatch',
    description: 'In-depth watch articles, guides, and reviews.',
    url: 'https://watchvswatch.com/blog',
  },
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export default function BlogIndex() {
  const posts = getAllPosts()

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <header className="mb-10">
        <h1 className="text-3xl font-bold text-[#0f172a] mb-2">Watch Blog</h1>
        <p className="text-[#475569]">
          Buying guides, movement deep-dives, and honest reviews.
        </p>
      </header>

      <div className="divide-y divide-[#e2e8f0]">
        {posts.map((post) => (
          <article key={post.slug} className="py-8 group">
            <Link href={`/blog/${post.slug}`} className="block">
              <div className="flex items-center gap-2 mb-2">
                <time
                  dateTime={post.date}
                  className="text-xs text-[#94a3b8] font-medium"
                >
                  {formatDate(post.date)}
                </time>
                <span className="text-[#e2e8f0]">·</span>
                <div className="flex gap-1.5 flex-wrap">
                  {post.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="text-xs bg-[#fdf3dc] text-[#b8860b] px-2 py-0.5 rounded-full font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <h2 className="text-xl font-bold text-[#0f172a] mb-2 group-hover:text-[#b8860b] transition-colors">
                {post.title}
              </h2>
              <p className="text-[#475569] text-sm leading-relaxed">
                {post.description}
              </p>

              <span className="inline-block mt-3 text-sm font-semibold text-[#b8860b] group-hover:underline">
                Read article →
              </span>
            </Link>
          </article>
        ))}
      </div>
    </main>
  )
}
