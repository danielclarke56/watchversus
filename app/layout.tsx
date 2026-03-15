import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://watchvswatch.com'),
  title: {
    default: 'WatchVsWatch — Head-to-Head Watch Comparisons & Reviews',
    template: '%s | WatchVsWatch',
  },
  description:
    'Community-driven watch comparisons, honest reviews, and personalized recommendations. Compare any two watches side-by-side with real community ratings.',
  keywords: ['watch comparison', 'watch reviews', 'best watches', 'rolex vs omega', 'watch recommendations'],
  alternates: {
    canonical: 'https://watchvswatch.com',
  },
  openGraph: {
    type: 'website',
    siteName: 'WatchVsWatch',
    title: 'WatchVsWatch — Head-to-Head Watch Comparisons & Reviews',
    description: 'Community-driven watch comparisons, honest reviews, and personalized recommendations.',
    url: 'https://watchvswatch.com',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WatchVsWatch — Head-to-Head Watch Comparisons & Reviews',
    description: 'Community-driven watch comparisons, honest reviews, and personalized recommendations.',
  },
  verification: {
    google: 'uJXK23x_lAigHXvAoywJqmmZAaZXeEpAntrOo_KV4gM',
  },
}

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'WatchVsWatch',
  url: 'https://watchvswatch.com',
  description: 'Community-driven watch comparisons, honest reviews, and personalized recommendations.',
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: 'https://watchvswatch.com/compare?q={search_term_string}',
    },
    'query-input': 'required name=search_term_string',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
      </head>
      <body className="bg-[#0f172a] text-white antialiased min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
