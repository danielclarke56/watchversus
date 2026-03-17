import 'server-only'

import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const BLOG_DIR = path.join(process.cwd(), 'content/blog')

export interface BlogPost {
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

export function getAllPosts(): BlogPost[] {
  const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith('.md'))

  const posts = files.map((filename) => {
    const slug = filename.replace(/\.md$/, '')
    const raw = fs.readFileSync(path.join(BLOG_DIR, filename), 'utf-8')
    const { data, content } = matter(raw)

    return {
      slug,
      title: data.title as string,
      description: data.description as string,
      date: data.date as string,
      tags: (data.tags as string[]) ?? [],
      heroImage: (data.heroImage as string) ?? '',
      readingTime: (data.readingTime as string) ?? '',
      category: (data.category as string) ?? '',
      author: (data.author as string) ?? '',
      featured: (data.featured as boolean) ?? false,
      content,
    }
  })

  return posts.sort((a, b) => (a.date < b.date ? 1 : -1))
}

export function getPostBySlug(slug: string): BlogPost | null {
  const filePath = path.join(BLOG_DIR, `${slug}.md`)
  if (!fs.existsSync(filePath)) return null

  const raw = fs.readFileSync(filePath, 'utf-8')
  const { data, content } = matter(raw)

  return {
    slug,
    title: data.title as string,
    description: data.description as string,
    date: data.date as string,
    tags: (data.tags as string[]) ?? [],
    heroImage: (data.heroImage as string) ?? '',
    readingTime: (data.readingTime as string) ?? '',
    category: (data.category as string) ?? '',
    author: (data.author as string) ?? '',
    featured: (data.featured as boolean) ?? false,
    content,
  }
}
