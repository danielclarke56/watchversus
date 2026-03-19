import type { Metadata } from 'next'
import Link from 'next/link'
import { Container } from '@/components/ui/Container'
import { Card } from '@/components/ui/Card'
import { VerdictCallout } from '@/components/ui/VerdictCallout'

// Hardcoded watch data
const vacheron = {
  slug: 'vacheron-constantin-overseas-4500v',
  name: 'Overseas 42',
  brand: 'Vacheron Constantin',
  reference: '4500V/110A-B674',
  case_diameter_mm: 42.5,
  case_thickness_mm: 11.8,
  lug_to_lug_mm: 50,
  movement_type: 'mechanical',
  movement_caliber: '2000',
  power_reserve_hours: 40,
  water_resistance_m: 300,
  crystal: 'sapphire',
  case_material: 'Stainless Steel',
  bracelet_material: 'Integrated steel bracelet',
  price_new_usd: { min: 36000, max: 42000 },
  price_preowned_usd: { min: 28000, max: 35000 },
  score: 9,
  buy_again_pct: 85,
}

const iwc = {
  slug: 'iwc-portofino-40',
  name: 'Portofino 40',
  brand: 'IWC',
  reference: 'IW356504',
  case_diameter_mm: 40,
  case_thickness_mm: 8.15,
  lug_to_lug_mm: 46,
  movement_type: 'mechanical',
  movement_caliber: '35111',
  power_reserve_hours: 42,
  water_resistance_m: 100,
  crystal: 'sapphire',
  case_material: 'Stainless Steel',
  bracelet_material: 'Leather strap',
  price_new_usd: { min: 6500, max: 8000 },
  price_preowned_usd: { min: 5000, max: 6500 },
  score: 8,
  buy_again_pct: 82,
}

function formatPrice(price: { min: number; max: number }): string {
  if (price.min === price.max) return `$${price.min.toLocaleString()}`
  return `$${price.min.toLocaleString()}–$${price.max.toLocaleString()}`
}

// Metadata
export const metadata: Metadata = {
  title: 'Vacheron Constantin Overseas vs IWC Portofino | Luxury Watch Comparison',
  description: 'Compare Vacheron Constantin Overseas 42 vs IWC Portofino 40. In-depth analysis of Swiss luxury sports vs dress watches, movement engineering, heritage, case finishing, price positioning, and collector value.',
  keywords: ['Vacheron Constantin Overseas', 'IWC Portofino', 'luxury watch comparison', 'sports watch vs dress watch', 'mechanical movement comparison', 'haute horlogerie'],
  openGraph: {
    title: 'Vacheron Constantin Overseas vs IWC Portofino',
    description: 'Complete head-to-head comparison of two legendary Swiss luxury watches.',
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
    question: 'Which watch represents better value for luxury collectors?',
    answer: `The IWC Portofino at $6,500–$8,000 delivers exceptional technical credibility for the price, featuring IWC's refined Caliber 35111 and prestigious Schaffhausen provenance. The Vacheron Constantin Overseas at $36,000–$42,000 commands a seven-fold premium, justified by Vacheron's 270-year heritage, superior case finishing (Hallmark of Geneva certification), and the caliber 2000's engineering excellence. For collectors seeking accessible luxury watchmaking, IWC wins decisively. For those pursuing haute horlogerie and collector-grade prestige, Vacheron's premium reflects institutional heritage and resale strength. Neither watch is overpriced—both deliver commensurate value, but at vastly different investment thresholds.`,
  },
  {
    question: 'How do the movements compare technically and in refinement?',
    answer: `The Vacheron Constantin Caliber 2000 is hand-finished to exacting standards: hand-beveled bridges, perlage (pebble grain) decoration, and Côtes de Genève (Geneva stripes) are visible through the display caseback. It's a showcase of watchmaking artistry, with each component hand-decorated by master finishers. The IWC Caliber 35111, while mechanically robust and precise, employs more industrial finishing—visible but less ornamental. Both are chronometer-grade movements with exceptional accuracy (±4 seconds/day), but Vacheron's movement is watchmaking jewelry; IWC's is functional engineering dressed with dignity. For connoisseurs who value finishing and decoration, Vacheron excels. For those prioritizing reliability and straightforward performance, IWC is equally compelling.`,
  },
  {
    question: 'What about water resistance—does the Portofino\'s 100m limit matter?',
    answer: `The Portofino's 100m rating is adequate for splashes, hand washing, and light rain—typical daily water exposure. It's not suitable for swimming, snorkeling, or beach wear. The Overseas' 300m rating invites active water sports, occasional diving, and confident wear in any water scenario. For collectors who swim, dive, or spend time on water, the Overseas is mandatory. For desk-bound collectors and urban wearers, the Portofino's limitation is irrelevant. IWC intentionally positioned the Portofino as a dress watch; its thin 8.15mm profile confirms this philosophy. Vacheron's Overseas bridges sports capability and refined aesthetics—it's the versatile luxury choice for those who want performance and elegance unified.`,
  },
  {
    question: 'Which watch is more wearable day-to-day on different wrist sizes?',
    answer: `The IWC Portofino's 40mm case, 8.15mm thickness, and 46mm lug-to-lug make it exceptionally versatile across wrist sizes and dress codes. It fits under shirt cuffs with ease, works on formal leather, casual rubber, or fabric straps, and suits both smaller and medium wrists. The Vacheron Overseas, at 42.5mm and 11.8mm thick, is chunkier—better suited to medium and larger wrists, though not unreasonably large. The Overseas integrates into the bracelet design, giving it a more tool-watch presence. For maximum versatility and comfort across scenarios, the Portofino wins. For those with larger wrists seeking a robust, purposeful sports luxury watch, the Overseas is tailor-made.`,
  },
  {
    question: 'How do Vacheron Constantin and IWC differ in watchmaking philosophy?',
    answer: `Vacheron Constantin, founded 1755, is the world's oldest continuously operating watchmaker. It embodies grand tradition: hand-finishing, in-house movement design, precious metals heritage, and meticulous attention to decoration. Every Vacheron carries the Hallmark of Geneva—a certification of excellence few brands uphold. IWC Schaffhausen (founded 1868) pioneers engineering innovation: reliable chronograph movements, innovative case designs, and pragmatic functionality. IWC excels at doing "good enough" better than anyone else; Vacheron pursues perfection. Vacheron appeals to traditionalists and heritage collectors; IWC appeals to those valuing innovation and efficiency. Both are elite Swiss houses, but Vacheron leans classical, while IWC embraces modernity.`,
  },
  {
    question: 'Which watch appreciates or holds value better in the secondary market?',
    answer: `Both watches are strong stores of value, retaining 75–85% of retail price on the secondary market. Vacheron Constantinovals typically hold slightly better due to scarcity, heritage premium, and strong demand from ultra-high-net-worth collectors. The Overseas in steel is particularly sought after—rarer than precious metal versions. IWC Portofinos hold well relative to retail price but face slightly more competition from new production (IWC produces higher volumes). Neither watch will appreciate significantly, but both resist depreciation admirably. For long-term collector strength and investment psychology, Vacheron edges IWC—but IWC is no slouch. If you wear and enjoy the watch first, resale becomes secondary; both are safe choices.`,
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
          Comparing the <strong className="text-slate-900">{w1.brand} {w1.name}</strong> ({formatPrice(w1.price_new_usd)}, {w1.water_resistance_m}m WR, {w1.case_diameter_mm}mm) against the <strong className="text-slate-900">{w2.brand} {w2.name}</strong> ({formatPrice(w2.price_new_usd)}, {w2.water_resistance_m}m WR, {w2.case_diameter_mm}mm) — two contrasting visions of Swiss luxury watchmaking. Detailed specs, movement analysis, heritage comparison, and expert positioning below.
        </p>

        {/* Verdict Callout */}
        <VerdictCallout 
          winnerName="Vacheron Constantin Overseas 42" 
          verdictSummary="The institution's masterpiece. Supreme finishing, sports versatility, and 270 years of watchmaking excellence. For serious collectors and those seeking haute horlogerie."
        />

        {/* Hero Section */}
        <section id="comparison-hero" className="bg-gradient-to-br from-amber-50 via-white to-slate-50 border border-slate-200 rounded-2xl overflow-hidden mb-12 shadow-md p-10">
          {/* Main headline */}
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight mb-3">
              <span className="block">{w1.brand}</span>
              <span className="block">{w1.name}</span>
              <span className="text-amber-600 text-3xl md:text-4xl">vs</span>
              <span className="block">{w2.brand}</span>
              <span className="block">{w2.name}</span>
            </h1>
            <p className="text-slate-700 text-lg md:text-xl">Luxury sports watch confrontation: Heritage icon meets modern engineering</p>
          </div>

          {/* Watch Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-8">
            {[w1, w2].map((w, i) => (
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
          <h2 className="text-3xl font-black text-slate-900 mb-6">Heritage & Design Philosophy</h2>
          <p className="text-slate-700 text-lg leading-relaxed mb-6">
            The <strong>Vacheron Constantin Overseas</strong> traces its lineage to 1977, when the brand introduced the Integrated Bracelet collection—a revolutionary concept uniting case and bracelet into a singular design continuum. Reintroduced in 2006, the modern Overseas honors that legacy while embracing contemporary sports watch expectations. The octagonal case, faceted bezel, and integrated bracelet create an instantly recognizable silhouette that whispers rather than shouts. The dial is minimalist: applied indices, sword hands, and a date window positioned with surgical precision. This is Vacheron's interpretation of sporty elegance—refined utility for collectors who refuse to compromise.
          </p>
          <p className="text-slate-700 text-lg leading-relaxed mb-6">
            The <strong>IWC Portofino</strong> emerged in 2002 as IWC's answer to the dress watch renaissance. Named after the Italian seaside village, it embodies Mediterranean charm married to German precision. The Portofino's thin profile (8.15mm) and elegant proportions make it a dress watch first, water resistance second. Unlike the Overseas' technical presence, the Portofino invites you to forget it's on your wrist—its thinness and refined proportions dissolve into the background. The dial layout is traditional: applied hour markers, Breguet-style hands, and date window in harmonious balance. This is IWC's declaration that luxury lies in restraint and usability, not ostentation.
          </p>

          <h2 className="text-3xl font-black text-slate-900 mb-6 mt-10">Movement Engineering & Technical Excellence</h2>
          <p className="text-slate-700 text-lg leading-relaxed mb-6">
            Vacheron Constantin's Caliber 2000 is a mechanical masterpiece engineered entirely in-house. Every component—balance wheel, escapement, wheels—is designed and manufactured to exacting specifications. The movement is visible through a display caseback, revealing hand-applied decoration: beveled bridges, circular perlage, and Geneva stripes applied by master artisans. This finishing is not superficial; each technique requires decades of training. The chronometer-grade regulation ensures ±4 seconds per day accuracy, among the finest for mechanical watches. A 40-hour power reserve suits modern wear patterns—set it down Friday evening, wear it Monday morning without winding.
          </p>
          <p className="text-slate-700 text-lg leading-relaxed mb-6">
            IWC's Caliber 35111 is an in-house design combining practicality with precision. It's a 6-jewel automatic movement (fewer jewels than luxury peers, intentional for durability) that prioritizes reliability over ornamentation. The finishing is visible but restrained—no hand-decoration. The balance is hairspring-adjusted for temperature compensation, ensuring consistent timekeeping across seasons. The 42-hour power reserve marginally edges Vacheron's 40 hours. For watchmakers prioritizing service accessibility and proven track records, IWC's approach is sophisticated: "good engineering needs no decoration." Both movements are chronometer-certified and capable of 50+ years of faithful service. The difference is philosophy: Vacheron treats the movement as wearable art; IWC treats it as a functional engine.
          </p>

          <h2 className="text-3xl font-black text-slate-900 mb-6 mt-10">Case Finishing & Watchmaking Craftsmanship</h2>
          <p className="text-slate-700 text-lg leading-relaxed mb-6">
            Vacheron Constantin applies the Hallmark of Geneva standard to every Overseas: this legendary certification, established in 1886, mandates hand-finishing, precise tolerances, and aesthetic excellence. The caseback, polishing, brushing, and even the screw slots are executed to museum standards. Under magnification, the Overseas' case reveals beveled edges, mirror-polished lugs, and brushed surfaces with intentional directionality. The integrated bracelet is solid steel, fitted with exceptional tolerance. When you hold an Overseas, you're holding the institutional refinement of 270 years of continuous watchmaking practice.
          </p>
          <p className="text-slate-700 text-lg leading-relaxed mb-6">
            IWC's Portofino is impeccably finished but without the Hallmark of Geneva's hand-decoration mandate. The case is precision-engineered using CNC machinery—uniformity and consistency over hand-artistry. The thin profile requires exquisite engineering tolerance; every surface is finished to a high standard, but via industrial techniques rather than hand-tooling. The bracelet or strap attachment is seamless and robust. IWC's approach reflects its German roots: engineering excellence, functional beauty, and uncompromising precision without unnecessary ornament. The Portofino is beautifully made; the Overseas is art.
          </p>

          <h2 className="text-3xl font-black text-slate-900 mb-6 mt-10">Water Resistance & Active Wear</h2>
          <p className="text-slate-700 text-lg leading-relaxed mb-6">
            The Overseas' 300-meter water resistance invites confident water engagement: swimming, snorkeling, and light diving are all well within safe parameters. The screw-down crown and exhibition caseback's robust design ensure this rating is backed by rigorous testing. The robust design philosophy suggests the watch can accompany you to sailing regattas, beachside vacations, or tropical expeditions without hesitation.
          </p>
          <p className="text-slate-700 text-lg leading-relaxed mb-6">
            The Portofino's 100-meter rating suits shower splashes, hand-washing, and unexpected rain—but excludes intentional swimming or water sports. This limitation is entirely intentional; IWC positioned the Portofino as an elegant dress watch, not a tool. The leather strap (typical configuration) is not water-resistant. This honest positioning respects the watch's purpose: a sophisticated companion for boardrooms, galas, and refined occasions, not a multipurpose instrument. Neither rating is "wrong"—they reflect different design intent.
          </p>

          <h2 className="text-3xl font-black text-slate-900 mb-6 mt-10">Pricing, Positioning & Target Audience</h2>
          <p className="text-slate-700 text-lg leading-relaxed mb-6">
            The Vacheron Constantin Overseas commands a $36,000–$42,000 retail price. This positions it among elite luxury watches, accessible primarily to collectors with substantial horological budgets or high net worth. Vacheron attracts those who view watches as investments in heritage and artistry—collectors who own multiple watches, study movements, and understand the craftsmanship represented in a Hallmark of Geneva certified timepiece. The Overseas appeals to serious watch enthusiasts: those who've owned a dozen watches and now seek the ultimate merger of sports capability and timeless design.
          </p>
          <p className="text-slate-700 text-lg leading-relaxed mb-6">
            The IWC Portofino's $6,500–$8,000 price point is still deeply luxury but roughly one-sixth that of the Overseas. This positions it as the entry point to haute horlogerie for successful professionals. The Portofino attracts those seeking exceptional craftsmanship without the ultra-premium price tag—practitioners, executives, and collectors who value elegant functionality over technical fireworks. It's the watch for your first truly luxury timepiece or your dress watch that serves formal and casual contexts equally.
          </p>

          <h2 className="text-3xl font-black text-slate-900 mb-6 mt-10">Maintenance, Service & Long-Term Ownership</h2>
          <p className="text-slate-700 text-lg leading-relaxed mb-6">
            Vacheron Constantin watches require service every 5–7 years depending on wear. An Overseas service costs $3,000–$5,000 (movement, case, bracelet refinishing). This isn't a barrier to entry for serious collectors; it's understood as part of owning a luxury watch. Vacheron maintains extensive archives—finding service parts for a 20-year-old Overseas is straightforward. The brand's prestige ensures service availability at boutiques worldwide.
          </p>
          <p className="text-slate-700 text-lg leading-relaxed mb-6">
            IWC Portofino service costs $1,500–$2,500, materially lower. The simpler movement and fewer hand-decorated components mean faster turnaround and lower parts costs. IWC service is available at boutiques and certified independent watchmakers globally. For those concerned with lifetime ownership costs, the Portofino's maintenance burden is considerably lighter. However, both brands honor their watches for decades; neither is a disposable timepiece.
          </p>

          <h2 className="text-3xl font-black text-slate-900 mb-6 mt-10">Final Verdict & Positioning</h2>
          <p className="text-slate-700 text-lg leading-relaxed mb-6">
            The <strong>Vacheron Constantin Overseas</strong> is the ultimate luxury sports watch for collectors who've earned their place at the pinnacle. It's the reward for serious horological study and refined taste. Every detail—case polishing, movement decoration, bracelet engineering—represents the accumulated wisdom of centuries. It's not the "best" watch objectively; it's the most refined expression of what a mechanical watch can be when artistry and engineering merge. If you own one watch and never another, the Overseas justifies its premium.
          </p>
          <p className="text-slate-700 text-lg leading-relaxed mb-6">
            The <strong>IWC Portofino</strong> is the thinking collector's dress watch—elegant, precise, accessible, and honest. It doesn't pretend to be a diver or sport instrument; it's a refined daily companion that happens to be mechanically excellent. For professionals and enthusiasts seeking your first luxury watch or your dress watch that never compromises on quality, the Portofino is the sophisticated choice. It respects your intelligence without demanding a second mortgage.
          </p>
          <p className="text-slate-700 text-lg leading-relaxed">
            Choose Vacheron if heritage, artistry, and water capability matter. Choose IWC if elegance, accessibility, and refined functionality speak to your values. Neither choice is wrong—only which fits your collecting philosophy.
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
                  <td className="p-4 font-semibold text-slate-900">Reference Number</td>
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
                  <td className="p-4 font-semibold text-slate-900">Bracelet/Strap</td>
                  <td className="p-4 text-slate-700">{w1.bracelet_material}</td>
                  <td className="p-4 text-slate-700">{w2.bracelet_material}</td>
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
          <h2 className="text-2xl font-black text-slate-900 mb-3">Explore More Luxury Comparisons</h2>
          <p className="text-slate-700 mb-6">Find head-to-head breakdowns of your favorite watches across all price segments.</p>
          <Link href="/compare" className="inline-block px-6 py-3 bg-amber-600 text-white font-bold rounded-lg hover:bg-amber-700 transition-colors">
            View All Comparisons →
          </Link>
        </section>
      </Container>
    </>
  )
}
