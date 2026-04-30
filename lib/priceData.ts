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

export interface PriceUseCase {
  useCase: string  // "First automatic watch"
  model: string    // "Seiko 5 Sports"
}

export interface PriceSource {
  label: string  // e.g. "Seiko official spec sheet"
  url: string    // source URL
}

export interface PriceData {
  slug: string
  name: string
  shortLabel: string
  dbValue: string           // exact photos.estimatedPrice value for DB photo fallback
  lastUpdated: string       // "April 2026" — shown on page for freshness signal
  intro: string             // leads with top pick by name + price
  heroFact: string          // specific fact: model + price + comparison
  overview: string          // 4 paragraphs: landscape, expectations, trade-offs, who it's for
  pickByUseCase: PriceUseCase[]  // scannable lookup table
  notableModels: PriceModel[]
  faq: PriceFAQ[]
  internalLinks: PriceInternalLink[]  // only /brand/ and /style/ paths
  sources: PriceSource[]    // cited sources shown at bottom of page
}

export const prices: PriceData[] = [
  {
    slug: "under-500",
    name: "Best Watches Under $500",
    shortLabel: "Under $500",
    dbValue: "Under $500",
    lastUpdated: "April 2026",
    intro: "The best watch under $500 right now is the Seiko 5 Sports GMT — a true mechanical GMT tracking two time zones for $495. This guide covers 7 verified picks across every use case, from indestructible tool watches to elegant dress pieces, all confirmed against current retail prices.",
    heroFact: "The Seiko 5 Sports GMT — a mechanical GMT watch with a dedicated 24-hour hand for tracking two time zones — retails for $495. Five years ago, a mechanical GMT from a reputable brand cost at least $1,500.",
    overview: `Under $500 is where serious watchmaking starts. Seiko, Citizen, and Orient — brands with decades of manufacture experience — dominate this tier with automatic movements, genuine tool watch specs, and in some cases sapphire crystal. Most models here run on mechanical movements powered by your wrist's motion, no battery required. Sapphire crystal is less common than in higher tiers but available on specific picks in this guide.

Buyers can expect a broad range: robust dive watches with 200m water resistance, dress automatics with domed crystals, and sport watches with integrated bracelets. The trade-off versus the $500–$1,000 tier is finishing — bracelets can feel loose at the clasp, case edges are less crisp, and movements are reliable but undecorated. These are aesthetic differences, not durability ones.

Japanese brands set the benchmark here. Seiko's in-house calibres offer hand-winding and hacking at prices Swiss brands can't touch. Citizen's Eco-Drive solar technology eliminates batteries entirely. Orient delivers genuine dress automatics under $250. For pure resilience, Casio's G-Shock lineup is in a category of its own. Switzerland appears at the top of this tier via Tissot, whose PRX brings a Swiss Made movement and sapphire crystal for under $500.

The under-$500 tier rewards research. The right pick here will outlast fashion trends, handle daily wear without babying, and hold its own next to watches that cost twice as much.`,
    pickByUseCase: [
      { useCase: "First automatic watch", model: "Seiko 5 Sports" },
      { useCase: "Budget diver", model: "Citizen Promaster Diver Eco-Drive" },
      { useCase: "GMT / travel", model: "Seiko 5 Sports GMT" },
      { useCase: "Dress watch", model: "Orient Bambino" },
      { useCase: "Integrated bracelet", model: "Citizen Tsuyosa Automatic" },
      { useCase: "Indestructible", model: "Casio G-Shock DW-5600E-1V" },
      { useCase: "Swiss Made quartz", model: "Tissot PRX 35mm Quartz" },
    ],
    notableModels: [
      {
        name: "Seiko 5 Sports",
        brandName: "Seiko",
        price: "~$350",
        caseSize: "42.5mm",
        waterResistance: "100m",
        crystal: "Hardlex",
        movement: "Automatic (Caliber 4R36)",
        bestFor: "Versatile daily wear",
        reason: "The 4R36 calibre gives you day/date, hand-winding, and hacking at ~$350 — more functionality than most automatics twice the price. 100m water resistance and Hardlex crystal handle genuine daily use.",
      },
      {
        name: "Seiko 5 Sports GMT",
        brandName: "Seiko",
        price: "~$495",
        caseSize: "42.5mm",
        waterResistance: "100m",
        crystal: "Hardlex with lenses",
        movement: "Automatic GMT (Caliber 4R34)",
        bestFor: "Affordable mechanical GMT",
        reason: "The only mechanical GMT under $500 from a major manufacturer. The 4R34 calibre adds a 24-hour hand and bidirectional bezel to track a second time zone — a complication that costs $1,500+ anywhere else.",
      },
      {
        name: "Orient Bambino",
        brandName: "Orient",
        price: "~$250",
        caseSize: "40.5mm",
        waterResistance: "30m",
        crystal: "Domed Mineral",
        movement: "Automatic (Orient F6724)",
        bestFor: "Elegant dress watch",
        reason: "The only dress automatic under $250 with an in-house movement that hand-winds and hacks. The domed dial and domed crystal read as far more expensive than $250 — the trade-off is 30m water resistance.",
      },
      {
        name: "Citizen Tsuyosa Automatic",
        brandName: "Citizen",
        price: "~$350",
        caseSize: "40mm",
        waterResistance: "50m",
        crystal: "Sapphire",
        movement: "Automatic (Caliber 8210)",
        bestFor: "Integrated bracelet style",
        reason: "Sapphire crystal and an integrated bracelet at ~$350 — a combination you'd expect to pay $800+ for. The Caliber 8210 runs to ±10 seconds/day accuracy. 50m water resistance is the one limitation.",
      },
      {
        name: "Citizen Promaster Diver Eco-Drive",
        brandName: "Citizen",
        price: "~$295",
        caseSize: "44mm",
        waterResistance: "200m",
        crystal: "Anti-reflective mineral",
        movement: "Eco-Drive (Caliber E168)",
        bestFor: "ISO-certified diving, Grab-and-go tool watch",
        reason: "ISO 6425 certified — the same standard applied to professional dive watches — with 200m water resistance and a solar movement that never needs a battery. At ~$295 it's the most capable tool watch in this guide.",
      },
      {
        name: "Casio G-Shock DW-5600E-1V",
        brandName: "Casio",
        price: "~$70",
        caseSize: "42.8mm",
        waterResistance: "200m",
        crystal: "Mineral",
        movement: "Quartz (Module 3229)",
        bestFor: "Extreme durability, Digital functionality",
        reason: "At ~$70 it's shock-resistant, 200m water resistant, and runs for years on a single battery. Nothing else in any price tier matches it for pure resilience.",
      },
      {
        name: "Tissot PRX 35mm Quartz",
        brandName: "Tissot",
        price: "~$450",
        caseSize: "35mm",
        waterResistance: "100m",
        crystal: "Sapphire",
        movement: "Quartz (ETA F05.115)",
        bestFor: "Retro-chic everyday, Integrated bracelet",
        reason: "Swiss Made, sapphire crystal, and a true 1970s integrated bracelet profile — all for ~$450. The ETA F05.115 quartz movement keeps ±0.07 seconds/day accuracy. The thinnest watch in this guide at 9.9mm.",
      },
    ],
    faq: [
      {
        question: "What is the best automatic watch under $500?",
        answer: "The Seiko 5 Sports GMT (~$495) is the standout pick — it's the only mechanical GMT under $500 from a major manufacturer. For a simpler automatic, the Seiko 5 Sports (~$350) is the most versatile, with a broad range of colourways and a proven 4R36 calibre. The Orient Bambino (~$250) is the best dress automatic in the tier.",
      },
      {
        question: "Seiko 5 Sports vs Citizen Tsuyosa — which should I buy?",
        answer: "The Seiko 5 Sports (~$350) is the better daily beater — 100m water resistance, day-date, and a proven track record. The Citizen Tsuyosa (~$350) wins on aesthetics: sapphire crystal, integrated bracelet, and a cleaner sports-dress look closer to an Omega Aqua Terra. If you wear it casually and want it to look more expensive, the Tsuyosa. If you need water resistance and don't want to baby it, the Seiko.",
      },
      {
        question: "Can I find a genuine dive watch under $500?",
        answer: "Yes. The Citizen Promaster Diver Eco-Drive (~$295) is ISO 6425 certified — the same independent standard applied to professional dive watches — with 200m water resistance and a solar movement that never needs a battery. The Seiko 5 Sports (~$350) offers 100m and a unidirectional bezel. For recreational diving, both are legitimate choices.",
      },
      {
        question: "Is sapphire crystal available under $500?",
        answer: "Yes, on specific models. The Citizen Tsuyosa (~$350), Tissot PRX 35mm Quartz (~$450), and Citizen Promaster Diver Eco-Drive (~$295) all include sapphire. The Seiko 5 Sports uses Hardlex — harder than standard mineral but not as scratch-resistant as sapphire. If avoiding visible scratches matters, prioritise the Tsuyosa or Tissot.",
      },
      {
        question: "What do I give up compared to the $500–$1,000 tier?",
        answer: "At $500–$1,000 you gain sapphire crystals on almost every model, significantly better bracelet finishing, COSC-certified movements (±4 seconds/day accuracy), and better case polishing. The movements in the under-$500 tier are reliable but undecorated. Bracelets can feel loose at the clasp. These are aesthetic trade-offs — the movements themselves are just as durable.",
      },
      {
        question: "What's the difference between the Seiko 5 Sports and the Seiko 5 Sports GMT?",
        answer: "The Seiko 5 Sports uses the 4R36 calibre — a standard automatic with day-date. The Seiko 5 Sports GMT uses the 4R34, adding a 24-hour hand and a bidirectional bezel to track a second time zone. The GMT costs ~$145 more (~$495 vs ~$350). If you travel frequently or want the complication, the GMT is exceptional value. Otherwise the standard 5 Sports is the better daily watch.",
      },
      {
        question: "Why choose the Orient Bambino over other dress watches under $500?",
        answer: "The Orient Bambino (~$250) is the only dress automatic under $250 with an in-house movement that supports both hand-winding and hacking. Its domed dial and domed mineral crystal give it a vintage aesthetic that reads as more expensive than it is. The trade-off is 30m water resistance — fine for daily wear but keep it away from pools.",
      },
    ],
    internalLinks: [
      {
        label: "Seiko Watches",
        href: "/brand/seiko",
      },
      {
        label: "Citizen Watches",
        href: "/brand/citizen",
      },
      {
        label: "Orient Watches",
        href: "/brand/orient",
      },
      {
        label: "Tissot Watches",
        href: "/brand/tissot",
      },
      {
        label: "Dive Watches",
        href: "/style/dive-watches",
      },
      {
        label: "Dress Watches",
        href: "/style/dress-watches",
      },
      {
        label: "GMT Watches",
        href: "/style/gmt-watches",
      },
    ],
    sources: [
      { label: "Seiko 5 Sports — official specs", url: "https://www.seikowatches.com/global-en/products/5sports" },
      { label: "Seiko 5 Sports GMT — official specs", url: "https://www.seikowatches.com/global-en/products/5sports/ssk001k1" },
      { label: "Orient Bambino — official specs", url: "https://www.orient-watch.com/collections/bambino" },
      { label: "Citizen Tsuyosa — official specs", url: "https://www.citizenwatch.com/us/en/collection/tsuyosa/" },
      { label: "Citizen Promaster Diver Eco-Drive — official specs", url: "https://www.citizenwatch.com/us/en/collection/promaster/" },
      { label: "Tissot PRX — official specs", url: "https://www.tissotwatches.com/en-en/tissot-prx.html" },
    ],
  },
]
export function getPriceBySlug(slug: string): PriceData | undefined {
  return prices.find((p) => p.slug === slug)
}
