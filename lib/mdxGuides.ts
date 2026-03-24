import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import type { Guide, GuideRecommendation, GuideFAQ } from './guideData'

const CONTENT_DIR = path.join(process.cwd(), 'content', 'guides')

export interface MdxGuideFrontmatter {
  slug: string
  title: string
  description: string
  h1: string
  intro: string
  emoji?: string
  tagline?: string
  recommendations?: GuideRecommendation[]
  faq?: GuideFAQ[]
  paa?: GuideFAQ[]
  conclusion?: string
  datePublished?: string
  dateModified?: string
}

export interface MdxGuideData {
  frontmatter: MdxGuideFrontmatter
  content: string // raw MDX body
}

/**
 * Get all MDX guide slugs from content/guides/
 */
export function getMdxGuideSlugs(): string[] {
  if (!fs.existsSync(CONTENT_DIR)) return []
  return fs
    .readdirSync(CONTENT_DIR)
    .filter((f) => f.endsWith('.mdx'))
    .map((f) => f.replace(/\.mdx$/, ''))
}

/**
 * Load a single MDX guide by slug. Returns null if not found.
 */
export function getMdxGuide(slug: string): MdxGuideData | null {
  const filePath = path.join(CONTENT_DIR, `${slug}.mdx`)
  if (!fs.existsSync(filePath)) return null

  const raw = fs.readFileSync(filePath, 'utf-8')
  const { data, content } = matter(raw)

  return {
    frontmatter: {
      slug,
      title: data.title ?? '',
      description: data.description ?? '',
      h1: data.h1 ?? data.title ?? '',
      intro: data.intro ?? '',
      emoji: data.emoji,
      tagline: data.tagline,
      recommendations: data.recommendations ?? [],
      faq: data.faq ?? [],
      paa: data.paa ?? [],
      conclusion: data.conclusion ?? '',
      datePublished: data.datePublished,
      dateModified: data.dateModified,
    },
    content,
  }
}

/**
 * Get all MDX guides as listing-compatible objects (for the guides index page).
 * Returns partial Guide-like objects with the fields needed for listing.
 */
export function getAllMdxGuideListings(): Pick<Guide, 'slug' | 'title' | 'description' | 'h1' | 'emoji' | 'tagline' | 'recommendations'>[] {
  return getMdxGuideSlugs().map((slug) => {
    const guide = getMdxGuide(slug)
    if (!guide) return null
    const { frontmatter } = guide
    return {
      slug: frontmatter.slug,
      title: frontmatter.title,
      description: frontmatter.description,
      h1: frontmatter.h1,
      emoji: frontmatter.emoji,
      tagline: frontmatter.tagline,
      recommendations: frontmatter.recommendations ?? [],
    }
  }).filter((g): g is NonNullable<typeof g> => g !== null)
}

/**
 * Check if an MDX guide exists for a given slug.
 */
export function hasMdxGuide(slug: string): boolean {
  return fs.existsSync(path.join(CONTENT_DIR, `${slug}.mdx`))
}
