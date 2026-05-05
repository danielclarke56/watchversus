/**
 * Best Watches Under $100 — buying guide
 * Route: /buying-guide/under-100
 */

export const dynamic = 'force-static'

import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { FaqAccordion } from '@/components/guide/FaqAccordion'
import { RankingTable } from '@/components/guide/RankingTable'
import { t } from '@/lib/styles'

export const metadata: Metadata = {
  title: 'Best Watches Under $100 — Community Ranking & Buying Guide | Watchems',
  description: 'The 20 most recommended watches under $100, ranked by community research across r/Watches, WatchUSeek, and enthusiast forums. Specs, FAQs, and honest trade-offs.',
  alternates: { canonical: 'https://watchems.com/buying-guide/under-100' },
}

// ─────────────────────────────────────────────────────────────────────────────
// RANKING — community + trusted source consensus
// ─────────────────────────────────────────────────────────────────────────────

interface RankEntry {
  rank: number
  brand: string
  model: string
  price: string
  caseSize: string
  thickness: string
  movement: string
  crystal: string
  wr: string
  url?: string
}

const RANKING: RankEntry[] = [
  { rank: 1,  brand: 'Casio',   model: 'Casio F-91W-1',                    price: '~$23',  caseSize: '38.5mm', thickness: '8.5mm',  movement: 'Quartz (2747)',        crystal: 'Mineral',  wr: '30m',  url: 'https://www.casio.com/intl/watches/casio/product.F-91W-1/' },
  { rank: 2,  brand: 'Casio',   model: 'Casio MDV-106-1AV Duro',           price: '~$85',  caseSize: '44.5mm', thickness: '12.3mm', movement: 'Quartz',               crystal: 'Mineral',  wr: '200m', url: 'https://www.casio.com/intl/watches/casio/product.MDV-106-1AV/' },
  { rank: 3,  brand: 'Casio',   model: 'Casio AE-1200WHD-1AV',             price: '~$40',  caseSize: '45mm',   thickness: '11.7mm', movement: 'Quartz (3199)',        crystal: 'Mineral',  wr: '100m', url: 'https://www.casio.com/intl/watches/casio/product.AE-1200WHD-1AV/' },
  { rank: 4,  brand: 'Timex',   model: 'Timex Weekender 38mm',             price: '~$77',  caseSize: '38mm',   thickness: '10mm',   movement: 'Quartz (Indiglo)',      crystal: 'Acrylic',  wr: '30m',  url: 'https://www.timex.com/collections/weekender' },
  { rank: 5,  brand: 'Casio',   model: 'Casio G-Shock DW-5600E-1V',        price: '~$99',  caseSize: '42.8mm', thickness: '13.4mm', movement: 'Quartz (3229)',        crystal: 'Mineral',  wr: '200m', url: 'https://www.casio.com/intl/watches/gshock/product.DW-5600E-1V/' },
  { rank: 6,  brand: 'Casio',   model: 'Casio A158WA-1',                   price: '~$29',  caseSize: '33.5mm', thickness: '7mm',    movement: 'Quartz (2747)',        crystal: 'Mineral',  wr: '30m',  url: 'https://www.casio.com/intl/watches/casio/product.A158WA-1/' },
  { rank: 7,  brand: 'Timex',   model: 'Timex Expedition Scout 40mm',      price: '~$65',  caseSize: '40mm',   thickness: '11mm',   movement: 'Quartz (Indiglo)',      crystal: 'Mineral',  wr: '50m',  url: 'https://www.timex.com/collections/expedition' },
  { rank: 8,  brand: 'Vostok',  model: 'Vostok Amphibia 120811',           price: '~$85',  caseSize: '40mm',   thickness: '13mm',   movement: 'Auto (2416B)',         crystal: 'Acrylic',  wr: '200m', url: 'https://vostok-watches.ru/en/catalog/amphibia/' },
  { rank: 9,  brand: 'Timex',   model: 'Timex Easy Reader T20501',         price: '~$69',  caseSize: '35mm',   thickness: '8mm',    movement: 'Quartz (Indiglo)',      crystal: 'Mineral',  wr: '30m',  url: 'https://www.timex.com/collections/easy-reader' },
  { rank: 10, brand: 'Casio',   model: 'Casio MTP-1302D-1A1V',             price: '~$35',  caseSize: '41.5mm', thickness: '8.6mm',  movement: 'Quartz',               crystal: 'Mineral',  wr: '50m',  url: 'https://www.casio.com/us/watches/casio/product.MTP-1302D-1A1V/' },
  { rank: 11, brand: 'Casio',   model: 'Casio G-Shock GW-M5610U-1',        price: '~$99',  caseSize: '43.2mm', thickness: '12.7mm', movement: 'Solar/Multiband quartz', crystal: 'Mineral', wr: '200m', url: 'https://www.casio.com/intl/watches/gshock/product.GW-M5610U-1/' },
  { rank: 12, brand: 'Casio',   model: 'Casio G-Shock DW-9052-1V',         price: '~$60',  caseSize: '48.9mm', thickness: '15.1mm', movement: 'Quartz (3232)',        crystal: 'Mineral',  wr: '200m', url: 'https://www.casio.com/intl/watches/gshock/' },
  { rank: 13, brand: 'Casio',   model: 'Casio A100WEF-1AEF',               price: '~$60',  caseSize: '34.9mm', thickness: '8.2mm',  movement: 'Quartz',               crystal: 'Mineral',  wr: '30m',  url: 'https://www.casio.com/intl/watches/casio/' },
  { rank: 14, brand: 'Timex',   model: 'Timex Ironman Classic 30',         price: '~$80',  caseSize: '43mm',   thickness: '14mm',   movement: 'Quartz (Indiglo)',      crystal: 'Mineral',  wr: '100m', url: 'https://www.timex.com/collections/ironman' },
  { rank: 15, brand: 'Casio',   model: 'Casio CA-53W-1',                   price: '~$40',  caseSize: '36.3mm', thickness: '8.3mm',  movement: 'Quartz (calculator)',  crystal: 'Mineral',  wr: '30m',  url: 'https://www.casio.com/intl/watches/casio/product.CA-53W-1/' },
  { rank: 16, brand: 'Casio',   model: 'Casio MTP-V001D-1B',               price: '~$40',  caseSize: '37mm',   thickness: '9mm',    movement: 'Quartz',               crystal: 'Mineral',  wr: '30m',  url: 'https://www.casio.com/intl/watches/casio/product.MTP-V001D-1B/' },
  { rank: 17, brand: 'Timex',   model: 'Timex MK1 Aluminum 40mm',          price: '~$60',  caseSize: '40mm',   thickness: '11mm',   movement: 'Quartz (Indiglo)',      crystal: 'Mineral',  wr: '30m',  url: 'https://www.timex.com/collections/mk1' },
  { rank: 18, brand: 'Casio',   model: 'Casio G-Shock GA-700-1B',          price: '~$99',  caseSize: '51.6mm', thickness: '16.9mm', movement: 'Ana-digi quartz',      crystal: 'Mineral',  wr: '200m', url: 'https://www.casio.com/us/watches/gshock/product.GA-700-1B/' },
  { rank: 19, brand: 'Casio',   model: 'Casio MTP-VD01D-1BV',              price: '~$25',  caseSize: '42mm',   thickness: '10mm',   movement: 'Quartz',               crystal: 'Mineral',  wr: '50m',  url: 'https://www.casio.com/us/watches/casio/product.MTP-VD01D-1BV/' },
  { rank: 20, brand: 'Casio',   model: 'Casio G-Shock GD-350-1B',          price: '~$85',  caseSize: '55mm',   thickness: '16.4mm', movement: 'Quartz',               crystal: 'Mineral',  wr: '200m', url: 'https://www.casio.com/intl/watches/gshock/' },
]

// ─────────────────────────────────────────────────────────────────────────────
// FAQ
// ─────────────────────────────────────────────────────────────────────────────

const EXTENDED_FAQ = [
  {
    question: 'Is a $50 watch actually worth buying, or should I just save more?',
    answer: 'For most people, yes — $50 buys a genuinely reliable watch that will outlast many expensive ones. The Casio F-91W costs ~$20 and has run continuously for decades on a single battery. The engineering at this price tier is extremely mature — Casio, Timex, and Seiko have been perfecting these movements for 30–40 years. The trade-offs are aesthetic (plastic cases, mineral glass) not mechanical. If you need a daily beater, travel watch, or backup watch, under $100 makes perfect sense.',
  },
  {
    question: 'Are watches under $100 quartz only?',
    answer: 'Almost. The only automatic commonly recommended under $100 is the Vostok Amphibia (~$90), a Russian-made diver with a genuine automatic movement and 200m water resistance. Everything else at this price point is quartz — which is actually ideal. Quartz movements are more accurate, more shock-resistant, and require no winding or movement. At under $100, a well-made quartz beats a cheap automatic every time.',
  },
  {
    question: 'Casio vs Timex — which is better under $100?',
    answer: 'Different strengths. Casio dominates in durability, features, and water resistance — the G-Shock line at ~$70–99 is almost indestructible and includes 200m WR, shock protection, and illuminated displays. Timex wins on traditional aesthetics — the Weekender and Ironman look more like "watches" and less like sports electronics. If you need toughness, Casio. If you want something that can dress up slightly or looks more classic, Timex. Both have decades of proven reliability.',
  },
  {
    question: 'Is the Casio F-91W really that good?',
    answer: 'Yes — it is the most recommended watch in this bracket and possibly the most recommended budget watch ever made. At ~$20, it offers: reliable quartz timekeeping (accurate to ±15 sec/month), a stopwatch, alarm, day/date display, 30m water resistance, and LED illumination. The case is light and slim (8.5mm thick). Battery life is 7 years. It has been worn by presidents, astronauts, soldiers, and design students. Its main limitation: 30m WR means splash-proof, not swimming.',
  },
  {
    question: 'What is the best G-Shock for under $100?',
    answer: 'The DW-5600E-1V (~$99 MSRP, often under $60 street) is the most recommended — the direct descendant of the original 1983 G-Shock: square case, 200m WR, shock protection, alarm, stopwatch, backlight, 2-year battery. For large-display fans, the GA-700-1B (~$99) offers an oversized ana-digi face — the biggest readable dial in this price bracket. For maintenance-free operation, the GW-M5610U-1 (~$99) adds solar charging and Multiband 6 radio sync. The GA-2100-1A1 "CasiOak" lists at $110 MSRP and is not in this guide.',
  },
  {
    question: 'What does Indiglo mean on Timex watches?',
    answer: 'Indiglo is Timex\'s brand name for their electroluminescent backlight. Pressing a side button illuminates the entire dial in a uniform blue-green glow, making the watch readable in complete darkness without a single LED point. It is distinctly different from a standard LED dot or spot light — the whole face lights up. Indiglo is reliable, uses minimal battery, and is one of the main reasons Timex watches are popular as bedside, hiking, and camping watches.',
  },
  {
    question: 'Can I wear a $20 Casio to work or does it look cheap?',
    answer: 'It depends on your environment and how you carry it. In creative, tech, and casual offices, a Casio F-91W is widely recognised as intentional minimalism — it has cult status. In conservative professional settings (law, banking, formal client meetings), it will read as informal. The same $20 watch worn with confidence in the right environment draws compliments; worn with an apology in the wrong one, it draws scrutiny. The watch community\'s consistent advice: wear what suits your context and do it without hesitation.',
  },
  {
    question: 'What is the water resistance like on budget watches?',
    answer: '30m (the most common under $100) means splash and rain resistance only — do not swim with it. 50m is rated for light swimming in calm water. 100m is suitable for regular pool swimming. 200m is a genuine dive rating. G-Shock watches with 200m ratings are tested to exceed their ratings; Casio\'s shock protection design actually helps here. Important: WR ratings assume static pressure. Cannonballing into a pool with a 30m watch can damage it even though 30 metres of static water would not.',
  },
  {
    question: 'What are the trade-offs compared to a $200–500 watch?',
    answer: 'Crystal quality — mineral glass scratches; sapphire does not. Case material — plastic or basic stainless at this price versus solid stainless above $150. Bracelet quality — inexpensive bracelets have more play. Movement finishing — no exhibition casebacks, no rotor weight on automatics. But accuracy, reliability, and durability are not significantly worse for a well-made quartz watch. A $20 Casio and a $500 Seiko will keep similar time. The differences are entirely about materials, finishing, and feel — not mechanical performance.',
  },
  {
    question: 'Is the Vostok Amphibia a reliable automatic under $100?',
    answer: 'It is the community\'s only serious automatic recommendation under $100, and it is available new on Amazon for ~$80–$95 (multiple references verified in stock). The Amphibia uses the Russian calibre 2416B — a robust movement with an unusual bayonet caseback design that actually tightens under water pressure, contributing to its genuine 200m dive rating. Trade-offs: accuracy is typical of budget automatics (±15–20 sec/day), the dial finishing is utilitarian, and the lugs can feel long on smaller wrists. The movement runs for years without service and the watch has a Soviet-era character that no Casio or Timex can match.',
  },
  {
    question: 'Should I buy a battery-powered quartz or a solar watch at this price?',
    answer: 'Solar is worth it if available — Casio\'s solar G-Shocks run indefinitely when exposed to regular light, eliminating battery changes entirely. The GW-M5610 (~$99) adds radio sync so it corrects itself automatically. Battery quartz watches at this price last 2–7 years per battery depending on features (backlights drain faster). For everyday carry, solar is more convenient. For minimal watches like the F-91W that are extremely cheap to replace, battery is fine.',
  },
  {
    question: 'What is the best under-$100 watch for outdoor activities?',
    answer: 'G-Shock DW-5600E for overall toughness — 200m WR, military-grade shock protection, alarm, stopwatch, 7-year battery. Casio MDV-106 Duro for swimming and water sports specifically — it is a dedicated diver-style watch with 200m WR for ~$55. Timex Expedition for hiking and camping — 50m WR, Indiglo backlight, field-watch aesthetics, comfortable nylon strap. The Casio W-S220 is worth considering if you want solar charging for extended outdoor use.',
  },
  {
    question: 'Can I find a dress watch under $100?',
    answer: 'Yes but with trade-offs. The Casio MTP-V001 (~$30) and Seiko SUR series (~$80–95) offer slim profiles and classic round-dial aesthetics that work in casual dress settings. The Casio A158W (~$25) in stainless steel is the community\'s favourite minimal field-watch for its clean, no-nonsense look. For formal settings, a Timex Weekender on a leather strap (~$40) is frequently cited. These are not dress watches by luxury standards — the crystals, cases, and bracelets reflect the price — but they read as intentional and clean in most environments.',
  },
  {
    question: 'Is it worth buying a smart watch or fitness tracker instead?',
    answer: 'Different category. Smartwatches (Apple Watch, Garmin, Fitbit) are fitness computers with clocks; traditional watches are timekeeping accessories with personalities. Under $100 specifically: smartwatch alternatives in this range are mostly bargain-bin Android Wear clones with short battery life and questionable health sensor accuracy. A $70 G-Shock will outlast most budget smartwatches. If you primarily want fitness tracking, a Xiaomi Mi Band or similar is better value than a budget smartwatch. If you want a watch that simply tells time reliably for years, traditional quartz wins.',
  },
  {
    question: 'How long will a budget quartz watch last?',
    answer: 'Decades, with basic care. The Casio F-91W has been in continuous production since 1989 and original units from the early 90s are still running. Quartz movements have very few moving parts — the main failure modes are battery corrosion (replace batteries before they die to avoid leakage), water damage from failed seals, and physical impact damage to the crystal or case. Stored examples from the 1970s–80s start right up with a new battery. There is no planned obsolescence in a well-made quartz watch.',
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────────────────────

export default function BuyingGuideUnder100Page() {
  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: 'Best Watches Under $100 — Community Ranking & Buying Guide',
    description: 'The 20 most recommended watches under $100, ranked by community research.',
    url: 'https://watchems.com/buying-guide/under-100',
    datePublished: '2026-05-01',
    author: { '@type': 'Organization', name: 'Watchems Editorial', url: 'https://watchems.com' },
    publisher: { '@type': 'Organization', name: 'Watchems', url: 'https://watchems.com' },
  }

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: EXTENDED_FAQ.map(({ question, answer }) => ({
      '@type': 'Question',
      name: question,
      acceptedAnswer: { '@type': 'Answer', text: answer },
    })),
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      <main>
        <article>

          {/* ════════════════════════════════════════
              HERO
          ════════════════════════════════════════ */}
          <header>
            <div className="relative w-full h-[60vh] min-h-72 max-h-[520px] overflow-hidden bg-surfaceAlt">
              <Image src="/images/guides/under-100-hero.png" alt="Collection of budget watches under $100 — illustrative image" fill priority className="object-cover" sizes="100vw" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />
              <p className="absolute bottom-2 right-3 text-white/30 text-[10px] leading-none">Illustrative image — AI generated</p>
              <div className="absolute inset-0 flex flex-col justify-end">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-12 w-full">
                  <nav aria-label="Breadcrumb" className="text-white/50 text-xs mb-5 flex items-center gap-1.5">
                    <Link href="/" className="hover:text-white/80 transition-colors">Home</Link>
                    <span>/</span>
                    <Link href="/buying-guides" className="hover:text-white/80 transition-colors">Buying Guides</Link>
                    <span>/</span>
                    <span className="text-white/70">Under $100</span>
                  </nav>
                  <h1 className="font-heading text-3xl sm:text-5xl font-semibold text-white tracking-tight leading-[1.05] mb-4">
                    Best Watches Under $100
                  </h1>
                  <p className="text-white/75 text-base sm:text-lg leading-relaxed max-w-2xl">
                    What watch buyers actually recommend under $100. No editorial agenda. Prices verified May 2026.
                  </p>
                </div>
              </div>
            </div>

            {/* Proof strip */}
            <div className="bg-surface border-b border-border">
              <div className="max-w-5xl mx-auto px-4 sm:px-6 py-5">
                <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
                  {[
                    { stat: '20', label: 'watches ranked' },
                    { stat: '$23–$99', label: 'price range' },
                    { stat: 'May 2026', label: 'prices verified' },
                  ].map((p) => (
                    <div key={p.label} className="flex items-baseline gap-2">
                      <span className="font-heading text-xl font-semibold text-textPrimary tabular-nums">{p.stat}</span>
                      <span className="text-xs text-textMuted">{p.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </header>

          {/* ════════════════════════════════════════
              RANKING TABLE
          ════════════════════════════════════════ */}
          <section id="ranking" aria-labelledby="ranking-heading" className="py-16 border-b border-border">
            <div className="max-w-5xl mx-auto px-4 sm:px-6">
              <div className="mb-8">
                <h2 className={`${t.h2}`} id="ranking-heading">Top 20 watches under $100</h2>
                <p className="text-sm text-textMuted mt-1">Curated by the Watchems team based on enthusiast community research. Not a live data feed. Scroll horizontally on mobile.</p>
              </div>
              <RankingTable rows={RANKING} initialCount={20} />
              <div className="mt-4 flex items-start gap-4 flex-wrap">
                <p className="text-xs text-textMuted leading-relaxed">Specs and prices are approximate — verify before purchase. No sponsored picks.</p>
                <details className="group shrink-0">
                  <summary className="cursor-pointer list-none flex items-center gap-1.5 text-xs font-medium text-textSecond hover:text-textPrimary transition-colors select-none">
                    <svg className="w-3.5 h-3.5 transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                    How this list was built
                  </summary>
                  <p className="mt-3 text-xs text-textSecond leading-relaxed max-w-lg">
                    This ranking was compiled by the Watchems team by researching recommendation frequency across 14 sources including r/Watches, r/SuggestAWatch, WatchUSeek, Worn &amp; Wound, Teddy Baldassarre, Two Broke Watch Snobs, HiConsumption, Gear Patrol, Cool Material, Gentleman&apos;s Gazette, The Time Bum, Dappered, WatchCompared, and The Modest Man. Prices verified against Casio.com, Timex.com, and Amazon in May 2026. Rank order reflects how often each model appeared across those sources — not a live data pull. The list may be updated or modified by the Watchems team at any time.
                  </p>
                </details>
              </div>
            </div>
          </section>

          {/* ════════════════════════════════════════
              OWNER CTA
          ════════════════════════════════════════ */}
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
            <aside className="rounded-2xl bg-textPrimary px-8 py-10 flex flex-col sm:flex-row sm:items-center gap-6">
              <div className="flex-1">
                <p className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-2">Own one of these?</p>
                <h2 className="font-heading text-xl font-semibold text-white mb-1">Show it on your wrist.</h2>
                <p className="text-white/70 text-sm leading-relaxed max-w-md">Real owner photos help buyers make better decisions. Add yours to the Watchems community gallery.</p>
              </div>
              <div className="shrink-0">
                <Link href="/upload" className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-white text-textPrimary text-sm font-semibold hover:bg-white/90 transition-colors whitespace-nowrap">
                  Upload your wrist shot
                </Link>
              </div>
            </aside>
          </div>

          {/* ════════════════════════════════════════
              FAQ
          ════════════════════════════════════════ */}
          <section id="faq" aria-labelledby="faq-heading" className="py-16 border-b border-border [scroll-margin-top:108px]">
            <div className="max-w-5xl mx-auto px-4 sm:px-6">
              <h2 className={`${t.h2} mb-8`} id="faq-heading">Common questions</h2>
              <FaqAccordion items={EXTENDED_FAQ} />
            </div>
          </section>

          {/* ════════════════════════════════════════
              EXPLORE + NAV
          ════════════════════════════════════════ */}
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 space-y-12">

            <aside aria-label="Explore related content">
              <p className="text-xs font-semibold text-textMuted uppercase tracking-widest mb-4">Explore on Watchems</p>
              <nav aria-label="Related pages">
                <ul className="flex flex-wrap gap-2">
                  {[
                    { href: '/buying-guide/under-500', label: 'Best under $500' },
                    { href: '/style/dive', label: 'Dive watches' },
                    { href: '/style/field', label: 'Field watches' },
                    { href: '/style/dress', label: 'Dress watches' },
                  ].map((link) => (
                    <li key={link.href}>
                      <Link href={link.href} className="inline-flex items-center px-3.5 py-1.5 rounded-full bg-surfaceAlt border border-border text-xs text-textSecond hover:text-textPrimary hover:border-textMuted transition-colors">{link.label}</Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </aside>

            <footer className="flex items-center justify-between gap-4 border-t border-border pt-6">
              <Link href="/buying-guides" className={`${t.meta} hover:text-textSecond transition-colors inline-flex items-center gap-2`}>
                <span aria-hidden="true">←</span>
                <span>All buying guides</span>
              </Link>
              <Link href="/buying-guide/under-500" className={`${t.meta} hover:text-textSecond transition-colors`}>
                Best under $500 →
              </Link>
            </footer>
          </div>

        </article>
      </main>
    </>
  )
}
