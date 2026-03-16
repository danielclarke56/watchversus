import Link from 'next/link'
import Image from 'next/image'
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
  const [hero, ...rest] = posts

  return (
    <main className="bg-white min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Page header */}
        <header className="mb-12">
          <h1 className="text-4xl font-bold text-[#0f172a] mb-3">Watch Blog</h1>
          <p className="text-lg text-[#475569]">
            In-depth guides, reviews, and market insights.
          </p>
        </header>

        {/* Hero post */}
        {hero && (
          <Link href={`/blog/${hero.slug}`} className="group block mb-14">
            <article className="rounded-2xl overflow-hidden border border-[#e2e8f0] shadow-sm hover:shadow-md transition-shadow">
              {hero.heroImage && (
                <div className="relative w-full aspect-video">
                  <Image
                    src={hero.heroImage}
                    alt={hero.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 1152px"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                  {/* Overlay content */}
                  <div className="absolute bottom-0 left-0 right-0 p-8">
                    <div className="flex items-center gap-3 mb-3 flex-wrap">
                      {hero.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="text-xs bg-[#d4a853] text-[#0f172a] px-2.5 py-0.5 rounded-full font-semibold"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2 leading-tight group-hover:text-[#d4a853] transition-colors">
                      {hero.title}
                    </h2>
                    <p className="text-white/80 text-sm sm:text-base leading-relaxed mb-4 max-w-2xl">
                      {hero.description}
                    </p>
                    <div className="flex items-center gap-3">
                      <time dateTime={hero.date} className="text-white/60 text-xs font-medium">
                        {formatDate(hero.date)}
                      </time>
                      <span className="text-white/40">·</span>
                      <span className="text-white/60 text-xs font-medium">{hero.readingTime}</span>
                      <span className="ml-2 inline-block bg-[#d4a853] text-[#0f172a] text-sm font-semibold px-4 py-1.5 rounded-full">
                        Read article →
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </article>
          </Link>
        )}

        {/* Grid of remaining posts */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          {rest.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`} className="group block">
              <article className="rounded-2xl overflow-hidden border border-[#e2e8f0] shadow-sm hover:shadow-md transition-shadow h-full flex flex-col">
                {post.heroImage && (
                  <div className="relative w-full aspect-video">
                    <Image
                      src={post.heroImage}
                      alt={post.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, 576px"
                    />
                  </div>
                )}
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex gap-1.5 flex-wrap mb-3">
                    {post.tags.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="text-xs bg-[#fdf3dc] text-[#b8860b] px-2.5 py-0.5 rounded-full font-semibold"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <h2 className="text-lg font-bold text-[#0f172a] mb-2 leading-snug group-hover:text-[#b8860b] transition-colors">
                    {post.title}
                  </h2>
                  <p className="text-[#475569] text-sm leading-relaxed flex-1">
                    {post.description}
                  </p>
                  <div className="flex items-center gap-2 mt-4">
                    <time dateTime={post.date} className="text-xs text-[#94a3b8] font-medium">
                      {formatDate(post.date)}
                    </time>
                    <span className="text-[#e2e8f0]">·</span>
                    <span className="text-xs text-[#94a3b8] font-medium">{post.readingTime}</span>
                    <span className="ml-auto text-sm font-semibold text-[#b8860b] group-hover:underline">
                      Read →
                    </span>
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </div>
    </main>
  )
}
