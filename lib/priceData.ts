export interface PriceModel {
  name: string
  reason: string
}

export interface PriceFAQ {
  question: string
  answer: string
}

export interface PriceData {
  slug: string
  name: string
  shortLabel: string
  heroFact: string
  overview: string
  notableModels: PriceModel[]
  faq: PriceFAQ[]
}

export const prices: PriceData[] = [
  {
    slug: 'under-500',
    name: 'Best Watches Under $500',
    shortLabel: 'Under $500',
    heroFact: 'The Seiko 5 Sports has shipped over 100 million units since 1963 — Japan\'s most enduring automatic watch — and remains under $300 at retail today.',
    overview: `The sub-$500 tier has undergone a quiet revolution. A decade ago, spending less than $500 on a watch meant accepting plastic crystals, low-beat movements, and poor finishing. That is no longer true. Japanese and Swiss manufacturers now compete aggressively at this price point, and the result is extraordinary value for buyers willing to look beyond brand names.

At the top of this tier, the Tissot PRX Powermatic 80 delivers an integrated steel bracelet, an ETA-based movement with an 80-hour power reserve, and Swiss Made certification — design details that were £1,000+ territory just a few years ago. The Hamilton Khaki Field Mechanical brings a genuine 80-hour manual-wind movement, sapphire crystal, and a design rooted in US Army field watch specifications, all under $450.

The Japanese contingent is arguably even stronger. Seiko's 5 Sports range — built on the 4R36 automatic with 100m water resistance and a day-date display — covers everything from casual to diver aesthetics under $250. The Orient Kamasu takes aim squarely at budget divers, offering a ceramic bezel insert, 200m water resistance, and a sapphire crystal for under $200 — specifications that match dive watches costing three times as much.

For those who prefer quartz precision or digital durability, the Casio G-Shock GA-2100 brings a Carbon Core Guard case, solar charging, Bluetooth time sync, and genuine shock resistance for under $120. The Citizen Promaster Diver, meanwhile, is ISO 6425-certified — the same independent standard governing professional dive watches — with a sapphire crystal and automatic movement well under $300.

The honest trade-off at this price point is movement finishing and case polish. Movements are typically not decorated, lugs may show tool marks, and bracelets can feel loose at the clasp. These are aesthetic compromises that do not affect reliability or functionality. At under $500, you are buying a working watch; at $5,000, you begin paying for the beauty of its construction.`,
    notableModels: [
      {
        name: 'Seiko 5 Sports SRPD',
        reason: 'Best-value automatic — in-house 4R36, 100m water resistance, day/date, wide variety of colourways under $250.',
      },
      {
        name: 'Orient Kamasu',
        reason: 'Sapphire crystal, 200m dive spec, ceramic bezel insert, in-house automatic — one of the best-specified divers under $200.',
      },
      {
        name: 'Tissot PRX Powermatic 80',
        reason: 'Integrated bracelet design, 80-hour power reserve, Swiss Made — best finishing and bracelet quality in the tier, under $500.',
      },
      {
        name: 'Hamilton Khaki Field Mechanical',
        reason: 'Manual-wind H-50 movement, 80-hour power reserve, sapphire crystal, field-watch heritage — under $450.',
      },
      {
        name: 'Casio G-Shock GA-2100',
        reason: 'Carbon Core Guard construction, solar power, Bluetooth time sync, shock and water resistant — the most durable under $120.',
      },
      {
        name: 'Citizen Promaster Diver NY0040',
        reason: 'ISO 6425 certified dive spec, sapphire crystal, automatic movement, full bracelet — a genuine diver under $300.',
      },
    ],
    faq: [
      {
        question: 'What is the best automatic watch under $500?',
        answer: 'The Tissot PRX Powermatic 80 is the strongest overall automatic under $500 — Swiss Made, 80-hour power reserve, integrated bracelet, and a clean integrated design. For pure value, the Orient Kamasu at under $200 gives you a sapphire crystal, ceramic bezel, and 200m dive rating that competes with watches costing three times as much. The Seiko 5 Sports is the most versatile choice, with a broad range of designs all using the reliable 4R36 calibre.',
      },
      {
        question: 'Can you get a Swiss Made watch for under $500?',
        answer: 'Yes. Tissot, Hamilton, and Certina all produce Swiss Made watches comfortably under $500. The Tissot PRX Powermatic 80 and Hamilton Khaki Field Mechanical are the standouts — both carry ETA-derived movements with impressive power reserves and genuine Swiss manufacture credentials. Swiss Made requires at least 60% of manufacturing costs to be incurred in Switzerland, including final inspection.',
      },
      {
        question: 'Is a $500 watch worth buying, or should I save more?',
        answer: 'A $500 watch is a serious purchase that will last decades with basic maintenance. The Seiko and Orient automatics in this tier use movements that Seiko and Orient service or replace cheaply. The question is not whether $500 buys a good watch — it does — but whether spending $1,000–$2,000 would materially improve your experience. At that tier, you gain sapphire crystals throughout, better movement finishing, and significantly improved bracelet quality. If daily reliability is the goal, $500 is more than sufficient.',
      },
      {
        question: 'What strap should I use on a watch under $500?',
        answer: 'NATO straps in nylon or canvas are the default recommendation for watches in this tier — they are inexpensive, comfortable, and easy to swap. A $15 NATO on a Seiko 5 Sports transforms the look for under $300 total. Leather straps work well for dressier contexts. Avoid spending more than $50–80 on a strap for a watch in this range — the strap budget should be proportional to the watch.',
      },
    ],
  },
]

export function getPriceBySlug(slug: string): PriceData | undefined {
  return prices.find((p) => p.slug === slug)
}
