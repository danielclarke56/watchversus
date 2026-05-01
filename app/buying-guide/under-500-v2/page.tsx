/**
 * EXPERIMENTAL V2 — /buying-guide/under-500-v2
 * Comparison prototype. Do NOT replace the original until reviewed side-by-side.
 */

export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { getGuideBySlug } from '@/lib/buyingGuides'
import { db } from '@/lib/db'
import { photos } from '@/lib/db/schema'
import { eq, and, ilike, or, desc } from 'drizzle-orm'
import { CTAButton } from '@/components/CTAButton'
import { PhotoCarousel } from '@/components/guide/PhotoCarousel'
import { FaqAccordion } from '@/components/guide/FaqAccordion'
import { t, l, c, i, tb } from '@/lib/styles'

export const metadata: Metadata = {
  title: 'Best Watches Under $500 — Complete Buying Guide | Watchems',
  description: '10 genuinely worthwhile watches under $500 — from first mechanicals to solar divers, dress watches, field watches, and GMTs — with clear trade-offs, fit notes, and buying advice.',
  robots: { index: false, follow: false },
}

// ── Proof points ──────────────────────────────────────────────────────────────
const PROOF_POINTS = [
  { stat: '10', label: 'verified picks' },
  { stat: '$70–$495', label: 'price range' },
  { stat: 'Apr 2026', label: 'prices checked' },
]

// ── Methodology criteria ──────────────────────────────────────────────────────
const METHODOLOGY = [
  { label: 'Category leadership', detail: 'Each pick must be the strongest choice for its use case — not just a well-known brand.' },
  { label: 'Real-world pricing', detail: 'Retail and common street prices considered. No inflated MSRPs.' },
  { label: 'Movement quality', detail: 'Calibre reliability, accuracy, repairability, and features (hacking, hand-winding).' },
  { label: 'Crystal & finishing', detail: 'Crystal type, case polishing, bracelet quality relative to price.' },
  { label: 'Water resistance', detail: 'Stated WR vs. real-world usability. ISO 6425 certification noted where applicable.' },
  { label: 'Serviceability', detail: 'Parts availability, service interval, and cost of long-term ownership.' },
]

// ── Editor top picks ──────────────────────────────────────────────────────────
const TOP_PICKS_CONFIG = [
  {
    name: 'Seiko 5 Sports SRPD55',
    whyHere: 'The most complete watch in this price tier. Automatic movement with hacking and hand-winding, 100m water resistance, and a decade-long reputation as the default first mechanical watch recommendation.',
    avoidIf: 'You want sapphire crystal or a refined bracelet clasp. Both arrive at the $500+ tier.',
  },
  {
    name: 'Citizen Promaster Diver BN0150-28E',
    whyHere: 'The only ISO 6425-certified watch in this guide — the same independent standard applied to professional dive instruments. Add a solar movement that never needs a battery and you have a serious tool watch at $295.',
    avoidIf: 'You want a mechanical movement or find 44mm cases too large for your wrist.',
  },
  {
    name: 'Citizen Tsuyosa NJ0150-81L',
    whyHere: 'Sapphire crystal and a true integrated bracelet at $350. A combination that typically costs $800+. If aesthetics matter as much as specs, this is the pick.',
    avoidIf: 'You need more than 50m water resistance or plan to wear it in the water regularly.',
  },
]

// ── "Find your watch" cards — fixed to match whoItIsFor descriptions ──────────
const BUYER_CARDS = [
  {
    profile: 'First-time buyer',
    description: 'You want a well-made watch without overspending before you know what you like.',
    model: 'Seiko 5 Sports SRPD55',
    price: '~$350',
    rationale: 'Proven calibre, 100m WR, wide colourway choice. The safest first automatic.',
  },
  {
    profile: 'Daily beater',
    description: 'You need 100m+ water resistance, a tough crystal, and a movement that doesn\'t need babying.',
    model: 'Citizen Promaster Diver BN0150-28E',
    price: '~$295',
    rationale: 'ISO 6425 certified, 200m WR, solar — genuinely purpose-built for daily punishment.',
  },
  {
    profile: 'Style-forward buyer',
    description: 'You want something that looks more expensive than it is — integrated bracelet, sapphire crystal, premium proportions.',
    model: 'Citizen Tsuyosa NJ0150-81L',
    price: '~$350',
    rationale: 'Or the Tissot PRX (~$450) for a Swiss Made alternative with a 1970s integrated profile.',
  },
  {
    profile: 'Upgrading from fashion brands',
    description: 'You\'ve worn MVMT or Daniel Wellington and want a real mechanical movement and a name that holds up to scrutiny.',
    model: 'Orient Bambino RA-AC0001S',
    price: '~$250',
    rationale: 'In-house automatic with hand-winding and hacking — more movement for the money than anything Swiss at this price.',
  },
  {
    profile: 'Gift buyer',
    description: 'You need a legitimate, recognisable name without overcommitting on budget.',
    model: 'Hamilton Khaki Field H69439931',
    price: '~$495',
    rationale: 'Swiss Made, sapphire crystal, 80hr power reserve. Or the Seiko 5 Sports if the budget is tighter.',
  },
]

// ── By use case ───────────────────────────────────────────────────────────────
const BY_USE_CASE = [
  { useCase: 'Everyday watch', model: 'Seiko 5 Sports SRPD55', note: 'Day/date, 100m WR, automatic. Handles everything.' },
  { useCase: 'Office / dress', model: 'Orient Bambino RA-AC0001S', note: 'Slim profile, domed crystal, vintage charm.' },
  { useCase: 'Travel / GMT', model: 'Seiko 5 Sports GMT SSK001', note: 'Mechanical GMT for $495 — the only one at this price.' },
  { useCase: 'Rugged / outdoor', model: 'Casio G-Shock DW-5600E-1V', note: 'Shock-proof, 200m WR, battery-powered. Nothing is tougher.' },
  { useCase: 'Dive watch', model: 'Citizen Promaster Diver BN0150-28E', note: 'ISO 6425 certified, 200m WR, solar movement.' },
  { useCase: 'Best gift', model: 'Hamilton Khaki Field H69439931', note: 'Swiss Made, sapphire, field heritage — hard to go wrong.' },
]

// ── By wrist size ─────────────────────────────────────────────────────────────
const BY_WRIST_SIZE = [
  {
    size: 'Small (under 16cm)',
    note: 'Prioritise case diameter and lug-to-lug over stated mm. Most 38mm watches wear true.',
    picks: ['Orient Bambino RA-AC0001S (40.5mm, 46mm L2L)', 'Hamilton Khaki Field H69439931 (38mm, 46mm L2L)', 'Tissot PRX T137.210.11.031.00 (35mm, 9.9mm thick)'],
  },
  {
    size: 'Medium (16–18cm)',
    note: 'Most picks in this guide are designed for this range.',
    picks: ['Seiko 5 Sports SRPD55 (42.5mm)', 'Citizen Tsuyosa NJ0150-81L (40mm)', 'Timex Marlin TW2T22700 (40mm)', 'Seiko Prospex Alpinist SPB117J1 (38mm)'],
  },
  {
    size: 'Larger (18cm+)',
    note: 'Lean toward 42mm+ cases and integrated bracelets — they fill the wrist better.',
    picks: ['Seiko 5 Sports GMT SSK001 (42.5mm)', 'Citizen Promaster Diver BN0150-28E (44mm)', 'Casio G-Shock DW-5600E-1V (42.8mm)'],
  },
]

// ── Editorial groupings ───────────────────────────────────────────────────────
const GROUPS = [
  {
    label: 'Best value',
    description: 'Strongest mechanical watches well under the $500 ceiling.',
    slugs: ['Seiko 5 Sports SRPD55', 'Orient Bambino RA-AC0001S', 'Casio G-Shock DW-5600E-1V', 'Timex Marlin TW2T22700'],
  },
  {
    label: 'Best spec',
    description: 'Tool-watch credentials — ISO dive cert, GMT complication, outdoor durability.',
    slugs: ['Citizen Promaster Diver BN0150-28E', 'Seiko 5 Sports GMT SSK001', 'Seiko Prospex Alpinist SPB117J1'],
  },
  {
    label: 'Best finish',
    description: 'Integrated bracelets, Swiss Made movements, premium aesthetics.',
    slugs: ['Citizen Tsuyosa NJ0150-81L', 'Tissot PRX T137.210.11.031.00', 'Hamilton Khaki Field H69439931'],
  },
]

// ── Common mistakes ───────────────────────────────────────────────────────────
const MISTAKES = [
  {
    mistake: 'Buying by diameter alone',
    detail: 'A 42mm watch can wear like a 44mm if lug-to-lug is long. Always check L2L and thickness before ordering. The Citizen Promaster at 44mm wears larger than most 44mm cases.',
  },
  {
    mistake: 'Assuming automatic is always better',
    detail: 'Automatic movements are not inherently more accurate or durable than quartz — the opposite is often true. Solar quartz (Citizen Eco-Drive) runs to ±15 seconds/year and never needs servicing. Automatic is a preference, not an upgrade.',
  },
  {
    mistake: 'Misreading water resistance ratings',
    detail: '30m means splash-proof. 50m means light swimming. 100m is the minimum for serious water activities. 200m means diving. These ratings are static — aged gaskets and crown-open accidents reduce them in practice.',
  },
  {
    mistake: 'Overvaluing sapphire without context',
    detail: 'Sapphire is scratch-resistant, not shatterproof — it chips more easily than Hardlex under impact. For a watch you\'ll bang around, Hardlex (Seiko) or mineral may be more practical than sapphire.',
  },
  {
    mistake: 'Ignoring the bracelet and clasp',
    detail: 'At this price tier, bracelets are where manufacturers cut corners. A watch on a bad bracelet is uncomfortable and cheapens the whole experience. Factor in the cost of an aftermarket strap.',
  },
]

// ── Extended FAQ including new beginner questions ─────────────────────────────
const EXTENDED_FAQ = [
  {
    question: 'Automatic vs quartz: which should I buy?',
    answer: 'Quartz is more accurate (±15 sec/year vs. ±15 sec/day for a typical automatic), cheaper to service, and never needs winding. Automatic is a mechanical experience — you can feel the movement, see it through a display caseback, and connect with the engineering. Neither is objectively better. If you want a tool watch that just works, quartz or solar. If the watch itself is the interest, automatic.',
  },
  {
    question: 'Is 50m water resistance enough?',
    answer: '50m is rated for light swimming and surface water activities. It is not rated for diving. The Citizen Tsuyosa (50m) and Hamilton Khaki Field (50m) are fine for washing hands, rain, and pool-side use — but not lap swimming or snorkelling. If you plan to swim regularly, choose a 100m or 200m rated watch.',
  },
  {
    question: 'Is sapphire crystal worth paying for under $500?',
    answer: 'Yes, if scratch resistance is a priority. Sapphire is significantly harder than mineral or Hardlex and will stay clear-looking far longer. The Citizen Tsuyosa, Tissot PRX, Seiko Prospex Alpinist, and Hamilton Khaki Field all include sapphire at $350–$495. The Seiko 5 Sports uses Hardlex — durable under impact but shows fine scratches faster.',
  },
  {
    question: 'What size watch should I buy?',
    answer: 'Case diameter is a poor guide on its own. Lug-to-lug (the distance between the lugs across your wrist) and thickness matter more for comfort. For most wrists, a 38–42mm case works. If you have a smaller wrist, look for L2L under 46mm. If you have a larger wrist, 44mm+ with an integrated bracelet (Citizen Tsuyosa, Tissot PRX) will fill the wrist better.',
  },
  {
    question: 'What is the best automatic watch under $500?',
    answer: 'The Seiko 5 Sports SRPD55 (~$350) is the most versatile — day/date, 100m WR, proven 4R36 calibre. If you want a complication, the Seiko 5 Sports GMT SSK001 (~$495) adds a mechanical GMT function that Swiss brands charge $800+ for. For dress, the Orient Bambino (~$250) is the strongest pick.',
  },
  {
    question: 'Is sapphire crystal available under $500?',
    answer: 'Yes — on specific models. The Citizen Tsuyosa (~$350), Tissot PRX (~$450), Hamilton Khaki Field (~$495), and Seiko Prospex Alpinist (~$450) all include sapphire. The Seiko 5 Sports uses Hardlex, which is harder than standard mineral but not as scratch-resistant as sapphire.',
  },
  {
    question: 'Seiko 5 Sports vs Citizen Tsuyosa — which should I buy?',
    answer: 'The Seiko 5 Sports wins on water resistance (100m vs 50m) and proven track record. The Tsuyosa wins on aesthetics — sapphire crystal and integrated bracelet at the same price. Choose Seiko if you\'ll wear it hard; choose Tsuyosa if you want it to look more expensive.',
  },
  {
    question: 'What do I give up compared to the $500–$1,000 tier?',
    answer: 'Better bracelet finishing, sapphire crystal on almost every model, COSC-certified movements (±4 sec/day), and cleaner case polishing. The movements in this tier are just as durable — the differences are aesthetic, not mechanical.',
  },
  {
    question: 'Can I find a genuine ISO-certified dive watch under $500?',
    answer: 'Yes. The Citizen Promaster Diver BN0150-28E (~$295) is ISO 6425 certified with 200m water resistance and a solar movement that never needs a battery. It\'s the most capable tool watch in this guide.',
  },
  {
    question: 'Seiko 5 Sports vs Seiko 5 Sports GMT — what\'s the difference?',
    answer: 'The standard 5 Sports uses the 4R36 (day/date automatic). The GMT adds the 4R34 calibre — a 24-hour hand and bidirectional bezel for tracking a second time zone. The GMT costs ~$145 more. If you travel, the GMT is exceptional value. If you don\'t, the standard is the better daily watch.',
  },
]

// ── Extended comparison data (lug-to-lug, thickness, wrist note) ──────────────
// Values marked [TBC] where exact manufacturer data was unavailable at time of writing
const EXTENDED_SPECS: Record<string, { lugToLug: string; thickness: string; wristNote: string }> = {
  'Seiko 5 Sports SRPD55':           { lugToLug: '~47mm', thickness: '13mm',   wristNote: 'Medium–large' },
  'Seiko 5 Sports GMT SSK001':       { lugToLug: '~48mm', thickness: '14mm',   wristNote: 'Medium–large' },
  'Orient Bambino RA-AC0001S':       { lugToLug: '~46mm', thickness: '11mm',   wristNote: 'Small–medium' },
  'Citizen Tsuyosa NJ0150-81L':      { lugToLug: '~46mm', thickness: '11.8mm', wristNote: 'Small–medium' },
  'Citizen Promaster Diver BN0150-28E': { lugToLug: '~51mm', thickness: '14mm', wristNote: 'Large' },
  'Casio G-Shock DW-5600E-1V':       { lugToLug: '~48mm', thickness: '13.4mm', wristNote: 'Medium–large' },
  'Tissot PRX T137.210.11.031.00':   { lugToLug: '~37mm', thickness: '9.9mm',  wristNote: 'Small–medium' },
  'Hamilton Khaki Field H69439931':  { lugToLug: '~46mm', thickness: '11mm',   wristNote: 'Small–medium' },
  'Seiko Prospex Alpinist SPB117J1': { lugToLug: '~44mm', thickness: '13.2mm', wristNote: 'Small–medium' },
  'Timex Marlin TW2T22700':          { lugToLug: '~46mm', thickness: '11mm',   wristNote: 'Small–medium' },
}

export default async function BuyingGuideV2Page() {
  const entry = getGuideBySlug('under-500')
  if (!entry) return null

  const modelConditions = entry.notableModels.map((m) => {
    const keyword = m.name.replace(m.brandName, '').trim()
    return and(ilike(photos.brandName, m.brandName), ilike(photos.modelName, `%${keyword}%`))
  })

  const allModelPhotos = await db
    .select({ id: photos.id, slug: photos.slug, url: photos.url, thumbnailUrl: photos.thumbnailUrl, brandName: photos.brandName, modelName: photos.modelName })
    .from(photos)
    .where(and(eq(photos.status, 'approved'), or(...modelConditions)))
    .orderBy(desc(photos.createdAt))
    .limit(entry.notableModels.length * 4)

  const photoByModel = new Map<string, typeof allModelPhotos[0]>()
  for (const model of entry.notableModels) {
    const keyword = model.name.replace(model.brandName, '').trim().toLowerCase()
    const match = allModelPhotos.find(
      (p) =>
        p.brandName?.toLowerCase() === model.brandName.toLowerCase() &&
        p.modelName?.toLowerCase().includes(keyword)
    )
    if (match) photoByModel.set(model.name, match)
  }

  const datePublished = new Date(`${entry.lastUpdated} 01`).toISOString().slice(0, 10)

  const topPicks = TOP_PICKS_CONFIG.map((cfg) => ({
    ...cfg,
    model: entry.notableModels.find((m) => m.name === cfg.name)!,
  })).filter((p) => p.model)

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: 'Best Watches Under $500 — Complete Buying Guide',
    description: '10 genuinely worthwhile watches under $500, with clear trade-offs, fit notes, and buying advice for real-world use.',
    url: 'https://watchems.com/buying-guide/under-500-v2',
    datePublished,
    image: entry.images.hero,
    author: { '@type': 'Organization', name: 'Watchems Editorial', url: 'https://watchems.com' },
    publisher: { '@type': 'Organization', name: 'Watchems', url: 'https://watchems.com' },
    citation: entry.sources.map((s) => ({ '@type': 'CreativeWork', name: s.label, url: s.url })),
  }

  const faqJsonLd = {
    '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: EXTENDED_FAQ.map(({ question, answer }) => ({
      '@type': 'Question', name: question,
      acceptedAnswer: { '@type': 'Answer', text: answer },
    })),
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      {/* ── DEV BANNER ── */}
      <div className="bg-textPrimary text-white text-xs font-medium text-center py-2 px-4">
        Prototype — v2 layout.{' '}
        <Link href="/buying-guide/under-500" className="underline underline-offset-2 opacity-70 hover:opacity-100">
          View current version →
        </Link>
      </div>

      <main>
        <article>

          {/* ══════════════════════════════════════════
              1. HERO
          ══════════════════════════════════════════ */}
          <header>
            <div className="relative w-full h-72 sm:h-96 overflow-hidden bg-surfaceAlt">
              <Image src={entry.images.hero} alt={entry.name} fill priority className="object-cover" sizes="100vw" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10" />
              <div className="absolute inset-0 flex flex-col justify-end">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-10 w-full">
                  <nav aria-label="Breadcrumb" className="text-white/60 text-xs mb-4 flex items-center gap-1.5">
                    <Link href="/" className="hover:text-white/90 transition-colors">Home</Link>
                    <span aria-hidden="true">/</span>
                    <Link href="/buying-guides" className="hover:text-white/90 transition-colors">Buying Guides</Link>
                    <span aria-hidden="true">/</span>
                    <span className="text-white/80">Under $500</span>
                  </nav>
                  <p className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-3">Watchems Buying Guide</p>
                  <h1 className="font-heading text-3xl sm:text-4xl font-semibold text-white tracking-tight leading-[1.1] mb-3">
                    Best Watches Under $500
                  </h1>
                  <p className="text-white/80 text-base leading-relaxed max-w-2xl">
                    10 genuinely worthwhile watches under $500 — from first mechanicals to solar divers, dress watches, field watches, and GMTs — with clear trade-offs, fit notes, and buying advice for real-world use.
                  </p>
                </div>
              </div>
            </div>

            {/* Proof + methodology strip */}
            <div className="border-b border-border bg-surfaceAlt">
              <div className="max-w-5xl mx-auto px-4 sm:px-6">
                <div className="flex items-stretch divide-x divide-border overflow-x-auto scrollbar-hide">
                  {PROOF_POINTS.map((p) => (
                    <div key={p.label} className="shrink-0 py-4 px-5 first:pl-0">
                      <div className="text-base font-semibold text-textPrimary tabular-nums">{p.stat}</div>
                      <div className="text-xs text-textMuted mt-0.5 whitespace-nowrap">{p.label}</div>
                    </div>
                  ))}
                  <div className="flex items-center px-5 shrink-0">
                    <p className="text-xs text-textMuted">Picks chosen for category leadership, not brand popularity. Retail and street pricing considered.</p>
                  </div>
                </div>
              </div>
            </div>
          </header>

          <div className="max-w-5xl mx-auto px-4 sm:px-6">

            {/* ══════════════════════════════════════════
                2. FIND YOUR WATCH
                Merged buyer profiles + recommendations
            ══════════════════════════════════════════ */}
            <section id="find" aria-labelledby="find-heading" className="pt-12 mb-16">
              <h2 className={`${t.h2} mb-2`} id="find-heading">Find your watch</h2>
              <p className={`${t.body} mb-8 max-w-2xl`}>
                Pick the description that fits you best. Each card maps to the strongest option in this guide for that need.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {BUYER_CARDS.map((card) => {
                  const model = entry.notableModels.find((m) => m.name === card.model)
                  const dbPhoto = photoByModel.get(card.model)
                  const thumbSrc = dbPhoto ? (dbPhoto.thumbnailUrl ?? dbPhoto.url) : model?.imageUrl ?? null

                  return (
                    <div key={card.profile} className="border border-border rounded-xl overflow-hidden hover:border-borderStrong transition-colors flex flex-col">
                      {thumbSrc && (
                        <div className="relative h-28 bg-surfaceAlt shrink-0">
                          <Image src={thumbSrc} alt={card.model} fill className="object-cover" sizes="350px" />
                        </div>
                      )}
                      <div className="p-4 flex flex-col flex-1">
                        <p className={`${t.eyebrow} mb-1`}>{card.profile}</p>
                        <p className={`${t.body} text-sm mb-4 leading-relaxed flex-1`}>{card.description}</p>
                        <div className="pt-3 border-t border-border">
                          <div className="flex items-baseline justify-between gap-2 mb-1">
                            <span className={`${t.strong} text-sm leading-snug`}>{card.model}</span>
                            <span className={`${t.meta} shrink-0 tabular-nums`}>{card.price}</span>
                          </div>
                          <p className="text-xs text-textMuted leading-relaxed">{card.rationale}</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>

            {/* ══════════════════════════════════════════
                3. HOW TO CHOOSE — beginner explainers
            ══════════════════════════════════════════ */}
            <section id="how-to-choose" aria-labelledby="how-to-choose-heading" className="mb-16">
              <h2 className={`${t.h2} mb-2`} id="how-to-choose-heading">How to choose a watch under $500</h2>
              <p className={`${t.body} mb-8 max-w-2xl`}>
                Four decisions that actually matter at this price point. Most buyers get distracted by diameter — these are the things that affect daily ownership.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <div className="border border-border rounded-xl p-5">
                  <h3 className={`${t.h3} mb-3`}>Movement type</h3>
                  <div className="space-y-3 text-sm">
                    {[
                      { type: 'Automatic', detail: 'Self-winding via wrist motion. Mechanical, no battery. Accuracy: ±10–20 sec/day. Requires servicing every 5–7 years. The most engaging ownership experience.' },
                      { type: 'Manual-wind', detail: 'Same as automatic but wound by hand daily. Preferred by enthusiasts for the ritual. The Hamilton Khaki Field is the only manual-wind in this guide.' },
                      { type: 'Quartz', detail: 'Battery-powered. Accuracy: ±15 sec/year. Low maintenance. Often dismissed but genuinely practical. The Tissot PRX uses a fine Swiss quartz (ETA F05.115).' },
                      { type: 'Solar / Eco-Drive', detail: 'Quartz accuracy, no battery — recharged by any light source. Citizen\'s Eco-Drive technology. Ideal if you want reliability without battery swaps.' },
                    ].map(({ type, detail }) => (
                      <div key={type} className="flex gap-3">
                        <span className="text-xs font-semibold text-textPrimary w-24 shrink-0 pt-0.5">{type}</span>
                        <span className="text-textSecond leading-relaxed">{detail}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border border-border rounded-xl p-5">
                  <h3 className={`${t.h3} mb-3`}>Crystal type</h3>
                  <div className="space-y-3 text-sm">
                    {[
                      { type: 'Sapphire', detail: 'Hardest watch crystal. Highly scratch-resistant. Chips more easily under impact than softer crystals. Included on: Tsuyosa, PRX, Hamilton, Alpinist.' },
                      { type: 'Hardlex', detail: 'Seiko\'s treated mineral glass. Harder than standard mineral, more impact-resistant than sapphire. Scratches faster but survives drops better. On: Seiko 5 Sports.' },
                      { type: 'Mineral', detail: 'Standard glass. Scratches under normal use. Fine for low-risk wear. Used on most Citizen and Orient entry models.' },
                      { type: 'Acrylic', detail: 'Soft plastic. Scratches easily but polishes out. Gives vintage warmth. The Timex Marlin uses domed acrylic intentionally for its 1960s aesthetic.' },
                    ].map(({ type, detail }) => (
                      <div key={type} className="flex gap-3">
                        <span className="text-xs font-semibold text-textPrimary w-24 shrink-0 pt-0.5">{type}</span>
                        <span className="text-textSecond leading-relaxed">{detail}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border border-border rounded-xl p-5">
                  <h3 className={`${t.h3} mb-3`}>Water resistance — what the ratings mean</h3>
                  <div className="space-y-3 text-sm">
                    {[
                      { rating: '30m', detail: 'Splash-proof. Rain, handwashing. Do not submerge. Orient Bambino, Timex Marlin.' },
                      { rating: '50m', detail: 'Light swimming, surface water. Not for diving. Citizen Tsuyosa, Hamilton Khaki.' },
                      { rating: '100m', detail: 'Swimming and snorkelling. Seiko 5 Sports — fine for all but serious water activities.' },
                      { rating: '200m', detail: 'Diving and water sports. Citizen Promaster (ISO 6425 certified), Casio G-Shock.' },
                    ].map(({ rating, detail }) => (
                      <div key={rating} className="flex gap-3">
                        <span className="text-xs font-semibold text-textPrimary w-12 shrink-0 pt-0.5">{rating}</span>
                        <span className="text-textSecond leading-relaxed">{detail}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-textMuted mt-3 leading-relaxed">Note: ratings assume new gaskets. Older watches or those with opened crowns should be re-pressure tested.</p>
                </div>

                <div className="border border-border rounded-xl p-5">
                  <h3 className={`${t.h3} mb-3`}>Case fit — beyond diameter</h3>
                  <div className="space-y-3 text-sm text-textSecond leading-relaxed">
                    <p><span className="font-semibold text-textPrimary">Lug-to-lug (L2L)</span> is the distance from lug tip to lug tip across your wrist. This determines whether the case overhangs your wrist. A 44mm watch with short lugs can wear smaller than a 40mm with long ones.</p>
                    <p><span className="font-semibold text-textPrimary">Thickness</span> affects how the watch sits under a cuff and how substantial it feels. The Tissot PRX at 9.9mm is the slimmest in this guide. The Citizen Promaster at 14mm is the chunkiest.</p>
                    <p><span className="font-semibold text-textPrimary">Rule of thumb:</span> for most wrists, aim for L2L under 48mm and thickness under 13mm for comfortable everyday wear.</p>
                  </div>
                </div>

              </div>
            </section>

            {/* ══════════════════════════════════════════
                4. WHAT $500 GETS YOU
                Expanded expectations section
            ══════════════════════════════════════════ */}
            <section id="overview" aria-labelledby="overview-heading" className="mb-16">
              <div className="grid grid-cols-1 md:grid-cols-[1fr_260px] gap-8 items-start">
                <div>
                  <h2 className={`${t.h2} mb-6`} id="overview-heading">What $500 gets you in watches</h2>
                  <div className="space-y-4 text-base text-textSecond leading-[1.8]">
                    <p>Under $500 is where enthusiast-grade watchmaking becomes accessible. The gap between a $50 fashion watch and a $350 Seiko 5 Sports is not incremental — it's categorical. You get a genuine in-house mechanical movement, tool-watch specifications, and a name with horological credibility.</p>
                    <p>Seiko, Citizen, and Orient dominate this tier because they've been making movements in-house for decades, at volumes that let them price below Swiss equivalents. Seiko's 4R36 calibre — found in the 5 Sports — hacks and hand-winds at ~$350. Swiss brands charge $600+ for comparable movement features.</p>
                    <p>Casio's G-Shock sets the durability benchmark at the low end. Tissot brings Swiss Made certification at the top of the range. In between, there's more variety than most buyers realise before looking carefully.</p>
                    <h3 className={`${t.h3} mt-6 mb-3`}>What you trade off versus the $500–$1,000 tier</h3>
                    <p>The differences are aesthetic, not mechanical. Above $500, you gain sapphire on almost every model, bracelet clasps that don't rattle, case finishing with crisp polished edges, and COSC-certified movements running to ±4 seconds/day. Movements in the under-$500 tier are just as durable — they're undecorated and less finely regulated, not less reliable.</p>
                    <p>The honest summary: the right pick here will outlast fashion trends, handle daily wear without babying, and hold its own on the wrist next to watches that cost twice as much. What it won't do is impress someone who inspects bracelet tolerances.</p>
                  </div>
                </div>

                <aside className="md:sticky md:top-24 space-y-4">
                  <blockquote className="bg-textPrimary rounded-xl p-5">
                    <p className="text-white text-sm font-medium leading-relaxed italic">
                      &ldquo;{entry.heroFact}&rdquo;
                    </p>
                  </blockquote>

                  <div className="border border-border rounded-xl p-5 space-y-3">
                    <p className={`${t.eyebrow} mb-1`}>Tier facts</p>
                    {[
                      ['Sapphire crystal', 'Tsuyosa, PRX, Alpinist, Hamilton'],
                      ['ISO dive cert.', 'Citizen Promaster only'],
                      ['GMT complication', 'Seiko 5 GMT SSK001'],
                      ['Swiss Made', 'Tissot PRX, Hamilton Khaki'],
                      ['Solar movement', 'Citizen Promaster'],
                      ['Manual-wind', 'Hamilton Khaki Field'],
                    ].map(([fact, detail]) => (
                      <div key={fact} className="flex gap-3 text-sm">
                        <span className="text-textMuted w-28 shrink-0 leading-relaxed">{fact}</span>
                        <span className="text-textSecond leading-relaxed">{detail}</span>
                      </div>
                    ))}
                  </div>
                </aside>
              </div>
            </section>

            {/* Mid editorial image */}
            {entry.images.mid && (
              <figure className="relative w-full h-56 sm:h-72 overflow-hidden rounded-xl mb-16 bg-surfaceAlt">
                <Image src={entry.images.mid} alt={`${entry.name} — editorial`} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 1024px" />
              </figure>
            )}

            {/* ══════════════════════════════════════════
                5. HOW WE CHOSE
            ══════════════════════════════════════════ */}
            <section id="methodology" aria-labelledby="methodology-heading" className="mb-16">
              <h2 className={`${t.h2} mb-2`} id="methodology-heading">How we chose these watches</h2>
              <p className={`${t.body} mb-8 max-w-2xl`}>
                Every model in this guide had to win a clear category. No picks are here because of brand recognition alone. These are the criteria each watch was evaluated against.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {METHODOLOGY.map(({ label, detail }) => (
                  <div key={label} className="border border-border rounded-xl p-4">
                    <p className={`${t.strong} mb-1`}>{label}</p>
                    <p className="text-sm text-textSecond leading-relaxed">{detail}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* ══════════════════════════════════════════
                6. EDITOR'S TOP PICKS — with Why / Avoid if
            ══════════════════════════════════════════ */}
            <section id="top-picks" aria-labelledby="top-picks-heading" className="mb-16">
              <div className="flex items-baseline gap-4 mb-6">
                <h2 className={`${t.h2}`} id="top-picks-heading">Editor's top picks</h2>
                <span className={`${t.meta}`}>strongest all-round choices</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                {topPicks.map(({ model, whyHere, avoidIf }, idx) => {
                  const dbPhoto = photoByModel.get(model.name)
                  const thumbSrc = dbPhoto ? (dbPhoto.thumbnailUrl ?? dbPhoto.url) : model.imageUrl ?? null
                  const thumbHref = dbPhoto ? `/photo/${dbPhoto.slug ?? dbPhoto.id}` : null

                  return (
                    <div key={model.name} className="border border-border rounded-xl overflow-hidden hover:border-borderStrong transition-colors flex flex-col">
                      <div className="relative h-44 bg-surfaceAlt shrink-0">
                        {thumbSrc ? (
                          thumbHref ? (
                            <Link href={thumbHref} className="block w-full h-full">
                              <Image src={thumbSrc} alt={model.name} fill className="object-cover" sizes="350px" />
                            </Link>
                          ) : (
                            <Image src={thumbSrc} alt={model.name} fill className="object-cover" sizes="350px" />
                          )
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-textMuted text-xs">No photo yet</span>
                          </div>
                        )}
                        <div className="absolute top-3 left-3 bg-textPrimary text-white text-xs font-semibold rounded-full w-6 h-6 flex items-center justify-center">
                          {idx + 1}
                        </div>
                      </div>

                      <div className="p-4 flex flex-col flex-1">
                        <p className={`${t.eyebrow} mb-1`}>{model.bestFor}</p>
                        <h3 className={`${t.h3} mb-0.5`}>{model.name}</h3>
                        <p className={`${t.strong} tabular-nums mb-3`}>{model.price}</p>

                        <div className="space-y-3 flex-1">
                          <div>
                            <p className="text-xs font-semibold text-textPrimary mb-0.5">Why it's here</p>
                            <p className="text-sm text-textSecond leading-relaxed">{whyHere}</p>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-textPrimary mb-0.5">Best for</p>
                            <p className="text-sm text-textSecond leading-relaxed">{model.reason}</p>
                          </div>
                          <div className="pt-3 border-t border-border">
                            <p className="text-xs font-semibold text-textMuted mb-0.5">Avoid if</p>
                            <p className="text-xs text-textMuted leading-relaxed">{avoidIf}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>

            {/* ══════════════════════════════════════════
                7. COMPARISON TABLE — sticky first col + extended specs
            ══════════════════════════════════════════ */}
            <section id="comparison" aria-labelledby="comparison-heading" className="mb-16">
              <div className="flex items-baseline gap-4 mb-6">
                <h2 className={`${t.h2}`} id="comparison-heading">Side-by-side</h2>
                <span className={`${t.meta}`}>all 10 picks</span>
              </div>

              <div className="overflow-x-auto rounded-xl border border-border">
                <table className="w-full text-sm border-collapse">
                  <caption className="sr-only">Watch specifications comparison — best watches under $500</caption>
                  <thead>
                    <tr className="bg-surfaceAlt">
                      <th scope="col" className={`sticky left-0 z-10 bg-surfaceAlt px-4 py-3 text-left ${tb.header} whitespace-nowrap border-b border-r border-border`}>Model</th>
                      <th scope="col" className={`px-4 py-3 text-left ${tb.header} whitespace-nowrap border-b border-border`}>Price</th>
                      <th scope="col" className={`px-4 py-3 text-left ${tb.header} whitespace-nowrap border-b border-border hidden sm:table-cell`}>Case</th>
                      <th scope="col" className={`px-4 py-3 text-left ${tb.header} whitespace-nowrap border-b border-border hidden sm:table-cell`}>L2L</th>
                      <th scope="col" className={`px-4 py-3 text-left ${tb.header} whitespace-nowrap border-b border-border hidden md:table-cell`}>Thick</th>
                      <th scope="col" className={`px-4 py-3 text-left ${tb.header} whitespace-nowrap border-b border-border hidden sm:table-cell`}>WR</th>
                      <th scope="col" className={`px-4 py-3 text-left ${tb.header} whitespace-nowrap border-b border-border hidden md:table-cell`}>Crystal</th>
                      <th scope="col" className={`px-4 py-3 text-left ${tb.header} whitespace-nowrap border-b border-border hidden lg:table-cell`}>Movement</th>
                      <th scope="col" className={`px-4 py-3 text-left ${tb.header} whitespace-nowrap border-b border-border hidden md:table-cell`}>Wrist fit</th>
                      <th scope="col" className={`px-4 py-3 text-left ${tb.header} whitespace-nowrap border-b border-border`}>Best for</th>
                    </tr>
                  </thead>
                  <tbody>
                    {entry.notableModels.map((model, idx) => {
                      const ext = EXTENDED_SPECS[model.name]
                      return (
                        <tr key={model.name} className={`${tb.row} border-b border-border last:border-0`}>
                          <td className={`sticky left-0 z-10 bg-surface px-4 py-3.5 ${tb.cellStrong} whitespace-nowrap border-r border-border`}>
                            <span className="text-textMuted text-xs mr-2 tabular-nums">{String(idx + 1).padStart(2, '0')}</span>
                            {model.name}
                          </td>
                          <td className={`px-4 py-3.5 ${tb.cellStrong} whitespace-nowrap tabular-nums`}>{model.price}</td>
                          <td className={`px-4 py-3.5 ${tb.cell} hidden sm:table-cell whitespace-nowrap`}>{model.caseSize}</td>
                          <td className={`px-4 py-3.5 ${tb.cell} hidden sm:table-cell whitespace-nowrap`}>{ext?.lugToLug ?? '—'}</td>
                          <td className={`px-4 py-3.5 ${tb.cell} hidden md:table-cell whitespace-nowrap`}>{ext?.thickness ?? '—'}</td>
                          <td className={`px-4 py-3.5 ${tb.cell} hidden sm:table-cell whitespace-nowrap`}>{model.waterResistance}</td>
                          <td className={`px-4 py-3.5 ${tb.cell} hidden md:table-cell whitespace-nowrap`}>{model.crystal}</td>
                          <td className={`px-4 py-3.5 ${tb.cell} hidden lg:table-cell whitespace-nowrap`}>{model.movement}</td>
                          <td className={`px-4 py-3.5 ${tb.cell} hidden md:table-cell whitespace-nowrap`}>{ext?.wristNote ?? '—'}</td>
                          <td className={`px-4 py-3.5 ${t.meta} whitespace-nowrap`}>{model.bestFor}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-textMuted mt-2 leading-relaxed">L2L and thickness figures are approximate. Verify with manufacturer before purchase. Values marked with approx (~) derived from community measurements.</p>
            </section>

            {/* ══════════════════════════════════════════
                8. BY USE CASE
            ══════════════════════════════════════════ */}
            <section id="by-use-case" aria-labelledby="by-use-case-heading" className="mb-16">
              <h2 className={`${t.h2} mb-2`} id="by-use-case-heading">Best watches under $500 by use case</h2>
              <p className={`${t.body} mb-8 max-w-2xl`}>If you know the context, pick from here. One answer per category.</p>
              <div className="border border-border rounded-xl overflow-hidden divide-y divide-border">
                {BY_USE_CASE.map(({ useCase, model: modelName, note }) => {
                  const model = entry.notableModels.find((m) => m.name === modelName)
                  return (
                    <div key={useCase} className="flex items-start gap-4 px-5 py-4 bg-surface hover:bg-surfaceAlt transition-colors">
                      <span className="text-xs font-semibold text-textMuted w-32 shrink-0 pt-0.5">{useCase}</span>
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-semibold text-textPrimary">{modelName}</span>
                        {model && <span className="text-xs text-textMuted ml-2 tabular-nums">{model.price}</span>}
                        <p className="text-xs text-textSecond mt-0.5 leading-relaxed">{note}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>

            {/* ══════════════════════════════════════════
                9. BY WRIST SIZE
            ══════════════════════════════════════════ */}
            <section id="by-wrist-size" aria-labelledby="by-wrist-size-heading" className="mb-16">
              <h2 className={`${t.h2} mb-2`} id="by-wrist-size-heading">Best watches under $500 by wrist size</h2>
              <p className={`${t.body} mb-8 max-w-2xl`}>Case diameter is a starting point, not the answer. These recommendations factor in L2L and thickness.</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {BY_WRIST_SIZE.map(({ size, note, picks }) => (
                  <div key={size} className="border border-border rounded-xl p-5">
                    <h3 className={`${t.h3} mb-2`}>{size}</h3>
                    <p className="text-sm text-textSecond leading-relaxed mb-4">{note}</p>
                    <ul className="space-y-1.5">
                      {picks.map((pick) => (
                        <li key={pick} className="text-sm text-textSecond flex gap-2">
                          <span className="text-textMuted mt-1 shrink-0">·</span>
                          <span>{pick}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>

            {/* ══════════════════════════════════════════
                10. FULL BREAKDOWN — grouped
            ══════════════════════════════════════════ */}
            <section id="picks" aria-labelledby="picks-heading" className="mb-16">
              <h2 className={`${t.h2} mb-2`} id="picks-heading">Full breakdown</h2>
              <p className={`${t.body} mb-10 max-w-2xl`}>All 10 picks grouped by what they do best.</p>

              <div className="space-y-12">
                {GROUPS.map((group) => {
                  const groupModels = group.slugs
                    .map((name) => entry.notableModels.find((m) => m.name === name))
                    .filter((m): m is NonNullable<typeof m> => m !== undefined)

                  return (
                    <div key={group.label}>
                      <div className="flex items-baseline gap-3 mb-5 pb-3 border-b border-border">
                        <h3 className="font-heading text-base font-semibold text-textPrimary">{group.label}</h3>
                        <span className={`${t.body} text-sm`}>{group.description}</span>
                      </div>

                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 notable-models-list">
                        {groupModels.map((model) => {
                          const dbPhoto = photoByModel.get(model.name)
                          const thumbSrc = dbPhoto ? (dbPhoto.thumbnailUrl ?? dbPhoto.url) : model.imageUrl ?? null
                          const thumbHref = dbPhoto ? `/photo/${dbPhoto.slug ?? dbPhoto.id}` : null

                          return (
                            <li key={model.name} className="border border-border rounded-xl overflow-hidden hover:border-borderStrong transition-colors">
                              <div className="relative h-32 bg-surfaceAlt">
                                {thumbSrc ? (
                                  thumbHref ? (
                                    <Link href={thumbHref} className="block w-full h-full">
                                      <Image src={thumbSrc} alt={`${model.name} wrist shot`} fill className="object-cover" sizes="450px" />
                                    </Link>
                                  ) : (
                                    <Image src={thumbSrc} alt={model.name} fill className="object-cover" sizes="450px" />
                                  )
                                ) : (
                                  <Link href="/upload" className="flex items-center justify-center w-full h-full hover:bg-surface transition-colors" aria-label={`Upload a photo of the ${model.name}`}>
                                    <span className="text-textMuted text-xs">Add a photo</span>
                                  </Link>
                                )}
                              </div>

                              <div className="p-4">
                                <div className="flex items-start justify-between gap-2 mb-1">
                                  <h4 className="font-heading text-sm font-semibold text-textPrimary leading-snug">{model.name}</h4>
                                  <span className="text-sm font-semibold text-textPrimary tabular-nums shrink-0">{model.price}</span>
                                </div>
                                <p className="text-xs font-semibold text-textMuted uppercase tracking-widest mb-3">{model.bestFor}</p>

                                <div className="flex flex-wrap gap-1 mb-3">
                                  {[model.caseSize, model.waterResistance, model.crystal].map((spec) => (
                                    <span key={spec} className="text-xs text-textSecond bg-surfaceAlt border border-border rounded-full px-2.5 py-0.5">{spec}</span>
                                  ))}
                                </div>

                                <p className="text-sm text-textSecond leading-relaxed mb-2">{model.reason}</p>

                                <div className="border-t border-border pt-2 mt-2 space-y-1.5">
                                  <p className="text-xs text-textMuted leading-relaxed">
                                    <span className="font-semibold text-textSecond">Trade-off — </span>{model.tradeoff}
                                  </p>
                                  {model.communitySignal && (
                                    <p className="text-xs text-textMuted italic leading-relaxed pl-2 border-l border-borderStrong">{model.communitySignal}</p>
                                  )}
                                </div>

                                {!dbPhoto && (
                                  <Link href="/upload" className="mt-3 inline-flex items-center gap-1 text-xs text-accent hover:underline underline-offset-2">
                                    {model.imageUrl ? 'Own this? Add your photo →' : 'Own this watch? Upload a photo'}
                                  </Link>
                                )}
                              </div>
                            </li>
                          )
                        })}
                      </ul>
                    </div>
                  )
                })}
              </div>
            </section>

            {/* ══════════════════════════════════════════
                11. COMMON MISTAKES
            ══════════════════════════════════════════ */}
            <section id="mistakes" aria-labelledby="mistakes-heading" className="mb-16">
              <h2 className={`${t.h2} mb-2`} id="mistakes-heading">Common mistakes when buying a watch under $500</h2>
              <p className={`${t.body} mb-8 max-w-2xl`}>Most first-time buyers make the same avoidable errors. These are the ones worth knowing before you order.</p>
              <div className="space-y-4">
                {MISTAKES.map(({ mistake, detail }) => (
                  <div key={mistake} className="border border-border rounded-xl p-5">
                    <h3 className={`${t.strong} mb-1.5`}>{mistake}</h3>
                    <p className="text-sm text-textSecond leading-relaxed">{detail}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* ══════════════════════════════════════════
                12. OWNERSHIP & MAINTENANCE
            ══════════════════════════════════════════ */}
            <section id="ownership" aria-labelledby="ownership-heading" className="mb-16">
              <h2 className={`${t.h2} mb-6`} id="ownership-heading">Ownership and maintenance</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-border rounded-xl p-5">
                  <h3 className={`${t.h3} mb-3`}>Mechanical watches</h3>
                  <div className="space-y-2 text-sm text-textSecond leading-relaxed">
                    <p>Automatic movements should be serviced every 5–7 years. Expect $150–$300 for a standard service on a Seiko or Orient calibre. Less on manual-wind movements.</p>
                    <p>A watch that runs consistently — even if ±20 sec/day — is working correctly. Sudden irregularity (gaining 2+ minutes/day) is a sign it needs service.</p>
                    <p>Store automatic watches away from strong magnets (speakers, phone mounts). Magnetism causes erratic timekeeping and is easily demagnetised by a watchmaker.</p>
                  </div>
                </div>
                <div className="border border-border rounded-xl p-5">
                  <h3 className={`${t.h3} mb-3`}>Crystal and water resistance</h3>
                  <div className="space-y-2 text-sm text-textSecond leading-relaxed">
                    <p>Sapphire stays clear longer but chips under sharp impacts. If you work with your hands, Hardlex may outlast sapphire in practice despite being less scratch-resistant.</p>
                    <p>Water resistance degrades over time as gaskets dry out. If you swim regularly with a watch, have it pressure-tested annually. A new gasket costs ~$20–$40 at a watchmaker.</p>
                    <p>Never press pushers or unscrew crowns underwater, even on a dive watch. WR ratings assume a fully secured crown.</p>
                  </div>
                </div>
              </div>
            </section>

            {/* ══════════════════════════════════════════
                13. FAQ — expanded with beginner questions
            ══════════════════════════════════════════ */}
            <section id="faq" aria-labelledby="faq-heading" className="mb-16">
              <h2 className={`${t.h2} mb-8`} id="faq-heading">Common questions</h2>
              <FaqAccordion items={EXTENDED_FAQ} />
            </section>

            {/* ══════════════════════════════════════════
                14. COMMUNITY PHOTOS
            ══════════════════════════════════════════ */}
            {allModelPhotos.length > 0 && (
              <section aria-label="Community photos" className="mb-16">
                <div className="flex items-baseline gap-4 mb-6">
                  <h2 className={`${t.h2}`}>From the community</h2>
                  <span className={`${t.meta}`}>real wrist shots</span>
                </div>
                <PhotoCarousel modelName="" photos={allModelPhotos} />
                <div className="mt-6">
                  <CTAButton priority="primary" size="sm" href="/upload">Upload yours</CTAButton>
                </div>
              </section>
            )}

            {/* ══════════════════════════════════════════
                15. EXPLORE + CTA
            ══════════════════════════════════════════ */}
            {entry.internalLinks.length > 0 && (
              <aside aria-label="Explore related content" className="mb-10">
                <p className={`${t.eyebrow} mb-4`}>Explore on Watchems</p>
                <nav aria-label="Related pages">
                  <ul className="flex flex-wrap gap-2">
                    {entry.internalLinks.map((link) => (
                      <li key={link.href}>
                        <Link href={link.href} className={i.pill}>{link.label}</Link>
                      </li>
                    ))}
                  </ul>
                </nav>
              </aside>
            )}

            <aside aria-label="Community contribution" className="mb-10">
              <div className={c.callout}>
                <p className={`${t.eyebrow} mb-2`}>Own one of these?</p>
                <h2 className={`${t.h3} mb-1`}>Show it on your wrist.</h2>
                <p className={`${t.body} mb-5`}>Real owner photos help buyers make better decisions. Add yours to the Watchems community gallery.</p>
                <CTAButton priority="primary" size="md" href="/upload">Upload your wrist shot</CTAButton>
              </div>
            </aside>

            <footer className="pb-8 flex items-center justify-between gap-4 border-t border-border pt-6">
              <Link href="/buying-guides" className={`${t.meta} hover:text-textSecond transition-colors inline-flex items-center gap-2`}>
                <span aria-hidden="true">←</span>
                <span>All buying guides</span>
              </Link>
              <Link href="/buying-guide/under-500" className={`${t.meta} hover:text-textSecond transition-colors`}>
                View v1 →
              </Link>
            </footer>

          </div>
        </article>
      </main>
    </>
  )
}
