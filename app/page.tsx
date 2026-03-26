import HeroSearch from '@/components/home/HeroSearch'
import PhotoGallery from '@/components/home/PhotoGallery'
import type { Metadata } from 'next'

const faqItems = [
  {
    q: 'How do I compare two watches on WatchVsWatch?',
    a: `Use the search bar on the homepage or visit the Compare page to pick any two watches. You'll see side-by-side specs, key differences, and an expert verdict — all on one page.`,
  },
  {
    q: 'What brands does WatchVsWatch cover?',
    a: 'We cover watches at every price point — from affordable favourites like Seiko, Casio, Orient, and Tissot to mid-range brands like Hamilton, Longines, and Oris, all the way up to Rolex, Omega, Tudor, Breitling, IWC, Cartier, Grand Seiko, and beyond. New watches and brands are added regularly.',
  },
  {
    q: 'Is WatchVsWatch free to use?',
    a: 'Yes, WatchVsWatch is completely free. We have no affiliate links and no sponsored content — every comparison and recommendation is independent.',
  },
  {
    q: 'How are watches rated and compared?',
    a: 'Each comparison includes verified specifications, an analysis of real-world differences (movement, water resistance, case size, price), and an editorial verdict summarising who each watch is best for.',
  },
  {
    q: 'Can WatchVsWatch help me choose my first watch?',
    a: 'Absolutely. Take our Watch Finder Quiz to get a personalised recommendation in under a minute, or browse our buying guides organised by budget, style, and occasion — whether your budget is $100 or $10,000.',
  },
  {
    q: 'Does WatchVsWatch have watch buying guides?',
    a: 'Yes. WatchVsWatch publishes independent buying guides organised by budget (best watches under $500, under $1,000, under $5,000), by style (dive watches, dress watches, chronographs, field watches), and by occasion. Each guide includes curated picks with specs and a clear recommendation — no affiliate links and no sponsored placements.',
  },
]

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqItems.map((item) => ({
    '@type': 'Question',
    name: item.q,
    acceptedAnswer: {
      '@type': 'Answer',
      text: item.a,
    },
  })),
}

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'WatchVsWatch',
  url: 'https://watchvswatch.com',
  logo: 'https://watchvswatch.com/icon.png',
  description: 'WatchVsWatch is an independent watch research resource covering side-by-side watch comparisons, buying guides by budget and style, detailed watch profiles, community ratings, and a Watch Finder Quiz. It covers watches at every price point from Seiko and Casio to Rolex and Patek Philippe, with no affiliate links or sponsored content.',
  knowsAbout: [
    'Watch comparisons', 'Watch buying guides', 'Watch specifications', 'Luxury watches',
    'Dive watches', 'Dress watches', 'Chronograph watches', 'Watch reviews',
    'Watch recommendations', 'Rolex', 'Omega', 'Tudor', 'Seiko', 'TAG Heuer', 'Grand Seiko',
  ],
  sameAs: [],
}

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'WatchVsWatch',
  url: 'https://watchvswatch.com',
  description: 'Independent watch research resource: comparisons, buying guides, watch profiles, and the Watch Finder Quiz.',
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: 'https://watchvswatch.com/watches?q={search_term_string}',
    },
    'query-input': 'required name=search_term_string',
  },
}

export const metadata: Metadata = {
  title: 'Watch Reviews, Comparisons & Buying Guides | WatchVsWatch',
  description:
    'The independent watch research resource. Compare watches side by side, explore buying guides, use the Watch Finder Quiz, and browse full specs for 50+ watches. No affiliate links. No sponsored content.',
  alternates: {
    canonical: 'https://watchvswatch.com',
  },
  openGraph: {
    type: 'website',
    siteName: 'WatchVsWatch',
    title: 'Watch Reviews, Comparisons & Buying Guides | WatchVsWatch',
    description: 'Independent watch research: side-by-side comparisons, buying guides by budget and style, Watch Finder Quiz, and detailed watch profiles. Every price point, no affiliate links.',
    url: 'https://watchvswatch.com',
    images: [{ url: 'https://watchvswatch.com/api/og?title=WatchVsWatch&subtitle=Compare+Watches+Side+by+Side', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Watch Reviews, Comparisons & Buying Guides | WatchVsWatch',
    description: 'Independent watch research: side-by-side comparisons, buying guides by budget and style, Watch Finder Quiz, and detailed watch profiles. Every price point, no affiliate links.',
  },
}

export default function HomePage() {
  return (
    <>
      {/* JSON-LD Schemas */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />

      <main className="min-h-screen">
        <HeroSearch />
        <PhotoGallery />
      </main>
    </>
  )
}
