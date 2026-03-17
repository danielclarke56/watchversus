import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { getWatchBySlug, getReviewsForWatch, calcAverageRatings, calcOverallRating, formatPrice, popularComparisons } from '@/lib/watches'
import { guides } from '@/lib/guideData'
import { getBrandsForComparison } from '@/lib/relatedContent'
import { generateComparisonBadges, getBadgeClasses } from '@/lib/comparisonBadges'
import RatingBar from '@/components/RatingBar'
import StarRating from '@/components/StarRating'
import type { Watch } from '@/lib/types'
import VoteSection from './VoteSection'
import ComparisonStickyNav from './ComparisonStickyNav'



function generateVerdict(w1: Watch, w2: Watch): string {
  const sentences: string[] = []
  const p1 = w1.price_new_usd.min
  const p2 = w2.price_new_usd.min
  const priceDiff = Math.abs(p1 - p2) / Math.min(p1, p2)

  if (priceDiff > 0.5) {
    const cheaper = p1 < p2 ? w1 : w2
    const dearer = p1 < p2 ? w2 : w1
    sentences.push(`${cheaper.brand} ${cheaper.name} is the value winner at ${formatPrice(cheaper.price_new_usd)} — over 50% cheaper than the ${dearer.brand} ${dearer.name} (${formatPrice(dearer.price_new_usd)}).`)
  } else {
    sentences.push(`Both sit in a similar price range: ${w1.brand} ${w1.name} at ${formatPrice(w1.price_new_usd)} vs ${w2.brand} ${w2.name} at ${formatPrice(w2.price_new_usd)} — choose based on use case and style preference.`)
  }

  if (w1.movement_type !== w2.movement_type) {
    const mech = w1.movement_type !== 'quartz' ? w1 : w2
    const qtz = w1.movement_type !== 'quartz' ? w2 : w1
    sentences.push(`${mech.brand} ${mech.name} offers ${mech.movement_type} craftsmanship; ${qtz.brand} ${qtz.name} runs quartz for higher accuracy and lower maintenance.`)
  }

  const wrDiff = Math.abs(w1.water_resistance_m - w2.water_resistance_m)
  if (wrDiff >= 50) {
    const better = w1.water_resistance_m > w2.water_resistance_m ? w1 : w2
    const other = w1.water_resistance_m > w2.water_resistance_m ? w2 : w1
    if (better.water_resistance_m >= 200) {
      sentences.push(`Choose ${better.brand} ${better.name} (${better.water_resistance_m}m WR) for diving; ${other.brand} ${other.name} (${other.water_resistance_m}m) suits everyday wear.`)
    } else {
      sentences.push(`${better.brand} ${better.name} edges ahead on water resistance: ${better.water_resistance_m}m vs ${other.water_resistance_m}m.`)
    }
  }

  const caseDiff = Math.abs(w1.case_diameter_mm - w2.case_diameter_mm)
  if (caseDiff >= 2 && sentences.length < 3) {
    const larger = w1.case_diameter_mm > w2.case_diameter_mm ? w1 : w2
    const smaller = w1.case_diameter_mm > w2.case_diameter_mm ? w2 : w1
    sentences.push(`Case size: ${larger.brand} ${larger.name} at ${larger.case_diameter_mm}mm suits larger wrists; ${smaller.brand} ${smaller.name} at ${smaller.case_diameter_mm}mm is the more compact option.`)
  }

  return sentences.slice(0, 3).join(' ')
}

export async function generateStaticParams() {
  return popularComparisons.map((c) => ({
    slug: `${c.slug1}-vs-${c.slug2}`,
  }))
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const parts = params.slug.split('-vs-')
  if (parts.length !== 2) return {}
  const w1 = getWatchBySlug(parts[0])
  const w2 = getWatchBySlug(parts[1])
  if (!w1 || !w2) return {}
  return {
    title: `${w1.brand} ${w1.name} vs ${w2.brand} ${w2.name} — Full Comparison`,
    description: `Compare ${w1.brand} ${w1.name} vs ${w2.brand} ${w2.name}. Full specs, movement, water resistance, and community ratings side-by-side. Which watch is best?`,
    alternates: {
      canonical: `https://watchvswatch.com/compare/${parts[0]}-vs-${parts[1]}`,
    },
    openGraph: {
      title: `${w1.brand} ${w1.name} vs ${w2.brand} ${w2.name} | WatchVsWatch`,
      description: `Which is better? ${w1.brand} ${w1.name} vs ${w2.brand} ${w2.name} — full head-to-head comparison with specs, community ratings, and pricing.`,
      url: `https://watchvswatch.com/compare/${parts[0]}-vs-${parts[1]}`,
      type: 'website',
    },
  }
}

const SPEC_ROWS: Array<{ label: string; fn: (w: ReturnType<typeof getWatchBySlug>) => string }> = [
  { label: 'Case Diameter', fn: (w) => `${w!.case_diameter_mm}mm` },
  { label: 'Case Thickness', fn: (w) => `${w!.case_thickness_mm}mm` },
  { label: 'Lug Width', fn: (w) => `${w!.lug_width_mm}mm` },
  { label: 'Lug-to-Lug', fn: (w) => `${w!.lug_to_lug_mm}mm` },
  { label: 'Movement', fn: (w) => w!.movement_type },
  { label: 'Caliber', fn: (w) => w!.movement_caliber },
  { label: 'Power Reserve', fn: (w) => w!.power_reserve_hours ? `${w!.power_reserve_hours}h` : 'Quartz' },
  { label: 'Water Resistance', fn: (w) => `${w!.water_resistance_m}m` },
  { label: 'Crystal', fn: (w) => w!.crystal },
  { label: 'Case Material', fn: (w) => w!.case_material },
  { label: 'Bracelet/Strap', fn: (w) => w!.bracelet_material },
  { label: 'Price (New)', fn: (w) => formatPrice(w!.price_new_usd) },
  { label: 'Price (Pre-owned)', fn: (w) => formatPrice(w!.price_preowned_usd) },
  { label: 'Style', fn: (w) => w!.style.join(', ') },
]

const RATING_LABELS: Record<string, string> = {
  value_for_money: 'Value for Money',
  build_quality: 'Build Quality',
  movement_reliability: 'Movement Reliability',
  daily_wearability: 'Daily Wearability',
  resale_strength: 'Resale Strength',
}

export default async function ComparisonPage({ params }: { params: { slug: string } }) {
  const vsIndex = params.slug.indexOf('-vs-')
  if (vsIndex === -1) notFound()

  const slug1 = params.slug.slice(0, vsIndex)
  const slug2 = params.slug.slice(vsIndex + 4)

  const w1 = getWatchBySlug(slug1)
  const w2 = getWatchBySlug(slug2)

  if (!w1 || !w2) notFound()

  const reviews1 = getReviewsForWatch(w1.id)
  const reviews2 = getReviewsForWatch(w2.id)
  const avg1 = calcAverageRatings(reviews1)
  const avg2 = calcAverageRatings(reviews2)
  const overall1 = avg1 ? calcOverallRating(avg1) : null
  const overall2 = avg2 ? calcOverallRating(avg2) : null

  // Community preference from ratings
  const pref1 = (overall1 && overall2)
    ? Math.round((overall1 / (overall1 + overall2)) * 100)
    : 50
  const pref2 = 100 - pref1
  const preferredWatch = pref1 > pref2 ? w1 : pref2 > pref1 ? w2 : null

  const relatedComparisons = popularComparisons
    .filter((c) => `${c.slug1}-vs-${c.slug2}` !== params.slug && (c.slug1 === slug1 || c.slug2 === slug2 || c.slug1 === slug2 || c.slug2 === slug1))
    .slice(0, 4)

  // Get relevant guides based on watch characteristics
  const relatedGuides = guides
    .filter((g) => {
      const lowerGuideSlug = g.slug.toLowerCase()
      const guideRecs = g.recommendations.map((r) => r.slug.toLowerCase())
      const isWatchIncluded = guideRecs.includes(slug1.toLowerCase()) || guideRecs.includes(slug2.toLowerCase())
      const w1InRange = w1.price_new_usd.max <= 500 && lowerGuideSlug.includes('under-500')
      const w1InRange1k = w1.price_new_usd.max <= 1000 && lowerGuideSlug.includes('under-1000')
      const w1InRange2k = w1.price_new_usd.max <= 2000 && lowerGuideSlug.includes('1000-2000')
      const w2InRange = w2.price_new_usd.max <= 500 && lowerGuideSlug.includes('under-500')
      const w2InRange1k = w2.price_new_usd.max <= 1000 && lowerGuideSlug.includes('under-1000')
      const w2InRange2k = w2.price_new_usd.max <= 2000 && lowerGuideSlug.includes('1000-2000')
      const watchInPriceRange = w1InRange || w1InRange1k || w1InRange2k || w2InRange || w2InRange1k || w2InRange2k
      return isWatchIncluded || watchInPriceRange
    })
    .slice(0, 3)

  const faqItems = [
    {
      question: `Which is better: ${w1.brand} ${w1.name} or ${w2.brand} ${w2.name}?`,
      answer: `Both are excellent watches with different strengths. The ${w1.brand} ${w1.name} offers ${w1.case_diameter_mm === w2.case_diameter_mm ? 'comparable sizing' : w1.case_diameter_mm < w2.case_diameter_mm ? 'a more compact size' : 'a larger case'} and costs ${w1.price_new_usd.min < w2.price_new_usd.min ? 'less' : 'more'} new. The ${w2.brand} ${w2.name} excels in ${w2.water_resistance_m > w1.water_resistance_m ? 'water resistance' : 'overall construction'}. The best choice depends on your wrist size, budget, and preferred aesthetic.`,
    },
    {
      question: `What's the price difference?`,
      answer: `The ${w1.brand} ${w1.name} retails for ${formatPrice(w1.price_new_usd)}, while the ${w2.brand} ${w2.name} is priced at ${formatPrice(w2.price_new_usd)}. Pre-owned, expect ${formatPrice(w1.price_preowned_usd)} and ${formatPrice(w2.price_preowned_usd)} respectively. Actual secondary market prices vary based on condition and demand.`,
    },
    {
      question: `How do the case sizes compare?`,
      answer: `The ${w1.brand} ${w1.name} has a ${w1.case_diameter_mm}mm case diameter with ${w1.case_thickness_mm}mm thickness, while the ${w2.brand} ${w2.name} measures ${w2.case_diameter_mm}mm × ${w2.case_thickness_mm}mm. Both have lug-to-lug measurements of ${w1.lug_to_lug_mm}mm and ${w2.lug_to_lug_mm}mm respectively. Consider your wrist size and wear style when deciding.`,
    },
    {
      question: `Which has better water resistance?`,
      answer: `The ${w1.brand} ${w1.name} is water-resistant to ${w1.water_resistance_m}m, while the ${w2.brand} ${w2.name} offers ${w2.water_resistance_m}m. Both are suitable for swimming and snorkeling at their respective depths. For professional diving, verify the rating exceeds 300m and includes a screw-down crown.`,
    },
    {
      question: `How do the movements compare?`,
      answer: `The ${w1.brand} ${w1.name} uses a ${w1.movement_type} ${w1.movement_caliber} with ${w1.power_reserve_hours ? `${w1.power_reserve_hours} hours` : 'quartz'} power reserve. The ${w2.brand} ${w2.name} features a ${w2.movement_type} ${w2.movement_caliber}${w2.power_reserve_hours ? ` with ${w2.power_reserve_hours} hours` : ''} power reserve. ${w1.movement_type !== 'quartz' && w2.movement_type !== 'quartz' ? 'Both offer traditional mechanical craftsmanship.' : 'Check movement specifications for specific features like chronograph or GMT functionality.'}`,
    },
    {
      question: `Which holds value better?`,
      answer: `${w1.brand} and ${w2.brand} both command strong secondary markets. Pre-owned pricing shows an estimated resale value of ${formatPrice(w1.price_preowned_usd)} for the ${w1.name} and ${formatPrice(w2.price_preowned_usd)} for the ${w2.name}. Condition, service history, and box/papers significantly impact resale value for both models.`,
    },
  ]

  // Get related brands for internal linking footer
  const relatedBrands = getBrandsForComparison(slug1, slug2)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://watchvswatch.com' },
          { '@type': 'ListItem', position: 2, name: 'Compare', item: 'https://watchvswatch.com/compare' },
          {
            '@type': 'ListItem',
            position: 3,
            name: `${w1.brand} ${w1.name} vs ${w2.brand} ${w2.name}`,
            item: `https://watchvswatch.com/compare/${slug1}-vs-${slug2}`,
          },
        ],
      },
      {
        '@type': 'ItemList',
        name: `${w1.brand} ${w1.name} vs ${w2.brand} ${w2.name} Comparison`,
        description: `Head-to-head specs, community ratings, and pricing for ${w1.brand} ${w1.name} vs ${w2.brand} ${w2.name}.`,
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: `${w1.brand} ${w1.name}`,
            url: `https://watchvswatch.com/watches/${w1.slug}`,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: `${w2.brand} ${w2.name}`,
            url: `https://watchvswatch.com/watches/${w2.slug}`,
          },
        ],
      },
      {
        '@type': 'FAQPage',
        mainEntity: faqItems.map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: item.answer,
          },
        })),
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ComparisonStickyNav slug1={w1.slug} slug2={w2.slug} watch1Name={w1.name} watch2Name={w2.name} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pt-16">
        {/* Breadcrumb */}
        <nav className="text-sm text-[#94a3b8] mb-6 flex items-center gap-2">
          <Link href="/compare" className="hover:text-[#b8860b] transition-colors">Compare</Link>
          <span>/</span>
          <span className="text-[#0f172a]">{w1.name} vs {w2.name}</span>
        </nav>

        {/* Hero Section — Enhanced */}
        <section id="comparison-hero" className="bg-gradient-to-br from-[#fffbf0] via-white to-[#f8fafc] border border-[#e2e8f0] rounded-2xl overflow-hidden mb-12 shadow-lg">
          <div className="px-6 md:px-10 py-10 md:py-14">
            {/* Main headline */}
            <div className="text-center mb-8">
              <h1 className="text-4xl md:text-6xl font-black text-[#0f172a] leading-tight mb-3">
                <span className="block">{w1.brand} {w1.name}</span>
                <span className="text-[#b8860b] text-3xl md:text-5xl">vs</span>
                <span className="block">{w2.brand} {w2.name}</span>
              </h1>
              <p className="text-[#475569] text-lg md:text-xl">Complete head-to-head comparison</p>
            </div>

            {/* Watch Cards — Side-by-side comparison layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-8">
              {[w1, w2].map((w, i) => {
                const overall = i === 0 ? overall1 : overall2
                const revCount = i === 0 ? reviews1.length : reviews2.length
                const badges = i === 0 ? generateComparisonBadges(w1, w2) : generateComparisonBadges(w2, w1)
                return (
                  <div key={w.id} className="relative">
                    <div className="bg-white border-2 border-[#e2e8f0] rounded-xl p-6 md:p-8 hover:border-[#b8860b]/40 transition-colors">
                      {/* Badges with improved styling */}
                      {badges.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-6">
                          {badges.map((badge) => (
                            <span
                              key={badge.text}
                              className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border-2 ${getBadgeClasses(badge.color)}`}
                            >
                              <span className="text-sm">{badge.icon}</span>
                              {badge.text}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Watch Image — Larger and more prominent */}
                      {w.image ? (
                        <div className="bg-gradient-to-br from-[#f8fafc] to-[#fffbf0] rounded-lg border-2 border-[#e2e8f0] aspect-square flex items-center justify-center mb-6 overflow-hidden">
                          <Image
                            src={w.image}
                            alt={w.imageAlt ?? `${w.brand} ${w.name}`}
                            width={280}
                            height={280}
                            className="w-full h-full object-contain p-4"
                            priority={i === 0}
                          />
                        </div>
                      ) : (
                        <div className="bg-[#f8fafc] rounded-lg border-2 border-[#e2e8f0] aspect-square flex items-center justify-center mb-6">
                          <svg className="w-16 h-16 text-[#cbd5e1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="9" strokeWidth="1" />
                            <path strokeLinejoin="round" strokeLinecap="round" strokeWidth="1" d="M12 7v5l3 3" />
                          </svg>
                        </div>
                      )}

                      {/* Watch Identity */}
                      <div className="border-b border-[#e2e8f0] pb-4 mb-4">
                        <p className="text-xs text-[#b8860b] font-black uppercase tracking-widest mb-1">{w.brand}</p>
                        <h2 className="text-2xl font-black text-[#0f172a] mb-1">{w.name}</h2>
                        <p className="text-[#94a3b8] text-xs font-medium">Ref. {w.reference}</p>
                      </div>

                      {/* Price Highlight — Enhanced */}
                      <div className="bg-[#fffbf0] border-2 border-[#b8860b]/30 rounded-lg p-4 mb-4">
                        <p className="text-xs text-[#94a3b8] font-semibold uppercase mb-1">New Price</p>
                        <p className="text-2xl font-black text-[#b8860b]">{formatPrice(w.price_new_usd)}</p>
                        <p className="text-xs text-[#475569] mt-2">Pre-owned: {formatPrice(w.price_preowned_usd)}</p>
                      </div>

                      {/* Key Specs — Visual Rows */}
                      <div className="space-y-2.5 mb-6 pb-4 border-b border-[#e2e8f0]">
                        <div className="flex justify-between items-center">
                          <span className="text-[#94a3b8] text-xs font-semibold">Case</span>
                          <span className="text-[#0f172a] font-bold text-sm">{w.case_diameter_mm}mm {w.case_material}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-[#94a3b8] text-xs font-semibold">Thickness</span>
                          <span className="text-[#0f172a] font-bold text-sm">{w.case_thickness_mm}mm</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-[#94a3b8] text-xs font-semibold">Movement</span>
                          <span className="text-[#0f172a] font-bold text-sm capitalize">{w.movement_type}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-[#94a3b8] text-xs font-semibold">Water Resistance</span>
                          <span className="text-[#0f172a] font-bold text-sm">{w.water_resistance_m}m</span>
                        </div>
                      </div>

                      {/* Rating Section */}
                      {overall ? (
                        <div className="flex flex-col items-center gap-2 py-4 mb-4">
                          <div className="text-4xl font-black text-[#b8860b]">{overall.toFixed(1)}</div>
                          <StarRating rating={overall} size="sm" />
                          <span className="text-xs text-[#94a3b8] font-medium">{revCount} review{revCount !== 1 ? 's' : ''}</span>
                        </div>
                      ) : (
                        <div className="text-center py-4 mb-4">
                          <span className="text-xs text-[#94a3b8] font-medium">No reviews yet</span>
                        </div>
                      )}

                      {/* View Details Link */}
                      <Link href={`/watches/${w.slug}`} className="block w-full text-center py-3 px-4 bg-[#b8860b]/10 text-[#b8860b] hover:bg-[#b8860b] hover:text-white font-bold rounded-lg transition-all duration-200">
                        View Full Specs →
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Quick Comparison Summary */}
            <div className="bg-white/60 backdrop-blur border border-[#b8860b]/20 rounded-xl p-4 md:p-6 text-center">
              <p className="text-[#475569] text-sm md:text-base">
                {w1.price_new_usd.min < w2.price_new_usd.min
                  ? `${w1.name} is ${formatPrice({ min: w2.price_new_usd.min - w1.price_new_usd.min, max: w2.price_new_usd.max - w1.price_new_usd.max })} cheaper`
                  : `${w2.name} is ${formatPrice({ min: w1.price_new_usd.min - w2.price_new_usd.min, max: w1.price_new_usd.max - w2.price_new_usd.max })} cheaper`} •{' '}
                {w1.water_resistance_m > w2.water_resistance_m ? `${w1.name} has better water resistance` : `${w2.name} has better water resistance`}
              </p>
            </div>
          </div>
        </section>

      {/* Quick Verdict — Enhanced */}
      <section id="comparison-verdict" className="bg-[#fffbf0] border border-[#b8860b]/40 rounded-xl p-6 md:p-8 my-10 shadow-md">
        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-[#b8860b] text-lg">⚖️</span>
          <h2 className="font-bold text-lg text-[#b8860b] tracking-wide">Quick Verdict</h2>
          {preferredWatch && (
            <span className="ml-auto text-xs bg-[#b8860b]/20 text-[#b8860b] border border-[#b8860b]/40 px-2 py-0.5 rounded-full font-semibold">
              Community Pick: {preferredWatch.name}
            </span>
          )}
        </div>

        {/* Verdict text */}
        <p className="text-[#475569] text-sm leading-relaxed mb-5">{generateVerdict(w1, w2)}</p>

        {/* Community ratings preference bar */}
        <div className="mb-5">
          <div className="flex justify-between text-xs mb-2">
            <span className="font-semibold text-[#0f172a]">{w1.name}</span>
            <span className="text-[#475569]">Internet Community Rating</span>
            <span className="font-semibold text-[#0f172a]">{w2.name}</span>
          </div>
          <div className="flex h-2.5 rounded-full overflow-hidden bg-[#e2e8f0]">
            <div className="bg-[#b8860b] transition-all" style={{ width: `${pref1}%` }} />
            <div className="bg-[#cbd5e1] transition-all" style={{ width: `${pref2}%` }} />
          </div>
          <div className="flex justify-between text-xs mt-1.5">
            <span className="text-[#b8860b] font-bold">{pref1}%</span>
            <span className="text-[#94a3b8] font-bold">{pref2}%</span>
          </div>
        </div>

        <VoteSection slug={params.slug} watch1Name={w1.name} watch2Name={w2.name} />

      </section>

      {/* Spec comparison table */}
      <section id="comparison-specs" className="card overflow-hidden mb-10">
        <div className="bg-[#f8fafc] px-4 py-3 border-b border-[#e2e8f0]">
          <h2 className="text-[#0f172a] font-semibold">Specifications Compared</h2>
        </div>
        <div className="grid grid-cols-3 bg-white px-4 py-2 border-b border-[#e2e8f0] text-xs text-[#94a3b8] uppercase tracking-wider">
          <div>Specification</div>
          <div>{w1.brand} {w1.name}</div>
          <div>{w2.brand} {w2.name}</div>
        </div>
        {SPEC_ROWS.map((row, i) => {
          const v1 = row.fn(w1)
          const v2 = row.fn(w2)
          const differ = v1 !== v2
          return (
            <div key={row.label} className={`grid grid-cols-3 px-4 py-3 text-sm border-b border-[#e2e8f0] last:border-0 ${i % 2 === 0 ? 'bg-[#f8fafc]' : 'bg-white'}`}>
              <div className="text-[#475569] font-medium">{row.label}</div>
              <div className={`capitalize ${differ ? 'text-[#b8860b] font-semibold' : 'text-[#0f172a]'}`}>{v1}</div>
              <div className={`capitalize ${differ ? 'text-[#b8860b] font-semibold' : 'text-[#0f172a]'}`}>{v2}</div>
            </div>
          )
        })}
      </section>

      {/* Community ratings comparison */}
      {(avg1 || avg2) && (
        <section id="comparison-ratings" className="mb-10">
          <h2 className="text-xl font-bold text-[#0f172a] mb-5">Community Ratings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[{ w: w1, avg: avg1, label: `${w1.brand} ${w1.name}` }, { w: w2, avg: avg2, label: `${w2.brand} ${w2.name}` }].map(({ w, avg, label }) => (
              <div key={w.id} className="card p-5">
                <h3 className="text-[#0f172a] font-semibold mb-4 text-sm">{label}</h3>
                {avg ? (
                  <div className="space-y-3">
                    {Object.entries(avg).map(([key, val]) => (
                      <RatingBar key={key} label={RATING_LABELS[key]} value={val} />
                    ))}
                  </div>
                ) : (
                  <p className="text-[#94a3b8] text-sm">No community ratings yet</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* FAQ Section */}
      <section id="comparison-faq" className="mb-10">
        <h2 className="text-xl font-bold text-[#0f172a] mb-5">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((item, i) => (
            <details key={i} className="card p-5 group cursor-pointer">
              <summary className="text-[#0f172a] font-semibold flex justify-between items-center list-none">
                <span>{item.question}</span>
                <span className="text-[#b8860b] group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="text-[#475569] text-sm mt-4 leading-relaxed">{item.answer}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Related comparisons */}
      {relatedComparisons.length > 0 && (
        <section id="comparison-related" className="mb-10">
          <h2 className="text-xl font-bold text-[#0f172a] mb-5">Related Comparisons</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {relatedComparisons.map((c) => {
              const wa = getWatchBySlug(c.slug1)
              const wb = getWatchBySlug(c.slug2)
              if (!wa || !wb) return null
              return (
                <Link key={`${c.slug1}-${c.slug2}`} href={`/compare/${c.slug1}-vs-${c.slug2}`} className="card p-4 hover:border-[#b8860b]/40 transition-colors group">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-[#94a3b8] uppercase">{wa.brand}</p>
                      <p className="text-[#0f172a] text-xs font-semibold truncate">{wa.name}</p>
                    </div>
                    <div className="text-[#b8860b] font-bold text-xs shrink-0">VS</div>
                    <div className="flex-1 min-w-0 text-right">
                      <p className="text-[10px] text-[#94a3b8] uppercase">{wb.brand}</p>
                      <p className="text-[#0f172a] text-xs font-semibold truncate">{wb.name}</p>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </section>
      )}

      {/* Related guides */}
      {relatedGuides.length > 0 && (
        <section id="comparison-guides" className="mb-10">
          <h2 className="text-xl font-bold text-[#0f172a] mb-5">Related Guides</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {relatedGuides.map((g) => (
              <Link key={g.slug} href={`/guides/${g.slug}`} className="card p-5 hover:border-[#b8860b]/40 transition-colors group">
                <p className="text-xs uppercase text-[#94a3b8] font-semibold mb-2">Buying Guide</p>
                <h3 className="text-sm font-bold text-[#0f172a] group-hover:text-[#b8860b] transition-colors line-clamp-2">{g.title}</h3>
                <p className="text-xs text-[#475569] mt-3 line-clamp-1">{g.description}</p>
                <p className="text-xs text-[#b8860b] font-medium mt-4 inline-block">Read Guide →</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Brand Hub Links */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-[#0f172a] mb-5">Explore These Brands</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Link
            href={`/brands/${w1.brand.toLowerCase().replace(/\s+/g, '-')}`}
            className="card p-5 hover:border-[#b8860b]/40 transition-colors group"
          >
            <p className="text-xs uppercase text-[#94a3b8] font-semibold mb-2">Brand Hub</p>
            <h3 className="text-lg font-bold text-[#0f172a] group-hover:text-[#b8860b] transition-colors mb-2">
              {w1.brand}
            </h3>
            <p className="text-sm text-[#475569] mb-4">
              Explore all {w1.brand} watches in our database and see how they compare
            </p>
            <p className="text-xs text-[#b8860b] font-medium inline-block">View Brand Hub →</p>
          </Link>
          
          <Link
            href={`/brands/${w2.brand.toLowerCase().replace(/\s+/g, '-')}`}
            className="card p-5 hover:border-[#b8860b]/40 transition-colors group"
          >
            <p className="text-xs uppercase text-[#94a3b8] font-semibold mb-2">Brand Hub</p>
            <h3 className="text-lg font-bold text-[#0f172a] group-hover:text-[#b8860b] transition-colors mb-2">
              {w2.brand}
            </h3>
            <p className="text-sm text-[#475569] mb-4">
              Explore all {w2.brand} watches in our database and see how they compare
            </p>
            <p className="text-xs text-[#b8860b] font-medium inline-block">View Brand Hub →</p>
          </Link>
        </div>
      </section>

      {/* Related brands footer */}
      {relatedBrands.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xl font-bold text-[#0f172a] mb-5">Explore Other Brands</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {relatedBrands.map((b) => (
              <Link
                key={b.slug}
                href={`/brands/${b.slug}`}
                className="card p-4 hover:border-[#b8860b]/40 transition-colors group text-center"
              >
                <h3 className="text-sm font-bold text-[#0f172a] group-hover:text-[#b8860b] transition-colors">
                  {b.name}
                </h3>
                <p className="text-xs text-[#475569] mt-2 line-clamp-2">{b.heroFact}</p>
                <p className="text-xs text-[#b8860b] font-medium mt-3 inline-block">Explore Brand →</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Custom compare CTA */}
      <div className="mt-8 text-center bg-white border border-[#e2e8f0] rounded-xl p-8">
        <h3 className="text-[#0f172a] font-semibold text-lg mb-2">Build Your Own Comparison</h3>
        <p className="text-[#475569] text-sm mb-5">Pick any two watches from our database of 50</p>
        <Link href="/compare" className="btn-gold">
          Start a New Comparison
        </Link>
      </div>
    </div>
    </>
  )
}
