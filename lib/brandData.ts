export interface BrandFAQ {
  question: string
  answer: string
}

export interface BrandData {
  slug: string
  name: string
  country: string
  founded: number
  overview: string
  watchBrand: string // canonical brand name as it appears in the photos DB
  heroFact: string  // one punchy stat or claim
  faq: BrandFAQ[]
}

export const brands: BrandData[] = [
  {
    slug: 'rolex',
    name: 'Rolex',
    country: 'Switzerland',
    founded: 1905,
    watchBrand: 'Rolex',
    heroFact: 'The most recognised watch brand on Earth, producing roughly 1 million watches annually - all in-house.',
    overview: `Rolex was founded in London in 1905 by Hans Wilsdorf and moved to Geneva in 1919. It is the most recognised watch brand in the world and has defined modern tool watch design with the Submariner (1953), GMT-Master (1954), and Daytona (1963). Rolex produces every significant component in-house - cases, bracelets, movements, dials, and Oystersteel - an achievement virtually no other brand matches at scale. Its watches are known for extraordinary durability, precision, and market-beating resale values. Rolex Certified Pre-Owned (RCPO) has further extended the brand's quality guarantee into the secondary market. For many collectors, a Rolex is not a watch - it is the standard against which all others are measured.`,
    faq: [
      {
        question: 'Why are Rolex watches so expensive?',
        answer: 'Rolex manufactures virtually every component in-house - movements, Oystersteel alloy, cases, bracelets, dials, and crystals - to quality standards that competitors outsource to achieve. The brand also deliberately constrains production relative to demand, maintaining secondary market premiums. Materials like Cerachrom ceramic, Chromalight lume, and the Jubilee bracelet represent genuine engineering investments. Beyond materials: COSC+ accuracy, 70-hour power reserves, and decades of refinement justify significant pricing.',
      },
      {
        question: 'Which Rolex holds its value best?',
        answer: 'The GMT-Master II Pepsi (126710BLRO) commands extraordinary secondary market premiums - preowned prices of $18,000-24,000 against a retail of ~$11,000. The Daytona in steel is similarly oversubscribed. The Submariner and Explorer offer strong but more rational resale. In general, sports models on bracelets in steel hold value better than dress models in precious metals, which tend to trade closer to or below retail.',
      },
      {
        question: 'Rolex vs Omega - which is better?',
        answer: 'They serve different needs. Rolex offers unmatched market prestige, extraordinary build quality, and exceptional resale value - particularly in sport models. Omega offers equivalent or superior movement technology (Master Chronometer certification, 15,000 gauss anti-magnetic resistance) at lower retail prices without waitlists. Technically, Omega\'s Co-Axial escapement and METAS certification represent genuine horological innovation. Culturally, Rolex remains the apex of watch status. Compare specific models head-to-head on our tool.',
      },
      {
        question: 'Can I get a Rolex at retail?',
        answer: 'Purchasing sport Rolex models (Submariner, GMT-Master II, Daytona) at retail is genuinely difficult - authorized dealers maintain waiting lists of months to years for popular references. Dress models and less-publicized references (Datejust, Explorer, Air-King) are more accessible. Building a relationship with an authorized dealer through non-hotlist purchases is the traditional approach. Alternatively, the Rolex Certified Pre-Owned program now offers authenticated secondhand Rolex through authorized dealers with a two-year warranty.',
      },
    ],
  },
  {
    slug: 'omega',
    name: 'Omega',
    country: 'Switzerland',
    founded: 1848,
    watchBrand: 'Omega',
    heroFact: 'The only watch worn on the Moon. The Speedmaster was NASA-qualified in 1965 and accompanied every Apollo mission.',
    overview: `Omega was founded in La Chaux-de-Fonds in 1848 and is today owned by the Swatch Group. It is the second largest Swiss watch brand by revenue and the official timekeeper of the Olympic Games. Omega's three iconic lines - Seamaster (dive watch, James Bond), Speedmaster (NASA Moon watch), and Constellation (dress) - span nearly every category in watchmaking. The brand's most significant modern achievement is the Co-Axial escapement (acquired from independent watchmaker George Daniels) and the resulting Master Chronometer certification via METAS, offering accuracy within 0/+5 seconds per day and anti-magnetic resistance to 15,000 gauss. At comparable prices to Rolex's entry models, Omega often delivers superior movement technology without waitlists.`,
    faq: [
      {
        question: 'What is Master Chronometer certification?',
        answer: 'Master Chronometer is Omega\'s proprietary certification verified by METAS (Switzerland\'s Federal Institute of Metrology). Criteria: minimum accuracy of 0/+5 seconds per day (stricter than COSC\'s -4/+6), resistance to 15,000 gauss magnetic fields, 5-day power reserve verified, and water resistance confirmed. The Seamaster 300m, Aqua Terra, and Constellation all carry this certification. It represents the most rigorous movement certification commercially available from a major brand.',
      },
      {
        question: 'Is the Omega Speedmaster still relevant in 2026?',
        answer: 'Yes. The Speedmaster Professional Moonwatch retains unique historical significance - it\'s the only watch certified by NASA for all manned space missions and worn by astronauts on the lunar surface in 1969. The 2021 update introduced the Co-Axial Cal. 3861 and modern manufacturing refinements while retaining the hesalite crystal and stepped dial of the originals. For collectors who value history, the Speedmaster is irreplaceable. Functionally, the manual-wind movement and 50m water resistance limit its daily practicality.',
      },
      {
        question: 'Omega Seamaster 300m vs Rolex Submariner - which to choose?',
        answer: 'The Omega Seamaster 300m ($5,700-6,200) vs Rolex Submariner 41 ($9,100-9,600) is one of watchmaking\'s most discussed comparisons. The Omega wins on: movement technology (Master Chronometer vs COSC+), price (significantly cheaper), and immediate availability. The Rolex wins on: brand prestige, resale value, case refinement, and the cultural cachet of the Submariner name. For a watch you plan to wear and not resell, the Omega makes strong technical and financial sense. Compare them directly on our platform.',
      },
      {
        question: 'Which Omega holds its value best?',
        answer: 'The Speedmaster Professional Moonwatch holds value exceptionally well due to its unique cultural and historical status - original-specification examples with hesalite crystals are particularly strong. The Seamaster 300m holds better than most mid-luxury watches but does not command Rolex-style premiums. Limited editions and special releases (Snoopy editions, Speedmaster anniversaries) often trade above retail. For pure investment, the Speedmaster is Omega\'s strongest asset.',
      },
    ],
  },
  {
    slug: 'tudor',
    name: 'Tudor',
    country: 'Switzerland',
    founded: 1926,
    watchBrand: 'Tudor',
    heroFact: 'Rolex\'s sister brand, delivering in-house movements at 30-60% lower retail prices than its parent.',
    overview: `Tudor was founded by Hans Wilsdorf (of Rolex) in 1926 as an accessible sibling to Rolex, using Rolex case designs with third-party movements. The brand was largely dormant through the 1990s but relaunched aggressively in 2012 with the Black Bay series, offering genuine Rolex-heritage aesthetics with increasingly capable in-house MT movements. Today, Tudor's Black Bay 58, Black Bay GMT, and Pelagos are standout values in their respective categories - COSC-certified in-house movements at 30-60% of Rolex retail prices. The brand is particularly successful in the $3,000-$5,000 dive and GMT segment, where it faces no direct peer in terms of value. Tudor watches are made in Rolex's Geneva facilities and share Rolex's quality manufacturing standards.`,
    faq: [
      {
        question: 'Is Tudor owned by Rolex?',
        answer: 'Tudor is owned by the same parent company (Rolex S.A.) as Rolex, making them sister brands under the same corporate umbrella. They share manufacturing facilities in Geneva. Tudor is not a "budget Rolex" - it has its own distinct identity, design language, and customer base. Tudor uses its own in-house movements (MT5402, MT5652, MT5602) rather than Rolex calibers, though both benefit from the same manufacturing standards and quality control systems.',
      },
      {
        question: 'Tudor Black Bay 58 vs Rolex Submariner - which to buy?',
        answer: 'The Tudor Black Bay 58 ($3,600-3,900) vs Rolex Submariner 41 ($9,100-9,600) is the most common comparison for dive watch buyers with flexible budgets. Tudor wins on: price (less than half), availability (no waitlist), and the riveted bracelet\'s vintage charm. Rolex wins on: resale value, case finishing quality, movement refinement (Cal. 3235 vs MT5402), and the Submariner\'s cultural status. If the watch is purely for wearing, Tudor is exceptional value. If resale value matters, Rolex holds better.',
      },
      {
        question: 'Are Tudor movements reliable?',
        answer: 'Yes - Tudor\'s MT5 movement family (MT5402, MT5602, MT5652) are COSC-certified in-house calibers with 70-hour power reserves, tested at -4/+6 seconds per day. They benefit from Rolex\'s manufacturing infrastructure and quality standards. The Pelagos 39\'s MT5602 has proven particularly robust in dive conditions. Tudor movements are serviced at authorized Rolex/Tudor service centers worldwide.',
      },
      {
        question: 'Which Tudor model is most recommended?',
        answer: 'The Tudor Black Bay 58 is Tudor\'s most celebrated model - the 39mm case, COSC-certified MT5402, vintage riveted bracelet, and under-$4,000 price make it one of the best-value watches in all of watchmaking. The Black Bay GMT offers exceptional value in the GMT segment at $4,150-4,500. The Pelagos 39 is the choice for serious dive use - titanium case, 500m water resistance, at $4,350-4,700.',
      },
    ],
  },
  {
    slug: 'tag-heuer',
    name: 'TAG Heuer',
    country: 'Switzerland',
    founded: 1860,
    watchBrand: 'TAG Heuer',
    heroFact: 'Motorsport\'s official timekeeper for over 50 years - TAG Heuer has timed Formula 1, Le Mans, and the Monaco Grand Prix.',
    overview: `TAG Heuer was founded by Edouard Heuer in Saint-Imier in 1860 and became the world's most celebrated sports chronograph brand through deep motorsport ties. The Carrera (1963) and Monaco (1969) are design icons linked to racing legends including Jacky Ickx and Steve McQueen. Acquired by LVMH in 1999, TAG Heuer has invested heavily in in-house movement development - the Heuer 02 chronograph caliber (80-hour power reserve, column wheel) is a genuine achievement at its price point. The brand operates in a broadly accessible luxury tier ($1,500-$7,000 retail), making it an entry point to Swiss mechanical chronographs with genuine motorsport heritage. The Aquaracer 300 represents excellent value in the dive watch segment.`,
    faq: [
      {
        question: 'Is TAG Heuer considered a luxury watch brand?',
        answer: 'TAG Heuer is in the entry-to-mid luxury tier - Swiss-made, with heritage and quality justifying the price, but below the prestige of Rolex, Omega, or IWC. The brand is particularly strong in chronographs (Carrera, Monaco) and dive watches (Aquaracer). LVMH ownership brings investment in movement development and marketing. For someone entering Swiss watchmaking in the $1,500-$6,000 range with a passion for motorsport, TAG Heuer is highly relevant.',
      },
      {
        question: 'TAG Heuer Carrera vs Omega Speedmaster - which is better?',
        answer: 'Both are iconic chronographs with very different characters. The TAG Heuer Carrera 42 ($5,350-5,900) features the in-house Heuer 02 with 80-hour power reserve - more power reserve than the Speedmaster - and cleaner motorsport design. The Omega Speedmaster ($6,900-7,400) offers unique NASA Moon history, hand-wound Co-Axial Cal. 3861, and irreplaceable cultural status. For pure specification at price, TAG Heuer competes strongly. For historical significance and collecting depth, the Speedmaster is unmatched.',
      },
      {
        question: 'What is TAG Heuer\'s most iconic model?',
        answer: 'The TAG Heuer Monaco is arguably the most iconic - its square case and blue dial were made famous by Steve McQueen in the 1971 film "Le Mans," and it was the first automatic chronograph with a square case. The Carrera is the better everyday watch - clean, motorsport-pure, and available with the in-house Heuer 02 movement. The Aquaracer is the most practical daily driver at a more accessible price.',
      },
    ],
  },
  {
    slug: 'seiko',
    name: 'Seiko',
    country: 'Japan',
    founded: 1881,
    watchBrand: 'Seiko',
    heroFact: 'Invented the quartz movement (1969), the kinetic movement (1988), and the spring drive (1999) - more watch innovations than any other single company.',
    overview: `Seiko was founded in Tokyo in 1881 by Kintaro Hattori and is Japan's largest watch manufacturer, encompassing Grand Seiko, Credor, and Pulsar under its corporate umbrella. Seiko's technological contributions to watchmaking are unmatched: the company invented the quartz watch (Astron, 1969), the kinetic movement (1988), and the Spring Drive (1999) - a hybrid mechanical/electronic movement accurate to Â±1 second per day. Seiko manufactures at multiple price tiers from the $250 Seiko 5 Sports to $50,000+ Grand Seiko Spring Drives. The Prospex dive and field line, Presage dress line, and 5 Sports casual range collectively represent the most comprehensive watch offering from a single manufacturer at accessible prices.`,
    faq: [
      {
        question: 'Is Grand Seiko the same as Seiko?',
        answer: 'Grand Seiko is Seiko\'s luxury sub-brand, now operating as an independent brand identity while remaining part of the Seiko Group. Grand Seiko watches are made in dedicated ateliers in Shinshu and Shizukuishi with hand-finishing standards that rival Swiss haute horlogerie. Regular Seiko covers everything from $100 quartz watches to $1,500 Presage dress watches. Grand Seiko starts around $3,000 and peaks at $50,000+. The two brands share corporate ownership but are entirely distinct in positioning and manufacturing.',
      },
      {
        question: 'Why do watch enthusiasts love Seiko so much?',
        answer: 'Seiko has earned cult status among enthusiasts for several reasons: remarkable value (70-hour power reserve, sapphire crystal movements under $1,000), deep heritage (Seiko 5 Sports has been continuously produced since 1963), diverse complications (Spring Drive accuracy, Hi-Beat movements), a thriving modding community, and decades of vintage references that appreciate in value. The Seiko Prospex SPB143 and Seiko 5 Sports SRPE55 are perennial "best value" recommendations from virtually every serious watch reviewer.',
      },
      {
        question: 'Which Seiko should I buy first?',
        answer: 'The Seiko 5 Sports SRPE55 ($250-350) is the traditional first recommendation - reliable 4R36 movement, day/date, 100m water resistance, sport aesthetic. For a step up, the Seiko Prospex SPB143 ($700-900) is outstanding - 6R35 movement, 70-hour power reserve, sapphire crystal, and vintage dive watch heritage. The Seiko Presage SPB165 ($650-800) suits those who want a dress watch with enamel dial. Any of these three will deliver lasting satisfaction.',
      },
    ],
  },
  {
    slug: 'tissot',
    name: 'Tissot',
    country: 'Switzerland',
    founded: 1853,
    watchBrand: 'Tissot',
    heroFact: 'The official timekeeper of MotoGP, Tour de France, and multiple Olympic sports - worn on the wrist of more Swiss watch buyers than any other brand.',
    overview: `Tissot was founded in Le Locle in 1853 and is today owned by the Swatch Group, making it a stablemate of Omega, Longines, and Rado. As the Swatch Group's volume Swiss-made brand, Tissot delivers genuine Swiss manufacturing, sapphire crystals, and ETA/Sellita movements at entry-level luxury prices ($300-$1,200). The PRX's 2021 relaunch as an 80-hour automatic with integrated bracelet at under $600 was arguably the most disruptive product launch in the $500-$1,000 watch segment in a decade. The Seastar 1000's 300m water resistance and 80-hour Powermatic 80 movement at $650-800 similarly punches well above its price. Tissot is the entry point into Swiss-made watchmaking for most buyers.`,
    faq: [
      {
        question: 'Is Tissot a luxury brand?',
        answer: 'Tissot sits at the entry-to-accessible tier of Swiss luxury watchmaking - Swiss-made, genuine mechanical movements, sapphire crystals - but positioned below the prestige of Omega, Longines, or IWC. The brand competes on value, offering Swiss specifications at prices accessible to most watch buyers. "Luxury" in the traditional sense implies exclusivity and scarcity that Tissot doesn\'t pursue - but the quality justifies more than the label suggests.',
      },
      {
        question: 'Is the Tissot PRX worth buying in 2026?',
        answer: 'Yes - the Tissot PRX Powermatic 80 remains one of the best watches for the money in any category. Swiss-made, Powermatic 80 movement (80-hour power reserve, Â±2.5 seconds/day accuracy), sapphire crystal, integrated bracelet, and a design that captures the luxury sports watch aesthetic at $550-625. Preowned examples regularly appear under $450. It has been backordered since launch for good reason.',
      },
      {
        question: 'Tissot vs Seiko - which brand offers better value?',
        answer: 'Different strengths at different price points. Under $400, Seiko wins decisively - the 5 Sports SRPE55 at $250-350 has no Swiss equivalent. From $500-$800, Tissot (PRX, Seastar 1000) competes strongly - Swiss-made with ETA-derived 80-hour movements, sapphire crystals, and design ambition. From $700-900, Seiko Prospex SPB143 and Tissot Seastar 1000 are genuine head-to-head alternatives with different character. Both brands deliver excellent value in their respective tier.',
      },
    ],
  },
  {
    slug: 'cartier',
    name: 'Cartier',
    country: 'France',
    founded: 1847,
    watchBrand: 'Cartier',
    heroFact: 'Cartier created the first men\'s wristwatch in 1904 for aviator Alberto Santos-Dumont - the Santos is still in production today.',
    overview: `Cartier was founded in Paris in 1847 and holds an extraordinary place in watchmaking history: it created the world's first men's wristwatch in 1904 (the Santos, made for aviator Alberto Santos-Dumont), invented the rectangular Tank case in 1917, and has since established some of the most culturally significant watch designs in history. Today part of the Richemont Group, Cartier produces both mechanical watches with Manufacture movements and quartz dress pieces. The Santos de Cartier, Tank Must, and PanthÃ¨re are its most iconic current references. Cartier occupies a unique position - respected as a jeweller and watchmaker simultaneously - with strong brand recognition that commands premium resale values, particularly for iconic rectangular designs.`,
    faq: [
      {
        question: 'Is Cartier known more for jewellery or watches?',
        answer: 'Both - Cartier is simultaneously one of the world\'s leading jewellers and a respected watchmaker. The brand\'s strongest watch designs (Santos, Tank, PanthÃ¨re) are as recognizable as any Rolex sport model. Cartier watches hold unusual cultural appeal because they cross the boundary between watchmaking and fashion jewellery, appealing to audiences who might not define themselves as watch enthusiasts. This breadth of appeal supports strong resale values.',
      },
      {
        question: 'Cartier Santos vs Cartier Tank - which to choose?',
        answer: 'The Santos de Cartier ($7,600-8,200) is a round-cased sports watch - versatile, historically significant (first men\'s wristwatch), and suitable for everything from casual to business formal. The Tank Must ($2,800-3,200) is a rectangular quartz dress watch - more affordable, pure Parisian elegance, ideal for formal wear. If versatility and active wear matter, choose the Santos. If you want an elegant, affordable Cartier for formal occasions, the Tank Must is outstanding value.',
      },
      {
        question: 'Do Cartier watches hold their value?',
        answer: 'Cartier watches hold value reasonably well, particularly for iconic models. The Santos and Tank rarely trade below 70-80% of retail. Precious metal versions (gold Santos, diamond-set pieces) can appreciate significantly. The Tank Must (quartz) has seen strong appreciation from its cultural moment. Cartier doesn\'t command Rolex-style premiums but is considerably more stable than most fashion watch brands. The brand\'s 175+ year heritage provides strong resale foundations.',
      },
    ],
  },
  {
    slug: 'iwc',
    name: 'IWC Schaffhausen',
    country: 'Switzerland',
    founded: 1868,
    watchBrand: 'IWC',
    heroFact: 'Founded by American watchmaker Florentine Ariosto Jones in Schaffhausen, specifically to use Swiss craftsmanship with American production efficiency - still operating from the same location.',
    overview: `IWC Schaffhausen (International Watch Company) was founded in 1868 by American Florentine Ariosto Jones in Schaffhausen, a Swiss-German border town chosen for its Rhine river power source. Today part of the Richemont Group, IWC is known for three dominant collections: Pilot's Watches (aviation heritage, anti-magnetic soft-iron inner cases), Portugieser (dress, large dial, railway track chapter ring), and Aquatimer (professional dive). IWC manufactures its own movements across multiple complications - the IWC 52000-series calibers are particularly praised for reliability. The Mark XVIII Pilot and Portugieser 40 represent the brand's strongest everyday arguments. At $4,000-8,000 retail, IWC occupies the mid-to-upper segment of Swiss luxury.`,
    faq: [
      {
        question: 'IWC vs Omega - which is the better brand?',
        answer: 'Both are strong mid-to-upper luxury Swiss brands with different strengths. Omega offers Master Chronometer movement technology (15,000 gauss, METAS certification) and the iconic Speedmaster/Seamaster heritage at competitive prices. IWC offers distinctive designs (Pilot\'s anti-magnetic inner case, Portugieser elegance), more in-house movement variety, and a strong aviation identity. Omega is more widely recognized; IWC appeals to connoisseurs who appreciate understated mechanical prestige. Neither is objectively better - the right choice depends on which design language resonates.',
      },
      {
        question: 'What is the IWC Pilot\'s Watch soft-iron inner case?',
        answer: 'IWC Pilot\'s Watches (Mark XVIII, Pilot\'s Chronograph, Big Pilot) feature a soft-iron inner case that shields the movement from magnetic fields - a critical feature for the aviation context these watches were originally designed for. Soft iron acts as a Faraday cage, deflecting magnetic fields around the movement. This provides magnetic protection without the movement modifications required by Omega\'s anti-magnetic approach. It\'s a traditional engineering solution that remains relevant for anyone working near magnetic machinery.',
      },
      {
        question: 'Which IWC model should I start with?',
        answer: 'The IWC Pilot\'s Watch Mark XVIII ($4,400-4,900) is the most versatile starting point - clean black dial, clear Arabic numerals, 40mm slim case, and that soft-iron anti-magnetic protection. The Portugieser 40 ($7,100-7,700) is the choice for dress watch enthusiasts - railway track chapter ring, in-house Cal. 82100 with 60-hour power reserve, and minimalist elegance. For sport, the Aquatimer and Pilot Chronograph expand the range further.',
      },
    ],
  },
  {
    slug: 'patek-philippe',
    name: 'Patek Philippe',
    country: 'Switzerland',
    founded: 1839,
    watchBrand: 'Patek Philippe',
    heroFact: '"You never actually own a Patek Philippe. You merely look after it for the next generation." The Calatrava, Nautilus, and Aquanaut are among the most coveted watches ever made.',
    overview: `Patek Philippe was founded in Geneva in 1839 and remains independently owned by the Stern family - the last major independent Swiss manufacture. It is widely considered the apex of watchmaking prestige, holding world auction records, producing some of the most mechanically complex pocket and wrist watches in history, and maintaining demand that vastly outstrips production for nearly all popular references. The Nautilus (1976, designed by Gerald Genta) is arguably the most famous luxury sports watch ever made - production ended in 2021 for the reference 5711 yet secondary market prices remain at multiples of the original $35,000 retail. Patek Philippe represents the pinnacle of Swiss horological achievement.`,
    faq: [
      {
        question: 'Why is Patek Philippe so expensive?',
        answer: 'Patek Philippe commands extreme prices for compounding reasons: independent family ownership allows long-term quality investment without shareholder pressure; every movement is hand-finished to Grand Seiko/CÃ´tes de GenÃ¨ve standard; production is deliberately limited (under 65,000 pieces annually); complications are among the most complex produced commercially; and the brand\'s cultural narrative of generational ownership creates extraordinary brand equity. The Nautilus 5711\'s discontinuation created a scarcity event that drove preowned prices to 4-5Ã— retail.',
      },
      {
        question: 'Is the Patek Philippe Nautilus 5711 still available?',
        answer: 'The reference 5711 was discontinued in 2021. Preowned examples currently trade at $90,000-150,000 despite original retail of $35,000-38,000 - one of the largest retail-to-secondary premiums in watchmaking history. The successor reference Aquanaut (5167) has partly absorbed demand but trades differently. New Patek Philippe Nautilus variants exist (complications, precious metals) at different price points. Acquiring a 5711 now requires the secondary market.',
      },
      {
        question: 'Patek Philippe vs Audemars Piguet - which is the greater brand?',
        answer: 'Patek Philippe is generally considered the apex of watchmaking prestige - independent family ownership, unmatched auction record, and the perception of ultimate horological refinement. Audemars Piguet (Royal Oak) holds its own as the defining luxury sports watch, with secondary market prices that sometimes rival Patek. In terms of movement complexity and finishing standards, Patek has a slight edge historically. In terms of cultural cool and modern sports watch dominance, AP\'s Royal Oak is peerless. Compare the AP Royal Oak and other watches on our platform.',
      },
    ],
  },
  {
    slug: 'audemars-piguet',
    name: 'Audemars Piguet',
    country: 'Switzerland',
    founded: 1875,
    watchBrand: 'Audemars Piguet',
    heroFact: 'The Royal Oak (1972), designed overnight by Gerald Genta, redefined luxury watchmaking - its octagonal bezel and exposed screws created the luxury sports watch category.',
    overview: `Audemars Piguet was founded in Le Brassus in 1875 by Jules-Louis Audemars and Edward-Auguste Piguet and remains one of the few independent watchmaking families in Switzerland. Its defining product, the Royal Oak (1972), was revolutionary - a steel sports watch priced higher than gold dress watches, with an octagonal case, visible screws, and "Grande Tapisserie" dial. Designed by Gerald Genta (who also designed the Nautilus), the Royal Oak created and continues to define the luxury integrated bracelet sports watch genre. The Royal Oak 15500 in steel starts at ~$25,000 retail with secondary market prices often reaching $35,000-50,000. AP is consistently cited as one of the three greatest Swiss watch brands alongside Patek Philippe and Vacheron Constantin.`,
    faq: [
      {
        question: 'Why is the Audemars Piguet Royal Oak so special?',
        answer: 'The Royal Oak (1972) was the first luxury steel sports watch - priced higher than gold dress watches of the time, which was radical. Its octagonal bezel with exposed hexagonal screws, integrated bracelet, and Grande Tapisserie dial are instantly recognizable design innovations that no competitor has successfully copied. Gerald Genta designed it in one night. The Royal Oak didn\'t just succeed - it created an entirely new category (luxury integrated sports watch) that remains the most desirable segment in watchmaking today.',
      },
      {
        question: 'Is the AP Royal Oak worth the price in 2026?',
        answer: 'The Royal Oak 15500 starts at ~$24,000-26,000 retail, with secondary market prices typically $35,000-50,000 - the market rewards buyers, not sellers, at AP retail. The watch is exceptional: in-house Cal. 4302, 60-hour power reserve, extraordinary case finishing with alternating polished and satin surfaces. Whether it\'s "worth" the price depends on your definition - as a financial asset, it\'s strong. As a mechanical object of desire, it\'s peerless. As an everyday watch, it\'s surprisingly wearable at 41mm and 10.4mm thick.',
      },
      {
        question: 'AP Royal Oak vs Patek Nautilus - which is the better watch?',
        answer: 'Both are icons of the luxury sports watch genre, both designed by Gerald Genta, and both trade at extraordinary secondary market premiums. The Royal Oak (41mm, 10.4mm thick, integrated steel bracelet) is more contemporary and sport-forward. The Nautilus 5711 (40mm, 8.3mm, incredibly slim) is more elegant and refined. AP production continues; the 5711 is discontinued. If you can find either at rational prices, both are exceptional. The choice ultimately comes down to which design speaks to you - compare them on our platform.',
      },
    ],
  },
  {
    slug: 'grand-seiko',
    name: 'Grand Seiko',
    country: 'Japan',
    founded: 1960,
    watchBrand: 'Grand Seiko',
    heroFact: 'Grand Seiko\'s Zaratsu hand-polishing technique creates case surfaces so flat and reflective they appear to emit light - a finishing standard that rivals Swiss brands at five times the price.',
    overview: `Grand Seiko was established in 1960 as Seiko's pursuit of the ultimate wristwatch - in direct competition with Swiss standards. Made in dedicated ateliers in Shinshu (home of the Spring Drive) and Shizukuishi, Grand Seiko applies Zaratsu hand-polishing to create mirror-flat surfaces that distinguish its case finishing from virtually all other watchmakers at any price. The brand's signature movements - the Spring Drive (accuracy Â±1 second/day), Hi-Beat automatic (36,000 bph), and manual wind calibers - represent genuine horological innovation. Grand Seiko dials (Snowflake, Birch, Cherry Blossom, seasons series) are made with natural materials and textures that create dials of extraordinary beauty. The brand operates independently from regular Seiko with its own ambassador program and design identity.`,
    faq: [
      {
        question: 'Is Grand Seiko worth the price over Swiss alternatives?',
        answer: 'Grand Seiko competes directly with Omega, IWC, and the entry tier of Jaeger-LeCoultre at $3,000-$10,000. The case finishing quality (Zaratsu polishing) genuinely exceeds Swiss standards at comparable prices. The Spring Drive movement offers Â±1 second/day accuracy without electronic regulation - purely mechanical by watch definitions. Dials like the Snowflake are hand-crafted artworks. The trade-off: lower brand recognition in Western markets and fewer complications at the price. For those who prioritize craft and artistry over Swiss brand prestige, Grand Seiko is extraordinary value.',
      },
      {
        question: 'What is the Grand Seiko Spring Drive movement?',
        answer: 'The Spring Drive is Grand Seiko\'s proprietary movement type - a mechanical movement regulated by a gliding spring (Tri-synchro regulator) and electromagnetic brake rather than a traditional lever escapement. This eliminates the ticking escapement noise and delivers Â±1 second/day accuracy in a fully mechanical movement. The Spring Drive is Grand Seiko\'s most significant horological innovation and what drives the brand\'s premium pricing. The SBGA211 Snowflake uses the 9R65 Spring Drive caliber.',
      },
      {
        question: 'Which Grand Seiko model is most iconic?',
        answer: 'The SBGA211 "Snowflake" is Grand Seiko\'s most celebrated reference - its hand-textured white lacquer dial, inspired by Nagano snowfall, is widely considered one of the most beautiful dials in watchmaking at any price. The titanium case with Zaratsu-polished surfaces adds to the sense of perfectionism. The Snowflake has introduced many collectors to Grand Seiko who previously dismissed Japanese watchmaking.',
      },
    ],
  },
  {
    slug: 'longines',
    name: 'Longines',
    country: 'Switzerland',
    founded: 1832,
    watchBrand: 'Longines',
    heroFact: 'One of the oldest Swiss watch brands in continuous operation, Longines has been official timekeeper at the Olympic Games, Wimbledon, and the Kentucky Derby.',
    overview: `Longines was founded in Saint-Imier in 1832 and is one of the oldest Swiss watch brands in continuous operation - and today one of the best-value Swiss manufactures. Owned by the Swatch Group (alongside Omega and Tissot), Longines accesses ETA/Swatch Group movement technology and Swiss manufacturing at pricing significantly below its parent brand's prestige tier. The brand positions itself as "Elegance is an Attitude" - delivering Swiss-made mechanical watches with COSC certification and genuine aesthetic ambition at $1,000-$3,000. The HydroConquest (dive) and Master Collection (dress) are the most recommended references, offering specifications that legitimately compete with Swiss brands at twice the price.`,
    faq: [
      {
        question: 'Is Longines a luxury brand?',
        answer: 'Longines occupies the upper accessible tier of Swiss watchmaking - genuinely Swiss-made, COSC-certifiable movements, quality finishing - but positioned deliberately below the prestige of Omega or IWC. The brand eschews exclusivity for broad accessibility: widely distributed, no waitlists, honest pricing. For buyers who want Swiss-made quality with heritage and COSC certification at $1,000-$2,500, Longines delivers exceptional value that the watch community consistently praises.',
      },
      {
        question: 'Which Longines should I buy?',
        answer: 'The Longines HydroConquest 41 ($1,200-1,500) is the strongest value recommendation - 300m water resistance, 72-hour L888.4 movement, sapphire crystal, Swiss-made. For dress watch buyers, the Master Collection 40 ($1,600-2,000) offers COSC certification, moonphase, and traditional Swiss elegance at an honest price. The Spirit and Conquest lines offer additional options. For a first Swiss automatic under $1,500, the HydroConquest is one of the best overall propositions in watchmaking.',
      },
      {
        question: 'Longines vs Tissot - which offers better value?',
        answer: 'Both are Swatch Group brands, with Longines positioned above Tissot in prestige and pricing. Tissot wins on price - the PRX at $550-625 and Seastar 1000 at $650-800 are compelling values. Longines wins on heritage, slightly more refined finishing, and the L888 movement\'s 72-hour power reserve (vs Tissot\'s Powermatic 80 at 80 hours). For under $800, Tissot is better value. From $1,000-$2,000, Longines offers more heritage and slightly higher prestige for modest additional cost.',
      },
    ],
  },
  {
    slug: 'hamilton',
    name: 'Hamilton',
    country: 'USA / Switzerland',
    founded: 1892,
    watchBrand: 'Hamilton',
    heroFact: 'Hamilton watches appeared in over 500 films - from 2001: A Space Odyssey to Interstellar - making it the most cinematically featured watch brand in Hollywood history.',
    overview: `Hamilton was founded in Lancaster, Pennsylvania in 1892 and supplied watches to the U.S. military through both World Wars - the Khaki Field's design directly descends from these military contracts. Acquired by the Swatch Group in 1974, manufacturing moved to Biel, Switzerland, but the American spirit (and name) endured. Today Hamilton is the best-value Swiss-made watch brand in the $500-$1,000 category - the H-10 movement's 80-hour power reserve appears in the Khaki Field, Jazzmaster, and Khaki Pilot, delivering Swiss manufacturing and sapphire crystals at accessible prices. The Khaki Field Auto 38 has become the modern field watch benchmark and the go-to recommendation for enthusiasts seeking genuine value in Swiss watchmaking.`,
    faq: [
      {
        question: 'Is Hamilton Swiss-made?',
        answer: 'Yes - Hamilton has been manufactured in Biel, Switzerland since the Swatch Group acquisition in 1974. All Hamilton movements, including the in-house H-10 caliber (80-hour power reserve), are made and assembled in Switzerland. The brand is an American brand in identity and heritage, Swiss-made in execution. Swiss Made labeling on Hamilton watches is accurate and certified.',
      },
      {
        question: 'What is the Hamilton H-10 movement?',
        answer: 'The Hamilton H-10 is an in-house automatic movement with an exceptional 80-hour power reserve - nearly double the 40-45 hour reserves common at this price. It runs at 21,600 bph, delivers accuracy of approximately Â±10 seconds/day, and is used across the Khaki Field, Jazzmaster, and Pilot lines. The 80-hour reserve means you can take it off Thursday, put it back on Monday morning, and it will still be running. This is the H-10\'s signature selling point and genuine market advantage.',
      },
      {
        question: 'Hamilton Khaki Field vs Hamilton Jazzmaster - which to choose?',
        answer: 'Same H-10 movement, different characters. The Khaki Field Auto 38 ($650-750) is a rugged field watch - Arabic numerals, canvas strap, military heritage, 100m water resistance. The Jazzmaster 40 ($750-900) is a dress watch - Dauphine hands, sunray dial, leather strap, 50m water resistance, slim profile. If you wear jeans and boots most days, the Khaki Field. If you wear suits or smart-casual most days, the Jazzmaster. Both are among the best watches at their price.',
      },
    ],
  },
  {
    slug: 'breitling',
    name: 'Breitling',
    country: 'Switzerland',
    founded: 1884,
    watchBrand: 'Breitling',
    heroFact: 'The Navitimer\'s circular slide rule bezel can calculate airspeed, fuel consumption, climbing rate, and time-to-destination - making it a genuine cockpit instrument worn on the wrist.',
    overview: `Breitling was founded in Saint-Imier in 1884 by LÃ©on Breitling and became the world's definitive aviation watch brand through deep partnerships with the aerospace industry. The Navitimer (1952) with its circular slide rule bezel remains the most capable pilot's chronograph ever made. The Superocean and Avenger lines extend the brand's tool watch philosophy to the ocean and professional environments. Under the ownership of CVC Capital Partners (acquired from the Schneider family in 2017), Breitling has pursued a heritage relaunch strategy - more accessible pricing, vintage-inspired designs, and strong secondary market development. The brand occupies the $3,000-$10,000 mid-luxury segment, with the Superocean 42 offering genuine dive watch value and the Navitimer B01 42 remaining the definitive pilot's chronograph.`,
    faq: [
      {
        question: 'Is Breitling considered a luxury watch brand?',
        answer: 'Yes - Breitling is a respected mid-to-upper luxury Swiss brand with genuine aviation heritage and strong brand recognition. It sits between Longines/TAG Heuer and Rolex/Omega in prestige tier. Breitling\'s in-house movements (Caliber 01, Caliber 17) are COSC-certified with impressive specifications. The brand\'s secondary market has been volatile but has stabilized under the current management\'s heritage strategy. Among professional pilots and aviation enthusiasts, Breitling carries irreplaceable credibility.',
      },
      {
        question: 'Breitling Navitimer vs Omega Speedmaster - which is the better pilot\'s watch?',
        answer: 'The Navitimer B01 42 ($9,300-10,000) and Omega Speedmaster Moonwatch ($6,900-7,400) are the two greatest aviation chronographs in regular production. The Navitimer is functional first - the circular slide rule actually calculates flight parameters, the COSC Caliber 01 is exceptional, and it has been used by real pilots since 1952. The Speedmaster is historical first - the only watch worn on the Moon, with irreplaceable NASA heritage. For a working pilot who values instrument function, Navitimer. For a collector who values history, Speedmaster.',
      },
      {
        question: 'Breitling Superocean vs Tudor Black Bay - which dive watch wins?',
        answer: 'The Breitling Superocean 42 ($4,000-4,500) vs Tudor Black Bay 58 ($3,600-3,900) is a compelling comparison at similar prices. The Breitling wins on: bold design differentiation, brand prestige in the dive watch community, and Caliber 17 reliability. Tudor wins on: COSC certification, 70-hour power reserve (vs 38 hours for Breitling), riveted bracelet character, and slightly lower price. For pure specification at price, Tudor wins. For design distinctiveness and Breitling heritage, the Superocean wins.',
      },
    ],
  },
  {
    slug: 'panerai',
    name: 'Panerai',
    country: 'Italy / Switzerland',
    founded: 1860,
    watchBrand: 'Panerai',
    heroFact: 'Originally designed as secret diving instruments for the Italian Navy\'s frogman commandos in WWII - Panerai watches were classified military equipment until the 1990s.',
    overview: `Officine Panerai was founded in Florence in 1860 as a precision instrument supplier to the Italian Navy. Its watches became classified military equipment in WWII - large-cased, highly legible dive instruments for the Decima Flottiglia MAS frogman commandos. The brand went commercial only in 1993, offering watches so unlike anything else in production that they became instant collector objects. Today owned by the Richemont Group, Panerai is known for its distinctive oversized cushion cases, crown protection bridge mechanism, and bold Italian industrial aesthetic. The Luminor and Radiomir families are made in NeuchÃ¢tel, Switzerland with Panerai's own in-house P-series movements. Panerai is a statement brand - its watches are unmistakable, polarizing, and deeply coveted by a loyal following.`,
    faq: [
      {
        question: 'Why are Panerai watches so large?',
        answer: 'Panerai\'s signature large cases (42-47mm standard; 44mm in the Luminor series) reflect the watch\'s military origins - instruments designed for Italian Navy frogmen who needed maximum legibility in dark underwater conditions. The large dials accommodated broad luminescent Arabic numerals readable at depth. The distinctive crown protection bridge prevents accidental crown actuation while diving. Today\'s large cases are a design signature - Panerai buyers specifically seek the bold presence, not despite the size but because of it.',
      },
      {
        question: 'Is Panerai a good investment?',
        answer: 'Panerai occupies a mid-luxury tier ($5,000-$15,000 retail for most references) with moderate secondary market performance. Unlike Rolex or AP, most Panerai models trade at or slightly below retail on the secondary market, making them less compelling as financial investments. However, as a use-and-enjoy watch, Panerai offers outstanding build quality, unique Italian design, and exceptional in-house movements (P.9010, P.001). For collectors who love the aesthetic, the ownership experience is highly rewarding.',
      },
      {
        question: 'Which Panerai should I start with?',
        answer: 'The Luminor Due in 42mm (PAM00927 or similar) is the most approachable starting point - more refined and slimmer than the traditional Luminor, with the in-house P.900 movement at ~$6,000-7,000 retail. For those who want the full Panerai experience, the Luminor Base 44mm or Luminor Marina 44mm captures the original frogman character. The Radiomir is the more vintage-influenced alternative for those who find the crown bridge too assertive.',
      },
    ],
  },
  {
    slug: 'jaeger-lecoultre',
    name: 'Jaeger-LeCoultre',
    country: 'Switzerland',
    founded: 1833,
    watchBrand: 'Jaeger-LeCoultre',
    heroFact: 'JLC manufactures over 1,200 different components in-house - more than almost any Swiss watchmaker - and has created over 400 calibers since its founding.',
    overview: `Jaeger-LeCoultre was founded in Le Sentier in 1833 by Antoine LeCoultre, who invented the device that measures micron-level precision. The brand is known as the "watchmaker's watchmaker" - its depth of manufacture and movement expertise is cited by Patek Philippe, Vacheron Constantin, and AP as peers. The Reverso (1931), with its swiveling rectangular case, and the Memovox, the first self-winding alarm watch (1950), are JLC's signature achievements. Today owned by the Richemont Group, JLC produces watches across a broad range - from the $5,000 Reverso to six-figure minute repeaters. The Reverso Classic Medium Thin is the most accessible window into a manufacture that represents the pinnacle of movement artistry.`,
    faq: [
      {
        question: 'What makes Jaeger-LeCoultre special among Swiss manufactures?',
        answer: 'Jaeger-LeCoultre\'s distinction lies in depth of manufacture - the brand produces virtually every component internally, including hairsprings, jewels, escapements, and cases. Few brands in any price category match this vertical integration. JLC also has an extraordinary complications portfolio: Reverso\'s swiveling case, Atmos perpetual motion clock, Grande Sonnerie minute repeaters, and Gyrotourbillon. Patek Philippe and AP have publicly acknowledged JLC as the movement supplier for some of their complications - a remarkable industry endorsement.',
      },
      {
        question: 'Is the Jaeger-LeCoultre Reverso worth the price?',
        answer: 'The Reverso Classic Medium Thin ($7,300-8,000) is exceptional value at its tier. The swiveling rectangular case is mechanically ingenious (the blank reverse side can be engraved - a genuine personalization tradition), the hand-wound Cal. 822/2 movement is refined, and the Art Deco proportions are timeless. For a watch you plan to pass to the next generation, the Reverso is among the most appropriate choices - it transcends trends and has been in continuous production since 1931.',
      },
      {
        question: 'Jaeger-LeCoultre vs IWC - which is the better brand?',
        answer: 'Both are Richemont Group siblings with distinct identities. JLC is the movement specialists - deeper manufacture, more complex calibers, the Reverso\'s iconic status. IWC is the aviation/tool watch specialists - the Pilot\'s Mark XVIII, Big Pilot, and Portugieser are cleaner, more accessible designs. JLC suits those who want a watch that rewards mechanical appreciation and collecting depth. IWC suits those who want a functional elegance and aviation heritage. Neither is objectively superior.',
      },
    ],
  },
  {
    slug: 'zenith',
    name: 'Zenith',
    country: 'Switzerland',
    founded: 1865,
    watchBrand: 'Zenith',
    heroFact: 'Zenith created the world\'s first automatic chronograph movement in 1969 - the El Primero - still produced today at its original 36,000 bph for 1/10th second accuracy.',
    overview: `Zenith was founded in Le Locle in 1865 by Georges Favre-Jacot and is home to one of watchmaking's most celebrated achievements: the El Primero, the world's first automatic chronograph movement, introduced in January 1969 (beating Rolex and TAG Heuer by hours). The El Primero runs at 36,000 bph - 50% faster than most chronographs - delivering 1/10th second accuracy with a distinctive tri-color subdial. Today owned by LVMH, Zenith has invested in its Chronomaster and Defy lines alongside El Primero. The El Primero Chronomaster Original (2021 reissue in 38mm) is particularly celebrated for bringing the original specification back with modern reliability. Zenith is the chronograph specialist's brand.`,
    faq: [
      {
        question: 'What is the El Primero and why is it significant?',
        answer: 'The El Primero, launched in January 1969, was the world\'s first automatic (self-winding) chronograph movement. It runs at 36,000 beats per hour - double the frequency of most Swiss automatics (28,800 bph) - delivering 1/10th second measurement precision. The high frequency required Zenith to design a completely new lever escapement geometry. Rolex famously used the El Primero as a base for its first automatic chronograph (the Daytona Cal. 4030) from 1988 to 2000. It remains in production today, still running at its original specification.',
      },
      {
        question: 'Zenith El Primero vs Omega Speedmaster - which chronograph to choose?',
        answer: 'The Zenith El Primero Chronomaster Original ($8,000-9,000) vs Omega Speedmaster Moonwatch ($6,900-7,400) is the great Swiss chronograph debate. Zenith wins on: chronograph expertise (invented the automatic chronograph), 1/10th second accuracy, and the tri-color panda dial\'s visual impact. Omega wins on: NASA Moon history, hand-wound Cal. 3861\'s purity, and cultural cachet that no other watch can match. For chronograph enthusiasts who know history, Zenith is the connoisseur\'s choice. For those who value unique heritage, Speedmaster.',
      },
      {
        question: 'Is Zenith underrated compared to Omega and TAG Heuer?',
        answer: 'Yes - Zenith is consistently cited by watch connoisseurs as underpriced relative to its historical and technical significance. The El Primero\'s role in chronograph history is unambiguous, yet Zenith trades at lower secondary market premiums than Omega or Rolex. For buyers who value horological achievement over brand marketing, Zenith delivers exceptional value. LVMH ownership provides investment and distribution that has raised the brand\'s profile, but independent resale values remain more accessible than many peers.',
      },
    ],
  },
  {
    slug: 'casio',
    name: 'Casio',
    country: 'Japan',
    founded: 1946,
    watchBrand: 'Casio',
    heroFact: 'The Casio G-Shock withstood being run over by a 10-ton truck during testing in 1983 - the engineer designed it to survive a three-story fall onto concrete. It passed both tests.',
    overview: `Casio was founded in Tokyo in 1946 and is Japan's most versatile consumer electronics company, producing calculators, keyboards, cameras, and watches. Its watch division spans from $15 entry-level quartz pieces to $700+ G-Shock MRG series. The G-Shock (1983) is one of the most influential watch designs in history - its shock-resistant module-within-module construction achieved military-grade durability at consumer prices and has become a streetwear and outdoor sports icon. The Edifice, Pro Trek, and Oceanus lines extend Casio's technical expertise into different market segments. G-Shock's collaboration with brands including A Bathing Ape, Reebok, and recent luxury-tier MRG models have made it a credible collector's watch in unexpected circles. We do not currently carry Casio models in our comparison database.`,
    faq: [
      {
        question: 'Is the Casio G-Shock worth buying?',
        answer: 'Yes - unequivocally. The G-Shock DW-5600 ($50-80) and GA-2100 "CasiOak" ($100-120) offer military-grade shock resistance, 200m water resistance, solar charging, and multi-band radio synchronization for under $150 in some configurations. No mechanical watch comes close to this durability-to-price ratio. For sports, outdoor activities, travel, and as a beater watch, G-Shock is the practical choice. The MRG series ($500-700) brings titanium cases and Japanese craftsmanship for serious collectors.',
      },
      {
        question: 'Casio G-Shock vs regular automatic watch - which is better?',
        answer: 'Different tools for different purposes. A mechanical automatic offers the craft, heritage, and horological appreciation that quartz digital watches don\'t. A G-Shock offers near-indestructibility, solar charging, atomic time sync, world time, stopwatch, and alarm functions that no mechanical watch can match. Many collectors own both - an automatic for appreciation, a G-Shock for when conditions are harsh. The choice depends on priorities: craft vs function, heritage vs practicality.',
      },
      {
        question: 'Why doesn\'t Watchems have Casio watches in its database?',
        answer: 'Our current comparison database of 50 watches focuses on mechanical and automatic timepieces in the $100-$150,000 range, where direct specification comparison (power reserve, water resistance rating, case material) provides the most value. Casio\'s G-Shock and quartz lines operate in a different market segment. We plan to expand the database - sign up to be notified when Casio models are added to the comparison tool.',
      },
    ],
  },
  {
    slug: 'citizen',
    name: 'Citizen',
    country: 'Japan',
    founded: 1918,
    watchBrand: 'Citizen',
    heroFact: 'Citizen invented Eco-Drive in 1976 - a solar-powered movement that can run for six months in total darkness after full charge. Over 100 million Eco-Drive watches have been sold.',
    overview: `Citizen Watch Co. was founded in Tokyo in 1918 and is Japan's second-largest watch manufacturer (after Seiko). The brand is best known for Eco-Drive solar technology, invented in 1976, which converts any light source to power and offers effectively permanent battery life with routine light exposure. Citizen also produces the Miyota movement family - used by hundreds of independent and microbrand watchmakers worldwide - and its high-end Caliber 0100 Grand Seiko-challenging movement (Â±1 second per year accuracy) sits among the most precise non-atomic timekeepers ever produced. The Promaster series (dive, aviation, land) delivers professional specifications at accessible prices. We do not currently carry Citizen models in our comparison database.`,
    faq: [
      {
        question: 'What is Citizen Eco-Drive?',
        answer: 'Eco-Drive is Citizen\'s proprietary light-powered movement technology, first introduced in 1976. A photovoltaic cell beneath the dial converts any light source - indoor fluorescent, sunlight, desk lamp - into electrical energy stored in a lithium-ion rechargeable cell. A fully charged Eco-Drive watch runs for approximately 6 months in total darkness. The technology eliminates battery replacement, reduces environmental waste, and makes Eco-Drive watches highly practical for everyday wear. Over 100 million Eco-Drive watches have been produced across 180+ calibers.',
      },
      {
        question: 'What is the Citizen Caliber 0100?',
        answer: 'The Citizen Caliber 0100 (in the Eco-Drive 0100 series) is a quartz movement accurate to Â±1 second per year - the most accurate analog quartz watch movement commercially produced. It achieves this through a thermocompensated circuit that corrects for temperature fluctuations that cause frequency drift in quartz oscillators. At Â±1 second per year, it outperforms GPS watches in raw frequency accuracy. The watches housing it retail at $900-$1,500 and represent a genuine technological achievement.',
      },
      {
        question: 'Why doesn\'t Watchems include Citizen watches?',
        answer: 'Our comparison database currently focuses on 50 mechanical and automatic watches in the $100-$150,000 tier. Citizen\'s strongest products (Eco-Drive, Promaster series) operate primarily in quartz and solar categories where the comparison dimensions we track (power reserve, movement caliber specifications) are less relevant. We plan to expand - check back as we add Citizen Promaster and Eco-Drive models to allow direct comparison with Seiko and other Japanese brands.',
      },
    ],
  },
  {
    slug: 'frederique-constant',
    name: 'FrÃ©dÃ©rique Constant',
    country: 'Switzerland',
    founded: 1988,
    watchBrand: 'FrÃ©dÃ©rique Constant',
    heroFact: 'One of the few Swiss brands under $2,000 to manufacture genuine in-house movements - a manufacturing investment rare at this price tier.',
    overview: `FrÃ©dÃ©rique Constant was founded in Geneva in 1988 by Peter and Aletta Stas with an explicit mission: deliver Swiss-made watches with in-house movements at accessible prices. The brand began manufacturing its own calibers in 2004 - a genuine achievement for a brand in the $500-$3,000 tier where most competitors use outsourced movements. FrÃ©dÃ©rique Constant's FC-300 and FC-710 manufacture calibers offer reliability and service access at prices that the Swiss watch industry rarely extends to this segment. The Classics and Slimline collections are the brand's strongest dress watches, with the distinctive "Heart Beat" open-aperture dial showcasing the movement. Acquired by Japanese giant Citizen in 2016, FC benefits from investment while maintaining Geneva manufacture independence.`,
    faq: [
      {
        question: 'Is FrÃ©dÃ©rique Constant really Swiss-made with in-house movements?',
        answer: 'Yes - FrÃ©dÃ©rique Constant has manufactured calibers in its Geneva facility since 2004, making it one of the few brands under $2,000 with genuine in-house movements. The FC-306 (used in the Classics Automatic) and related calibers are designed and assembled in Geneva. "Swiss Made" labeling requires that the movement be Swiss, assembled in Switzerland, and inspected in Switzerland - FC meets all criteria. The in-house movement investment distinguishes FC from competitors using exclusively ETA/Sellita movements at this price.',
      },
      {
        question: 'How does FrÃ©dÃ©rique Constant compare to Hamilton or Longines?',
        answer: 'Three different value propositions at similar prices. Hamilton offers the strongest movement specification (80-hour H-10 power reserve) and American heritage at $650-900. Longines offers deeper Swiss heritage (founded 1832) and COSC certification with the L888 movement\'s 72-hour reserve at $1,200-2,000. FrÃ©dÃ©rique Constant offers in-house movement manufacture at $900-1,500 with distinctive open-heart dial options. For sheer movement value, Hamilton. For heritage and certification, Longines. For in-house manufacture ambition, FC.',
      },
      {
        question: 'What is the FrÃ©dÃ©rique Constant Heart Beat watch?',
        answer: 'The Heart Beat is FC\'s signature design - a small aperture in the dial revealing the balance wheel oscillating beneath, providing a window into the movement\'s "heartbeat." This complication adds horological interest to traditional dress watch aesthetics without the cost of a full skeleton dial. It\'s available across the Classics and Slimline collections and is the most distinctive design element in FC\'s lineup. For buyers who want to see their movement working, the Heart Beat delivers this at a fraction of skeleton watch pricing.',
      },
    ],
  },
  {
    slug: 'vacheron-constantin',
    name: 'Vacheron Constantin',
    country: 'Switzerland',
    founded: 1755,
    watchBrand: 'Vacheron Constantin',
    heroFact: 'Founded in 1755 - the world\'s oldest continuously operating watchmaker. Every watch is hand-assembled and individually tested.',
    overview: `Vacheron Constantin is the world's oldest continuously operating watchmaker, founded in Geneva in 1755. For 270 years, the brand has epitomized Swiss horological excellence and is celebrated for ultra-complex movements, exceptional finishing, and an uncompromising commitment to in-house manufacture. Vacheron Constantin produces roughly 20,000 watches per year - a low volume that underscores its focus on exclusivity and craftsmanship over market penetration. The Overseas collection is the brand's modern sports watch, balancing steel construction with haute horlogerie finishing. The Patrimony represents dress watch tradition. Vacheron Constantin's Maltese cross logo and the Hallmark of Geneva certification (PoinÃ§on de GenÃ¨ve) signify quality that transcends price. For collectors seeking deep horological heritage and uncompromising manufacture standards, Vacheron Constantin remains the apex of Swiss watchmaking.`,
    faq: [
      {
        question: 'What makes Vacheron Constantin different from Rolex or Patek Philippe?',
        answer: 'All three are Geneva-based manufacture houses with extraordinary reputations, but they serve different markets. Rolex prioritizes tool watch robustness and resale value - producing 1 million watches/year with tight tolerances. Patek Philippe focuses on ultra-complex complications and precious metals - serving collectors seeking mechanical art. Vacheron Constantin occupies the middle ground: lower production volume than Rolex (20,000/year), simpler complications than Patek (though capable of very complex pieces), but with finishing and heritage that equals both. VC appeals to purists who value continuity, finishing, and the oldest pedigree.',
      },
      {
        question: 'Why is Vacheron Constantin so expensive?',
        answer: 'VC produces roughly 20,000 watches per year across all collections - one-twentieth Rolex\'s volume. This scarcity is intentional. The brand manufactures every component in-house (movements, cases, bracelets, dials, hands), a standard that requires enormous capital and expertise. Finishing standards (Perlage, beveling, PoinÃ§on de GenÃ¨ve hallmarking) are hand-applied by artisans, adding labor cost. Additionally, VC maintains that low volume supports pricing power - undersupply relative to demand is central to the brand\'s strategy.',
      },
      {
        question: 'Is the Overseas a good sports watch compared to Rolex Submariner?',
        answer: 'Yes, but they target different buyers. The Submariner is a professional dive tool with 300m WR and legendary durability; it\'s oversubscribed in the market and trades above retail. The Overseas is a luxury sports watch with integrated bracelet, 150m WR, and haute horlogerie finishing - more refined, less utilitarian. If you want a tool watch that will survive anything, choose Submariner. If you want a luxury sports watch with extraordinary finishing and heritage, Overseas is superior. The Overseas costs significantly more ($35k+ steel) but justifies it through in-house movements and pedigree.',
      },
      {
        question: 'Does Vacheron Constantin hold its value?',
        answer: 'Yes, but with important caveats. Steel sports models (Overseas) hold value well - around 70-80% of retail in the secondary market. Precious metal dress watches (Patrimony in gold or platinum) typically trade closer to material value, so resale is more commodity-dependent. Unlike Rolex, VC does not see secondary market premiums - watches rarely trade above retail. However, the brand\'s rarity, heritage, and finishing mean depreciation is modest compared to many Swiss brands. VC is best purchased for personal enjoyment rather than investment.',
      },
      {
        question: 'Where can I buy Vacheron Constantin?',
        answer: 'Vacheron Constantin watches are sold through authorized retailers worldwide and directly through Vacheron Constantin boutiques in major cities (Geneva, New York, London, Tokyo, Dubai, etc.). Unlike Rolex, there are no waitlists for most models - availability is generally good. Prices are manufacturer-set globally. The brand offers a five-year warranty and provides in-house service through authorized service centers. Pre-owned watches are available through specialist dealers and auction houses; expect to pay 70-80% of retail for recent models in good condition.',
      },
      {
        question: 'What is the Maltese cross on Vacheron Constantin watches?',
        answer: 'The Maltese cross is Vacheron Constantin\'s house emblem, appearing on the caseback, rotor, and dial of most models. It represents the brand\'s Geneva heritage and is a design element that has been part of VC since the 18th century. The cross is a symbol of precision, quality, and continuity - it reassures buyers that they own a piece of watchmaking history. Some VC models also carry the PoinÃ§on de GenÃ¨ve (Geneva Hallmark), an additional certification indicating that the movement meets strict finishing and accuracy standards.',
      },
    ],
  },
  {
    slug: 'nomos-glashutte',
    name: 'Nomos GlashÃ¼tte',
    country: 'Germany',
    founded: 1992,
    watchBrand: 'Nomos Glashutte',
    heroFact: 'The only German watchmaker designing and manufacturing all movements in-house - from simple automatics to complex complications - in the GlashÃ¼tte watchmaking district.',
    overview: `Nomos GlashÃ¼tte was founded in 1992 in the GlashÃ¼tte region of Germany, one of world's three great watchmaking centers alongside Switzerland and Japan. What distinguishes Nomos is its commitment to designing and manufacturing all movements entirely in-house - a rarity for any brand, and virtually unique among German independent makers. The Tangente collection showcases Nomos's design philosophy: Bauhaus-inspired minimalism, crystal-clear legibility, and mechanical honesty. Nomos produces watches at multiple price points, from accessible automatic Clubs ($1,200) to complex manual-wind Langematik pieces ($4,000+) and astronomical complications ($15,000+). The brand's in-house movements - Alpha, Beta, and Lambda families - are manufactured at Nomos's own facilities in GlashÃ¼tte. For design enthusiasts and movement purists who value modernism over tradition, Nomos represents the forefront of contemporary watchmaking.`,
    faq: [
      {
        question: 'What is unique about Nomos movements?',
        answer: 'Nomos manufactures 100% of its movements in-house - all designs, manufacturing, and assembly occur at the GlashÃ¼tte facility. This is exceptionally rare outside Switzerland. The Alpha (automatic), Beta (manual), and Lambda (complex) families are Nomos designs that reflect contemporary German engineering philosophy: efficiency, precision, and transparency. Unlike many brands using ETA/Sellita movements, every Nomos watch contains a proprietary Nomos caliber. This control over the supply chain ensures consistency and allows Nomos to offer warranty and service support without dependency on movement suppliers.',
      },
      {
        question: 'How does Nomos compare to Swiss minimalist brands like Junghans or Tissot?',
        answer: 'Nomos and Junghans are both German minimalists, but serve different tiers. Junghans focuses on accessible design (â‚¬800-2,000) and uses a mix of in-house and ETA movements. Nomos is positioned higher ($1,200-$15,000) with all in-house movements and more complex finishing. Tissot (Swiss) is even more accessible than Junghans and uses ETA movements. If you value pure minimalist design at entry prices, Junghans. If you want minimalism with in-house movement prestige at mid-tier, Nomos. If you want Swiss heritage, Tissot.',
      },
      {
        question: 'Is Nomos a good investment watch?',
        answer: 'Nomos watches hold value reasonably well - typically 60-70% of retail in the secondary market after a few years. Steel sports models (Club, Orion) depreciate less than precious metal dress pieces. Unlike Rolex or Patek Philippe, Nomos does not see secondary market premiums - watches rarely trade above retail. However, the in-house movements and German heritage provide stability. Nomos is best purchased for its design, engineering, and personal satisfaction rather than as a speculative investment.',
      },
      {
        question: 'What is GlashÃ¼tte?',
        answer: 'GlashÃ¼tte is a small town in Saxony, Germany, home to one of the world\'s three historic watchmaking centers. Founded in the 1800s as a German answer to Swiss dominance, GlashÃ¼tte became famous for precision and innovative design. It fell into decline during the East German era but has experienced a major revival since 1990. Today, GlashÃ¼tte is home to Nomos, A. Lange & SÃ¶hne, and other precision makers. The town is a UNESCO world heritage site and a pilgrimage destination for watch enthusiasts interested in German horological tradition.',
      },
      {
        question: 'Where can I buy Nomos?',
        answer: 'Nomos watches are sold through authorized dealers worldwide and directly through Nomos boutiques in major cities. There are no waitlists or allocation constraints - models are generally available. Prices are manufacturer-set globally. Nomos offers a two-year warranty and provides service through authorized service partners and Nomos directly. Pre-owned watches are available through specialist dealers; expect to pay 60-70% of retail.',
      },
      {
        question: 'Why is Nomos expensive compared to Japanese brands like Seiko?',
        answer: 'Seiko manufactures at massive scale and uses cost-optimized in-house movements (6R15, 7S26, etc.). Nomos is 50Ã— smaller and manufactures each component with hand-finishing for each movement. The Tangente, for example, uses the manually wound Beta movement with hand-beveled bridges - labor that Seiko automates. Additionally, Nomos carries the prestige and heritage of GlashÃ¼tte watchmaking, which commands a premium over mass-market Japanese production. You\'re paying for limited production, design heritage, and finishing precision.',
      },
    ],
  },
  {
    slug: 'halios',
    name: 'Halios',
    country: 'Canada',
    founded: 2011,
    watchBrand: 'Halios',
    heroFact: 'An independent Canadian microbrand designing exceptional in-house automatic watches at $1,500-3,000 with zero compromises on finishing or reliability.',
    overview: `Halios is an independent Canadian watchmaker founded in 2011 by Jason Lim, based in Vancouver. Despite its youth, Halios has built a cult following among watch enthusiasts for designing and manufacturing watches that rival Swiss brands in finishing while offering exceptional value. Every Halios watch is assembled and tested in-house, using proprietary cases, dials, and ETA/Sellita movements modified and finished to Halios specifications. The Seaforth is the flagship - a modern field watch with 300m water resistance and an integrated bracelet. The Psilons and Universa represent dress and dive complications. Halios produces roughly 300-500 watches per year, maintaining a personal connection with customers. The brand represents the best of contemporary microbrand culture: design-driven, customer-centric, and uncompromising on finishing despite small scale. For collectors seeking contemporary Canadian craft and design at mid-tier pricing, Halios is exceptional.`,
    faq: [
      {
        question: 'Why is a Canadian brand like Halios compared to Swiss watches?',
        answer: 'Because Halios\'s finishing and reliability standard exceeds Swiss brands at its price point. Halios is micro-production (300-500 watches/year), allowing every watch to be hand-assembled and individually tested. Cases are proprietary and finished in-house. Dials are sourced from specialized suppliers and finished by hand. Movements (ETA/Sellita base) are modified with custom rotor designs and hand-finishing. At $1,500-3,000, this level of finish is impossible from Swiss mass-production brands. Halios competes on design and execution, not heritage or resale value.',
      },
      {
        question: 'Is Halios reliable despite being a young brand?',
        answer: 'Yes. Every Halios watch is assembled in-house and tested before shipping, with a comprehensive warranty and direct customer support from the founder. The brand uses industry-standard ETA/Sellita movements (proven reliable) combined with proprietary case and dial engineering. Halios has been operating since 2011 - 15 years of production history - with strong community reputation. The brand is not a fly-by-night operation; it represents serious contemporary watchmaking.',
      },
      {
        question: 'How does Halios hold value?',
        answer: 'Halios watches hold value well in the secondary market - typically 70-80% of retail. The brand has strong collector following and limited supply (micro-production) supports secondary market stability. Unlike mass-market brands, Halios doesn\'t see depreciation drops because scarcity is intentional. Pre-owned Halios watches often sell within days on watch forums. However, there are no secondary market premiums - watches trade at or slightly below retail depending on condition and reference.',
      },
      {
        question: 'Is Halios a good watch for a first-time luxury purchase?',
        answer: 'Excellent. Halios offers in-house finishing and design at lower price points than established Swiss brands. You get hand-assembled watches, customer support from the designer, and strong secondary market liquidity. The learning curve is minimal - modern, legible designs with no complications. Halios is ideal for entry into contemporary independent watchmaking.',
      },
      {
        question: 'Where can I buy Halios?',
        answer: 'Halios watches are sold direct from the Halios website (halioswatches.com) and occasionally through select authorized retailers. Production is limited (300-500/year), so certain references sell out. The direct-to-consumer model keeps prices low and allows Jason (the founder) to build relationships with customers. Lead times are typically 2-4 months for new releases. Pre-owned watches are available through watch forums and specialist dealers.',
      },
      {
        question: 'Why is Halios harder to find than Swiss brands?',
        answer: 'Because Halios deliberately maintains limited production to preserve the quality and customer experience. A microbrand scaling to 5,000+ watches/year would lose the hand-assembly and personal customer interaction that define the brand. Scarcity is a design choice. You\'re purchasing access to an independent designer and craftsperson who stands behind every watch.',
      },
    ],
  },
  {
    slug: 'baltic',
    name: 'Baltic',
    country: 'France',
    founded: 2014,
    watchBrand: 'Baltic',
    heroFact: 'A French independent brand crafting neo-vintage watches with proprietary cases, dials, and hand-finishing - inspired by 1970s design at contemporary prices.',
    overview: `Baltic is a French independent watchmaker founded in 2014 by Yvan Arpa, based in Burgundy. Despite its youth, Baltic has established a cult following for neo-vintage aesthetic: watches that capture the spirit of 1970s and 1980s tool watches while incorporating contemporary manufacturing and finishing standards. Baltic designs proprietary cases and dials in-house, custom-finishing every dial with applied metal chapter rings and hand-printed text. The brand collaborates with small independent suppliers for movements, complications, and specialized finishing. Baltic represents the modern independent watchmaker: small production (1,000-2,000 watches/year), direct-to-consumer sales, and uncompromising design. The brand is known for limited releases (often 500-1,000 pieces) that sell out quickly, creating strong secondary market demand. For buyers seeking contemporary independent watchmaking with strong design and personal support, Baltic is a masterclass in microbrand execution. The brand also collaborates with watch designers and brands (Seagull movements, Ronda quartz) to create unique references. Baltic watches are known for strong QA, personal customer support, and a community-first approach that rivals Swiss mainstream brands in customer satisfaction.`,
    faq: [
      {
        question: 'What makes Baltic different from other independent microbrands?',
        answer: 'Baltic combines French design sensibility with Swiss/German manufacturing precision. The brand manufactures proprietary cases and dials in-house in Burgundy, hand-finishing every dial. Unlike other microbrands that source everything, Baltic controls case design, dial finishing, and movement selection - similar to established brands but at 1/10th the scale. This vertical integration is unusual for microbrands and explains the design consistency and quality control.',
      },
      {
        question: 'Is Baltic a serious watchmaker or a trend brand?',
        answer: 'Serious. Baltic has been operating for 11 years with 15,000+ watches delivered and strong customer retention. The brand invests continuously in tool development, dial finishing techniques, and movement partnerships. Limited production and sold-out references indicate demand exceeds supply - not a sign of trend cycling. Secondary market hold 75-85% of retail, similar to established microbrands like Halios or Seiko. The brand is profitable, small team (8-12 people), and reinvests in product development.',
      },
      {
        question: 'How do Baltic watches compare to Japanese and Swiss brands at the same price?',
        answer: 'Baltic watches are design-forward where Japanese brands (Seiko, Citizen) are conservative, and less prestigious than Swiss brands (Longines, Tissot) but with stronger community engagement. At $1,500-3,000, you choose: Japanese reliability and value, Swiss heritage and resale, or independent design and personality. Baltic buyers prioritize aesthetic and design over resale value - accepting 70-80% secondary market retention versus Swiss 85-90%. The tradeoff is justified by stronger designer input, limited production creating exclusivity, and direct access to the founder via email.',
      },
      {
        question: 'How many Baltic watches are produced per year?',
        answer: 'Approximately 1,500-2,000 watches per year. Most references are limited to 500-1,000 pieces globally. Production is intentionally constrained to maintain hand-finishing quality and community exclusivity. Many references sell out within 2-6 months of release. This artificial scarcity (combined with real production limits) drives secondary market demand - Baltic watches often appreciate 10-15% above retail in the first year post-release.',
      },
      {
        question: 'Are Baltic watches a good investment?',
        answer: 'Not primarily - Baltic watches should be purchased for design and wearing pleasure, not investment returns. However, limited production and sold-out references create strong secondary market demand. Expect 70-85% resale value depending on reference and condition. Some references have appreciated 10-20% above retail due to scarcity, but this is not guaranteed. The brand has only existed for 11 years - long-term value retention is unknown. Treat Baltic watches as wearable art with strong secondary market liquidity, not investment vehicles.',
      },
      {
        question: 'Where can I buy Baltic?',
        answer: 'Baltic watches are sold direct from the Baltic website (balticwatches.com) and through select authorized retailers in Europe and North America. Limited production means certain models sell out. The direct model keeps prices low and allows customer feedback to influence future designs. Lead times are typically 4-8 weeks for new releases. Pre-owned watches are available through watch forums and specialist dealers.',
      },
    ],
  },
  {
    slug: 'swatch',
    name: 'Swatch',
    country: 'Switzerland',
    founded: 1983,
    watchBrand: 'Swatch',
    heroFact: 'Founded in 1983, Swatch saved the Swiss watch industry from Japanese quartz dominance through affordable, colorful, plastic quartz watches. Over 100 million sold.',
    overview: `Swatch was founded in Switzerland in 1983 as a response to the Japanese quartz watch crisis that threatened Swiss watchmaking dominance. The brand\'s mission was radical: create affordable, plastic quartz watches that were colorful, fun, and distinctly Swiss. The strategy worked beyond expectations. Swatch has sold over 100 million watches and became a cultural icon - a watch as fashion statement rather than precision instrument. Swatch represents the polar opposite of luxury watchmaking: no complications, no heritage claims, no investment potential, but unmatched accessibility and personality. The brand is owned by the Swatch Group alongside Omega, Tissot, Longines, and Breitling. For buyers seeking affordable Swiss design and personality, Swatch is the entry point to Swiss watchmaking tradition. The brand has also evolved: Swatch has launched higher-end collections (Sistem51 with in-house automatic movement) and collaborations (with artists, musicians, and designers) that elevate the brand beyond pure casual wear.`,
    faq: [
      {
        question: 'Is a Swatch a "real" watch compared to Rolex or Omega?',
        answer: 'In terms of mechanism, yes - a Swatch keeps time and is assembled with precision. In terms of heritage, prestige, and investment, no. Swatch is intentionally fun, disposable, and trend-driven - you buy a Swatch for personality and price point, not for ownership legacy. The brand has no pretense; this is its strength. Swatch is perfect for fashion watch wearers, casual users, and first-time watch buyers. It\'s not designed to compete with luxury watchmaking - it\'s its own category.',
      },
      {
        question: 'Does Swatch hold its value?',
        answer: 'No. Swatch watches are designed for seasonal wear, fashion rotation, and collection-building on a budget. Resale value is minimal - a $50 Swatch rarely sells for more than $10-15 secondhand. This is by design; Swatch embraces disposability as a feature, not a bug. You\'re not buying investment; you\'re buying personality and access to Swiss design at impulse-purchase prices. Viewing Swatch through a resale lens misses the point entirely.',
      },
      {
        question: 'What is Swatch Sistem51?',
        answer: 'Sistem51 is Swatch\'s higher-end collection, featuring a fully automated in-house automatic movement with 51 parts - vs. 150+ for traditional Swiss automatics. Sistem51 watches retail at $150-300, positioning them between casual Swatch and true luxury. The movement is manufactured by robot and optimized for durability and ease of service. Sistem51 represents Swatch\'s attempt to introduce horological seriousness while maintaining affordability and Swiss manufacture. It\'s the intersection of traditional watchmaking and contemporary manufacturing philosophy.',
      },
      {
        question: 'Who should buy a Swatch?',
        answer: 'Anyone who enjoys watches as fashion, wants to experiment with design without spending $1,000+, or seeks an entry point to Swiss watchmaking culture. Swatch is ideal for collectors who want to own multiple watches and rotate them seasonally. It\'s also perfect for first-time watch buyers who want to learn basics without financial commitment. Swatch is not for collectors seeking investment potential or horological depth.',
      },
      {
        question: 'Where can I buy Swatch?',
        answer: 'Swatch watches are ubiquitous - sold at Swatch boutiques, department stores, online retailers, and watch specialists worldwide. Retail is $40-150 depending on collection. Availability is unlimited; no waitlists or scarcity. Swatch offers a two-year warranty and direct customer support. Pre-owned Swatches are available at minimal markups on secondary marketplaces.',
      },
      {
        question: 'Can I service or repair a Swatch?',
        answer: 'Swatch authorized service centers will repair Swatch watches, though repair costs ($40-100 for battery changes, $100-300 for movement service) can exceed the original purchase price. For casual users, this isn\'t economically rational - you\'d simply buy a new watch. For Sistem51 models, service is more straightforward due to the simplified movement design. Swatch watches are not designed for long-term ownership and service - they\'re designed for personality and value at purchase point.',
      },
    ],
  },
  {
    slug: 'mido',
    name: 'Mido',
    country: 'Switzerland',
    founded: 1918,
    watchBrand: 'Mido',
    heroFact: 'Founded 1918 in Switzerland, Mido specializes in durable, minimalist watches with legendary reliability and water resistance - especially known for the Multifort.',
    overview: `Mido was founded in Switzerland in 1918 with a mission: create watches that emphasize practical durability and reliability over decoration. This philosophy endures today. Mido is owned by the Swatch Group and competes in the affordable-Swiss segment ($500-1,500) with models like the Multifort (300m water-resistant field watch) and Ocean Star (dive watches). Mido emphasizes tool watch functionality, robust cases, and ETA movements (modified to Mido specifications) rather than in-house complications. The brand is known for extraordinary water resistance - Mido field watches are genuinely 300m-capable. For buyers seeking Swiss manufacturing, proven reliability, and practical sports watches without the Rolex or Omega price premium, Mido is exceptional. The brand is less fashionable than Swatch but more approachable than luxury brands, occupying a sweet spot for serious, understated watch enthusiasts.`,
    faq: [
      {
        question: 'What makes Mido different from Tissot or Hamilton?',
        answer: 'All three are affordable Swiss brands (Swatch Group), but with different philosophies. Mido emphasizes durability and water resistance - a 300m Mido is genuinely dive-capable. Tissot focuses on wider design range (dress to sport) with broader appeal. Hamilton emphasizes American heritage and movement specs (80-hour power reserves). If you want robust sports watches and practical water resistance, Mido. If you want design variety, Tissot. If you want heritage story, Hamilton.',
      },
      {
        question: 'Is Mido considered Swiss-made?',
        answer: 'Yes - Mido watches are designed and cased in Switzerland and use Swiss movements (modified ETA calibers). "Swiss Made" regulations require movement assembly in Switzerland, and Mido meets this standard. The brand does not manufacture movements from scratch like Rolex or Omega - Mido uses industry-standard ETA/Sellita movements sourced from parent company Swatch Group. However, all assembly and finishing occur in Switzerland.',
      },
      {
        question: 'Does Mido hold its value?',
        answer: 'Moderately. Mido watches typically depreciate to 65-75% of retail after a few years. The brand is stable but not collected like Rolex - there are no secondary market premiums. However, used Mido field watches (Multifort, Ocean Star) have reliable secondary market demand because they\'re practical tools that remain relevant. Pre-owned Midso watches sell steadily on forums and specialist dealers.',
      },
      {
        question: 'Is a Mido Multifort a good value sports watch?',
        answer: 'Excellent. The Multifort offers 300m water resistance, ETA movement, robust steel case, and modern design at $600-900. For comparison, Rolex Submariner is $9,100+ and Omega Seamaster is $5,900+. The Multifort is genuinely 300m-capable and will outlast you. You sacrifice brand prestige and resale value but gain practical durability at a rational price. For work watches or beater sports watches, Mido is exceptional value.',
      },
      {
        question: 'Where can I buy Mido?',
        answer: 'Mido watches are sold through authorized retailers worldwide, Swatch Group boutiques, and online specialists. Availability is excellent - no waitlists. Prices are manufacturer-set globally. Mido offers a two-year warranty and service through authorized service partners. Pre-owned watches are available through watch forums and specialist dealers at 65-75% of retail.',
      },
      {
        question: 'Is Mido underrated as a sports watch brand?',
        answer: 'Absolutely. Mido doesn\'t have the cultural cachet of Rolex or the technological prestige of Omega, so it\'s overlooked by casual watch shoppers. However, serious users and collectors recognize that Mido delivers exceptional durability and water resistance for the price. A Mido Multifort at $700 is arguably better value than most $2,000 mid-tier sports watches. Underrated status is part of Mido\'s appeal - you own a quality tool without the premium markup.',
      },
    ],
  },
  {
    slug: 'christopher-ward',
    name: 'Christopher Ward',
    country: 'United Kingdom',
    founded: 2004,
    watchBrand: 'Christopher Ward',
    heroFact: 'A British independent brand designing contemporary watches with proprietary cases, hand-finishing, and exceptional value - priced 30-40% below Swiss equivalents.',
    overview: `Christopher Ward is a British independent watchmaker founded in 2004 by Christophe Claret and Ward Donovan, based in Worthing. The brand's philosophy: design watches that offer premium finishing and proprietary case engineering at 30-40% below Swiss luxury prices. Every Christopher Ward watch is assembled and tested in-house, using proprietary cases and dials combined with modified ETA/Sellita movements. The C60 is the flagship dive watch (300m, integrated bracelet, hand-finishing) at Â£1,895 (~$2,400 USD) - equivalent in capability to Rolex Submariner but at one-quarter the price. The Trident and Apex collections represent dress and field traditions. Christopher Ward maintains a direct-to-consumer model, eliminating retailer margins and passing savings to customers. The brand has built a passionate UK and European following by consistently delivering on the promise: contemporary design, proprietary engineering, and transparency pricing without the luxury brand tax. For international buyers seeking British-made watches and exceptional value, Christopher Ward represents the best of contemporary independent watchmaking.`,
    faq: [
      {
        question: 'How does Christopher Ward compare to Rolex at one-quarter the price?',
        answer: 'Christopher Ward trades some prestige for value. The C60 offers 300m water resistance, proprietary steel case, hand-finished movement, and modern design - equivalent to a Rolex Submariner in capability. However, Rolex carries cultural prestige, secondary market premiums, and the weight of 100+ years of heritage. Christopher Ward trades brand name for design singularity and transparent pricing. If you value prestige and resale, Rolex. If you value finishing, design, and rational pricing, Christopher Ward.',
      },
      {
        question: 'Is Christopher Ward hand-assembled in the UK?',
        answer: 'Yes - every watch is assembled and tested in-house at the Worthing facility in England. Cases and dials are proprietary designs manufactured to Christopher Ward specifications. Movements are modified ETA/Sellita calibers, hand-finished by CW technicians. Unlike mass-market brands using automated assembly, every CW watch sees human hands during assembly and QC. This hand-assembly standard is exceptional at the CW price point.',
      },
      {
        question: 'Does Christopher Ward hold its value?',
        answer: 'Yes, well. Christopher Ward watches typically hold 70-80% of retail value in the secondary market. The brand has a devoted collector following and limited production (roughly 3,000-5,000/year) supports secondary market stability. Pre-owned CW watches sell reliably on watch forums and specialist dealers. Unlike Rolex, there are no secondary market premiums, but depreciation is modest.',
      },
      {
        question: 'Why is Christopher Ward not as well-known as Swiss brands?',
        answer: 'Brand visibility and marketing budget. Switzerland has centuries of heritage marketing advantage. Christopher Ward was founded in 2004 and competes against 100+ year old brands with massive marketing spend. The brand has chosen direct-to-consumer sales, which limits retail visibility compared to authorized dealer networks. However, within watch enthusiast communities, CW is highly respected for value and design.',
      },
      {
        question: 'Where can I buy Christopher Ward?',
        answer: 'Christopher Ward watches are sold direct from the Christopher Ward website (christopherward.com) and through select authorized retailers. The direct model keeps prices low - no retailer markup. Availability is generally good; limited production means certain references sell out. Lead times are typically 4-8 weeks for new releases. Pre-owned watches are available through watch forums and specialist dealers.',
      },
      {
        question: 'Should I buy Christopher Ward or Omega?',
        answer: 'Christopher Ward C60: Â£1,895 (~$2,400), proprietary case, hand-finished movement, contemporary design, less brand prestige. Omega Seamaster: $5,900, Master Chronometer certification, 15,000 gauss anti-magnetic, 170+ years heritage, significant prestige. Christopher Ward offers equivalent capability at 40% of Omega price, sacrificing heritage and certification. If budget is under $3,000, CW is superior value. If you value horological credentials and brand prestige, Omega. If budget is under $2,500, Christopher Ward is the only viable choice.',
      },
    ],
  },
  {
    slug: 'alpina',
    name: 'Alpina',
    country: 'Switzerland',
    founded: 1883,
    watchBrand: 'Alpina',
    heroFact: 'Founded in 1883, Alpina pioneered the concept of the modern sports watch — their 1938 Alpina 4 defined the specifications (steel case, anti-shock, anti-magnetic, waterproof) that the entire industry later adopted.',
    overview: `Alpina was founded in 1883 in Geneva and holds a unique place in watch history: in 1938, the brand introduced the Alpina 4, a watch that established the four pillars of the modern sports watch — stainless steel case, anti-shock, anti-magnetic, and water resistance. These specifications were revolutionary, and the entire Swiss watch industry eventually adopted them as standard. Today Alpina produces in two main lines: the Alpiner collection (field and sports watches) and the Seastrong collection (dive watches), both carrying the brand's commitment to robust, practical tool watches. Alpina uses Swiss ETA-based movements and manufactures at its facility in Plan-les-Ouates, Geneva. At $800–2,500, Alpina sits between entry-level Swiss (Tissot, Mido) and luxury (Omega, IWC) — offering Swiss manufacture, clean design, and genuine sports capability without luxury premiums. For buyers who want real watch history behind their tool watch, Alpina's 1938 heritage is unmatched.`,
    faq: [
      {
        question: 'What is the Alpina 4 and why does it matter?',
        answer: 'The Alpina 4 (1938) defined the four requirements of the modern sports watch: stainless steel case, anti-shock protection, anti-magnetic resistance, and water resistance. Before Alpina, these features were rare or non-existent in combination. After the Alpina 4, the Swiss industry adopted these as standard specifications. Virtually every sports watch you own — Rolex Submariner, Omega Seamaster, Tudor Black Bay — owes its specification philosophy to Alpina\'s 1938 innovation.',
      },
      {
        question: 'How does Alpina compare to Tissot or Mido?',
        answer: 'All three are mid-range Swiss brands, but with different positioning. Tissot is the largest and most visible, with the broadest model range and strong marketing. Mido specializes in durability and field watch capability. Alpina is the most historically significant — the brand that invented the modern sports watch specification. At similar price points ($800–1,500), Alpina offers deeper heritage and a more focused product range oriented around field and dive watches. If history matters to you, Alpina. If design variety matters, Tissot.',
      },
      {
        question: 'Are Alpina watches good value?',
        answer: 'Yes. Alpina watches at $800–1,500 deliver Swiss manufacture, genuine sports capability (200–300m water resistance), ETA-based movements, and 140+ years of brand heritage. You\'re not paying for prestige like Rolex or Omega — you\'re paying for Swiss tool watch capability at a rational price. Resale value is moderate (60–70% of retail), typical for mid-range Swiss brands. Alpina is best purchased for daily wearing and use, not investment.',
      },
      {
        question: 'Where can I buy Alpina?',
        answer: 'Alpina watches are sold through authorized retailers worldwide, the Alpina website, and major watch specialists. Availability is generally good — no waitlists or scarcity. Alpina offers a two-year warranty and service through authorized service centers. Pre-owned watches are available through watch forums and specialist dealers at 60–70% of retail.',
      },
    ],
  },
  {
    slug: 'laco',
    name: 'Laco',
    country: 'Germany',
    founded: 1925,
    watchBrand: 'Laco',
    heroFact: 'One of only five brands approved by the German Luftwaffe to supply pilot watches in World War II — Laco\'s B-Uhr (observer\'s watch) design remains the defining reference for aviation watches.',
    overview: `Laco was founded in 1925 in Pforzheim, Germany — the center of German watchmaking at the time. The brand became one of the five official suppliers of the German Luftwaffe B-Uhr (Beobachtungsuhr, or observer's watch) during World War II. These large-format (55mm) aviation watches with inner rotating bezels and onion-crown winding systems set the template for the modern pilot watch. Every significant pilot watch today — IWC Pilot, Longines HydroConquest, Bell & Ross BR01 — references the B-Uhr design specification that Laco helped establish. Today Laco produces direct re-editions of the original Luftwaffe specifications alongside modern interpretations in their Sport and Edition lines. The brand manufactures in-house in Pforzheim, using Swiss ETA movements in traditional German cases. At $500–1,500, Laco represents exceptional value for buyers seeking genuine aviation watch heritage without paying IWC or Breitling prices. For pilot watch enthusiasts, owning a Laco is owning a piece of the original reference.`,
    faq: [
      {
        question: 'What is a B-Uhr and why does it matter?',
        answer: 'B-Uhr stands for Beobachtungsuhr (observer\'s watch) — the specification the German Luftwaffe required for navigation watches in WWII. Requirements included: 55mm diameter (readable in cockpit gloves), oversized onion crown for gloved winding, subsidiary seconds dial, and exceptional legibility. Laco was one of five approved suppliers (alongside IWC, Lange, Stowa, and Wempe). The B-Uhr\'s design logic — uncluttered dial, oversized numerals, practical case — became the template for every aviation watch made since.',
      },
      {
        question: 'How does Laco compare to IWC or Breitling for pilot watches?',
        answer: 'Laco, IWC, and Breitling all produce pilot watches, but at very different price points and prestige levels. IWC Pilot watches are $4,000–20,000+, carrying brand prestige and modern manufacture. Breitling Navitimer is $5,000–8,000 with aerospace chronograph history. Laco pilots are $500–1,500 with deeper historical authenticity (actual WWII Luftwaffe supplier) at a fraction of the price. If you want pilot watch history at an honest price, Laco. If you want brand prestige, IWC or Breitling.',
      },
      {
        question: 'Are Laco watches German-made?',
        answer: 'Yes — Laco watches are designed and cased at their facility in Pforzheim, Germany. Movements are Swiss ETA calibers (industry standard). Case manufacturing, dial production, and final assembly all occur in Pforzheim. The brand is genuinely German in manufacture and heritage, unlike some brands that claim European heritage while outsourcing production. Pforzheim has a centuries-long jewelry and watchmaking tradition.',
      },
      {
        question: 'Should I buy a Laco or a modern pilot watch from a bigger brand?',
        answer: 'If authentic pilot watch heritage is your priority — Laco is the answer. You\'re buying one of the five original Luftwaffe-approved watch families. If brand prestige and contemporary complications matter more, IWC or Breitling. Laco\'s value proposition is unbeatable for the history: $800 for a direct descendant of the original B-Uhr specification, made in Pforzheim. No other brand can offer that combination at that price.',
      },
      {
        question: 'Where can I buy Laco?',
        answer: 'Laco watches are sold through authorized retailers in Europe and North America, and directly from the Laco website (laco.de). Availability is generally good. Laco offers a two-year warranty and service through authorized centers and directly from Pforzheim. Pre-owned watches are available through watch forums at 65–75% of retail.',
      },
    ],
  },
  {
    slug: 'orient',
    name: 'Orient',
    country: 'Japan',
    founded: 1950,
    watchBrand: 'Orient',
    heroFact: 'Orient manufactures its own movements entirely in-house — including the movement, case, dial, and bracelet — making it the only brand producing fully in-house watches at under $300.',
    overview: `Orient was founded in 1950 in Tokyo and is today owned by Seiko Epson. The brand occupies a unique position in watchmaking: it produces fully in-house automatic movements at entry-level prices ($100–500). No other watchmaker — not Tissot, not Hamilton, not even entry-level Omega — manufactures the movement, case, dial, and bracelet entirely in-house at Orient's price point. This vertical integration produces remarkable value: an Orient Bambino or Mako at $150–200 contains a genuine Japanese in-house automatic movement, finished metal bracelet, and solid case — capabilities that would cost 3–5× more from a Swiss brand. Orient specializes in three families: Bambino (dress watches, open heart), Mako (dive watches, 200m), and Orient Star (elevated finishing, exhibition caseback). The brand represents the apex of value in mechanical watchmaking — a fully in-house automatic for the price of most quartz watches.`,
    faq: [
      {
        question: 'Does Orient really make its own movements?',
        answer: 'Yes. Orient manufactures its own automatic movements entirely in-house at its Tokyo facility — every component, from the mainspring to the rotor. This is exceptional at $150–300. By comparison, Tissot and Hamilton (Swiss, $300–800) use ETA/Sellita movements from external suppliers. Seiko, Orient\'s parent company, also manufactures in-house. This tradition of Japanese vertical integration produces movements that perform reliably for decades with basic maintenance.',
      },
      {
        question: 'How does Orient compare to Seiko?',
        answer: 'Both are Japanese in-house manufacturers. Seiko is larger, more prestigious, and covers a wider range ($100 SNK to $5,000+ Grand Seiko). Orient is positioned at the entry level of in-house manufacturing ($100–500). The Orient caliber F6922 (Mako) and F4750 (Bambino) are simpler than mid-range Seiko movements but offer comparable reliability. Orient is the best answer to "I want an in-house automatic on a budget." If you want more design variety or prestige, Seiko. If you want the most movement for the money, Orient.',
      },
      {
        question: 'Are Orient watches reliable long-term?',
        answer: 'Extremely. Orient movements are known for decade-spanning reliability with basic servicing (every 5–7 years). The in-house calibers are robust and well-proven — Orient has been making the same core movement families since the 1970s with incremental improvements. User reports of Orient watches running accurately after 20+ years without servicing are common, though not recommended practice. For daily beaters, Orient movements are among the most durable available.',
      },
      {
        question: 'What is the best Orient watch for a first automatic?',
        answer: 'The Orient Mako II (dive, $180) or Orient Bambino (dress, $150) are the classic starting points. Mako: 200m water resistance, solid bracelet, clear dial — a legitimate dive watch at entry price. Bambino: dress aesthetic, open heart option, curved case — a formal watch at casual prices. Both run Orient\'s in-house F6922 movement. For something elevated with exhibition caseback, Orient Star ($400–600) offers superior finishing and the same in-house reliability.',
      },
      {
        question: 'Where can I buy Orient?',
        answer: 'Orient watches are widely available through Amazon, authorized retailers, and watch specialists worldwide. Seiko/Orient authorized dealer networks are extensive. Prices are stable globally. Orient offers a two-year warranty and service through authorized centers. Pre-owned Orient watches are widely available at 50–70% of retail — the brand\'s accessibility makes secondary market prices competitive.',
      },
    ],
  },
  {
    slug: 'bulova',
    name: 'Bulova',
    country: 'United States',
    founded: 1875,
    watchBrand: 'Bulova',
    heroFact: 'Bulova\'s Accutron (1960) was the world\'s first fully electronic watch, using a vibrating tuning fork instead of a balance wheel — accurate to within one minute per month, 10× better than any mechanical watch of the era.',
    overview: `Bulova was founded in New York City in 1875 by Joseph Bulova, a Czech immigrant. For most of the 20th century, Bulova was America's largest watch manufacturer — producing watches for the US military in both World Wars and setting broadcast history by airing the world's first television commercial in 1941. The brand's greatest technical achievement was the Accutron (1960): the first fully electronic watch, using a vibrating tuning fork at 360Hz to replace the traditional balance wheel. The Accutron was accurate to within one minute per month — 10× better than mechanical movements of the era — and was used in early spacecraft, including NASA Apollo missions. Today Bulova is owned by Citizen and produces across multiple lines: the Accutron revival (with updated electronic tuning fork movement), the Precisionist collection (ultra-high frequency quartz at 262kHz), and the classic Automatic line. Bulova occupies the sweet spot between accessible ($200–600) and heritage-rich — for buyers who want American watchmaking history at affordable prices.`,
    faq: [
      {
        question: 'What is the Bulova Accutron and why is it significant?',
        answer: 'The Accutron (1960) was the world\'s first fully electronic watch — it replaced the traditional balance wheel with an electronically driven tuning fork vibrating at 360Hz. This produced accuracy of ±1 minute per month, compared to ±1–2 minutes per day for mechanical watches. NASA used Accutron movements in instrumentation for early spacecraft. Bulova has revived the Accutron name with a modern electrostatic movement (not tuning fork), continuing the brand\'s legacy of electronic innovation. Owning an Accutron is owning American watch engineering history.',
      },
      {
        question: 'What is the Bulova Precisionist?',
        answer: 'The Precisionist uses a proprietary high-frequency quartz oscillator at 262kHz — 8× faster than standard quartz — producing accuracy of ±10 seconds per year (standard quartz: ±15 seconds/month). The sweep second hand moves 16 times per second, giving it the appearance of a continuous sweep rather than the tick of standard quartz. The Precisionist is Bulova\'s modern technical statement: American engineering producing Swiss-beating accuracy at $200–500. It\'s one of the most accurate non-radio-controlled watches available.',
      },
      {
        question: 'Is Bulova considered a luxury brand?',
        answer: 'No — Bulova is a premium American brand, not a luxury brand. Price points ($200–700) and ownership structure (Citizen-owned) position Bulova as a step above mass-market (Seiko entry, Casio) but well below Swiss luxury (Omega, IWC). However, Bulova\'s American heritage (1875), military history, and technical innovations (Accutron, Precisionist) give it a historical significance that pure price comparison misses. You\'re not buying prestige — you\'re buying 150 years of American watchmaking.',
      },
      {
        question: 'How does Bulova compare to Seiko at similar prices?',
        answer: 'At $200–400, Bulova and Seiko are direct competitors. Seiko offers in-house automatic movements and Japanese manufacturing tradition. Bulova offers American heritage, the Precisionist\'s technical superiority in quartz, and the Accutron revival\'s unique electronic movement. For automatic watches, Seiko wins on movement quality at similar prices. For quartz accuracy and American heritage, Bulova Precisionist is unmatched. Both are excellent values — choose based on movement preference (automatic vs. high-frequency quartz) and heritage interest.',
      },
      {
        question: 'Where can I buy Bulova?',
        answer: 'Bulova watches are widely available through department stores, authorized retailers, and major online platforms. Prices are stable. Bulova offers a two-year warranty and service through Citizen (parent company) authorized centers. Pre-owned Bulova watches are widely available at 40–60% of retail — the brand\'s accessibility and heritage models (vintage Accutron) have strong collector interest.',
      },
    ],
  },
  {
    slug: 'zodiac',
    name: 'Zodiac',
    country: 'Switzerland',
    founded: 1882,
    watchBrand: 'Zodiac',
    heroFact: 'Zodiac produced the Sea Wolf in 1953 — one of the world\'s first purpose-built dive watches, preceding the Rolex Submariner by one year and setting the standard for modern dive watch design.',
    overview: `Zodiac was founded in Le Locle, Switzerland in 1882 and occupies a quietly significant place in watch history. The brand introduced the Sea Wolf in 1953 — one of the world's first purpose-built diving watches, with 200m water resistance and a rotating inner bezel, predating the Rolex Submariner (1954) by a year. Zodiac also produced the Sea Dragon in 1960, which featured a helium escape valve — another innovation later associated with other dive watch brands. Today Zodiac is owned by Fossil Group and focuses on vintage-revival design: modern re-editions of the Sea Wolf and Super Sea Wolf, capturing the aesthetic of 1960s–70s Swiss dive watches at $400–800. Zodiac does not manufacture in-house — Swiss ETA movements power modern references — but the design authenticity and historical legitimacy are genuine. For buyers who want vintage dive watch aesthetics with verified historical roots and without the $5,000+ premium of collector pieces, Zodiac occupies a unique position.`,
    faq: [
      {
        question: 'Is Zodiac the original dive watch brand?',
        answer: 'One of the original three. Blancpain Fifty Fathoms (1953), Rolex Submariner (1954), and Zodiac Sea Wolf (1953) were the first purpose-built dive watches. The Sea Wolf predates the Submariner by approximately one year and was the first production watch with a rotating inner bezel for dive timing. Zodiac\'s contribution to dive watch history is historically documented and legitimate — not a marketing claim.',
      },
      {
        question: 'How does Zodiac compare to modern dive watch brands?',
        answer: 'Zodiac is positioned as a vintage-revival brand at entry-to-mid pricing ($400–800). Modern dive watches from Seiko (SKX, Turtle), Orient (Mako), and Citizen (Promaster) offer comparable capability at similar prices with stronger movement credentials (in-house for Seiko/Orient). Omega Seamaster and Rolex Submariner carry far more prestige at much higher prices. Zodiac\'s unique value is historical authenticity — if you want to wear a brand that genuinely invented modern dive watch design, Zodiac is the answer. If movement quality is the priority, Seiko at similar prices.',
      },
      {
        question: 'Are Zodiac watches made in Switzerland?',
        answer: 'Zodiac uses Swiss ETA movements (meeting Swiss Made standards), but the brand is owned by Fossil Group (American). Case manufacturing and final assembly specifics vary by collection. The "Swiss Made" designation on Zodiac watches is legitimate (movement assembled in Switzerland), but the brand is not independently Swiss-owned. For buyers who care about ownership structure vs. manufacturing origin, this distinction matters.',
      },
      {
        question: 'Does Zodiac hold its value?',
        answer: 'Moderately — typically 55–70% of retail after a few years. Zodiac doesn\'t have the collector following of Rolex or Omega, and Fossil Group ownership limits prestige. However, original vintage Zodiac Sea Wolf models (1950s–70s) have strong collector interest and appreciate significantly. Modern re-editions are less collected but retain reasonable secondary market demand. Zodiac is purchased for design appreciation and historical interest, not investment.',
      },
      {
        question: 'Where can I buy Zodiac?',
        answer: 'Zodiac watches are sold through authorized retailers, department stores, and the Zodiac website (zodiacwatches.com). Availability is generally good. Zodiac offers a two-year warranty and service through Fossil Group authorized centers. Pre-owned modern Zodiac watches are available at 55–70% of retail; vintage Sea Wolf models command collector premiums.',
      },
    ],
  },
]



