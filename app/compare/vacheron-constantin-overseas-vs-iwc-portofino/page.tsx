import type { Metadata } from 'next'
import Link from 'next/link'
import { Container } from '@/components/ui/Container'
import { Card } from '@/components/ui/Card'
import { VerdictCallout } from '@/components/ui/VerdictCallout'

// Hardcoded watch data
const vacheron = {
  slug: 'vacheron-constantin-overseas-4500v',
  name: 'Overseas 4500V',
  brand: 'Vacheron Constantin',
  reference: '4500V/110A-B146',
  case_diameter_mm: 42.5,
  case_thickness_mm: 12.5,
  lug_to_lug_mm: 50,
  movement_type: 'mechanical',
  movement_caliber: '1120/1',
  power_reserve_hours: 48,
  water_resistance_m: 150,
  crystal: 'sapphire',
  case_material: 'Stainless Steel',
  bracelet_material: 'Integrated bracelet',
  price_new_usd: { min: 32000, max: 38000 },
  price_preowned_usd: { min: 24000, max: 32000 },
  score: 9,
  buy_again_pct: 92,
}

const iwc = {
  slug: 'iwc-portofino-iw356505',
  name: 'Portofino Chronograph 42',
  brand: 'IWC',
  reference: 'IW356505',
  case_diameter_mm: 42,
  case_thickness_mm: 13.8,
  lug_to_lug_mm: 49.5,
  movement_type: 'mechanical',
  movement_caliber: '79320',
  power_reserve_hours: 42,
  water_resistance_m: 100,
  crystal: 'sapphire',
  case_material: 'Stainless Steel',
  bracelet_material: 'Integrated bracelet',
  price_new_usd: { min: 7500, max: 8500 },
  price_preowned_usd: { min: 5500, max: 7000 },
  score: 8,
  buy_again_pct: 88,
}

function formatPrice(price: { min: number; max: number }): string {
  if (price.min === price.max) return `$${price.min.toLocaleString()}`
  return `$${price.min.toLocaleString()}–$${price.max.toLocaleString()}`
}

// Metadata
export const metadata: Metadata = {
  title: 'Vacheron Constantin Overseas vs IWC Portofino | Luxury Watch Comparison',
  description: 'Compare Vacheron Constantin Overseas 4500V vs IWC Portofino Chronograph. Detailed specs, in-house movements, case finishing, heritage, price positioning, and expert verdict on these two iconic luxury sports watches.',
  keywords: ['Vacheron Constantin Overseas', 'IWC Portofino', 'luxury watch comparison', 'integrated bracelet', '1120 vs 79320 movement', 'dress sports watch'],
  openGraph: {
    title: 'Vacheron Constantin Overseas vs IWC Portofino',
    description: 'Complete head-to-head comparison of two legendary luxury integrated sports watches.',
    type: 'website',
    images: [{
      url: 'https://watchvswatch.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'Vacheron Constantin vs IWC comparison',
    }],
  },
}

// FAQ items for schema
const faqItems = [
  {
    question: 'Why is the Vacheron Constantin so much more expensive?',
    answer: `Vacheron Constantin is the oldest continuous watchmaker in the world, established 1755, with unmatched heritage and prestige. The Overseas uses a fully in-house caliber 1120/1 developed over decades of refinement. VC applies extraordinary finishing standards: Genevese stripes, hand-engraving, angle polishing on bevels that takes Master watchmakers days to perfect. The IWC Portofino uses the industrial-strength 79320 caliber (also in-house but broader market), with factory finishing optimized for efficiency. VC represents the pinnacle of old-world watchmaking cost and philosophy; IWC represents intelligent engineering at luxury scale.`,
  },
  {
    question: 'Which movement is more reliable long-term?',
    answer: `Both are bulletproof in-house mechanisms. The VC 1120/1 is legendary for precision and longevity&mdash;many examples run perfectly after 30+ years with minimal service. The IWC 79320 is deployed across Portofino and Doppelchronograph lines with millions of service hours logged. The 79320 may actually have broader service support globally due to IWC&apos;s larger authorized dealer network. For raw reliability, statistically they&apos;re equal; the VC edges ahead in legendary track record, but the IWC&apos;s modular design means easier servicing at broader centers.`,
  },
  {
    question: 'What about case finishing and polishing?',
    answer: `This is where luxury watchmaking reveals itself. Vacheron Constantin applies angle polishing to the bevels of the Overseas case&mdash;a hand-craft process that takes a specialist hours per watch. The result is a mirror-like bevel that catches light from specific angles. IWC applies excellent but mechanized satin finishing and controlled polishing. Both are objectively &quot;finished to a high standard,&quot; but VC&apos;s Overseas represents the upper extreme of finishing ambition. If you examine both under magnification, the VC&apos;s bevels will show evidence of hand work and artisanal care; the IWC shows precise, repeatable manufacturing excellence.`,
  },
  {
    question: 'Which is the better investment for resale value?',
    answer: `The Vacheron Constantin Overseas, especially steel models, commands one of the strongest secondary markets in watchmaking. They appreciate or hold value remarkably well&mdash;some have appreciated 10&ndash;20% over 3&ndash;5 years due to production limits and brand prestige. The IWC Portofino, while respected, depreciates more typically: 20&ndash;30% in the first two years, then stabilizes. If investment potential influences your decision, VC is the clear winner. You can lose money on either, but the VC is structured to preserve capital more reliably.`,
  },
  {
    question: 'Which watch is more versatile for different outfits?',
    answer: `The IWC Portofino is the more versatile dress-to-casual piece. Its cleaner dial (no subdials on base model), slender proportions, and integrated bracelet flow seamlessly from a business suit to weekend casual. The Vacheron Overseas, while classically sporty-elegant, broadcasts &quot;prestige timepiece&quot; louder due to its integrated bracelet geometry and the sheer gravitas of the brand. Both excel in dress-casual, but the IWC transitions slightly more naturally from formal to casual contexts without commanding attention. The VC, by contrast, is a statement piece&mdash;it announces you have arrived.`,
  },
  {
    question: 'Should I choose based on movement finishing or wearability?',
    answer: `If movement finishing and artisanal case work excite you, buy the Vacheron. Collectors who love examining their watches under magnification, opening the caseback, and appreciating hand-polished bevels will find VC transcendent. If daily wearability, versatility, and intelligent engineering matter more, the IWC Portofino is the smarter choice. It&apos;s also 4x more affordable, leaving capital for a second or third watch. The VC is a &quot;one perfect watch&quot; purchase; the IWC is a &quot;cornerstone of a collection&quot; purchase.`,
  },
]

export default function ComparisonPage() {
  const w1 = vacheron
  const w2 = iwc

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
                    item: 'https://watchvswatch.com/compare/vacheron-constantin-overseas-vs-iwc-portofino',
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
          Comparing the <strong className="text-slate-900">{w1.brand} {w1.name}</strong> ({formatPrice(w1.price_new_usd)}, {w1.water_resistance_m}m WR, {w1.case_diameter_mm}mm, in-house 1120/1) against the <strong className="text-slate-900">{w2.brand} {w2.name}</strong> ({formatPrice(w2.price_new_usd)}, {w2.water_resistance_m}m WR, {w2.case_diameter_mm}mm, 79320 chronograph) &mdash; specs, heritage, movement analysis, and expert verdict below.
        </p>

        {/* Verdict Callout */}
        <VerdictCallout 
          winnerName="Vacheron Constantin Overseas 4500V" 
          verdictSummary="Unmatched heritage, legendary finishing, investment-grade resale. The pinnacle of luxury sports watch craftsmanship and collecting."
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
                    <div className="text-4xl font-black text-amber-600">{w.score.toFixed(1)} / 10</div>
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
          <h2 className="text-3xl font-black text-slate-900 mb-6">Heritage &amp; Legacy</h2>
          <p className="text-slate-700 text-lg leading-relaxed mb-6">
            The Vacheron Constantin Overseas and IWC Portofino represent two distinct philosophies in luxury watchmaking&apos;s upper echelon. Vacheron Constantin, founded 1755, is the oldest continuously operating watchmaker on Earth. The Overseas line, launched 1977, evolved from the Integrated collection and embodies VC&apos;s commitment to refined sports watches for discerning collectors. Every Overseas is assembled by hand, with movements visible through a caseback exhibition that showcases decades of in-house caliber refinement.
          </p>
          <p className="text-slate-700 text-lg leading-relaxed mb-6">
            The IWC Portofino, descended from the Aquatimer family and modernized into its current dress-sport form, carries IWC's schaffhausen engineering ethos: precision, reliability, and intelligent innovation. While younger than VC, IWC (founded 1868) has a 150-year legacy of making watches for professionals and collectors who value dependability above ornament. The Portofino is engineered for the executive who wants luxury without pretense.
          </p>

          <h2 className="text-3xl font-black text-slate-900 mb-6 mt-10">Movement Architecture &amp; In-House Calibers</h2>
          <p className="text-slate-700 text-lg leading-relaxed mb-6">
            The Vacheron Constantin Overseas is powered by the caliber 1120/1, a fully in-house automatic movement developed and refined over decades. This movement is a time capsule of old-school Swiss watchmaking philosophy: symmetrical decoration on both sides, hand-engraved balance cocks, Genevese stripes applied by hand at VC&apos;s Geneva workshops, and finishing that borders on jewel-like. The 48-hour power reserve ensures the watch survives a weekend without winding. The 1120/1 beats at 4 Hz (28,800 bph), a slightly lower frequency than competitors, which contributes to legendary accuracy and component longevity&mdash;parts experience less stress at this rhythm.
          </p>
          <p className="text-slate-700 text-lg leading-relaxed mb-6">
            The IWC Portofino Chronograph 42 houses the caliber 79320, also fully in-house but engineered for the modern production environment. The 79320 is a column-wheel chronograph with 42-hour power reserve, deployed across multiple IWC collections. It&apos;s equally reliable as the VC 1120/1 but optimized for manufacturing efficiency and modular repair. The 79320 beats at 4 Hz as well, showing IWC&apos;s similar philosophy on stress reduction. Where they diverge: VC finishes the 1120/1 to transcendent standards visible only under magnification; IWC finishes the 79320 to exacting factory standards sufficient for luxury but not approaching VC&apos;s investment in hand-work.
          </p>

          <h2 className="text-3xl font-black text-slate-900 mb-6 mt-10">Case Design &amp; Finishing Mastery</h2>
          <p className="text-slate-700 text-lg leading-relaxed mb-6">
            The Vacheron Constantin Overseas 4500V features an integrated bracelet case design that appears simple but represents engineering precision. The case is polished and brushed with intentional contrast&mdash;polished surfaces on top surfaces, brushed on sides&mdash;but the real artistry lies in the bevels. VC applies angle polishing to all bevels, a hand-craft operation where a specialist takes hours with fine abrasives to achieve a mirror-like finish on the bevel facets. When you examine an Overseas under light, the bevels catch and reflect with a distinctive glow. The caseback is hand-engraved with the VC hallmark and individual serial detailing. Thickness of 12.5mm keeps it elegant; the 50mm lug-to-lug makes it wearable on most wrists despite its 42.5mm width.
          </p>
          <p className="text-slate-700 text-lg leading-relaxed mb-6">
            The IWC Portofino Chronograph 42 applies excellent but more standardized finishing. The case is polished and brushed with sharp transitions, achieved through CNC tooling and automated finishing lines. The result is consistent, sharp, and objectively beautiful. However, under magnification, you&apos;ll see the hand-craft that VC lavishes is absent&mdash;everything is mechanically repeatable. The IWC case measures 13.8mm thick and 49.5mm lug-to-lug, marginally larger than the VC, giving it a slightly more assertive presence. Both feature sapphire crystals and equally robust stainless steel construction, but VC&apos;s finishing philosophy takes case artistry to a higher plane.
          </p>

          <h2 className="text-3xl font-black text-slate-900 mb-6 mt-10">Water Resistance &amp; Practical Engineering</h2>
          <p className="text-slate-700 text-lg leading-relaxed mb-6">
            The Vacheron Constantin Overseas offers 150m water resistance&mdash;adequate for swimming and snorkeling, occasional saltwater exposure. The IWC Portofino offers 100m, suitable for daily splash and light water contact. In practical terms, both are water-resistant dress sports watches, not diving instruments. The difference is marginal; neither invites submersion beyond their rating. Both feature integrated bracelets with secure clasps, and both hold tightness over decades of use through VC&apos;s and IWC&apos;s legendary service standards.
          </p>

          <h2 className="text-3xl font-black text-slate-900 mb-6 mt-10">Price Positioning & Market Reality</h2>
          <p className="text-slate-700 text-lg leading-relaxed mb-6">
            The Vacheron Constantin Overseas retails $32,000&ndash;$38,000 USD, putting it in the rarefied &quot;haute horlogerie&quot; price bracket. This reflects not just the 1120/1 movement and stainless steel, but the hand-craft in finishing, the heritage premium, and scarcity (VC produces a fraction of what competitors make). On the secondary market, it holds value remarkably&mdash;used examples command $24,000&ndash;$32,000, recovering 65&ndash;75% of retail even after several years of ownership. Some examples appreciate due to discontinued references or strong collector demand.
          </p>
          <p className="text-slate-700 text-lg leading-relaxed mb-6">
            The IWC Portofino Chronograph 42 retails $7,500–$8,500, roughly one-fifth the VC price. It's a legitimate luxury watch but accessible to a broader collector base. Secondary market pricing typically runs $5,500–$7,000 (70–80% of retail), showing solid but less dramatic retention than VC. The IWC is a smart luxury purchase; the VC is an investment-grade purchase. If capital preservation matters to your decision, VC is the mathematically superior choice.
          </p>

          <h2 className="text-3xl font-black text-slate-900 mb-6 mt-10">Target Audience & Positioning</h2>
          <p className="text-slate-700 text-lg leading-relaxed mb-6">
            The Vacheron Constantin Overseas appeals to established collectors with significant timepiece experience. Buyers typically own multiple watches already and appreciate artisanal finishing, heritage storytelling, and investment characteristics. VC collectors are often attracted to the craft, not just the function. They examine movements under magnification, read books about watchmaking history, and view watches as portable jewelry and mechanical art. Overseas buyers often wear their purchases infrequently (rotating through a collection) to preserve value.
          </p>
          <p className="text-slate-700 text-lg leading-relaxed mb-6">
            The IWC Portofino appeals to the sophisticated professional who wants a serious luxury watch but prioritizes practicality and versatility. Portofino buyers tend to wear their watches daily, in professional and casual contexts. IWC&apos;s reputation for durability and service support appeals to users who want the luxury without collecting obsession. Portofino is a &quot;buy once, wear forever&quot; watch; Overseas is a &quot;cornerstone of a collection&quot; watch.
          </p>

          <h2 className="text-3xl font-black text-slate-900 mb-6 mt-10">Service &amp; Long-Term Maintenance</h2>
          <p className="text-slate-700 text-lg leading-relaxed mb-6">
            Vacheron Constantin service is available globally but limited; VC has fewer authorized service centers than mainstream luxury brands. A full movement service (overhaul, cleaning, lubrication) typically costs $2,500&ndash;$4,000 and takes 4&ndash;8 weeks. However, VC movement quality is so superior that many examples go 10&ndash;15 years between services without issue. Spare parts are expensive and made to order, adding to servicing costs. VC service philosophy is &quot;build it right the first time, then care for it methodically.&quot;
          </p>
          <p className="text-slate-700 text-lg leading-relaxed mb-6">
            IWC service is more readily accessible, with authorized centers in most major cities. A comparable movement service runs $1,500&ndash;$2,500. The 79320 caliber is standardized across multiple references, so spare parts are sometimes available from stock. IWC&apos;s modular design means certain components can be replaced without full overhauls, potentially reducing service costs for minor work. For collectors who plan to wear their watches actively, IWC&apos;s broader service infrastructure is a practical advantage.
          </p>

          <h2 className="text-3xl font-black text-slate-900 mb-6 mt-10">Final Verdict</h2>
          <p className="text-slate-700 text-lg leading-relaxed mb-6">
            If you are an experienced collector, appreciate hand-craft finishing, and view watches as art objects with investment characteristics, the Vacheron Constantin Overseas is transcendent. It represents the pinnacle of watch finishing philosophy and carries a 270-year legacy of watchmaking excellence. The 1120/1 movement is a masterpiece; the case finishing is visible testimony to old-world artisanal care. Buy it if capital preservation and collecting passion justify the premium.
          </p>
          <p className="text-slate-700 text-lg leading-relaxed">
            If you want a serious, prestige luxury watch to wear daily, appreciate intelligent engineering over ornamental finishing, and prefer broader service accessibility, the IWC Portofino is the smarter choice. It&apos;s equally reliable, beautifully made, and offers exceptional value relative to VC. You&apos;ll have capital left over for additional watches, travel, or life experiences. Buy it if practicality and versatility matter more than investment grade positioning.
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
                  <td className="p-4 font-semibold text-slate-900">Bracelet</td>
                  <td className="p-4 text-slate-700">{w1.bracelet_material}</td>
                  <td className="p-4 text-slate-700">{w2.bracelet_material}</td>
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
          <h2 className="text-2xl font-black text-slate-900 mb-3">Explore More Luxury Comparisons</h2>
          <p className="text-slate-700 mb-6">Find head-to-head breakdowns of your favorite watches.</p>
          <Link href="/compare" className="inline-block px-6 py-3 bg-amber-600 text-white font-bold rounded-lg hover:bg-amber-700 transition-colors">
            View All Comparisons →
          </Link>
        </section>
      </Container>
    </>
  )
}
