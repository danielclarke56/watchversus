import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getWatchBySlug, getReviewsForWatch, calcAverageRatings, calcOverallRating, formatPrice, popularComparisons } from '@/lib/watches'
import RatingBar from '@/components/RatingBar'
import StarRating from '@/components/StarRating'
import type { Watch } from '@/lib/types'

export const revalidate = 86400 // Revalidate Reddit data every 24h

const WATCH_SUBREDDITS = [
  'Watches',
  'WatchHorology',
  'rolex',
  'OmegaWatches',
  'Tudor',
  'seiko',
  'Watchexchange',
  'watchcollecting',
]

async function getRedditMentions(query: string): Promise<number> {
  try {
    const subredditParam = WATCH_SUBREDDITS.join('+')
    const res = await fetch(
      `https://www.reddit.com/r/${subredditParam}/search.json?q=${encodeURIComponent(query)}&sort=relevance&t=year&limit=100&restrict_sr=1`,
      {
        headers: { 'User-Agent': 'watchvswatch-bot/1.0 (watchvswatch.com)' },
        next: { revalidate: 86400 },
      }
    )
    if (!res.ok) return 0
    const json = await res.json()
    return json?.data?.dist ?? json?.data?.children?.length ?? 0
  } catch {
    return 0
  }
}

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
    description: `${w1.brand} ${w1.name} vs ${w2.brand} ${w2.name}: ${w1.brand} ${w1.name} has a ${w1.case_diameter_mm}mm case at ${formatPrice(w1.price_new_usd)}, ${w2.brand} ${w2.name} at ${w2.case_diameter_mm}mm for ${formatPrice(w2.price_new_usd)}. Compare movement, water resistance, and full specs side-by-side.`,
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

  // Reddit buzz (parallel, daily ISR)
  const [reddit1, reddit2] = await Promise.all([
    getRedditMentions(`${w1.brand} ${w1.name}`),
    getRedditMentions(`${w2.brand} ${w2.name}`),
  ])
  const totalReddit = reddit1 + reddit2
  const redditPref1 = totalReddit > 0 ? Math.round((reddit1 / totalReddit) * 100) : 50

  const relatedComparisons = popularComparisons
    .filter((c) => `${c.slug1}-vs-${c.slug2}` !== params.slug && (c.slug1 === slug1 || c.slug2 === slug2 || c.slug1 === slug2 || c.slug2 === slug1))
    .slice(0, 4)

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumb */}
      <nav className="text-sm text-slate-500 mb-6 flex items-center gap-2">
        <Link href="/compare" className="hover:text-[#d4a853] transition-colors">Compare</Link>
        <span>/</span>
        <span className="text-white">{w1.name} vs {w2.name}</span>
      </nav>

      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
          {w1.brand} {w1.name} <span className="text-[#d4a853]">vs</span> {w2.brand} {w2.name}
        </h1>
        <p className="text-slate-400">Head-to-head comparison · Community ratings · Pricing</p>
      </div>

      {/* Watch headers */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        {[w1, w2].map((w, i) => {
          const overall = i === 0 ? overall1 : overall2
          const revCount = i === 0 ? reviews1.length : reviews2.length
          return (
            <div key={w.id} className="card p-6 text-center">
              <div className="bg-gradient-to-br from-[#1e293b] to-[#0f172a] rounded-xl border border-[#334155] aspect-square max-w-32 mx-auto flex items-center justify-center mb-4 overflow-hidden">
                {w.image ? (
                  <img
                    src={w.image}
                    alt={w.imageAlt ?? `${w.brand} ${w.name}`}
                    className="w-full h-full object-contain p-2"
                    loading="eager"
                  />
                ) : (
                  <svg className="w-8 h-8 text-[#334155]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="9" strokeWidth="1" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 7v5l3 3" />
                  </svg>
                )}
              </div>
              <p className="text-xs text-[#d4a853] font-bold uppercase tracking-wider mb-1">{w.brand}</p>
              <h2 className="text-lg font-bold text-white mb-1">{w.name}</h2>
              <p className="text-slate-500 text-xs mb-3">Ref. {w.reference}</p>
              {overall ? (
                <div className="flex flex-col items-center gap-1">
                  <div className="text-2xl font-bold text-[#d4a853]">{overall.toFixed(1)}</div>
                  <StarRating rating={overall} size="sm" />
                  <span className="text-xs text-slate-500">{revCount} review{revCount !== 1 ? 's' : ''}</span>
                </div>
              ) : (
                <span className="text-xs text-slate-500">No reviews yet</span>
              )}
              <Link href={`/watches/${w.slug}`} className="text-xs text-[#d4a853] hover:underline block mt-3">
                Full specs →
              </Link>
            </div>
          )
        })}
      </div>

      {/* Quick Verdict — Enhanced */}
      <div className="bg-gradient-to-br from-[#1a1a2e] to-[#16213e] border border-[#d4a853]/40 rounded-xl p-6 my-6 shadow-lg">
        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-[#d4a853] text-lg">⚖️</span>
          <h2 className="font-bold text-lg text-[#d4a853] tracking-wide">Quick Verdict</h2>
          {preferredWatch && (
            <span className="ml-auto text-xs bg-[#d4a853]/20 text-[#d4a853] border border-[#d4a853]/40 px-2 py-0.5 rounded-full font-semibold">
              Community Pick: {preferredWatch.name}
            </span>
          )}
        </div>

        {/* Verdict text */}
        <p className="text-slate-200 text-sm leading-relaxed mb-5">{generateVerdict(w1, w2)}</p>

        {/* Community ratings preference bar */}
        <div className="mb-5">
          <div className="flex justify-between text-xs mb-2">
            <span className="font-semibold text-white">{w1.name}</span>
            <span className="text-slate-400">Community Ratings</span>
            <span className="font-semibold text-white">{w2.name}</span>
          </div>
          <div className="flex h-2.5 rounded-full overflow-hidden bg-[#334155]">
            <div className="bg-[#d4a853] transition-all" style={{ width: `${pref1}%` }} />
            <div className="bg-[#475569] transition-all" style={{ width: `${pref2}%` }} />
          </div>
          <div className="flex justify-between text-xs mt-1.5">
            <span className="text-[#d4a853] font-bold">{pref1}%</span>
            <span className="text-slate-500 font-bold">{pref2}%</span>
          </div>
        </div>

        {/* Forum buzz */}
        <div className="border-t border-[#334155] pt-4">
          <p className="text-xs text-slate-500 mb-3 uppercase tracking-wider">Reddit Watch Community Buzz · Last 12 months</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#0f172a] rounded-lg p-3 text-center">
              <div className="text-xl font-bold text-white">{reddit1 > 0 ? reddit1 : '—'}</div>
              <div className="text-xs text-slate-500 mt-0.5">posts / mentions</div>
              <div className="text-xs text-[#d4a853] font-medium mt-1 truncate">{w1.brand} {w1.name}</div>
            </div>
            <div className="bg-[#0f172a] rounded-lg p-3 text-center">
              <div className="text-xl font-bold text-white">{reddit2 > 0 ? reddit2 : '—'}</div>
              <div className="text-xs text-slate-500 mt-0.5">posts / mentions</div>
              <div className="text-xs text-[#d4a853] font-medium mt-1 truncate">{w2.brand} {w2.name}</div>
            </div>
          </div>
          {totalReddit > 0 && (
            <div className="mt-3">
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-slate-400">{w1.name}</span>
                <span className="text-slate-500">Forum Split</span>
                <span className="text-slate-400">{w2.name}</span>
              </div>
              <div className="flex h-1.5 rounded-full overflow-hidden bg-[#334155]">
                <div className="bg-orange-400 transition-all" style={{ width: `${redditPref1}%` }} />
                <div className="bg-slate-600 transition-all" style={{ width: `${100 - redditPref1}%` }} />
              </div>
            </div>
          )}
          <p className="text-xs text-slate-600 mt-2 text-center">Data refreshed daily · Source: r/Watches, r/WatchHorology, r/rolex, r/OmegaWatches + more</p>
        </div>
      </div>

      {/* Spec comparison table */}
      <div className="card overflow-hidden mb-8">
        <div className="bg-[#1e293b] px-4 py-3 border-b border-[#334155]">
          <h2 className="text-white font-semibold">Specifications Compared</h2>
        </div>
        <div className="grid grid-cols-3 bg-[#0f172a] px-4 py-2 border-b border-[#334155] text-xs text-slate-500 uppercase tracking-wider">
          <div>Specification</div>
          <div>{w1.brand} {w1.name}</div>
          <div>{w2.brand} {w2.name}</div>
        </div>
        {SPEC_ROWS.map((row, i) => {
          const v1 = row.fn(w1)
          const v2 = row.fn(w2)
          const differ = v1 !== v2
          return (
            <div key={row.label} className={`grid grid-cols-3 px-4 py-3 text-sm border-b border-[#334155] last:border-0 ${i % 2 === 0 ? 'bg-[#1e293b]' : 'bg-[#0f172a]'}`}>
              <div className="text-slate-400 font-medium">{row.label}</div>
              <div className={`capitalize ${differ ? 'text-[#d4a853] font-semibold' : 'text-white'}`}>{v1}</div>
              <div className={`capitalize ${differ ? 'text-[#d4a853] font-semibold' : 'text-white'}`}>{v2}</div>
            </div>
          )
        })}
      </div>

      {/* Community ratings comparison */}
      {(avg1 || avg2) && (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-white mb-5">Community Ratings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[{ w: w1, avg: avg1, label: `${w1.brand} ${w1.name}` }, { w: w2, avg: avg2, label: `${w2.brand} ${w2.name}` }].map(({ w, avg, label }) => (
              <div key={w.id} className="card p-5">
                <h3 className="text-white font-semibold mb-4 text-sm">{label}</h3>
                {avg ? (
                  <div className="space-y-3">
                    {Object.entries(avg).map(([key, val]) => (
                      <RatingBar key={key} label={RATING_LABELS[key]} value={val} />
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 text-sm">No community ratings yet</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FAQ Section */}
      <div className="mb-10">
        <h2 className="text-xl font-bold text-white mb-5">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((item, i) => (
            <details key={i} className="card p-5 group cursor-pointer">
              <summary className="text-white font-semibold flex justify-between items-center list-none">
                <span>{item.question}</span>
                <span className="text-[#d4a853] group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="text-slate-400 text-sm mt-4 leading-relaxed">{item.answer}</p>
            </details>
          ))}
        </div>
      </div>

      {/* Related comparisons */}
      {relatedComparisons.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-white mb-5">Related Comparisons</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {relatedComparisons.map((c) => {
              const wa = getWatchBySlug(c.slug1)
              const wb = getWatchBySlug(c.slug2)
              if (!wa || !wb) return null
              return (
                <Link key={`${c.slug1}-${c.slug2}`} href={`/compare/${c.slug1}-vs-${c.slug2}`} className="card p-4 hover:border-[#d4a853]/40 transition-colors group">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-slate-500 uppercase">{wa.brand}</p>
                      <p className="text-white text-xs font-semibold truncate">{wa.name}</p>
                    </div>
                    <div className="text-[#d4a853] font-bold text-xs shrink-0">VS</div>
                    <div className="flex-1 min-w-0 text-right">
                      <p className="text-[10px] text-slate-500 uppercase">{wb.brand}</p>
                      <p className="text-white text-xs font-semibold truncate">{wb.name}</p>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {/* Custom compare CTA */}
      <div className="mt-8 text-center bg-[#1e293b] border border-[#334155] rounded-xl p-8">
        <h3 className="text-white font-semibold text-lg mb-2">Build Your Own Comparison</h3>
        <p className="text-slate-400 text-sm mb-5">Pick any two watches from our database of 50</p>
        <Link href="/compare" className="btn-gold">
          Start a New Comparison
        </Link>
      </div>
    </div>
    </>
  )
}
