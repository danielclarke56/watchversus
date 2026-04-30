export interface PriceModel {
  name: string
  brandName: string       // used for DB fallback query
  price: string           // e.g. "~$230"
  caseSize: string        // e.g. "42mm"
  waterResistance: string // e.g. "100m"
  crystal: string         // "Sapphire" | "Mineral" | "Hardlex"
  movement: string        // e.g. "Automatic (4R36)"
  bestFor: string         // e.g. "Daily beater"
  reason: string          // one-line editorial summary
}

export interface PriceFAQ {
  question: string
  answer: string
}

export interface PriceInternalLink {
  label: string
  href: string
}

export interface PriceData {
  slug: string
  name: string
  shortLabel: string
  dbValue: string           // exact photos.estimatedPrice value for DB photo fallback
  lastUpdated: string       // "April 2026" — shown on page for freshness signal
  intro: string             // 1–2 sentences: who this guide is for
  heroFact: string
  overview: string          // 3–5 paragraphs of editorial prose
  notableModels: PriceModel[]
  faq: PriceFAQ[]
  internalLinks: PriceInternalLink[]  // related pages on Watchems
}

export const prices: PriceData[] = [
  {
    slug: 'under-500',
    name: 'Best Watches Under $500',
    shortLabel: 'Under $500',
    dbValue: 'Under $500',
    lastUpdated: 'April 2026',
    intro: 'Whether you\'re buying your first mechanical watch, looking for a reliable daily beater, or shopping for a gift — this guide covers the best watches available for under $500 in 2026, with honest trade-offs at every choice.',
    heroFact: 'The Seiko 5 Sports has shipped over 100 million units since 1963 — Japan\'s most enduring automatic watch — and remains under $300 at retail today.',
    overview: `The sub-$500 tier has undergone a quiet revolution. A decade ago, spending less than $500 on a watch meant accepting plastic crystals, low-beat movements, and poor finishing. That is no longer true. Japanese and Swiss manufacturers now compete aggressively at this price point, and the result is extraordinary value for buyers willing to look beyond heritage brand names.

At the top of this tier, the Tissot PRX Powermatic 80 delivers an integrated steel bracelet, an ETA-based movement with an 80-hour power reserve, and Swiss Made certification — design details that were $1,000+ territory just a few years ago. The Hamilton Khaki Field Mechanical brings a genuine 80-hour manual-wind movement, sapphire crystal, and a design rooted in US Army field watch specifications, all under $450.

The Japanese contingent is arguably even stronger. Seiko's 5 Sports range — built on the 4R36 automatic with 100m water resistance and a day-date display — covers everything from casual to diver aesthetics under $250. The Orient Kamasu takes aim squarely at budget divers, offering a ceramic bezel insert, 200m water resistance, and a sapphire crystal for under $200 — specifications that match dive watches costing three times as much.

For those who prefer quartz precision or digital durability, the Casio G-Shock GA-2100 brings a Carbon Core Guard case, solar charging, Bluetooth time sync, and genuine shock resistance for under $120. The Citizen Promaster Diver, meanwhile, is ISO 6425-certified — the same independent standard governing professional dive watches — with a sapphire crystal and automatic movement well under $300.

The honest trade-off at this price point is movement finishing and case polish. Movements are typically not decorated, lugs may show tool marks, and bracelets can feel loose at the clasp. These are aesthetic compromises that do not affect reliability or functionality. At under $500, you are buying a working watch; at $5,000, you begin paying for the beauty of its construction.`,
    notableModels: [
      {
        name: 'Seiko 5 Sports SRPD',
        brandName: 'Seiko',
        price: '~$230',
        caseSize: '42.5mm',
        waterResistance: '100m',
        crystal: 'Hardlex',
        movement: 'Automatic (4R36)',
        bestFor: 'First automatic watch',
        reason: 'Best-value automatic — in-house 4R36, 100m water resistance, day/date, wide variety of colourways under $250.',
      },
      {
        name: 'Orient Kamasu',
        brandName: 'Orient',
        price: '~$185',
        caseSize: '41.8mm',
        waterResistance: '200m',
        crystal: 'Sapphire',
        movement: 'Automatic (F6922)',
        bestFor: 'Budget diver',
        reason: 'Sapphire crystal, 200m dive spec, ceramic bezel insert, in-house automatic — one of the best-specified divers under $200.',
      },
      {
        name: 'Tissot PRX Powermatic 80',
        brandName: 'Tissot',
        price: '~$475',
        caseSize: '40mm',
        waterResistance: '100m',
        crystal: 'Sapphire',
        movement: 'Automatic (ETA C07.111)',
        bestFor: 'Dress / smart casual',
        reason: 'Integrated bracelet design, 80-hour power reserve, Swiss Made — best finishing and bracelet quality in the tier.',
      },
      {
        name: 'Hamilton Khaki Field Mechanical',
        brandName: 'Hamilton',
        price: '~$445',
        caseSize: '38mm',
        waterResistance: '50m',
        crystal: 'Sapphire',
        movement: 'Manual-wind (H-50)',
        bestFor: 'Field / heritage look',
        reason: 'Manual-wind H-50 movement, 80-hour power reserve, sapphire crystal, field-watch heritage.',
      },
      {
        name: 'Casio G-Shock GA-2100',
        brandName: 'Casio',
        price: '~$110',
        caseSize: '45.4mm',
        waterResistance: '200m',
        crystal: 'Mineral',
        movement: 'Quartz (solar)',
        bestFor: 'Rugged / active use',
        reason: 'Carbon Core Guard construction, solar power, Bluetooth time sync, shock and water resistant — the most durable under $120.',
      },
      {
        name: 'Citizen Promaster Diver NY0040',
        brandName: 'Citizen',
        price: '~$270',
        caseSize: '42mm',
        waterResistance: '200m',
        crystal: 'Sapphire',
        movement: 'Automatic (8203)',
        bestFor: 'Serious diver on a budget',
        reason: 'ISO 6425 certified dive spec, sapphire crystal, automatic movement, full bracelet — a genuine diver under $300.',
      },
    ],
    faq: [
      {
        question: 'What is the best automatic watch under $500?',
        answer: 'The Tissot PRX Powermatic 80 is the strongest overall automatic under $500 — Swiss Made, 80-hour power reserve, integrated bracelet, and clean integrated design. For pure value, the Orient Kamasu at under $200 gives you a sapphire crystal, ceramic bezel, and 200m dive rating that competes with watches costing three times as much. The Seiko 5 Sports is the most versatile choice, with a broad range of designs all using the reliable 4R36 calibre.',
      },
      {
        question: 'Can you get a Swiss Made watch for under $500?',
        answer: 'Yes. Tissot, Hamilton, and Certina all produce Swiss Made watches comfortably under $500. The Tissot PRX Powermatic 80 and Hamilton Khaki Field Mechanical are the standouts — both carry ETA-derived movements with impressive power reserves and genuine Swiss manufacture credentials. Swiss Made requires at least 60% of manufacturing costs to be incurred in Switzerland, including final inspection.',
      },
      {
        question: 'Is a $500 watch worth buying, or should I save more?',
        answer: 'A $500 watch is a serious purchase that will last decades with basic maintenance. The Seiko and Orient automatics in this tier use movements that Seiko and Orient service or replace cheaply. The question is not whether $500 buys a good watch — it does — but whether spending $1,000–$2,000 would materially improve your experience. At that tier, you gain better movement finishing and significantly improved bracelet quality. If daily reliability is the goal, $500 is more than sufficient.',
      },
      {
        question: 'What strap should I use on a watch under $500?',
        answer: 'NATO straps in nylon or canvas are the default recommendation — they are inexpensive, comfortable, and easy to swap. A $15 NATO on a Seiko 5 Sports transforms the look for under $300 total. Leather straps work well for dressier contexts. Avoid spending more than $50–80 on a strap for a watch in this range — the strap budget should stay proportional to the watch.',
      },
      {
        question: 'Orient Kamasu vs Seiko SKX — which should I buy?',
        answer: 'The Seiko SKX (discontinued but widely available used) uses the 7S26 movement with no hacking or hand-winding — a minor inconvenience for daily use. The Orient Kamasu uses the F6922 with both hacking and hand-winding, plus a sapphire crystal and ceramic bezel insert. New, the Kamasu wins on specification at a lower price. Used, a minty SKX has strong community backing and aftermarket support. For a new purchase in 2026, buy the Kamasu.',
      },
      {
        question: 'Is the Seiko 5 Sports worth buying in 2026?',
        answer: 'Yes, without hesitation. The current SRPD series uses the updated 4R36 calibre with hacking and hand-winding — improvements over the older 7S26. At $200–250, the Seiko 5 Sports offers legitimate 100m water resistance, a day-date complication, and a range of designs broad enough to suit almost any taste. It is the most recommended entry-level automatic for good reason: it is simply a reliable, good-looking watch at a fair price.',
      },
      {
        question: 'Do I need a sapphire crystal on a watch under $500?',
        answer: 'Sapphire crystal (hardness 9 on the Mohs scale) is significantly more scratch-resistant than mineral or Hardlex glass. At under $500, several watches include sapphire — the Orient Kamasu, Tissot PRX, Hamilton Khaki Field, and Citizen Promaster Diver all do. The Seiko 5 Sports uses Hardlex, which scratches more easily but can be polished cheaply. If you wear your watch daily and dislike visible scratches, prioritise sapphire. For occasional or rugged use, Hardlex is fine.',
      },
    ],
    internalLinks: [
      { label: 'Browse Seiko wrist photos', href: '/brand/seiko' },
      { label: 'Browse Casio wrist photos', href: '/brand/casio' },
      { label: 'Dive watch guide', href: '/style/dive-watches' },
      { label: 'Field watch guide', href: '/style/field-watches' },
    ],
  },
]

export function getPriceBySlug(slug: string): PriceData | undefined {
  return prices.find((p) => p.slug === slug)
}
