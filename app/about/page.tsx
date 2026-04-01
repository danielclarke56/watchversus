import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'About WatchVsWatch — Real Watch Photos from Real Owners',
  description: 'WatchVsWatch is a community photo gallery for watch enthusiasts. Browse and upload real watch photos — no affiliate links, no sponsored content.',
  alternates: {
    canonical: 'https://watchvswatch.com/about',
  },
  openGraph: {
    title: 'About | WatchVsWatch',
    description: 'A community photo gallery for watch enthusiasts. Real watches, real owners, no affiliate links.',
    url: 'https://watchvswatch.com/about',
    type: 'website',
  },
}

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-textPrimary mb-3">About WatchVsWatch</h1>
        <p className="text-textSecond text-lg">A community photo gallery for watch enthusiasts</p>
      </div>

      <div className="space-y-10">
        {/* What We Are */}
        <section className="card p-7">
          <h2 className="text-2xl font-bold text-textPrimary mb-4 flex items-center gap-3">
            <span className="w-8 h-8 rounded-sm bg-accentLight border border-borderStrong flex items-center justify-center text-accent text-sm font-bold shrink-0">01</span>
            What We Are
          </h2>
          <div className="text-textSecond space-y-3 leading-relaxed">
            <p>
              WatchVsWatch is a community photo gallery for watch enthusiasts. Browse real photos of
              watches worn in real life — from affordable Seikos to luxury Rolexes. No affiliate links,
              no sponsored content, just real watches from real owners.
            </p>
          </div>
        </section>

        {/* Sharing Your Watch */}
        <section className="card p-7">
          <h2 className="text-2xl font-bold text-textPrimary mb-4 flex items-center gap-3">
            <span className="w-8 h-8 rounded-sm bg-accentLight border border-borderStrong flex items-center justify-center text-accent text-sm font-bold shrink-0">02</span>
            Sharing Your Watch
          </h2>
          <div className="text-textSecond space-y-3 leading-relaxed">
            <p>
              Anyone can upload photos of their watch collection. Sign in with Google or email,
              upload a photo, and it appears in the gallery for other enthusiasts
              to discover. We moderate submissions to keep quality high.
            </p>
          </div>
        </section>

        {/* No Affiliate Links */}
        <section className="card p-7">
          <h2 className="text-2xl font-bold text-textPrimary mb-4 flex items-center gap-3">
            <span className="w-8 h-8 rounded-sm bg-accentLight border border-borderStrong flex items-center justify-center text-accent text-sm font-bold shrink-0">03</span>
            No Affiliate Links
          </h2>
          <div className="text-textSecond space-y-3 leading-relaxed">
            <p>
              We have no affiliate links and no sponsored content. We are fully independent.
              The gallery exists purely to celebrate watch culture.
            </p>
          </div>
        </section>

        {/* Contact */}
        <section id="contact" className="card p-7">
          <h2 className="text-2xl font-bold text-textPrimary mb-4 flex items-center gap-3">
            <span className="w-8 h-8 rounded-sm bg-accentLight border border-borderStrong flex items-center justify-center text-accent text-sm font-bold shrink-0">04</span>
            Contact
          </h2>
          <div className="text-textSecond space-y-3">
            <p>
              For questions, feedback, or to report issues:
            </p>
            <p>
              <strong className="text-textPrimary">Email:</strong>{' '}
              <span className="text-accent">hello@watchvswatch.com</span>
            </p>
            <p className="text-textMuted text-sm">
              We read every email and respond within 48 hours.
            </p>
          </div>
        </section>
      </div>

      {/* CTA */}
      <div className="mt-12 text-center bg-accentLight border border-borderStrong rounded-sm p-8">
        <h3 className="text-textPrimary font-bold text-xl mb-2">Share your collection with the community</h3>
        <p className="text-textSecond mb-5">Upload a photo of your watch or browse what others are wearing</p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link href="/upload" className="btn-gold">Upload a Photo</Link>
          <Link href="/" className="btn-outline">Browse Gallery</Link>
        </div>
      </div>
    </div>
  )
}
