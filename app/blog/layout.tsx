import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Watch Blog — Buying Guides, Reviews & Advice | WatchVsWatch',
  description:
    'In-depth watch articles: buying guides, movement breakdowns, brand reviews, and value-for-money analysis from the WatchVsWatch team.',
  alternates: { canonical: 'https://watchvswatch.com/blog' },
  openGraph: {
    title: 'Watch Blog | WatchVsWatch',
    description: 'In-depth watch articles, guides, and reviews.',
    url: 'https://watchvswatch.com/blog',
  },
}

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return children
}
