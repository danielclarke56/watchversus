import type { Metadata } from 'next'
import Link from 'next/link'
import { Container } from '@/components/ui/Container'
import { Card } from '@/components/ui/Card'
import { VerdictCallout } from '@/components/ui/VerdictCallout'
import StarRating from '@/components/StarRating'

// Hardcoded watch data
const hamilton = {
  slug: 'hamilton-khaki-field-auto-38',
  name: 'Khaki Field Auto 38',
  brand: 'Hamilton',
  reference: 'H70455133',
  case_diameter_mm: 38,
  case_thickness_mm: 10,
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
  score: 8,
  buy_again_pct: 80,
}

const seiko = {
  slug: 'seiko-prospex-spb143',
  name: 'Prospex SPB143',
  brand: 'Seiko',
  reference: 'SPB143J1',
  case_diameter_mm: 40.5,
  case_thickness_mm: 13.2,
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
  score: 8,
  buy_again_pct: 80,
}

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
    images: [{
      url: 'https://watchvswatch.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'Hamilton vs Seiko comparison',
    }],
  },
}

// FAQ items for schema
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

export default function ComparisonPage() {
  const w1 = hamilton
  const w2 = seiko

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

      <Container className="py-10 pt-28 sm:pt-20 lg:pt-16">
        {/* Breadcrumb */}
        <nav className="text-sm text-slate-600 mb-6 flex items-center gap-2">
          <Link href="/compare" className="hover:text-slate-800 transition-colors">Compare</Link>
          <span>/</span>
          <span className="text-slate-900">{w1.name} vs {w2.name}</span>
        </nav>

        {/* SEO lede */}
        <p className="text-slate-700 text-base leading-relaxed mb-8 max-w-3xl">
          Comparing the <strong className="text-slate-900">{w1.brand} {w1.name}</strong> ({formatPrice(w1.price_new_usd)}, {w1.water_resistance_m}m WR, {w1.case_diameter_mm}mm) against the <strong className="text-slate-900">{w2.brand} {w2.name}</strong> ({formatPrice(w2.price_new_usd)}, {w2.water_resistance_m}m WR, {w2.case_diameter_mm}mm) — specs, movement, and expert verdict below.
        </p>

        {/* Verdict Callout */}
        <VerdictCallout 
          winnerName="Hamilton Khaki Field Auto 38" 
          verdictSummary="Best value for field watch aesthetics and daily wearability. Lower price, slimmer profile, exceptional 80-hour power reserve."
        />

        {/* Hero Section */}
        <section id="comparison-hero" className="bg-gradient-to-br from-amber-50 via-white to-slate-50 border border-slate-200 rounded-2xl overflow-hidden mb-12 shadow-md p-10">
          {/* Main headline */}
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight mb-3">
              <span className="block">{w1.brand} {w1.name}</span>
              <span className="text-amber-600 text-3xl md:text-4xl">vs</span>
              <span className="block">{w2.brand} {w2.name}</span>
            </h1>
            <p className="text-slate-700 text-lg md:text-xl">Complete head-to-head comparison</p>
          </div>

          {/* Watch Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-8">
            {[w1, w2].map((w) => (
              <div key={w.slug} className="relative">
                <Card className="p-6 md:p-8">
                  {/* Watch Identity */}
                  <div className="border-b border-slate-200 pb-4 mb-4">
                    <p className="text-xs text-amber-600 font-black uppercase tracking-widest mb-1">{w.brand}</p>
                    <h2 className="text-2xl font-black text-slate-900 mb-1">{w.name}</h2>
                    <p className="text-slate-500 text-xs font-medium">Ref. {w.reference}</p>
                  </div>

                  {/* Price Highlight */}
                  <div className="bg-amber-100 border-2 border-amber-300 rounded-lg p-4 mb-4">
                    <p className="text-xs text-slate-600 font-semibold uppercase mb-1">New Price</p>
                    <p className="text-2xl font-black text-amber-600">{formatPrice(w.price_new_usd)}</p>
                    <p className="text-xs text-slate-600 mt-2">Pre-owned: {formatPrice(w.price_preowned_usd)}</p>
                  </div>

                  {/* Key Specs */}
                  <div className="space-y-2.5 mb-6 pb-4 border-b border-slate-200">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600 text-xs font-semibold">Case</span>
                      <span className="text-slate-900 font-bold text-sm">{w.case_diameter_mm}mm {w.case_material}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600 text-xs font-semibold">Thickness</span>
                      <span className="text-slate-900 font-bold text-sm">{w.case_thickness_mm}mm</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600 text-xs font-semibold">Movement</span>
                      <span className="text-slate-900 font-bold text-sm capitalize">{w.movement_type}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600 text-xs font-semibold">Water Resistance</span>
                      <span className="text-slate-900 font-bold text-sm">{w.water_resistance_m}m</span>
                    </div>
                  </div>

                  {/* Rating */}
                  <div className="flex flex-col items-center gap-2 py-4 mb-4">
                    <div className="text-4xl font-black text-amber-600">{w.score.toFixed(1)}</div>
                    <StarRating rating={w.score} size="sm" />
                    <span className="text-xs text-slate-600 font-medium">{w.buy_again_pct}% would buy again</span>
                  </div>

                  {/* View Details Link */}
                  <Link href={`/watches/${w.slug}`} className="block w-full text-center py-3 px-4 min-h-[48px] flex items-center justify-center bg-amber-100 text-amber-600 hover:bg-amber-600 hover:text-white font-bold rounded-lg transition-all duration-200">
                    View Full Specs →
                  </Link>
                </Card>
              </div>
            ))}
          </div>
        </section>

        {/* Detailed Comparison Content */}
        <section className="max-w-4xl mx-auto my-12">
          <h2 className="text-3xl font-black text-slate-900 mb-6">Design & Aesthetics</h2>
          <p className="text-slate-700 text-lg leading-relaxed mb-6">
            The Hamilton Khaki Field Auto 38 and Seiko Prospex SPB143 represent two distinct philosophies in modern watchmaking. The Hamilton embodies the military-inspired field watch tradition with its clean Arabic numerals, minimal bezels, and emphasis on readability in harsh conditions. Its 38mm case and canvas strap scream utilitarian elegance—think aircraft mechanics and expedition medics.
          </p>
          <p className="text-slate-700 text-lg leading-relaxed mb-6">
            The Seiko Prospex SPB143 carries the DNA of the legendary 1965 6105 diver. Its pronounced chapter ring, Mercedes hand set, and 200m water resistance indicate purpose-built credentials for underwater exploration. The bezel is a functional tool, not decoration. While both watches are handsome, the Hamilton appeals to dress-down versatility, and the Seiko broadcasts capability.
          </p>

          <h2 className="text-3xl font-black text-slate-900 mb-6 mt-10">Movement & Power Reserve</h2>
          <p className="text-slate-700 text-lg leading-relaxed mb-6">
            Hamilton&apos;s H-10 caliber is a technical marvel: an 80-hour power reserve means you can wear this watch Monday and set it aside until Friday without winding. For those who rotate watches frequently, this is invaluable. The movement is visible through a caseback, offering a transparent window into the engineering. It&apos;s not decorated to haute horlogerie standards, but it&apos;s honest and robust.
          </p>
          <p className="text-slate-700 text-lg leading-relaxed mb-6">
            Seiko&apos;s 6R35 is the workhorse of the Prospex collection&mdash;proven across dozens of models and tens of thousands of wrists. A 70-hour reserve is respectable, though five hours behind the Hamilton. What the 6R35 lacks in reserve, it makes up in market confidence; this movement has a proven track record spanning over a decade. For many collectors, proven reliability trumps superior specs on paper.
          </p>

          <h2 className="text-3xl font-black text-slate-900 mb-6 mt-10">Water Resistance & Durability</h2>
          <p className="text-slate-700 text-lg leading-relaxed mb-6">
            The Hamilton&apos;s 100m rating covers swimming and snorkeling&mdash;adequate for daily life and recreational use, but not diving. The Seiko&apos;s 200m rating invites actual underwater exploration. For professional or semi-professional divers, the Seiko is the mandate. For everyone else, the Hamilton is more than sufficient and significantly lighter on the wrist thanks to its thinner profile.
          </p>
          <p className="text-slate-700 text-lg leading-relaxed mb-6">
            Both watches feature sapphire crystals and stainless steel cases built to withstand decades of use. The Hamilton&apos;s 10mm thickness makes it exceptionally wearable under shirt cuffs; the Seiko&apos;s 13.2mm profile commands attention. For durability, both are equal&mdash;this isn&apos;t a differentiator, but rather a confirmation that both manufacturers have mastered the fundamentals.
          </p>

          <h2 className="text-3xl font-black text-slate-900 mb-6 mt-10">Price Positioning & Value</h2>
          <p className="text-slate-700 text-lg leading-relaxed mb-6">
            At $650&ndash;$750 retail, the Hamilton Khaki Field Auto 38 offers remarkable value for Swiss-made automation and 80-hour reserve. It undercuts its bigger brother (the 42mm version) and most &quot;accessible luxury&quot; competitors significantly. The Seiko Prospex SPB143, ranging $700&ndash;$900, sits at a natural premium due to its dive credentials and Prospex heritage.
          </p>
          <p className="text-slate-700 text-lg leading-relaxed mb-6">
            On the secondary market, both converge around $500&ndash;$700, though the Seiko typically commands a slightly stronger position due to diving desirability. If budget is primary, the Hamilton wins. If you specifically need a diver&apos;s watch, the Seiko&apos;s premium is justified and recovers well in resale.
          </p>

          <h2 className="text-3xl font-black text-slate-900 mb-6 mt-10">Ideal Use Cases</h2>
          <p className="text-slate-700 text-lg leading-relaxed mb-6">
            Choose the <strong>Hamilton Khaki Field Auto 38</strong> if you want a single watch that works everywhere: hiking trails, office meetings, formal dinners, casual weekends. Its compact size, field aesthetics, and exceptional power reserve make it the ultimate daily carry. It&apos;s the watch for travelers who don&apos;t want to pack multiples.
          </p>
          <p className="text-slate-700 text-lg leading-relaxed mb-6">
            Choose the <strong>Seiko Prospex SPB143</strong> if you&apos;re an active diver, frequent swimmer, or simply want a watch explicitly engineered for water immersion. It&apos;s the watch for ocean-focused adventurers and those who value proven dive watch heritage. It also works as a capable casual watch, but it&apos;s optimized for the water first.
          </p>

          <h2 className="text-3xl font-black text-slate-900 mb-6 mt-10">Final Verdict</h2>
          <p className="text-slate-700 text-lg leading-relaxed mb-6">
            Neither watch is objectively &quot;better.&quot; The Hamilton Khaki Field Auto 38 is the smarter buy for most people: exceptional value, uncompromising daily versatility, and a power reserve that redefines convenience. The Seiko Prospex SPB143 is the choice for those who need or want genuine dive credentials and are willing to pay the premium for proven submersible heritage.
          </p>
          <p className="text-slate-700 text-lg leading-relaxed">
            If you own only one watch, the Hamilton. If you&apos;re building a collection and need a diver, the Seiko.
          </p>
        </section>

        {/* Spec Comparison Table */}
        <section className="my-12">
          <h2 className="text-3xl font-black text-slate-900 mb-6">Detailed Specifications</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-amber-100 border-b-2 border-amber-600">
                  <th className="text-left p-4 font-black text-slate-900">Specification</th>
                  <th className="text-left p-4 font-black text-slate-900">{w1.name}</th>
                  <th className="text-left p-4 font-black text-slate-900">{w2.name}</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-200 hover:bg-amber-50 transition">
                  <td className="p-4 font-semibold text-slate-900">Brand</td>
                  <td className="p-4 text-slate-700">{w1.brand}</td>
                  <td className="p-4 text-slate-700">{w2.brand}</td>
                </tr>
                <tr className="border-b border-slate-200 hover:bg-amber-50 transition">
                  <td className="p-4 font-semibold text-slate-900">Reference</td>
                  <td className="p-4 text-slate-700">{w1.reference}</td>
                  <td className="p-4 text-slate-700">{w2.reference}</td>
                </tr>
                <tr className="border-b border-slate-200 hover:bg-amber-50 transition">
                  <td className="p-4 font-semibold text-slate-900">Case Diameter</td>
                  <td className="p-4 text-slate-700">{w1.case_diameter_mm}mm</td>
                  <td className="p-4 text-slate-700">{w2.case_diameter_mm}mm</td>
                </tr>
                <tr className="border-b border-slate-200 hover:bg-amber-50 transition">
                  <td className="p-4 font-semibold text-slate-900">Case Thickness</td>
                  <td className="p-4 text-slate-700">{w1.case_thickness_mm}mm</td>
                  <td className="p-4 text-slate-700">{w2.case_thickness_mm}mm</td>
                </tr>
                <tr className="border-b border-slate-200 hover:bg-amber-50 transition">
                  <td className="p-4 font-semibold text-slate-900">Lug to Lug</td>
                  <td className="p-4 text-slate-700">{w1.lug_to_lug_mm}mm</td>
                  <td className="p-4 text-slate-700">{w2.lug_to_lug_mm}mm</td>
                </tr>
                <tr className="border-b border-slate-200 hover:bg-amber-50 transition">
                  <td className="p-4 font-semibold text-slate-900">Case Material</td>
                  <td className="p-4 text-slate-700">{w1.case_material}</td>
                  <td className="p-4 text-slate-700">{w2.case_material}</td>
                </tr>
                <tr className="border-b border-slate-200 hover:bg-amber-50 transition">
                  <td className="p-4 font-semibold text-slate-900">Crystal</td>
                  <td className="p-4 text-slate-700">{w1.crystal}</td>
                  <td className="p-4 text-slate-700">{w2.crystal}</td>
                </tr>
                <tr className="border-b border-slate-200 hover:bg-amber-50 transition">
                  <td className="p-4 font-semibold text-slate-900">Movement Type</td>
                  <td className="p-4 text-slate-700 capitalize">{w1.movement_type}</td>
                  <td className="p-4 text-slate-700 capitalize">{w2.movement_type}</td>
                </tr>
                <tr className="border-b border-slate-200 hover:bg-amber-50 transition">
                  <td className="p-4 font-semibold text-slate-900">Movement Caliber</td>
                  <td className="p-4 text-slate-700">{w1.movement_caliber}</td>
                  <td className="p-4 text-slate-700">{w2.movement_caliber}</td>
                </tr>
                <tr className="border-b border-slate-200 hover:bg-amber-50 transition">
                  <td className="p-4 font-semibold text-slate-900">Power Reserve</td>
                  <td className="p-4 text-slate-700">{w1.power_reserve_hours}h</td>
                  <td className="p-4 text-slate-700">{w2.power_reserve_hours}h</td>
                </tr>
                <tr className="border-b border-slate-200 hover:bg-amber-50 transition">
                  <td className="p-4 font-semibold text-slate-900">Water Resistance</td>
                  <td className="p-4 text-slate-700">{w1.water_resistance_m}m</td>
                  <td className="p-4 text-slate-700">{w2.water_resistance_m}m</td>
                </tr>
                <tr className="border-b border-slate-200 hover:bg-amber-50 transition">
                  <td className="p-4 font-semibold text-slate-900">New Price (USD)</td>
                  <td className="p-4 text-slate-700 font-bold">{formatPrice(w1.price_new_usd)}</td>
                  <td className="p-4 text-slate-700 font-bold">{formatPrice(w2.price_new_usd)}</td>
                </tr>
                <tr>
                  <td className="p-4 font-semibold text-slate-900">Pre-owned Price (USD)</td>
                  <td className="p-4 text-slate-700 font-bold">{formatPrice(w1.price_preowned_usd)}</td>
                  <td className="p-4 text-slate-700 font-bold">{formatPrice(w2.price_preowned_usd)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="my-12 max-w-3xl mx-auto">
          <h2 className="text-3xl font-black text-slate-900 mb-8">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {faqItems.map((item, idx) => (
              <div key={idx} className="bg-amber-50 border border-amber-300 rounded-lg p-6">
                <h3 className="text-lg font-black text-slate-900 mb-3">{idx + 1}. {item.question}</h3>
                <p className="text-slate-700 leading-relaxed">{item.answer}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="bg-amber-100 border-2 border-amber-600 rounded-xl p-6 md:p-8 my-10 text-center">
          <h2 className="text-2xl font-black text-slate-900 mb-3">Explore More Comparisons</h2>
          <p className="text-slate-700 mb-6">Find head-to-head breakdowns of your favorite watches.</p>
          <Link href="/compare" className="inline-block px-6 py-3 bg-amber-600 text-white font-bold rounded-lg hover:bg-amber-700 transition-colors">
            View All Comparisons →
          </Link>
        </section>
      </Container>
    </>
  )
}
