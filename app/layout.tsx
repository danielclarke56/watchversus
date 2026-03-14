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
  title: {
    default: 'WatchVsWatch — Head-to-Head Watch Comparisons & Reviews',
    template: '%s | WatchVsWatch',
  },
  description:
    'Community-driven watch comparisons, honest reviews, and personalized recommendations. Compare any two watches side-by-side with real community ratings.',
  keywords: ['watch comparison', 'watch reviews', 'best watches', 'rolex vs omega', 'watch recommendations'],
  openGraph: {
    type: 'website',
    siteName: 'WatchVsWatch',
    title: 'WatchVsWatch — Head-to-Head Watch Comparisons & Reviews',
    description: 'Community-driven watch comparisons, honest reviews, and personalized recommendations.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WatchVsWatch — Head-to-Head Watch Comparisons & Reviews',
    description: 'Community-driven watch comparisons, honest reviews, and personalized recommendations.',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-[#0f172a] text-white antialiased min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
