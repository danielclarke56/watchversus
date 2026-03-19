import Link from 'next/link'
import type { Watch } from '@/lib/types'

interface GuideLink {
  href: string
  label: string
  emoji: string
}

function getRelatedGuides(watch: Watch): GuideLink[] {
  const { primary_category, movement_type } = watch
  const priceMax = watch.price_new_usd?.max ?? 0
  const guides: GuideLink[] = []

  // Category-specific guides
  if (primary_category === 'dive') {
    guides.push({ href: '/guides/best-dive-watches', label: 'Best Dive Watches', emoji: '🤿' })
    if (priceMax <= 1000) {
      guides.push({ href: '/guides/best-dive-watches-under-1000', label: 'Best Dive Watches Under $1,000', emoji: '💰' })
    }
  }

  if (primary_category === 'dress') {
    guides.push({ href: '/guides/best-dress-watches', label: 'Best Dress Watches', emoji: '👔' })
    if (priceMax <= 500) {
      guides.push({ href: '/guides/best-dress-watches-under-500', label: 'Best Dress Watches Under $500', emoji: '💰' })
    }
  }

  if (primary_category === 'sport' || primary_category === 'casual') {
    guides.push({ href: '/guides/best-sports-watches', label: 'Best Sports Watches', emoji: '🏃' })
  }

  if (primary_category === 'field') {
    guides.push({ href: '/guides/best-field-watches', label: 'Best Field Watches', emoji: '🧭' })
  }

  if (primary_category === 'gmt') {
    guides.push({ href: '/guides/best-gmt-watches', label: 'Best GMT Watches', emoji: '🌍' })
  }

  // Price-tier guides
  if (priceMax <= 500) {
    guides.push({ href: '/guides/best-watches-under-500', label: 'Best Watches Under $500', emoji: '💵' })
  } else if (priceMax <= 1000) {
    guides.push({ href: '/guides/best-watches-under-1000', label: 'Best Watches Under $1,000', emoji: '💵' })
  } else if (priceMax <= 3000) {
    if (movement_type === 'automatic' || movement_type === 'manual') {
      guides.push({ href: '/guides/best-automatic-watches-under-3000', label: 'Best Automatic Watches Under $3,000', emoji: '⚙️' })
    } else {
      guides.push({ href: '/guides/best-watches-under-3000', label: 'Best Watches Under $3,000', emoji: '💵' })
    }
  } else if (priceMax <= 5000) {
    guides.push({ href: '/guides/best-watches-under-5000', label: 'Best Watches Under $5,000', emoji: '💵' })
  } else if (priceMax <= 10000) {
    guides.push({ href: '/guides/best-luxury-watches-under-10000', label: 'Best Luxury Watches Under $10,000', emoji: '✨' })
  }

  // Chronograph check via name
  if (watch.name?.toLowerCase().includes('chrono') || watch.description?.toLowerCase().includes('chronograph')) {
    guides.push({ href: '/guides/best-chronograph-watches-under-5000', label: 'Best Chronograph Watches', emoji: '⏱️' })
  }

  // De-duplicate and limit to 3
  const seen = new Set<string>()
  const unique: GuideLink[] = []
  for (const g of guides) {
    if (!seen.has(g.href)) {
      seen.add(g.href)
      unique.push(g)
    }
    if (unique.length === 3) break
  }
  return unique
}

export default function WatchRelatedGuides({ watch }: { watch: Watch }) {
  const guides = getRelatedGuides(watch)
  if (guides.length === 0) return null

  return (
    <section id="guides">
        <h2 className="text-xl font-bold text-textPrimary mb-4">Related Buying Guides</h2>
        <div className="flex flex-wrap gap-3">
          {guides.map((g) => (
            <Link
              key={g.href}
              href={g.href}
              className="inline-flex items-center gap-2 bg-surfaceAlt border border-border hover:border-accent text-textPrimary hover:text-accent text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
            >
              <span>{g.emoji}</span>
              <span>{g.label}</span>
              <span className="text-accent text-xs">→</span>
            </Link>
          ))}
        </div>
    </section>
  )
}
