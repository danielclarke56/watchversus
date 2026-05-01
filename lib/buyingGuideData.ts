export interface GuideModel {
  name: string
  brandName: string       // used for DB fallback query
  price: string           // e.g. "~$230"
  caseSize: string        // e.g. "42mm"
  waterResistance: string // e.g. "100m"
  crystal: string         // "Sapphire" | "Mineral" | "Hardlex"
  movement: string        // e.g. "Automatic (4R36)"
  bestFor: string         // e.g. "Daily beater"
  reason: string          // one-line editorial summary
  communitySignal?: string // community sentiment from forums, reviews, YouTube
}

export interface GuideFAQ {
  question: string
  answer: string
}

export interface GuideInternalLink {
  label: string
  href: string
}

export interface GuideUseCase {
  useCase: string  // "First automatic watch"
  model: string    // "Seiko 5 Sports"
}

export interface GuideSource {
  label: string  // e.g. "Seiko official spec sheet"
  url: string    // source URL
}

export interface GuideWhoItIsFor {
  profile: string      // e.g. "First-time watch buyer"
  description: string  // one sentence explaining why this tier fits them
}

export interface BuyingGuideData {
  slug: string
  name: string
  shortLabel: string
  dbValue: string           // exact photos.estimatedPrice value for DB photo fallback
  lastUpdated: string       // "April 2026" — shown on page for freshness signal
  intro: string             // 2-3 sentences framing what the guide covers and who it's for
  heroFact: string          // specific fact: model + price + comparison
  overview: string          // 4 paragraphs: landscape, expectations, trade-offs, who it's for
  whoItIsFor: GuideWhoItIsFor[]  // buyer profiles — 3-4 entries
  pickByUseCase: GuideUseCase[]  // scannable lookup table
  notableModels: GuideModel[]
  faq: GuideFAQ[]
  internalLinks: GuideInternalLink[]  // only /brand/ and /style/ paths
  sources: GuideSource[]    // cited sources shown at bottom of page
}

export const buyingGuides: BuyingGuideData[] = [
  {
    slug: "under-500",
    name: "Watch Buying Guide: Under $500",
    shortLabel: "Under $500",
    dbValue: "Under $500",
    lastUpdated: "April 2026",
    intro: "This guide covers 7 solid picks under $500 — mechanical automatics, solar divers, and Swiss quartz — across different use cases. All prices verified against current retail. No single watch is right for everyone, so each pick is chosen for a specific need.",
    heroFact: "The Seiko 5 Sports GMT — a mechanical GMT watch with a dedicated 24-hour hand for tracking two time zones — retails for $495. Comparable mechanical GMT complications from Swiss brands typically start at $800–$1,500.",
    overview: `Under $500 is where serious watchmaking starts. Seiko, Citizen, and Orient — brands with decades of manufacture experience — dominate this tier with automatic movements, genuine tool watch specs, and in some cases sapphire crystal. Most models here run on mechanical movements powered by your wrist's motion, no battery required. Sapphire crystal is less common than in higher tiers but available on specific picks in this guide.

Buyers can expect a broad range: robust dive watches with 200m water resistance, dress automatics with domed crystals, and sport watches with integrated bracelets. The trade-off versus the $500–$1,000 tier is finishing — bracelets can feel loose at the clasp, case edges are less crisp, and movements are reliable but undecorated. These are aesthetic differences, not durability ones.

Japanese brands set the benchmark here. Seiko's in-house calibres offer hand-winding and hacking at prices Swiss brands can't touch. Citizen's Eco-Drive solar technology eliminates batteries entirely. Orient delivers genuine dress automatics under $250. For pure resilience, Casio's G-Shock lineup is in a category of its own. Switzerland appears at the top of this tier via Tissot, whose PRX brings a Swiss Made movement and sapphire crystal for under $500.

The under-$500 tier rewards research. The right pick here will outlast fashion trends, handle daily wear without babying, and hold its own next to watches that cost twice as much.`,
    whoItIsFor: [
      {
        profile: "First-time watch buyer",
        description: "You want a well-made watch that doesn't feel cheap, don't want to overspend before you know what you like, and aren't ready to baby it.",
      },
      {
        profile: "Daily beater seeker",
        description: "You need something that handles commutes, gym sessions, and weekends without a second thought — 100m+ water resistance, tough crystal, proven movement.",
      },
      {
        profile: "Upgrading from fashion watches",
        description: "You've been wearing a fashion brand (MVMT, Daniel Wellington, Fossil) and want a real mechanical movement, better finishing, and a name that holds up to scrutiny.",
      },
      {
        profile: "Gift buyer",
        description: "You're buying for someone who mentioned watches but you don't know the details — this tier gives you legitimate horological names without overcommitting.",
      },
    ],
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
        communitySignal: "A staple recommendation in r/Watches beginner threads for over a decade. Frequently cited as the entry point that got enthusiasts serious about mechanical watches.",
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
        reason: "A mechanical GMT at $495 — the 4R34 calibre adds a 24-hour hand and bidirectional bezel to track a second time zone. Strong value for a complication that typically starts at $800+ from Swiss brands.",
        communitySignal: "Praised on WatchUSeek and r/Watches as the most accessible mechanical GMT. Common praise: the value-to-complication ratio is hard to argue with at this price.",
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
        reason: "A dress automatic at ~$250 with an in-house movement that hand-winds and hacks — features usually found on watches twice the price. The domed dial and domed crystal give it a vintage look that reads as more expensive. Trade-off: 30m water resistance.",
        communitySignal: "Consistently recommended in r/Watches as the dress watch to buy before you can justify spending more. Often compared favourably to watches at 2–3x the price.",
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
        communitySignal: "Gained strong word-of-mouth on r/Watches and Hodinkee comments for punching above its price on aesthetics. Frequently described as an Aqua Terra alternative at a fraction of the cost.",
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
        communitySignal: "Trusted pick in dive watch communities for its ISO certification and no-battery convenience. Worn & Wound and WatchUSeek's dive watch forums regularly cite it as the value benchmark.",
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
        communitySignal: "Near-universal praise across r/Watches, r/CasioG_Shock, and military/outdoor communities. Often described as the only watch you need if you only want one that survives anything.",
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
        communitySignal: "Gained significant attention after Hodinkee coverage and YouTube reviews highlighting its resemblance to vintage Patek Nautilus proportions. Frequently recommended for those who want Swiss heritage without the price tag.",
      },
    ],
    faq: [
      {
        question: "What is the best automatic watch under $500?",
        answer: "The Seiko 5 Sports GMT (~$495) is the standout pick — a mechanical GMT with a dedicated 24-hour hand for tracking two time zones, a complication that typically costs $800+ from Swiss brands. For a simpler automatic, the Seiko 5 Sports (~$350) is the most versatile, with a broad range of colourways and a proven 4R36 calibre. The Orient Bambino (~$250) is the best dress automatic in the tier.",
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
        answer: "The Orient Bambino (~$250) offers an in-house movement with hand-winding and hacking — features common on watches costing $500+. Its domed dial and domed mineral crystal give it a vintage aesthetic that reads as more expensive than it is. The trade-off is 30m water resistance — fine for daily wear but keep it away from pools.",
      },
    ],
    internalLinks: [
      { label: "Seiko Watches", href: "/brand/seiko" },
      { label: "Citizen Watches", href: "/brand/citizen" },
      { label: "Orient Watches", href: "/brand/orient" },
      { label: "Tissot Watches", href: "/brand/tissot" },
      { label: "Dive Watches", href: "/style/dive-watches" },
      { label: "Dress Watches", href: "/style/dress-watches" },
      { label: "GMT Watches", href: "/style/gmt-watches" },
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

export function getGuideBySlug(slug: string): BuyingGuideData | undefined {
  return buyingGuides.find((g) => g.slug === slug)
}
