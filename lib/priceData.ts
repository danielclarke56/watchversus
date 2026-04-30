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
    overview: `Stepping into the 'under $500' price segment opens up a world of horological possibilities beyond basic fashion watches. Here, you'll encounter timepieces from established manufacturers like Seiko, Citizen, and Orient, renowned for their long histories and commitment to watchmaking. Many models in this range feature automatic (mechanical) movements, offering the charm of traditional horology where a rotor powers the watch with your wrist's motion, eliminating the need for a battery. While sapphire crystal, highly scratch-resistant, is less common than in higher tiers, it's increasingly found on specific models, providing enhanced durability.

Buyers in this segment can expect a broad spectrum of designs, from robust dive watches with impressive water resistance to elegant dress watches suitable for formal occasions. The trade-off compared to the $500-$1000 tier often lies in finishing details, the complexity of movements (though notable exceptions like the mechanical GMT exist), and the prevalence of Hardlex or mineral crystals over sapphire. Bracelets and straps might also be less refined than on more expensive watches, but they remain functional and comfortable.

Japanese brands like Seiko and Citizen dominate this price point, offering reliable in-house movements and a strong reputation for durability. Orient provides excellent value, particularly in classic dress watch styles with proprietary movements. You can also find highly durable quartz options, such as Casio G-Shocks, which offer unparalleled resilience and functionality for their price.

When choosing a watch under $500, prioritize models from brands with a proven track record. Focus on key specifications like water resistance, crystal material, and movement type that align with your intended use. While this segment requires some careful consideration, the value proposition is incredibly strong, allowing you to acquire a well-made and aesthetically pleasing timepiece without a significant investment.`,
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
        reason: "It offers a robust automatic movement, a durable build, and a versatile sport-diver aesthetic at an accessible price.",
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
        reason: "This model offers a highly sought-after mechanical GMT complication, making it an exceptional value for travelers and watch enthusiasts alike.",
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
        reason: "The Bambino stands out with its elegant domed dial and crystal, offering a sophisticated vintage dress watch aesthetic with an in-house automatic movement.",
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
        reason: "It offers a contemporary integrated bracelet design reminiscent of higher-end sports watches, combined with a reliable automatic movement and sapphire crystal.",
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
        reason: "An ISO-compliant dive watch powered by light, offering exceptional water resistance and a 'set and forget' convenience without needing battery changes.",
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
        reason: "The iconic G-Shock is virtually indestructible, offering 200m water resistance and essential digital functions in a classic, enduring design.",
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
        reason: "This watch delivers a popular 1970s integrated bracelet aesthetic with a slim profile and sapphire crystal, powered by a reliable Swiss quartz movement.",
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
