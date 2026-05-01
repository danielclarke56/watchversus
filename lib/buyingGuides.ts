import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import under500Data from '@/content/buying-guides/under-500/data'

export interface GuideModel {
  name: string
  brandName: string
  price: string
  caseSize: string
  waterResistance: string
  crystal: string
  movement: string
  bestFor: string       // one-line positioning
  reason: string        // 2-sentence value explanation
  tradeoff: string      // 1-sentence trade-off
  communitySignal?: string  // 1-sentence social proof
  imageUrl?: string
}

export interface GuideFAQ {
  question: string
  answer: string
}

export interface GuideInternalLink {
  label: string
  href: string
}

export interface GuideUseCase {
  useCase: string
  model: string
}

export interface GuideSource {
  label: string
  url: string
}

export interface GuideWhoItIsFor {
  profile: string
  description: string
}

export interface BuyingGuideData {
  slug: string
  name: string
  shortLabel: string
  dbValue: string
  lastUpdated: string
  intro: string
  heroFact: string
  overviewMdx: string
  whoItIsFor: GuideWhoItIsFor[]
  pickByUseCase: GuideUseCase[]
  notableModels: GuideModel[]
  faq: GuideFAQ[]
  internalLinks: GuideInternalLink[]
  sources: GuideSource[]
  images: {
    hero: string
    mid?: string
  }
}

// Static registry — add a new entry here when a new guide is created
const GUIDE_REGISTRY: Array<{ slug: string; data: Omit<BuyingGuideData, 'slug' | 'overviewMdx'> }> = [
  { slug: 'under-500', data: under500Data },
]

const GUIDES_DIR = path.join(process.cwd(), 'content', 'buying-guides')

function readMdx(slug: string): string {
  const mdxPath = path.join(GUIDES_DIR, slug, 'index.mdx')
  if (!fs.existsSync(mdxPath)) return ''
  const { content } = matter(fs.readFileSync(mdxPath, 'utf8'))
  return content.trim()
}

let _cache: BuyingGuideData[] | null = null

export function getAllGuides(): BuyingGuideData[] {
  if (_cache) return _cache
  _cache = GUIDE_REGISTRY.map(({ slug, data }) => ({
    slug,
    overviewMdx: readMdx(slug),
    ...data,
  }))
  return _cache
}

export function getGuideBySlug(slug: string): BuyingGuideData | undefined {
  return getAllGuides().find((g) => g.slug === slug)
}
