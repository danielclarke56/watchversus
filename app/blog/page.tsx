'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const CATEGORIES = ['All', 'Reviews', 'Comparisons', 'Guides', 'Buying Advice']

const CATEGORY_COLORS: Record<string, { badge: string; pill: string }> = {
  Review: { badge: 'bg-blue-100 text-blue-700', pill: 'bg-blue-600' },
  Comparison: { badge: 'bg-purple-100 text-purple-700', pill: 'bg-purple-600' },
  Guide: { badge: 'bg-green-100 text-green-700', pill: 'bg-green-600' },
  'Buying Advice': { badge: 'bg-orange-100 text-orange-700', pill: 'bg-orange-600' },
}

interface BlogPost {
  slug: string
  title: string
  description: string
  date: string
  tags: string[]
  heroImage: string
  readingTime: string
  category?: string
  author?: string
  featured?: boolean
  content: string
}

export default function BlogIndex() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load posts from API or JSON
    async function loadPosts() {
      try {
        const response = await fetch('/api/blog/posts')
        const data = await response.json()
        setPosts(data)
      } catch (error) {
        console.error('Failed to load blog posts:', error)
      } finally {
        setLoading(false)
      }
    }
    loadPosts()
  }, [])
  
  const filteredPosts = selectedCategory === 'All' 
    ? posts
    : posts.filter(post => post.category === selectedCategory)
  
  const [hero, ...rest] = filteredPosts

  if (loading) {
    return <div className="bg-white min-h-screen flex items-center justify-center"><p>Loading...</p></div>
  }

  return (
    <main className="bg-white min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Page header */}
        <header className="mb-10">
          <h1 className="text-4xl font-bold text-[#0f172a] mb-3">Watch Blog</h1>
          <p className="text-lg text-[#475569] mb-8">
            In-depth guides, reviews, and market insights.
          </p>
          
          {/* Category filter tabs */}
          <div className="flex flex-wrap gap-3 border-b border-[#e2e8f0] pb-6">
            {CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 font-semibold text-sm transition-colors rounded-full ${
                  selectedCategory === category
                    ? 'bg-[#0f172a] text-white'
                    : 'bg-[#f1f5f9] text-[#475569] hover:bg-[#e2e8f0]'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </header>

        {/* Featured post (if exists) */}
        {hero && (
          <Link href={`/blog/${hero.slug}`} className="group block mb-16">
            <article className="rounded-2xl overflow-hidden border border-[#e2e8f0] shadow-sm hover:shadow-lg transition-shadow">
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
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                  {/* Overlay content */}
                  <div className="absolute bottom-0 left-0 right-0 p-8">
                    <div className="flex items-center gap-3 mb-4 flex-wrap">
                      {hero.category && (
                        <span className={`text-xs ${CATEGORY_COLORS[hero.category]?.pill || 'bg-gray-600'} text-white px-3 py-1 rounded-full font-semibold`}>
                          {hero.category}
                        </span>
                      )}
                      {hero.tags.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="text-xs bg-white/20 text-white px-2.5 py-0.5 rounded-full font-semibold"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 leading-tight group-hover:text-[#d4a853] transition-colors">
                      {hero.title}
                    </h2>
                    <p className="text-white/85 text-sm sm:text-base leading-relaxed mb-4 max-w-2xl">
                      {hero.description}
                    </p>
                    <div className="flex items-center gap-3">
                      <time dateTime={hero.date} className="text-white/70 text-xs font-medium">
                        {formatDate(hero.date)}
                      </time>
                      <span className="text-white/40">·</span>
                      <span className="text-white/70 text-xs font-medium">{hero.readingTime}</span>
                      <span className="ml-2 inline-block bg-[#d4a853] text-[#0f172a] text-sm font-semibold px-4 py-1.5 rounded-full group-hover:bg-white transition-colors">
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
        {rest.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rest.map((post) => (
              <Link key={post.slug} href={`/blog/${post.slug}`} className="group block">
                <article className="rounded-lg border border-[#e2e8f0] overflow-hidden shadow-sm hover:shadow-lg transition-shadow h-full flex flex-col bg-white">
                  {post.heroImage && (
                    <div className="relative w-full aspect-video overflow-hidden bg-[#f1f5f9]">
                      <Image
                        src={post.heroImage}
                        alt={post.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform"
                        sizes="(max-width: 640px) 100vw, 576px"
                      />
                    </div>
                  )}
                  <div className="p-6 flex flex-col flex-1">
                    {/* Category Badge */}
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      {post.category && (
                        <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${CATEGORY_COLORS[post.category]?.badge || 'bg-gray-100 text-gray-700'}`}>
                          {post.category}
                        </span>
                      )}
                      <span className="text-xs text-[#94a3b8] font-medium ml-auto">{post.readingTime}</span>
                    </div>

                    {/* Title */}
                    <h2 className="text-lg font-bold text-[#0f172a] mb-2 leading-snug group-hover:text-[#b8860b] transition-colors">
                      {post.title}
                    </h2>

                    {/* Description */}
                    <p className="text-[#475569] text-sm leading-relaxed flex-1 mb-4">
                      {post.description}
                    </p>

                    {/* Meta footer */}
                    <div className="flex items-center justify-between pt-3 border-t border-[#e2e8f0]">
                      <time dateTime={post.date} className="text-xs text-[#94a3b8] font-medium">
                        {formatDate(post.date)}
                      </time>
                      <span className="text-sm font-semibold text-[#b8860b] group-hover:text-[#0f172a] transition-colors">
                        Read →
                      </span>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-[#475569] text-lg">No articles in this category yet.</p>
            <button
              onClick={() => setSelectedCategory('All')}
              className="mt-4 px-4 py-2 bg-[#0f172a] text-white font-semibold rounded-lg hover:bg-[#1e293b] transition-colors"
            >
              View all articles
            </button>
          </div>
        )}
      </div>
    </main>
  )
}
