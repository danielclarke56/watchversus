import type { Metadata } from 'next'
import Link from 'next/link'
import { Container } from '@/components/ui/Container'
import { VerdictCallout } from '@/components/ui/VerdictCallout'

// FAQ items for schema
const faqItems = [
  {
    question: 'Should I buy a new Rolex or pre-owned?',
    answer: `The choice depends on your priorities. Buy new if you want full warranty coverage, peace of mind regarding service history, and the prestige of ownership from day one. Buy pre-owned if you seek better value, access to discontinued models, and faster acquisition without waiting on dealer lists. Most collectors benefit from a mix: new sports models you plan to wear daily, pre-owned dress watches from the secondary market.`,
  },
  {
    question: 'What warranty coverage do I lose buying pre-owned?',
    answer: `A pre-owned Rolex typically comes with no manufacturer warranty (Rolex warrants only the original purchaser). Your recourse is the seller's guarantee, which varies: 30–90 days for reputable dealers, none for private sales. However, Rolex service remains available; the watch simply requires payment for maintenance. Many collectors accept this trade-off for 20–40% savings. Authorized dealers may offer certified pre-owned with extended warranty—a middle ground worth exploring.`,
  },
  {
    question: 'How do I authenticate a pre-owned Rolex?',
    answer: `Buy from reputable dealers (WatchBox, Tourneau, Chrono24's trusted sellers) with authentication guarantees. Never purchase directly from unknown private sellers. Indicators: serial numbers should match Rolex's production dates, dial printing must be crisp, movement engravings precise. Counterfeits exist at every price point. Invest $50–$150 in third-party authentication (Rolex forums, watchmakers) before committing to high-value purchases. When in doubt, pass.`,
  },
  {
    question: 'Why do new Rolex prices keep increasing?',
    answer: `Rolex increases prices annually (2–3% typical), driven by material costs, labor inflation, and strong demand. A 2023 Submariner at $9,600 cost $8,400 just three years prior. These increases are built into the watch's value proposition—owning at retail price is partly an inflation hedge. This is why pre-owned watches offer better value: you sidestep future increases and immediately access current-generation specifications.`,
  },
  {
    question: 'Do new Rolex watches hold value better than pre-owned?',
    answer: `Both hold value well (80–90% retention over 5 years), but the dynamics differ. A new watch depreciates most in year one (5–10%), then stabilizes. A pre-owned watch has already absorbed initial depreciation, so it holds steady or appreciates if you buy smartly (discontinued models, rare references). Neither is an investment—neither appreciate above inflation—but both resist catastrophic loss better than most luxury goods.`,
  },
  {
    question: 'What are the best pre-owned Rolex models for value?',
    answer: `Discontinued Submariner references, Datejusts with interesting dials, Sea-Dwellers, and GMT-Master IIs from the 1990s–2010s hold value exceptionally well. Avoid obvious fakes and heavily serviced examples. Modern sports models (2015+) offer the best warranty recovery if purchased from certified dealers. When buying pre-owned, focus on references still in demand on the secondary market; obscure vintage models may be difficult to sell if your plans change.`,
  },
]

// Metadata
export const metadata: Metadata = {
  title: 'Rolex New vs Pre-Owned Buying Guide | Which is Right for You?',
  description: 'Complete guide to buying Rolex watches new vs pre-owned. Learn about pricing, warranty coverage, authentication, value preservation, and expert buying advice for Rolex Submariner, Daytona, GMT-Master, and more.',
  keywords: ['Rolex buying guide', 'new vs pre-owned Rolex', 'Rolex authentication', 'pre-owned Rolex watches', 'Rolex pricing', 'Rolex warranty', 'Rolex dealer guide', 'buying Rolex secondhand'],
  openGraph: {
    title: 'Rolex New vs Pre-Owned: Complete Buying Guide',
    description: 'Expert advice on purchasing Rolex watches: new vs pre-owned comparison, authentication tips, pricing, and value preservation.',
    type: 'website',
    images: [{
      url: 'https://watchvswatch.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'Rolex buying guide',
    }],
  },
}

export default function RolexBuyingGuidePage() {
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
                  { '@type': 'ListItem', position: 2, name: 'Guides', item: 'https://watchvswatch.com/guides' },
                  {
                    '@type': 'ListItem',
                    position: 3,
                    name: 'Rolex New vs Pre-Owned Buying Guide',
                    item: 'https://watchvswatch.com/guides/rolex-new-vs-pre-owned-buying-guide',
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
          <Link href="/guides" className="hover:text-slate-800 transition-colors">Guides</Link>
          <span>/</span>
          <span className="text-slate-900">Rolex New vs Pre-Owned Buying Guide</span>
        </nav>

        {/* SEO Introduction */}
        <p className="text-slate-700 text-base leading-relaxed mb-8 max-w-3xl">
          Rolex watches represent some of the world's most coveted timepieces, combining Swiss precision engineering with legendary reliability and design. But when it comes to purchasing a Rolex, one critical decision awaits: do you buy new from an authorized dealer or pre-owned from the secondary market? This comprehensive guide breaks down the pros, cons, pricing, warranty implications, and value preservation factors to help you make an informed decision aligned with your budget and priorities.
        </p>

        {/* Verdict Callout */}
        <VerdictCallout 
          winnerName="The Right Choice Depends on Your Goals" 
          verdictSummary="Buy new for warranty peace-of-mind and latest specifications. Buy pre-owned to save 20–40%, access discontinued models, and avoid dealer waitlists. Most collectors benefit from both strategies: new sports watches for daily wear, pre-owned dress watches and vintage references for the collection."
        />

        {/* Introduction Section */}
        <section id="introduction" className="max-w-4xl mx-auto my-12">
          <h2 className="text-3xl font-black text-slate-900 mb-6">Why This Decision Matters</h2>
          <p className="text-slate-700 text-lg leading-relaxed mb-6">
            Purchasing a Rolex is not a casual transaction. These watches command premiums ranging from $6,000 to over $50,000, with rare vintage and sports references sometimes exceeding six figures. A single decision—new or pre-owned—can save or cost you thousands of dollars while dramatically affecting your ownership experience.
          </p>
          <p className="text-slate-700 text-lg leading-relaxed mb-6">
            The decision is further complicated by Rolex's controlled distribution model. Authorized dealers maintain long waitlists for popular sports models (Submariner, Daytona, GMT-Master II), sometimes extending 2–5 years. Meanwhile, the pre-owned market offers immediate access to the exact reference you want—but at the cost of warranty and the risk of counterfeit products if you're not careful.
          </p>
          <p className="text-slate-700 text-lg leading-relaxed">
            Understanding the full spectrum of implications—not just the price tag—empowers you to choose the path that aligns with your values, timeline, and financial situation.
          </p>
        </section>

        {/* New Rolex Section */}
        <section id="new-rolex" className="max-w-4xl mx-auto my-12">
          <h2 className="text-3xl font-black text-slate-900 mb-6">Buying a New Rolex: Pros and Cons</h2>
          
          <h3 className="text-2xl font-bold text-slate-900 mb-4 mt-8">Advantages of Buying New</h3>
          <p className="text-slate-700 text-lg leading-relaxed mb-6">
            <strong className="text-slate-900">Full Warranty Coverage.</strong> New Rolex watches come with a 5-year international warranty covering manufacturing defects. If a problem arises within this period, you're covered for repairs at no cost (beyond your initial purchase). This peace of mind is invaluable, especially for first-time Rolex buyers concerned about mechanical reliability.
          </p>
          <p className="text-slate-700 text-lg leading-relaxed mb-6">
            <strong className="text-slate-900">Known Service History.</strong> You own the watch from day one, meaning you control all maintenance records. There's no mystery about prior repairs, replacements, or alterations. This transparency is crucial for future resale and your confidence in the watch's mechanical integrity.
          </p>
          <p className="text-slate-700 text-lg leading-relaxed mb-6">
            <strong className="text-slate-900">Latest Specifications and Technology.</strong> New watches reflect Rolex's latest caliber improvements, bracelet designs, and dial variations. If you prioritize owning the current-generation version, buying new guarantees this. Modern Rolex movements are more chronometer-certified and refined than older calibers.
          </p>
          <p className="text-slate-700 text-lg leading-relaxed mb-6">
            <strong className="text-slate-900">No Risk of Counterfeits.</strong> Buying from an authorized Rolex dealer eliminates counterfeiting risk entirely. For watches costing $10,000+, this assurance is worth the premium alone. There's no need for third-party authentication or watchmaker inspections.
          </p>
          <p className="text-slate-700 text-lg leading-relaxed">
            <strong className="text-slate-900">Prestige of Ownership from Day One.</strong> You receive the watch with its original box, papers, and hang tag—the complete package that signals authenticity and cared-for provenance to future collectors or buyers.
          </p>

          <h3 className="text-2xl font-bold text-slate-900 mb-4 mt-10">Disadvantages of Buying New</h3>
          <p className="text-slate-700 text-lg leading-relaxed mb-6">
            <strong className="text-slate-900">Premium Pricing and Annual Increases.</strong> Rolex prices rise 2–3% annually, often without warning. A Submariner that cost $8,400 in 2020 now exceeds $9,600. Buying new means absorbing these increases immediately. Pre-owned buyers sidestep this annual markup.
          </p>
          <p className="text-slate-700 text-lg leading-relaxed mb-6">
            <strong className="text-slate-900">Waitlist Delays (2–5 Years for Popular Models).</strong> Authorized dealers cannot guarantee availability of sports watches. Popular references like the Submariner, Daytona, and GMT-Master II face long waitlists. Unless you're a good customer or Rolex VIP, expect to wait years. This delay can be frustrating for watch enthusiasts eager to start enjoying their purchase.
          </p>
          <p className="text-slate-700 text-lg leading-relaxed mb-6">
            <strong className="text-slate-900">Initial Depreciation (5–10% in Year One).</strong> A new watch depreciates in its first year simply because it's no longer "unworn." This is unavoidable; by year two, depreciation stabilizes, and the watch enters stable territory.
          </p>
          <p className="text-slate-700 text-lg leading-relaxed mb-6">
            <strong className="text-slate-900">Limited Availability of Discontinued Models.</strong> If you want a reference that's been out of production for 10+ years, authorized dealers can't help you. You'll be forced to the pre-owned market, negating the advantage of buying new.
          </p>
          <p className="text-slate-700 text-lg leading-relaxed">
            <strong className="text-slate-900">Dealer Politics and Purchasing Requirements.</strong> Many authorized dealers require you to purchase costume jewelry, leather goods, or other items to get on the waitlist for sports watches. This artificial demand inflation adds cost and frustration.
          </p>
        </section>

        {/* Pre-Owned Rolex Section */}
        <section id="pre-owned-rolex" className="max-w-4xl mx-auto my-12">
          <h2 className="text-3xl font-black text-slate-900 mb-6">Buying Pre-Owned: Pros and Cons</h2>
          
          <h3 className="text-2xl font-bold text-slate-900 mb-4 mt-8">Advantages of Buying Pre-Owned</h3>
          <p className="text-slate-700 text-lg leading-relaxed mb-6">
            <strong className="text-slate-900">Significant Cost Savings (20–40% Discount).</strong> Pre-owned Rolex watches typically sell for 60–80% of retail new price. A Submariner costing $9,600 new might be found pre-owned for $5,800–$7,000. This savings compounds across multiple watches and frees capital for other investments.
          </p>
          <p className="text-slate-700 text-lg leading-relaxed mb-6">
            <strong className="text-slate-900">Immediate Access to Any Reference.</strong> Want a Daytona? The pre-owned market has dozens available today. Want a discontinued reference from 2005? They're readily available. You're no longer constrained by dealer availability or waitlists. This freedom is immensely valuable for collectors with specific acquisition targets.
          </p>
          <p className="text-slate-700 text-lg leading-relaxed mb-6">
            <strong className="text-slate-900">Better Value on Vintage and Discontinued Models.</strong> Older Rolex watches often appreciate or hold value exceptionally well. A vintage 1970s Submariner purchased pre-owned for $4,000 today might be worth the same or more in five years. Buying new, you lose this appreciation potential.
          </p>
          <p className="text-slate-700 text-lg leading-relaxed mb-6">
            <strong className="text-slate-900">Price Stability After Purchase.</strong> You've already absorbed the initial depreciation hit; the watch now trades in a stable secondary market. Unlike new watches that depreciate 5–10% in year one, a pre-owned watch purchased wisely holds relatively steady.
          </p>
          <p className="text-slate-700 text-lg leading-relaxed">
            <strong className="text-slate-900">Access to Unique Variations and Rare Dials.</strong> The pre-owned market offers discontinued dial colors, bracelet combinations, and references never produced in large volumes. Collectors seeking specific configurations find vastly more options pre-owned than new.
          </p>

          <h3 className="text-2xl font-bold text-slate-900 mb-4 mt-10">Disadvantages of Buying Pre-Owned</h3>
          <p className="text-slate-700 text-lg leading-relaxed mb-6">
            <strong className="text-slate-900">No Manufacturer Warranty (Rolex Warrants Original Owner Only).</strong> A pre-owned Rolex arrives with no factory warranty. Your recourse is the seller's guarantee: reputable dealers offer 30–90-day warranties; private sellers typically offer none. After the warranty period, any service cost is on you.
          </p>
          <p className="text-slate-700 text-lg leading-relaxed mb-6">
            <strong className="text-slate-900">Unknown Service History and Prior Repairs.</strong> You inherit whatever work a previous owner (or owners) performed. Non-original components, amateur repairs, or undisclosed damage could lurk inside. Transparency depends entirely on the seller's honesty.
          </p>
          <p className="text-slate-700 text-lg leading-relaxed mb-6">
            <strong className="text-slate-900">Counterfeit Risk (Especially at Untrustworthy Sources).</strong> The pre-owned market is rife with sophisticated counterfeits, particularly on high-demand sports models. Buying from unknown private sellers or unreliable dealers exposes you to the risk of acquiring a fake—a catastrophic loss. Due diligence is mandatory.
          </p>
          <p className="text-slate-700 text-lg leading-relaxed mb-6">
            <strong className="text-slate-900">Cosmetic Wear and Aging.</strong> Most pre-owned watches show signs of use: scratches on the caseback, clasp polishing, bezel fading. While these don't affect function, they're aesthetically different from a pristine new watch. Some collectors are unbothered; others find this unacceptable.
          </p>
          <p className="text-slate-700 text-lg leading-relaxed">
            <strong className="text-slate-900">Limited or No Documentation.</strong> Pre-owned watches often lack original boxes, papers, or documentation. While Rolex service doesn't require papers, their absence makes resale more difficult and raises red flags about authenticity. Budget for authentication services.
          </p>
        </section>

        {/* Certification and Warranty Section */}
        <section id="certification-warranty" className="max-w-4xl mx-auto my-12">
          <h2 className="text-3xl font-black text-slate-900 mb-6">Certification and Warranty Comparison</h2>
          
          <h3 className="text-2xl font-bold text-slate-900 mb-4">Factory Warranty (New Rolex Only)</h3>
          <p className="text-slate-700 text-lg leading-relaxed mb-6">
            Rolex provides a 5-year international warranty on new watches. This covers manufacturing defects, mechanical failures (within normal use), and replacement of defective parts. The warranty transfers to your heirs but not to subsequent owners; it remains valid only for the original purchaser.
          </p>
          <p className="text-slate-700 text-lg leading-relaxed mb-6">
            What's NOT covered: accidental damage, water damage from impact (watches with water damage from submersion beyond rated depth), user-installed aftermarket parts, and normal wear-and-tear. This warranty is complementary to Rolex's legendary reliability; it's not a replacement guarantee.
          </p>

          <h3 className="text-2xl font-bold text-slate-900 mb-4 mt-10">Dealer Certification (Pre-Owned)</h3>
          <p className="text-slate-700 text-lg leading-relaxed mb-6">
            Reputable pre-owned dealers (e.g., WatchBox, Tourneau, Govberg) often provide "certified pre-owned" guarantees that include:
          </p>
          <ul className="list-disc list-inside text-slate-700 text-lg leading-relaxed mb-6 space-y-2">
            <li>30–90 day return windows</li>
            <li>Authentication guarantees (money-back if counterfeit)</li>
            <li>Mechanical inspection and testing certificates</li>
            <li>Sometimes extended warranties (12–24 months) for an additional fee</li>
          </ul>
          <p className="text-slate-700 text-lg leading-relaxed mb-6">
            These certifications are valuable but not as comprehensive as Rolex's factory warranty. They exist to build confidence in the secondary market; they're a seller's promise, not a manufacturer's obligation.
          </p>

          <h3 className="text-2xl font-bold text-slate-900 mb-4 mt-10">Private Sales (Unprotected)</h3>
          <p className="text-slate-700 text-lg leading-relaxed">
            Buying a Rolex privately—from a collector, pawn shop, or online marketplace—offers no formal protection. "As-is" sales are standard. Unless the seller voluntarily extends a return window (rare), you own all liability from the moment of purchase. This is why private purchases require professional authentication before committing funds.
          </p>
        </section>

        {/* Where to Buy Section */}
        <section id="where-to-buy" className="max-w-4xl mx-auto my-12">
          <h2 className="text-3xl font-black text-slate-900 mb-6">Where to Buy New vs Pre-Owned</h2>
          
          <h3 className="text-2xl font-bold text-slate-900 mb-4">Buying New Rolex</h3>
          <p className="text-slate-700 text-lg leading-relaxed mb-6">
            <strong className="text-slate-900">Authorized Rolex Dealers.</strong> The only legitimate source for new Rolex watches. Visit retailers authorized by Rolex in your region (boutiques, department stores like Saks Fifth Avenue, Tourneau). They handle registration, warranty activation, and after-sale service. Service is professional and consistent, though waitlists for sports models can be long.
          </p>
          <p className="text-slate-700 text-lg leading-relaxed">
            Avoid: grey market dealers, online marketplaces claiming "new" inventory, and unauthorized sellers offering "discounts." These sources often have murky supply chains and may not properly register your watch's warranty.
          </p>

          <h3 className="text-2xl font-bold text-slate-900 mb-4 mt-10">Buying Pre-Owned Rolex</h3>
          <p className="text-slate-700 text-lg leading-relaxed mb-6">
            <strong className="text-slate-900">Certified Pre-Owned Dealers.</strong> WatchBox, Tourneau, Govberg, and similar established retailers specialize in certified pre-owned watches. They provide authentication guarantees, mechanical inspections, and return policies. Pricing is higher than private sales (typically 70–80% of retail vs. 60–70%), but the protection justifies the premium.
          </p>
          <p className="text-slate-700 text-lg leading-relaxed mb-6">
            <strong className="text-slate-900">Trusted Online Marketplaces.</strong> Chrono24 (with its buyer protection program) and TrueFacet offer vetted sellers and dispute resolution. They're ideal for comparing listings across multiple dealers. Always buy from sellers with strong ratings and feedback; factor in authentication guarantees into your decision.
          </p>
          <p className="text-slate-700 text-lg leading-relaxed mb-6">
            <strong className="text-slate-900">Local Pawn Shops and Luxury Consignment.</strong> Some pawn shops carry quality pre-owned watches, though inventory varies wildly and expertise is inconsistent. Consignment shops are often a safer bet, as they have reputational incentive to stand behind products.
          </p>
          <p className="text-slate-700 text-lg leading-relaxed">
            <strong className="text-slate-900">Private Sales (Collectors, Forums).</strong> Buying directly from another collector can offer the best prices (60–70% of retail), but requires significant due diligence: authentication, inspection by a trusted watchmaker, and transaction protection (escrow services). Only pursue private sales if you're experienced with watch authentication or willing to invest in professional verification.
          </p>
        </section>

        {/* Price Preservation Section */}
        <section id="price-preservation" className="max-w-4xl mx-auto my-12">
          <h2 className="text-3xl font-black text-slate-900 mb-6">Price Preservation: New vs Pre-Owned</h2>
          
          <p className="text-slate-700 text-lg leading-relaxed mb-6">
            Neither new nor pre-owned Rolex watches are investments that reliably appreciate above inflation. However, both hold value remarkably well compared to most luxury goods. Understanding the depreciation curves helps inform your purchase strategy.
          </p>

          <h3 className="text-2xl font-bold text-slate-900 mb-4 mt-8">New Rolex Depreciation Curve</h3>
          <p className="text-slate-700 text-lg leading-relaxed mb-6">
            A new watch loses 5–10% of value in its first year, primarily from transitioning from "new/unworn" to "used." This depreciation is unavoidable and happens the moment you wear the watch. After year one, the curve flattens dramatically. Over 5 years, a new Rolex typically retains 80–90% of its original retail price—a respectable preservation rate.
          </p>
          <p className="text-slate-700 text-lg leading-relaxed">
            Example: A $9,600 Submariner purchased new depreciates to ~$8,500–$9,100 in year one, then holds around $8,000–$8,500 for the next 4–5 years. Over a decade, depreciation accelerates more noticeably, but the watch remains liquid and valuable.
          </p>

          <h3 className="text-2xl font-bold text-slate-900 mb-4 mt-8">Pre-Owned Price Stability</h3>
          <p className="text-slate-700 text-lg leading-relaxed mb-6">
            A pre-owned watch purchased at market value (70–75% of retail) enters a mature secondary market where prices are largely stable. If you buy a $7,000 pre-owned Submariner, you'll likely recover $6,500–$7,200 in 5 years—minimal fluctuation. The major depreciation has already occurred; you're trading in a relatively stable market.
          </p>
          <p className="text-slate-700 text-lg leading-relaxed">
            However, pre-owned prices are sensitive to fashion shifts. Discontinued dial colors, vintage references, and rare variations may appreciate if collecting trends favor them. Conversely, models falling out of fashion may depreciate more than current-generation watches.
          </p>

          <h3 className="text-2xl font-bold text-slate-900 mb-4 mt-8">Key Takeaway: Buying Strategy for Value Preservation</h3>
          <p className="text-slate-700 text-lg leading-relaxed">
            If you plan to keep the watch 5+ years, buying pre-owned at 70–75% of retail preserves more total dollars than buying new (absorbing 10% year-one depreciation). If you plan to keep it only 1–2 years, buying new offers full warranty coverage that may offset the depreciation. Neither option is objectively "better" for value; your ownership timeline determines the optimal choice.
          </p>
        </section>

        {/* Common Mistakes Section */}
        <section id="common-mistakes" className="max-w-4xl mx-auto my-12">
          <h2 className="text-3xl font-black text-slate-900 mb-6">Common Mistakes When Buying Rolex</h2>
          
          <h3 className="text-2xl font-bold text-slate-900 mb-4">Mistake #1: Skipping Authentication on Pre-Owned Purchases</h3>
          <p className="text-slate-700 text-lg leading-relaxed mb-6">
            Counterfeits are sophisticated and rampant. Never buy pre-owned without: (1) purchasing from a reputable dealer with authentication guarantees, or (2) having a trusted watchmaker or third-party authenticator inspect the watch before payment. Spending $100 on authentication to avoid a $5,000 fake is a trivial cost. Don't gamble.
          </p>

          <h3 className="text-2xl font-bold text-slate-900 mb-4">Mistake #2: Buying New Without Understanding Waitlist Realities</h3>
          <p className="text-slate-700 text-lg leading-relaxed mb-6">
            Many first-time buyers approach authorized dealers expecting to walk out with a sports watch within months. Reality: waitlists for Daytona, Submariner, and GMT-Master II are 2–5 years long, and there's no guarantee you'll ever get to the top. If speed to ownership is your priority, the pre-owned market is mandatory.
          </p>

          <h3 className="text-2xl font-bold text-slate-900 mb-4">Mistake #3: Ignoring Service Costs</h3>
          <p className="text-slate-700 text-lg leading-relaxed mb-6">
            Rolex service (full overhaul) costs $400–$800+, depending on the model. Pre-owned buyers should budget for service within 12–24 months of purchase. New watch owners benefit from the 5-year warranty, but eventually they'll face the same service costs. Factor this into your total cost of ownership.
          </p>

          <h3 className="text-2xl font-bold text-slate-900 mb-4">Mistake #4: Obsessing Over Condition When Buying Pre-Owned</h3>
          <p className="text-slate-700 text-lg leading-relaxed mb-6">
            A pre-owned watch with light scratches and polished surfaces is infinitely better than a fake new watch. If you're uncomfortable with any cosmetic imperfections, buy new. But if you're primarily concerned with owning a genuine, functioning Rolex, accept that pre-owned watches show use. These marks are part of their history and rarely affect value.
          </p>

          <h3 className="text-2xl font-bold text-slate-900 mb-4">Mistake #5: Buying Without a Clear Purpose or Use Case</h3>
          <p className="text-slate-700 text-lg leading-relaxed mb-6">
            Are you buying to wear daily, as an investment, for occasional special occasions, or as a collection piece? Your use case should drive your new vs. pre-owned decision. Daily wear benefits from new's warranty; collection building benefits from pre-owned's access and pricing. Impulse purchases rarely satisfy long-term.
          </p>

          <h3 className="text-2xl font-bold text-slate-900 mb-4">Mistake #6: Ignoring the Dealer's Reputation</h3>
          <p className="text-slate-700 text-lg leading-relaxed mb-6">
            Buying from an unknown seller to save $500 is tempting but reckless. Reputation is your primary defense against counterfeits and hidden damage. Established dealers, certification bodies, and community forums are your best sources for validation. Pay the premium for peace of mind.
          </p>
        </section>

        {/* Final Verdict Section */}
        <section id="final-verdict" className="max-w-4xl mx-auto my-12">
          <h2 className="text-3xl font-black text-slate-900 mb-6">Final Verdict</h2>
          
          <p className="text-slate-700 text-lg leading-relaxed mb-6">
            There is no universal "right" answer to the new vs. pre-owned question. Instead, the optimal choice depends on your specific situation:
          </p>

          <h3 className="text-2xl font-bold text-slate-900 mb-4 mt-8">Buy New If:</h3>
          <ul className="list-disc list-inside text-slate-700 text-lg leading-relaxed mb-6 space-y-2">
            <li>You want the 5-year warranty and peace of mind regarding service history</li>
            <li>You're buying your first Rolex and value stress-free ownership</li>
            <li>You're willing to wait 2–5 years on a waitlist for a specific sports model</li>
            <li>You prefer owning current-generation specifications and latest caliber improvements</li>
            <li>You want the complete package (box, papers, hang tag) for future resale</li>
            <li>You prioritize zero counterfeiting risk</li>
          </ul>

          <h3 className="text-2xl font-bold text-slate-900 mb-4 mt-8">Buy Pre-Owned If:</h3>
          <ul className="list-disc list-inside text-slate-700 text-lg leading-relaxed mb-6 space-y-2">
            <li>You want to save 20–40% off retail pricing</li>
            <li>You need immediate ownership (no waiting on dealer lists)</li>
            <li>You're hunting for a discontinued reference or vintage variation</li>
            <li>You're building a collection and want to maximize capital efficiency</li>
            <li>You're an experienced collector comfortable with authentication due diligence</li>
            <li>You plan to keep the watch long-term (5+ years) and value price stability over warranty</li>
            <li>You're buying from a reputable dealer with guarantees and return policies</li>
          </ul>

          <h3 className="text-2xl font-bold text-slate-900 mb-4 mt-8">The Balanced Approach (For Most Collectors)</h3>
          <p className="text-slate-700 text-lg leading-relaxed mb-6">
            Many successful Rolex collectors employ a hybrid strategy: buy current-generation sports watches new (when you finally get off the waitlist) for daily wear and full warranty coverage, and acquire dress watches, vintage references, and rare variations pre-owned from reputable dealers. This approach maximizes warranty protection where it matters most (daily wear durability) while optimizing for value and access where the secondary market shines (limited editions, discontinued models).
          </p>

          <p className="text-slate-700 text-lg leading-relaxed">
            Ultimately, the "right" Rolex purchase is one you'll wear and enjoy for years to come. Whether you buy new or pre-owned, focus on selecting a reference that matches your lifestyle, authenticating thoroughly, and purchasing from trustworthy sources. A well-selected Rolex—regardless of origin—remains a timeless companion and a sound addition to any watch collection.
          </p>
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
          <h2 className="text-2xl font-black text-slate-900 mb-3">Ready to Buy Your Rolex?</h2>
          <p className="text-slate-700 mb-6">Explore our complete watch comparison tools and model guides to find your perfect timepiece.</p>
          <Link href="/compare" className="inline-block px-6 py-3 bg-amber-600 text-white font-bold rounded-lg hover:bg-amber-700 transition-colors">
            Explore Watch Comparisons →
          </Link>
        </section>
      </Container>
    </>
  )
}
