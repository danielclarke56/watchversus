import type { Metadata } from 'next'
import { DM_Sans } from 'next/font/google'
import Script from 'next/script'
import { ClerkProvider } from '@clerk/nextjs'
import { SpeedInsights } from '@vercel/speed-insights/next'
import './globals.css'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'

const hasClerk = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-dm-sans',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://watchvswatch.com'),
  title: {
    default: 'WatchVsWatch - Head-to-Head Watch Comparisons & Reviews',
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
    title: 'WatchVsWatch - Head-to-Head Watch Comparisons & Reviews',
    description: 'Community-driven watch comparisons, honest reviews, and personalized recommendations.',
    url: 'https://watchvswatch.com',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WatchVsWatch - Head-to-Head Watch Comparisons & Reviews',
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
  description: 'Compare watches side-by-side with full specs, expert verdicts, and detailed analysis.',
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: 'https://watchvswatch.com/compare?q={search_term_string}',
    },
    'query-input': 'required name=search_term_string',
  },
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={dmSans.variable}>
      <head>
        <link rel="preconnect" href="https://api.fontshare.com" />
        <link rel="stylesheet" href="https://api.fontshare.com/v2/css?f[]=satoshi@700,500,400&display=swap" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
      </head>
      <body className="bg-[#f8fafc] text-[#0f172a] antialiased min-h-screen flex flex-col">
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-T077JWH4E5"
          strategy="afterInteractive"
        />
        <Script id="ga4-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-T077JWH4E5');
          `}
        </Script>
        <Navigation />
        <main className="flex-1">{children}</main>
        <Footer />
        <SpeedInsights />
      </body>
    </html>
  )
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  if (hasClerk) {
    return (
      <ClerkProvider>
        <Shell>{children}</Shell>
      </ClerkProvider>
    )
  }
  return <Shell>{children}</Shell>
}
