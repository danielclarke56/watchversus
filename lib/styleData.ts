export interface StyleFAQ {
  question: string
  answer: string
}

export interface StyleData {
  slug: string        // URL param: "dive-watches"
  name: string        // Display: "Dive Watches"
  dbValue: string     // Exact photos.watchStyle value: "diver"
  heroFact: string
  overview: string
  faq: StyleFAQ[]
  notableModels?: string[]
}

export const styles: StyleData[] = [
  {
    slug: 'dive-watches',
    name: 'Dive Watches',
    dbValue: 'diver',
    heroFact: 'The Rolex Submariner, introduced in 1953, defined the modern dive watch — its rotating bezel and 100m depth rating set the template still followed 70 years later.',
    overview: `Dive watches are purpose-built tool watches designed for underwater use, typically rated to at least 100 metres of water resistance. What defines the category is a rotating elapsed-time bezel (allowing divers to track bottom time without a computer), luminous indices and hands legible in dark water, a screw-down crown that seals the case, and sapphire or mineral crystals hardened against pressure. The Rolex Submariner, Omega Seamaster 300m, and Tudor Black Bay set the aesthetic standard — broad lumed hour markers, a unidirectional bezel that only rotates counterclockwise, and a thick case to accommodate water resistance gaskets.

Modern dive watches have long outgrown professional diving. Their legibility, durability, and bracelet versatility make them the default daily-wear choice for many collectors who never go near the ocean. At every price point — from the Seiko SKX and Casio Duro under £100, through the Orient Kamasu and Citizen Promaster mid-range, to the Rolex Submariner and Blancpain Fifty Fathoms at the top — the dive watch category offers some of the most dependable and versatile watches made.`,
    faq: [
      {
        question: 'What water resistance rating do I need for swimming?',
        answer: 'For recreational swimming and snorkelling, 100m (10 ATM) water resistance is the practical minimum. True scuba diving requires 200m+ with a screw-down crown. The ISO 6425 standard defines a genuine dive watch as capable of 100m depth with specific shock, magnetic, and legibility requirements beyond simple water resistance ratings. Many watches labelled "water resistant to 50m" are splash-proof only — the crown sealing and case construction matter as much as the number.',
      },
      {
        question: 'What is a unidirectional bezel and why does it matter?',
        answer: 'A unidirectional bezel rotates counterclockwise only. A diver aligns the zero marker with the minute hand at the start of a dive. If the bezel is accidentally bumped during the dive, it can only move in the direction that shortens the apparent elapsed time — the safer error. A bidirectional bezel could accidentally extend the apparent remaining air time, a potentially dangerous error underwater. Most serious dive watches use unidirectional bezels; bidirectional rotating bezels appear on GMT and general sport watches.',
      },
      {
        question: 'Which dive watch offers the best value?',
        answer: 'The Seiko Prospex range delivers ISO 6425-compliant dive specs with in-house movements at £300–£500 — extraordinary value. The Tudor Black Bay 58 offers genuine Rolex-adjacent build quality and in-house movement at roughly half the Submariner price. For pure specification per pound, the Orient Kamasu is hard to beat. At the premium end, the Rolex Submariner remains the benchmark against which all others are compared.',
      },
      {
        question: 'Can I wear a dive watch every day?',
        answer: 'Yes, and most dive watch owners do exactly that. The thick cases, sapphire crystals, and steel construction that make them suitable for water also make them exceptionally durable daily wearers. The only trade-off is that the larger case sizes (40–44mm typical) and rubber or metal bracelet options are more casual than dress watches. A dive watch on a leather or NATO strap bridges that gap considerably.',
      },
    ],
    notableModels: ['Rolex Submariner', 'Omega Seamaster 300m', 'Tudor Black Bay', 'Blancpain Fifty Fathoms', 'Seiko Prospex', 'Citizen Promaster'],
  },
  {
    slug: 'dress-watches',
    name: 'Dress Watches',
    dbValue: 'dress',
    heroFact: 'The Patek Philippe Calatrava, in production since 1932, is considered the definitive dress watch — thin, round, and devoid of any feature not strictly necessary.',
    overview: `Dress watches exist in philosophical opposition to tool watches: where a dive watch is thick, legible, and built for abuse, a dress watch is thin, refined, and built to disappear under a shirt cuff. The defining characteristics are a slim case (typically under 9mm), a simple dial without excessive subdials or markings, a leather or thin metal bracelet, and a case diameter that reads as understated rather than sporty — usually 36–40mm for modern pieces.

The canon of dress watchmaking runs from the Patek Philippe Calatrava and Jaeger-LeCoultre's Master Ultra-Thin to accessible options like the Longines Master Collection and Tissot Le Locle. At the entry level, the Orient Bambino and Hamilton Jazzmaster offer genuine dress aesthetics at accessible prices.

Dress watches have faced a challenge from the sportification of menswear — the Rolex Submariner is now worn in boardrooms that once demanded a thin Datejust. Yet demand for slim, elegant watches remains strong, particularly as a complement to more casual sports watches.`,
    faq: [
      {
        question: 'How thin should a dress watch be?',
        answer: 'A true dress watch slides under a shirt cuff without a visible bump. Practically, this means a case thickness under 9mm, and ideally under 7mm for the most formal pieces. Jaeger-LeCoultre\'s Master Ultra-Thin at 5.1mm represents the extreme. For daily wear, 8–9mm is comfortable and still reads as slim against the wrist. Thickness matters more than diameter — a 40mm watch at 7mm reads as more refined than a 36mm watch at 11mm.',
      },
      {
        question: 'What size dress watch should I wear?',
        answer: 'Dress watch proportions favour smaller than modern sport watches. Historically, 34–38mm was standard; today, 38–40mm is conventional without reading as oversized. On smaller wrists (under 17cm circumference), 36–38mm will feel most balanced. On larger wrists, 40mm is appropriate. Avoid exceeding 42mm for a dress watch — the proportions start to conflict with the category\'s ethos of understated elegance.',
      },
      {
        question: 'Leather strap vs metal bracelet for a dress watch?',
        answer: 'A thin leather strap in black or dark brown is considered the definitive dress watch companion — it keeps the wrist profile slim and reads as formal. Crocodile or alligator leather elevates further; calfskin is the versatile default. Metal bracelets (typically Milanese mesh or thin integrated bracelets) are acceptable for dress-casual contexts but add bulk. Avoid rubber, NATO, or velcro on a dress watch.',
      },
      {
        question: 'Which is the best dress watch under £500?',
        answer: 'The Longines Master Collection offers a beautifully finished ETA-based movement, sapphire crystal, and a dial that reads as genuinely luxurious at the price. The Hamilton Jazzmaster Viewmatic is similarly honest. The Orient Bambino (~£150–200) is the most recommended genuine mechanical dress watch at that price point. For quartz, the Tissot Le Locle and Citizen Eco-Drive silhouettes deliver dress aesthetics at accessible prices.',
      },
    ],
    notableModels: ['Patek Philippe Calatrava', 'Jaeger-LeCoultre Master Ultra-Thin', 'Longines Master Collection', 'Hamilton Jazzmaster', 'Orient Bambino'],
  },
  {
    slug: 'field-watches',
    name: 'Field Watches',
    dbValue: 'field',
    heroFact: 'The U.S. Army\'s A-11 specification, issued to Hamilton, Elgin, and Bulova during World War II, defined the field watch template: 36mm, black dial, luminous Arabic numerals, and a hacking movement.',
    overview: `Field watches trace their lineage to military procurement specifications. The defining characteristics are legibility under demanding conditions: uncluttered dials with large Arabic numerals, high-contrast black or olive dial with maximally luminous hands and markers, a moderate case size (36–40mm historically, up to 42mm modern), and a canvas or textile strap that could be worn over a sleeve.

The Hamilton Khaki Field remains the quintessential modern field watch, produced in variants faithful to the WWII-era originals. The Seiko 5 Sports range, Timex MK1, and Marathon Government models span the affordable to professional tiers. At the luxury end, IWC's Pilot and Portugieser lines draw on aviation-military heritage.

Field watches have proven remarkably durable in popular culture — their rugged, no-nonsense aesthetic appeals to collectors who find dive watches too obvious and dress watches too formal. They wear well on canvas NATO straps, and the typically modest case sizes suit a wide range of wrist sizes.`,
    faq: [
      {
        question: 'What makes a watch a "field watch"?',
        answer: 'The field watch category is defined more by design philosophy than technical specification. Key traits: high-contrast dial with large Arabic numerals rather than indices (prioritising legibility over beauty), anti-reflective or matte dial finish, luminous hands and markers, a durable steel or titanium case, and a strap designed for outdoor wear. Water resistance is typically 50–100m — adequate for the field without the engineering investment of a true dive watch.',
      },
      {
        question: 'Hamilton Khaki Field vs Seiko 5 Sports — which to choose?',
        answer: 'The Hamilton Khaki Field Mechanical offers a manual-wind movement, 80-hour power reserve, sapphire crystal, and genuine WW2 heritage aesthetics. The Seiko 5 Sports is an automatic with day/date, more casual finishing, and Seiko\'s legendary reliability. For purists wanting the authentic field watch experience and manual-wind engagement, the Hamilton wins. For value, automatic convenience, and bulletproof daily use, the Seiko 5 is hard to argue against.',
      },
      {
        question: 'What strap should I use on a field watch?',
        answer: 'Canvas or nylon NATO straps are historically correct and practically excellent — they are hard-wearing, inexpensive, machine-washable, and the double-pass design holds the watch on the wrist even if one spring bar fails. Olive, khaki, and black are the classic colours. Leather military-style straps (single or double stitched, distressed) also work well. Avoid rubber or resin straps on a field watch — they conflict with the aesthetic.',
      },
      {
        question: 'Are field watches suitable for everyday wear?',
        answer: 'Field watches are among the most practical everyday watches available. Their legibility, durability, comfortable strap options, and typically modest case sizes make them adaptable across contexts from business casual to genuine outdoor use. The NATO strap option means a broken spring bar is never catastrophic. The only setting where they look out of place is formal evening wear.',
      },
    ],
    notableModels: ['Hamilton Khaki Field', 'Seiko 5 Sports', 'Timex MK1', 'Marathon GSAR', 'CWC W10'],
  },
  {
    slug: 'pilot-watches',
    name: 'Pilot Watches',
    dbValue: 'pilot',
    heroFact: 'IWC\'s Big Pilot ref. 5002, with its 55mm case, remains one of the largest production pilot watches ever made — a direct descendant of a 1940 Luftwaffe observer\'s watch.',
    overview: `Pilot watches emerged from early 20th-century aviation, where cockpit instruments were minimal and a legible wrist-mounted timepiece was critical navigation equipment. The original specifications called for large cases to be readable through flight gloves, onion-shaped crowns for operation with gloved hands, black dials with white or luminous Arabic numerals, and anti-magnetic properties to resist compass interference.

Modern pilot watches span a wide range: faithful historical recreations like the IWC Big Pilot and Longines Heritage Series, contemporary interpretations like the Breitling Navitimer (with its slide rule bezel for aviation calculations), and accessible daily drivers like the Hamilton Khaki Aviation. The pilot watch aesthetic — bold dial, crown at 3, clean legibility — has become the dominant design language for dress-sport watches.

The defining feature of the category is the onion crown, visible in historical pieces and revived in modern recreations, though many "pilot" watches now use standard crowns.`,
    faq: [
      {
        question: 'Do pilot watches need an anti-reflective crystal?',
        answer: 'Anti-reflective coating on the sapphire crystal is important on pilot watches — cockpit lighting and sun glare require maximum dial legibility. Modern sapphire crystals typically receive double-sided AR coating (both interior and exterior surfaces) to minimise reflections across viewing angles. Flat crystals are preferred on historical reproductions; domed crystals appear on more contemporary interpretations.',
      },
      {
        question: 'What is a slide rule bezel and how does it work?',
        answer: 'The slide rule bezel (most famously on the Breitling Navitimer) is a circular slide rule that allows pilots to perform flight calculations without paper: unit conversions, fuel consumption, airspeed, climb rate, and time/distance/speed calculations. The outer bezel rotates against the fixed inner scale to perform multiplication and division. In the digital age these calculations are done by flight computers, but the Navitimer\'s slide rule bezel is an authentic piece of aviation heritage.',
      },
      {
        question: 'IWC vs Breitling for a pilot watch?',
        answer: 'IWC emphasises heritage aesthetics — the Big Pilot and Pilot\'s Watch Chronograph draw directly from 1940s observer\'s watches, with large cases, minimal dials, and onion crowns. Breitling emphasises professional aviation utility — the Navitimer slide rule bezel was designed for actual pilot use and the brand has maintained deep relationships with aviation. IWC for the collector who wants historical accuracy, Breitling for those who want a working professional instrument aesthetic.',
      },
      {
        question: 'Are large pilot watches practical on the wrist?',
        answer: 'Historical pilot watches were designed for cockpits, not dining tables — 55mm cases existed to be read through flight gloves. Modern pilot watches have rationalised to 41–46mm, which wears considerably better daily. The IWC Big Pilot at 46.2mm is at the upper limit for comfortable daily wear on most wrists; the standard Pilot\'s Watch at 41mm is ideal for most. Check the lug-to-lug measurement more than the diameter.',
      },
    ],
    notableModels: ['IWC Big Pilot', 'Breitling Navitimer', 'Hamilton Khaki Aviation', 'Longines Avigation', 'Laco Flieger'],
  },
  {
    slug: 'chronograph-watches',
    name: 'Chronograph Watches',
    dbValue: 'chronograph',
    heroFact: 'The Omega Speedmaster became the first watch worn on the Moon in 1969 — its manually-wound chronograph movement was NASA-certified through a brutal 11-test protocol that destroyed every competitor.',
    overview: `A chronograph is a watch with an independent stopwatch function operated by pushers, overlaid on the regular timekeeping. The complication involves a seconds hand that can be started, stopped, and reset independently of the running movement — a mechanism requiring significantly more engineering than simple timekeeping.

The icons of the category are the Omega Speedmaster, Rolex Daytona, TAG Heuer Carrera, and Breitling Navitimer — each associated with a specific performance discipline (space, motorsport, racing, aviation). At accessible price points, the Seiko Prospex Panda and Orient Neo-Seventies offer genuine mechanical chronographs without the luxury premium.

Chronographs are among the most wear-visible complications — the subdials and pushers create visual complexity that reads as technically interesting without requiring explanation. They remain the most popular watch complication among enthusiasts who want more than a simple three-hand watch.`,
    faq: [
      {
        question: 'How does a mechanical chronograph work?',
        answer: 'A mechanical chronograph adds a column wheel or cam mechanism, a coupling system (vertical or horizontal clutch), and a seconds wheel with its own gear train to the base movement. When the start pusher is pressed, the coupling engages the chronograph seconds wheel to the running movement — it begins counting seconds. A stop press decouples them. A reset press acts against a heart-shaped cam on the chronograph wheel, snapping the hand back to zero.',
      },
      {
        question: 'Rolex Daytona vs Omega Speedmaster — which to choose?',
        answer: 'The Rolex Daytona is a vertical-clutch column wheel chronograph with a Co-Axial escapement and 72-hour power reserve. It is extremely difficult to buy at retail. The Omega Speedmaster Professional uses a manually-wound Cal. 3861 column wheel chronograph with 48-hour power reserve and genuine NASA moon-mission heritage. For movement engineering and value, the Speedmaster is the answer. For brand prestige and resale value, the Daytona. Both are icons.',
      },
      {
        question: 'What is a flyback chronograph?',
        answer: 'A standard chronograph requires three button presses to time a new lap: stop, reset, start. A flyback chronograph accomplishes this in one press — pressing the pusher while the chronograph is running immediately resets the elapsed time and starts counting again. This was originally developed for aviation, where a pilot timing navigation legs cannot afford three button presses in sequence. The mechanism is significantly more complex and expensive than a standard chronograph.',
      },
      {
        question: 'Are chronograph watches more difficult to maintain?',
        answer: 'Yes. A chronograph movement contains significantly more components than a simple three-hand movement — typically 100–150 additional parts. This means service costs are higher (typically £400–£1,200 for a quality mechanical chronograph service) and finding a qualified watchmaker is more important. The clutch mechanism and column wheel require expert adjustment to maintain crisp pusher action. Budget for a full service every 5–7 years.',
      },
    ],
    notableModels: ['Omega Speedmaster', 'Rolex Daytona', 'TAG Heuer Carrera', 'Breitling Navitimer', 'Seiko Prospex Panda'],
  },
  {
    slug: 'gmt-watches',
    name: 'GMT Watches',
    dbValue: 'gmt',
    heroFact: 'The Rolex GMT-Master was designed in 1954 in partnership with Pan Am Airlines, so that pilots flying early transatlantic routes could simultaneously read home time and local time.',
    overview: `A GMT watch tracks two time zones simultaneously through an additional 24-hour hand that completes one revolution per day (rather than two), read against a 24-hour bezel or inner ring. The most celebrated example is the Rolex GMT-Master, created for Pan Am transatlantic pilots in 1954 — the iconic "Pepsi" bezel in red and blue marking day and night 12-hour segments on the 24-hour scale.

Modern GMT complications vary in approach. The "true" GMT has an independently settable 24-hour hand that can be moved in one-hour increments without stopping the running movement — essential for changing home time when crossing time zones. Some budget implementations simply add a second time-zone hand without independent adjustment capability.

Beyond professional use, GMT watches appeal to collectors and frequent travellers who appreciate the mechanical ingenuity of the complication. The visual complexity of a 24-hour hand and rotating bezel adds character without the bulk of a chronograph.`,
    faq: [
      {
        question: 'What is the difference between a true GMT and a dual-time watch?',
        answer: 'A "true" GMT allows the 24-hour hand to be set independently in one-hour increments by pulling the crown to a specific position, without stopping the running movement. This means you can change the home-time reference while keeping the local time running — critical for pilots and travellers. A dual-time watch typically moves both the local and home-time hands together, requiring you to stop the movement to change one independently. The Rolex GMT-Master II is the benchmark "true" GMT.',
      },
      {
        question: 'How do you read a GMT watch?',
        answer: 'Set up: the local time is read from the standard 12-hour dial and hands. The 24-hour hand (typically a third hand, arrow-tipped, in a different colour) points to the 24-hour bezel or ring. To read the second time zone: note where the 24-hour hand points on the 24-hour scale. 12 on the 24-hour scale = noon, 24 = midnight. The bezel\'s day/night colour split helps distinguish AM from PM at a glance.',
      },
      {
        question: 'Rolex GMT-Master II vs Tudor Black Bay GMT?',
        answer: 'The Rolex GMT-Master II Pepsi and Tudor Black Bay GMT Pepsi share identical movement architecture — both use movements from within the Rolex group infrastructure. The Rolex offers superior case finishing, Oyster bracelet refinement, and enormous brand prestige. The Tudor offers the same timekeeping performance, near-identical functionality, and genuine availability at a fraction of the price. For immediate availability and outstanding value, the Black Bay GMT is perhaps the strongest argument in watchmaking.',
      },
      {
        question: 'Can I track three time zones on a GMT watch?',
        answer: 'Yes. A GMT watch displays two time zones by default: local time on the 12-hour dial and a second zone on the 24-hour scale. The rotating bezel can be turned to align the 24-hour hand with any reference — giving you a third zone simultaneously. The bezel is typically graduated in 24 hours, so you can set it to any third time zone by rotating until the 24-hour hand aligns with the local time of that zone.',
      },
    ],
    notableModels: ['Rolex GMT-Master II', 'Tudor Black Bay GMT', 'Omega Seamaster GMT', 'Breitling GMT', 'Longines HydroConquest GMT'],
  },
  {
    slug: 'casual-watches',
    name: 'Casual Watches',
    dbValue: 'casual',
    heroFact: 'The Casio G-Shock, introduced in 1983 after engineer Kikuo Ibe dropped his father\'s watch and broke it, was designed to survive a 10-metre drop — it now sells over 10 million units annually.',
    overview: `Casual watches occupy the wide middle ground between purpose-built tool watches and dress watches: watches worn daily without a specific professional function, prioritising comfort, versatility, and personality over extreme specifications. The category encompasses everything from the Casio G-Shock and Timex Weekender to the Seiko 5 Sports and Orient Bambino worn without a suit.

What makes a watch "casual" is more about how it's worn than what it does. A Rolex Submariner worn to the office is being worn casually; a Patek Philippe Nautilus worn to a garden party is technically a casual piece. The category skews toward accessible price points because casual wear implies higher replacement risk and less occasion-specific investment.

The strongest casual watches are often the simplest: the three-hand Seiko SNXS79, the automatic Orient Bambino, the Hamilton Khaki Field, and the Timex Marlin. These are watches that work everywhere without demanding attention.`,
    faq: [
      {
        question: 'What makes a good everyday casual watch?',
        answer: 'An ideal casual watch is comfortable (under 12mm thick, under 42mm diameter for most wrists), versatile enough to dress up or down (steel case, neutral dial, standard lug width), durable without being precious (sapphire crystal, 50m+ water resistance), and mechanically interesting enough to hold your attention. Avoid complications you won\'t use. The three-hand automatic or quartz is the honest choice for a casual daily wearer.',
      },
      {
        question: 'Quartz vs automatic for everyday wear?',
        answer: 'Quartz watches are more accurate (±15 seconds per month vs ±5–15 seconds per day for most automatics), require no daily wearing to stay wound, and are typically thinner at comparable price points. Automatics offer mechanical engagement — the pleasure of a movement that responds to your motion. For a true daily wearer you want to stop thinking about, a quality quartz is the rational answer. For a daily wearer you want to be conscious of wearing, an automatic is worth the accuracy trade-off.',
      },
      {
        question: 'How much should I spend on a casual watch?',
        answer: 'Significantly less than you probably think. At £100–200, Seiko and Casio offer genuine mechanical automatics and indestructible digitals that will outlast expensive Swiss pieces with more delicate finishing. At £200–500, the Orient and Hamilton ranges offer in-house movements, sapphire crystals, and genuinely beautiful dials. Above £500 for a casual watch, you are paying for the pleasure of the object, not meaningfully better performance for daily use.',
      },
      {
        question: 'What strap works best for casual watches?',
        answer: 'For maximum versatility, a 20mm NATO strap in grey or olive works across sports, casual, and smart-casual contexts. Canvas or nylon perlon straps in neutral colours provide comfort and durability without the formality of leather. Leather straps in tan or cordovan elevate a casual watch toward smart-casual. The key is to buy several inexpensive straps and change them by occasion — this extends the apparent versatility of any watch dramatically.',
      },
    ],
  },
  {
    slug: 'tool-watches',
    name: 'Tool Watches',
    dbValue: 'tool',
    heroFact: 'The Rolex Explorer was worn by Edmund Hillary and Tenzing Norgay when they summitted Everest in 1953 — the watch survived conditions no timepiece had been tested in before.',
    overview: `"Tool watch" is a broad category descriptor rather than a precise style, applying to watches designed for a specific professional or extreme-environment use beyond basic timekeeping. The dive watch, field watch, and pilot watch are all technically tool watches, but within the collector community "tool watch" often describes watches built for industrial, scientific, or exploration contexts: the Rolex Explorer (mountaineering), Rolex Milgauss (anti-magnetic, designed for CERN scientists), IWC Aquatimer (underwater engineering), or purpose-built military watches.

The tool watch aesthetic is defined by readability over elegance, robustness over refinement, and a sense that the watch was built to a specification rather than to a market. Dials are high-contrast and uncluttered, cases are thick and corrosion-resistant, and movements are sealed against environmental hazards. Decorative elements are minimal or absent.

The appeal of tool watches to collectors is their honest purpose — a tool watch implies it was trusted with someone's life or livelihood. Wearing a genuine professional instrument is a different proposition from wearing a fashion accessory.`,
    faq: [
      {
        question: 'What distinguishes a tool watch from a sport watch?',
        answer: 'The distinction is primarily one of intent rather than strict specification. A sport watch is designed for active leisure use and aspires to versatility across formal and casual contexts. A tool watch is designed to perform a specific professional function in demanding conditions — the design flows from the specification rather than from the market. The most authentic tool watches were procured by military, scientific, or professional organisations to specific performance requirements.',
      },
      {
        question: 'Is the Rolex Explorer a genuine tool watch?',
        answer: 'Yes, in origin. The Explorer was developed in the early 1950s specifically for testing on Himalayan expeditions — the conditions were the specification. The current Explorer retains the clean black dial, 3-6-9 Arabic numerals, and 100m water resistance of the original. It\'s arguably the most versatile watch Rolex makes: legible enough for fieldwork, understated enough for a boardroom.',
      },
      {
        question: 'What is the Rolex Milgauss and who needs it?',
        answer: 'The Milgauss (from French "mille gauss" — 1,000 gauss) was designed in 1956 for scientists working in environments with strong magnetic fields, specifically at CERN in Geneva. The movement is shielded within a soft-iron Faraday cage to resist magnetic interference. In practice, very few people work in environments requiring that level of anti-magnetic protection. The Milgauss is purchased today for its distinctive lightning-bolt seconds hand and green sapphire crystal.',
      },
      {
        question: 'Can I wear a tool watch dressed up?',
        answer: 'Yes, and this is increasingly common. The Rolex Explorer and Submariner are regularly worn with suits; the IWC Pilot line bridges business and military aesthetics. The key question is whether the watch\'s case size and dial complexity fit the formality of the occasion. An Explorer at 40mm with a clean black dial works under a suit cuff. Tool watches on metal bracelets are more dress-capable than the same watch on rubber.',
      },
    ],
    notableModels: ['Rolex Explorer', 'Rolex Milgauss', 'IWC Aquatimer', 'Breitling Emergency', 'Omega Seamaster Planet Ocean'],
  },
]

export function getStyleBySlug(slug: string): StyleData | undefined {
  return styles.find((s) => s.slug === slug)
}

export function getStyleByDbValue(dbValue: string): StyleData | undefined {
  const lower = dbValue.toLowerCase()
  return styles.find((s) => s.dbValue.toLowerCase() === lower)
}
