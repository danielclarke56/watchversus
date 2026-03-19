'use client'

import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { Container } from '@/components/ui/Container'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { StarRating } from '@/components/ui/StarRating'
import { ComparisonStickyNav } from '@/components/ComparisonStickyNav'
import { VerdictCallout } from '@/components/VerdictCallout'

// Hardcoded watch data for Hamilton vs Seiko
const hamilton = {
  id: '40',
  slug: 'hamilton-khaki-field-auto-38',
  name: 'Khaki Field Auto 38',
  brand: 'Hamilton',
  reference: 'H70455133',
  year_introduced: 2020,
  case_diameter_mm: 38,
  case_thickness_mm: 10,
  lug_width_mm: 20,
  lug_to_lug_mm: 45,
  movement_type: 'automatic',
  movement_caliber: 'H-10',
  power_reserve_hours: 80,
  water_resistance_m: 100,
  crystal: 'sapphire',
  case_material: 'Stainless Steel',
  bracelet_material: 'Canvas strap',
  price_new_usd: { min: 650, max: 750 },
  price_preowned_usd: { min: 500, max: 650 },
  image: '/images/watches/hamilton-khaki-field-auto-38.webp',
  imageAlt: 'Hamilton Khaki Field Auto 38 official product image',
  primary_category: 'field',
  score: 8,
  buy_again_pct: 80,
}

const seiko = {
  id: '15',
  slug: 'seiko-prospex-spb143',
  name: 'Prospex SPB143',
  brand: 'Seiko',
  reference: 'SPB143J1',
  year_introduced: 2019,
  case_diameter_mm: 40.5,
  case_thickness_mm: 13.2,
  lug_width_mm: 20,
  lug_to_lug_mm: 48,
  movement_type: 'automatic',
  movement_caliber: '6R35',
  power_reserve_hours: 70,
  water_resistance_m: 200,
  crystal: 'sapphire',
  case_material: 'Stainless Steel',
  bracelet_material: 'Silicone/Steel',
  price_new_usd: { min: 700, max: 900 },
  price_preowned_usd: { min: 500, max: 700 },
  image: '/images/watches/seiko-prospex-spb143.webp',
  imageAlt: 'Seiko Prospex SPB143 official product image',
  primary_category: 'dive',
  score: 8,
  buy_again_pct: 80,
}

// Format price helper
function formatPrice(price: { min: number; max: number }): string {
  if (price.min === price.max) return `$${price.min.toLocaleString()}`
  return `$${price.min.toLocaleString()}–$${price.max.toLocaleString()}`
}

// Metadata
export const metadata: Metadata = {
  title: 'Hamilton Khaki Field vs Seiko Prospex SPB143 | Watch Comparison',
  description: 'Compare Hamilton Khaki Field Auto 38 vs Seiko Prospex SPB143. Detailed specs, movement analysis, price comparison, water resistance, and expert verdict on these two iconic field and dive watches.',
  keywords: ['Hamilton Khaki Field', 'Seiko Prospex SPB143', 'watch comparison', 'field watch vs dive watch', 'H-10 vs 6R35 movement'],
  openGraph: {
    title: 'Hamilton Khaki Field vs Seiko Prospex SPB143',
    description: 'Complete head-to-head comparison of two legendary modern tool watches.',
    type: 'website',
  },
}

export default function ComparisonPage() {
  const w1 = hamilton
  const w2 = seiko

  // Calculate verdict
  const verdictInfo = {
    winnerName: 'Hamilton Khaki Field Auto 38',
    summary: 'Best value for field watch aesthetics and daily wearability. Lower price, slimmer profile, exceptional 80-hour power reserve.',
  }

  // FAQ items
  const faqItems = [
    {
      question: 'Which watch is better for diving?',
      answer: `The Seiko Prospex SPB143 is explicitly designed as a dive watch with 200m water resistance, making it far superior for underwater use. The Hamilton Khaki Field Auto 38, with its 100m rating, is rated for swimming and snorkeling only. If diving is your primary use case, the Seiko is the clear choice. However, the Hamilton excels in daily field use—lightweight, compact, and ready for any terrestrial adventure.`,
    },
    {
      question: 'What\'s the price difference between these watches?',
      answer: `The Hamilton Khaki Field Auto 38 retails for $650–$750, while the Seiko Prospex SPB143 is priced at $700–$900. On the secondary market, both settle around $500–$700. The Hamilton offers better value at retail, while the Seiko justifies its premium through superior water resistance and proven dive heritage. For budget-conscious buyers, the Hamilton edges out as more accessible.`,
    },
    {
      question: 'How do the movements compare?',
      answer: `The Hamilton uses the H-10 caliber with an exceptional 80-hour power reserve, meaning fewer weekly wind-ups. The Seiko 6R35 offers 70 hours but is arguably more refined and time-tested in the market. Both are reliable, automatic movements suitable for daily wear. The H-10's longer reserve is a genuine advantage if you prefer longer intervals between wears; the 6R35 is proven across Seiko's entire dive collection.`,
    },
    {
      question: 'Which watch is more versatile for different occasions?',
      answer: `The Hamilton Khaki Field Auto 38 shines in versatility. Its 38mm case, field watch aesthetic, and canvas strap make it equally at home on a Nato strap for hiking, on leather for business casual, or on its original canvas. The Seiko Prospex SPB143, while capable, broadcasts "dive watch" louder and works best in casual or sporty contexts. For a single watch to wear everywhere, the Hamilton wins.`,
    },
    {
      question: 'What about case sizing and wearability?',
      answer: `The Hamilton measures 38mm diameter with a svelte 10mm thickness and 45mm lug-to-lug, making it exceptionally easy on the wrist—ideal for smaller frames or dress-watch sensibilities. The Seiko is chunkier: 40.5mm case, 13.2mm thick, 48mm lug-to-lug. For smaller wrists or all-occasion wear, the Hamilton is more forgiving. The Seiko feels more substantial and robust, appealing to those who prefer bolder proportions.`,
    },
    {
      question: 'Which is a better investment for resale value?',
      answer: `Both watches hold value well, with secondary market prices around 70–80% of retail. The Seiko Prospex line has stronger collectibility due to its dive heritage and Prospex legacy dating back decades. The Hamilton Khaki Field is also widely respected, but the Seiko's proven underwater credentials give it a slight edge in desirability. Neither will appreciate, but both resist depreciation admirably compared to many competitors in their price range.`,
    },
  ]

  return (
    <>
      {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
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
                    item: 'https://watchvswatch.com/compare/hamilton-khaki-field-vs-seiko-prospex-spb',
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
          }),
        }}
      />

      <ComparisonStickyNav
        slug1={w1.slug}
        slug2={w2.slug}
        watch1Name={w1.name}
        watch2Name={w2.name}
        verdict={verdictInfo.winnerName || 'Too Close to Call'}
      />

      <Container className="py-10 pt-28 sm:pt-20 lg:pt-16">
        {/* Breadcrumb */}
        <nav className="text-sm text-textMuted mb-6 flex items-center gap-2">
          <Link href="/compare" className="hover:text-accent transition-colors">Compare</Link>
          <span>/</span>
          <span className="text-textPrimary">{w1.name} vs {w2.name}</span>
        </nav>

        {/* SEO lede */}
        <p className="text-textSecond text-base leading-relaxed mb-8 max-w-3xl">
          Comparing the <strong className="text-textPrimary">{w1.brand} {w1.name}</strong> ({formatPrice(w1.price_new_usd)}, {w1.water_resistance_m}m WR, {w1.case_diameter_mm}mm) against the <strong className="text-textPrimary">{w2.brand} {w2.name}</strong> ({formatPrice(w2.price_new_usd)}, {w2.water_resistance_m}m WR, {w2.case_diameter_mm}mm) — specs, movement, and expert verdict below.
        </p>

        {/* Verdict Callout */}
        <VerdictCallout winnerName={verdictInfo.winnerName} verdictSummary={verdictInfo.summary} />

        {/* Hero Section */}
        <section id="comparison-hero" className="bg-gradient-to-br from-accentLight via-white to-surfaceAlt border border-border rounded-2xl overflow-hidden mb-12 shadow-md">
          <div className="px-6 md:px-10 py-10 md:py-14">
            {/* Main headline */}
            <div className="text-center mb-8">
              <h1 className="text-2xl sm:text-4xl md:text-6xl font-black text-textPrimary leading-tight mb-3">
                <span className="block">{w1.brand} {w1.name}</span>
                <span className="text-accent text-xl sm:text-3xl md:text-5xl">vs</span>
                <span className="block">{w2.brand} {w2.name}</span>
              </h1>
              <p className="text-textSecond text-lg md:text-xl">Complete head-to-head comparison</p>
            </div>

            {/* Watch Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-8">
              {[w1, w2].map((w, i) => (
                <div key={w.id} className="relative">
                  <Card hover as="article" className="p-6 md:p-8">
                    {/* Watch Image */}
                    {w.image ? (
                      <div className="bg-gradient-to-br from-surfaceAlt to-accentLight rounded-lg border-2 border-border aspect-square flex items-center justify-center mb-6 overflow-hidden">
                        <Image
                          src={w.image}
                          alt={w.imageAlt}
                          width={280}
                          height={280}
                          className="w-full h-full object-contain p-4"
                          priority={i === 0}
                        />
                      </div>
                    ) : (
                      <div className="bg-surfaceAlt rounded-lg border-2 border-border aspect-square flex items-center justify-center mb-6">
                        <svg className="w-16 h-16 text-borderStrong" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <circle cx="12" cy="12" r="9" strokeWidth="1" />
                          <path strokeLinejoin="round" strokeLinecap="round" strokeWidth="1" d="M12 7v5l3 3" />
                        </svg>
                      </div>
                    )}

                    {/* Watch Identity */}
                    <div className="border-b border-border pb-4 mb-4">
                      <p className="text-xs text-accent font-black uppercase tracking-widest mb-1">{w.brand}</p>
                      <h2 className="text-2xl font-black text-textPrimary mb-1">{w.name}</h2>
                      <p className="text-textMuted text-xs font-medium">Ref. {w.reference}</p>
                    </div>

                    {/* Price Highlight */}
                    <div className="bg-accentLight border-2 border-accent/30 rounded-lg p-4 mb-4">
                      <p className="text-xs text-textMuted font-semibold uppercase mb-1">New Price</p>
                      <p className="text-2xl font-black text-accent">{formatPrice(w.price_new_usd)}</p>
                      <p className="text-xs text-textSecond mt-2">Pre-owned: {formatPrice(w.price_preowned_usd)}</p>
                    </div>

                    {/* Key Specs */}
                    <div className="space-y-2.5 mb-6 pb-4 border-b border-border">
                      <div className="flex justify-between items-center">
                        <span className="text-textMuted text-xs font-semibold">Case</span>
                        <span className="text-textPrimary font-bold text-sm">{w.case_diameter_mm}mm {w.case_material}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-textMuted text-xs font-semibold">Thickness</span>
                        <span className="text-textPrimary font-bold text-sm">{w.case_thickness_mm}mm</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-textMuted text-xs font-semibold">Movement</span>
                        <span className="text-textPrimary font-bold text-sm capitalize">{w.movement_type}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-textMuted text-xs font-semibold">Water Resistance</span>
                        <span className="text-textPrimary font-bold text-sm">{w.water_resistance_m}m</span>
                      </div>
                    </div>

                    {/* Rating */}
                    <div className="flex flex-col items-center gap-2 py-4 mb-4">
                      <div className="text-4xl font-black text-accent">{w.score.toFixed(1)}</div>
                      <StarRating rating={w.score} size="sm" />
                      <span className="text-xs text-textMuted font-medium">{w.buy_again_pct}% would buy again</span>
                    </div>

                    {/* View Details Link */}
                    <Link href={`/watches/${w.slug}`} className="block w-full text-center py-3 px-4 min-h-[48px] flex items-center justify-center bg-accent/10 text-accent hover:bg-accent hover:text-white font-bold rounded-lg transition-all duration-200">
                      View Full Specs →
                    </Link>
                  </Card>
                </div>
              ))}
            </div>

            {/* Quick Comparison Summary */}
            <div className="bg-white/60 backdrop-blur border border-accent/20 rounded-xl p-4 md:p-6">
              <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-3 sm:justify-center">
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 px-3 py-2 bg-accent/10 border border-accent/20 rounded-lg min-w-0">
                  <span className="text-xs text-textMuted font-semibold">Price</span>
                  <span className="text-xs sm:text-sm font-bold text-textPrimary truncate">Hamilton cheaper</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 px-3 py-2 bg-accent/10 border border-accent/20 rounded-lg min-w-0">
                  <span className="text-xs text-textMuted font-semibold">H2O</span>
                  <span className="text-xs sm:text-sm font-bold text-textPrimary truncate">Seiko (200m)</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 px-3 py-2 bg-accent/10 border border-accent/20 rounded-lg min-w-0">
                  <span className="text-xs text-textMuted font-semibold">Size</span>
                  <span className="text-xs sm:text-sm font-bold text-textPrimary truncate">Hamilton (38mm)</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 px-3 py-2 bg-accent/10 border border-accent/20 rounded-lg min-w-0">
                  <span className="text-xs text-textMuted font-semibold">Power Reserve</span>
                  <span className="text-xs sm:text-sm font-bold text-textPrimary truncate">Hamilton (80h)</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Detailed Comparison Content */}
        <section className="prose prose-lg max-w-4xl mx-auto my-12 text-textSecond">
          <h2 className="text-3xl font-black text-textPrimary mb-6">Design & Aesthetics</h2>
          <p>
            The Hamilton Khaki Field Auto 38 and Seiko Prospex SPB143 represent two distinct philosophies in modern watchmaking. The Hamilton embodies the military-inspired field watch tradition with its clean Arabic numerals, minimal bezels, and emphasis on readability in harsh conditions. Its 38mm case and canvas strap scream utilitarian elegance—think aircraft mechanics and expedition medics.
          </p>
          <p>
            The Seiko Prospex SPB143 carries the DNA of the legendary 1965 6105 diver. Its pronounced chapter ring, Mercedes hand set, and 200m water resistance indicate purpose-built credentials for underwater exploration. The bezel is a functional tool, not decoration. While both watches are handsome, the Hamilton appeals to dress-down versatility, and the Seiko broadcasts capability.
          </p>

          <h2 className="text-3xl font-black text-textPrimary mb-6">Movement & Power Reserve</h2>
          <p>
            Hamilton's H-10 caliber is a technical marvel: an 80-hour power reserve means you can wear this watch Monday and set it aside until Friday without winding. For those who rotate watches frequently, this is invaluable. The movement is visible through a caseback, offering a transparent window into the engineering. It's not decorated to haute horlogerie standards, but it's honest and robust.
          </p>
          <p>
            Seiko's 6R35 is the workhorse of the Prospex collection—proven across dozens of models and tens of thousands of wrists. A 70-hour reserve is respectable, though five hours behind the Hamilton. What the 6R35 lacks in reserve, it makes up in market confidence; this movement has a proven track record spanning over a decade. For many collectors, proven reliability trumps superior specs on paper.
          </p>

          <h2 className="text-3xl font-black text-textPrimary mb-6">Water Resistance & Durability</h2>
          <p>
            The Hamilton's 100m rating covers swimming and snorkeling—adequate for daily life and recreational use, but not diving. The Seiko's 200m rating invites actual underwater exploration. For professional or semi-professional divers, the Seiko is the mandate. For everyone else, the Hamilton is more than sufficient and significantly lighter on the wrist thanks to its thinner profile.
          </p>
          <p>
            Both watches feature sapphire crystals and stainless steel cases built to withstand decades of use. The Hamilton's 10mm thickness makes it exceptionally wearable under shirt cuffs; the Seiko's 13.2mm profile commands attention. For durability, both are equal—this isn't a differentiator, but rather a confirmation that both manufacturers have mastered the fundamentals.
          </p>

          <h2 className="text-3xl font-black text-textPrimary mb-6">Price Positioning & Value</h2>
          <p>
            At $650–$750 retail, the Hamilton Khaki Field Auto 38 offers remarkable value for Swiss-made automation and 80-hour reserve. It undercuts its bigger brother (the 42mm version) and most "accessible luxury" competitors significantly. The Seiko Prospex SPB143, ranging $700–$900, sits at a natural premium due to its dive credentials and Prospex heritage.
          </p>
          <p>
            On the secondary market, both converge around $500–$700, though the Seiko typically commands a slightly stronger position due to diving desirability. If budget is primary, the Hamilton wins. If you specifically need a diver's watch, the Seiko's premium is justified and recovers well in resale.
          </p>

          <h2 className="text-3xl font-black text-textPrimary mb-6">Ideal Use Cases</h2>
          <p>
            Choose the <strong>Hamilton Khaki Field Auto 38</strong> if you want a single watch that works everywhere: hiking trails, office meetings, formal dinners, casual weekends. Its compact size, field aesthetics, and exceptional power reserve make it the ultimate daily carry. It's the watch for travelers who don't want to pack multiples.
          </p>
          <p>
            Choose the <strong>Seiko Prospex SPB143</strong> if you're an active diver, frequent swimmer, or simply want a watch explicitly engineered for water immersion. It's the watch for ocean-focused adventurers and those who value proven dive watch heritage. It also works as a capable casual watch, but it's optimized for the water first.
          </p>

          <h2 className="text-3xl font-black text-textPrimary mb-6">Verdict</h2>
          <p>
            Neither watch is objectively "better." The Hamilton Khaki Field Auto 38 is the smarter buy for most people: exceptional value, uncompromising daily versatility, and a power reserve that redefines convenience. The Seiko Prospex SPB143 is the choice for those who need or want genuine dive credentials and are willing to pay the premium for proven submersible heritage.
          </p>
          <p>
            If you own only one watch, the Hamilton. If you're building a collection and need a diver, the Seiko.
          </p>
        </section>

        {/* Spec Comparison Table */}
        <section className="my-12">
          <h2 className="text-3xl font-black text-textPrimary mb-6">Detailed Specifications</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-accentLight border-b-2 border-accent">
                  <th className="text-left p-4 font-black text-textPrimary">Specification</th>
                  <th className="text-left p-4 font-black text-textPrimary">{w1.name}</th>
                  <th className="text-left p-4 font-black text-textPrimary">{w2.name}</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border hover:bg-accentLight/30 transition">
                  <td className="p-4 font-semibold text-textPrimary">Brand</td>
                  <td className="p-4 text-textSecond">{w1.brand}</td>
                  <td className="p-4 text-textSecond">{w2.brand}</td>
                </tr>
                <tr className="border-b border-border hover:bg-accentLight/30 transition">
                  <td className="p-4 font-semibold text-textPrimary">Reference</td>
                  <td className="p-4 text-textSecond">{w1.reference}</td>
                  <td className="p-4 text-textSecond">{w2.reference}</td>
                </tr>
                <tr className="border-b border-border hover:bg-accentLight/30 transition">
                  <td className="p-4 font-semibold text-textPrimary">Year Introduced</td>
                  <td className="p-4 text-textSecond">{w1.year_introduced}</td>
                  <td className="p-4 text-textSecond">{w2.year_introduced}</td>
                </tr>
                <tr className="border-b border-border hover:bg-accentLight/30 transition">
                  <td className="p-4 font-semibold text-textPrimary">Case Diameter</td>
                  <td className="p-4 text-textSecond">{w1.case_diameter_mm}mm</td>
                  <td className="p-4 text-textSecond">{w2.case_diameter_mm}mm</td>
                </tr>
                <tr className="border-b border-border hover:bg-accentLight/30 transition">
                  <td className="p-4 font-semibold text-textPrimary">Case Thickness</td>
                  <td className="p-4 text-textSecond">{w1.case_thickness_mm}mm</td>
                  <td className="p-4 text-textSecond">{w2.case_thickness_mm}mm</td>
                </tr>
                <tr className="border-b border-border hover:bg-accentLight/30 transition">
                  <td className="p-4 font-semibold text-textPrimary">Lug to Lug</td>
                  <td className="p-4 text-textSecond">{w1.lug_to_lug_mm}mm</td>
                  <td className="p-4 text-textSecond">{w2.lug_to_lug_mm}mm</td>
                </tr>
                <tr className="border-b border-border hover:bg-accentLight/30 transition">
                  <td className="p-4 font-semibold text-textPrimary">Lug Width</td>
                  <td className="p-4 text-textSecond">{w1.lug_width_mm}mm</td>
                  <td className="p-4 text-textSecond">{w2.lug_width_mm}mm</td>
                </tr>
                <tr className="border-b border-border hover:bg-accentLight/30 transition">
                  <td className="p-4 font-semibold text-textPrimary">Case Material</td>
                  <td className="p-4 text-textSecond">{w1.case_material}</td>
                  <td className="p-4 text-textSecond">{w2.case_material}</td>
                </tr>
                <tr className="border-b border-border hover:bg-accentLight/30 transition">
                  <td className="p-4 font-semibold text-textPrimary">Crystal</td>
                  <td className="p-4 text-textSecond">{w1.crystal}</td>
                  <td className="p-4 text-textSecond">{w2.crystal}</td>
                </tr>
                <tr className="border-b border-border hover:bg-accentLight/30 transition">
                  <td className="p-4 font-semibold text-textPrimary">Bracelet/Strap</td>
                  <td className="p-4 text-textSecond">{w1.bracelet_material}</td>
                  <td className="p-4 text-textSecond">{w2.bracelet_material}</td>
                </tr>
                <tr className="border-b border-border hover:bg-accentLight/30 transition">
                  <td className="p-4 font-semibold text-textPrimary">Movement Type</td>
                  <td className="p-4 text-textSecond capitalize">{w1.movement_type}</td>
                  <td className="p-4 text-textSecond capitalize">{w2.movement_type}</td>
                </tr>
                <tr className="border-b border-border hover:bg-accentLight/30 transition">
                  <td className="p-4 font-semibold text-textPrimary">Movement Caliber</td>
                  <td className="p-4 text-textSecond">{w1.movement_caliber}</td>
                  <td className="p-4 text-textSecond">{w2.movement_caliber}</td>
                </tr>
                <tr className="border-b border-border hover:bg-accentLight/30 transition">
                  <td className="p-4 font-semibold text-textPrimary">Power Reserve</td>
                  <td className="p-4 text-textSecond">{w1.power_reserve_hours}h</td>
                  <td className="p-4 text-textSecond">{w2.power_reserve_hours}h</td>
                </tr>
                <tr className="border-b border-border hover:bg-accentLight/30 transition">
                  <td className="p-4 font-semibold text-textPrimary">Water Resistance</td>
                  <td className="p-4 text-textSecond">{w1.water_resistance_m}m</td>
                  <td className="p-4 text-textSecond">{w2.water_resistance_m}m</td>
                </tr>
                <tr className="border-b border-border hover:bg-accentLight/30 transition">
                  <td className="p-4 font-semibold text-textPrimary">New Price (USD)</td>
                  <td className="p-4 text-textSecond font-bold">{formatPrice(w1.price_new_usd)}</td>
                  <td className="p-4 text-textSecond font-bold">{formatPrice(w2.price_new_usd)}</td>
                </tr>
                <tr>
                  <td className="p-4 font-semibold text-textPrimary">Pre-owned Price (USD)</td>
                  <td className="p-4 text-textSecond font-bold">{formatPrice(w1.price_preowned_usd)}</td>
                  <td className="p-4 text-textSecond font-bold">{formatPrice(w2.price_preowned_usd)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="my-12 max-w-3xl mx-auto">
          <h2 className="text-3xl font-black text-textPrimary mb-8">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {faqItems.map((item, idx) => (
              <div key={idx} className="bg-accentLight/20 border border-accent/30 rounded-lg p-6">
                <h3 className="text-lg font-black text-textPrimary mb-3">{idx + 1}. {item.question}</h3>
                <p className="text-textSecond leading-relaxed">{item.answer}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Brand Hubs */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 my-10">
          {[w1, w2].map((w) => {
            const brandSlug = w.brand.toLowerCase().replace(/\s+/g, '-')
            return (
              <div key={w.id} className="card p-5 md:p-6 border-l-4 border-accent bg-gradient-to-br from-accentLight/50 to-white hover:shadow-sm transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-xs text-accent font-black uppercase tracking-wider mb-1">Explore Brand</p>
                    <h3 className="text-lg font-bold text-textPrimary">{w.brand} Hub</h3>
                  </div>
                  <span className="text-2xl">🏛️</span>
                </div>
                <p className="text-sm text-textSecond mb-4">All {w.brand} watches, comparisons, and guides in one place</p>
                <Link href={`/brands/${brandSlug}`} className="inline-block w-full text-center px-4 py-2.5 bg-accent/10 text-accent font-semibold rounded-lg hover:bg-accent/20 border border-accent/20 transition-colors">
                  Visit {w.brand} Pillar Page →
                </Link>
              </div>
            )
          })}
        </section>

        {/* Related Comparisons CTA */}
        <section className="bg-accentLight border-2 border-accent rounded-xl p-6 md:p-8 my-10 text-center">
          <h2 className="text-2xl font-black text-textPrimary mb-3">Explore More Comparisons</h2>
          <p className="text-textSecond mb-6">Find head-to-head breakdowns of your favorite watches.</p>
          <Link href="/compare" className="inline-block px-6 py-3 bg-accent text-white font-bold rounded-lg hover:bg-accent/90 transition-colors">
            View All Comparisons →
          </Link>
        </section>
      </Container>
    </>
  )
}
