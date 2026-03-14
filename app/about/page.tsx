import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'About WatchVsWatch',
  description: 'Learn about WatchVsWatch — our mission, how community reviews work, and our watch database.',
}

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-white mb-3">About WatchVsWatch</h1>
        <p className="text-slate-400 text-lg">Community-driven watch intelligence for enthusiasts at every level</p>
      </div>

      <div className="space-y-10">
        {/* Mission */}
        <section className="card p-7">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-[#d4a853]/20 border border-[#d4a853]/30 flex items-center justify-center text-[#d4a853] text-sm font-bold shrink-0">01</span>
            Our Mission
          </h2>
          <div className="text-slate-300 space-y-3 leading-relaxed">
            <p>
              WatchVsWatch was built to be the comparison resource we always wished existed — honest, detailed, and
              driven by the people who actually own and wear these watches. The name says it all: this is a head-to-head
              platform where any two watches can be compared across the specifications that actually matter.
            </p>
            <p>
              Too much of the watch internet is powered by marketing budgets rather than genuine insight. Brands sponsor
              reviews. Affiliates inflate praise. Watch forums are helpful but scattered and hard to search. WatchVsWatch
              centralizes the comparison experience and puts community-generated ratings at its core.
            </p>
            <p>
              We&apos;re independent, bootstrapped, and driven by passion for horology. We cover watches at every price point,
              from the Seiko 5 to the Patek Nautilus, without hierarchy or snobbery.
            </p>
          </div>
        </section>

        {/* How reviews work */}
        <section id="reviews" className="card p-7">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-[#d4a853]/20 border border-[#d4a853]/30 flex items-center justify-center text-[#d4a853] text-sm font-bold shrink-0">02</span>
            How Reviews Work
          </h2>
          <div className="text-slate-300 space-y-3 leading-relaxed">
            <p>
              Reviews on WatchVsWatch are submitted by community members who own or have owned the watches they review.
              We don&apos;t compensate reviewers. We don&apos;t require accounts or verification.
            </p>
            <p>
              Each review rates the watch across five dimensions that matter to real owners:
            </p>
            <ul className="list-none space-y-2 ml-2">
              {[
                ['Value for Money', 'Does the watch deliver on its price point?'],
                ['Build Quality', 'Materials, finishing, bracelet, tolerances'],
                ['Movement Reliability', 'Accuracy, service intervals, repairability'],
                ['Daily Wearability', 'Size, comfort, versatility across occasions'],
                ['Resale Strength', 'How well does it hold value on the secondary market?'],
              ].map(([name, desc]) => (
                <li key={name} className="flex gap-3">
                  <span className="text-[#d4a853] shrink-0 mt-0.5">→</span>
                  <span><strong className="text-white">{name}</strong> — {desc}</span>
                </li>
              ))}
            </ul>
            <p className="text-slate-400 text-sm mt-4">
              Reviews are currently stored locally in your browser. We&apos;re building backend infrastructure to
              aggregate community reviews globally — coming soon.
            </p>
          </div>
        </section>

        {/* Data */}
        <section className="card p-7">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-[#d4a853]/20 border border-[#d4a853]/30 flex items-center justify-center text-[#d4a853] text-sm font-bold shrink-0">03</span>
            Our Watch Database
          </h2>
          <div className="text-slate-300 space-y-3 leading-relaxed">
            <p>
              Our database currently covers 50 watches spanning every price point, style, and brand tier — from the
              Swatch Sistem51 to the Patek Philippe Nautilus. Every specification is researched from official brand
              documentation and trusted secondary sources.
            </p>
            <p>
              We expand the database based on community demand. If you want to see a specific reference added,
              reach out via the contact form below.
            </p>
          </div>
        </section>

        {/* Contact */}
        <section id="contact" className="card p-7">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-[#d4a853]/20 border border-[#d4a853]/30 flex items-center justify-center text-[#d4a853] text-sm font-bold shrink-0">04</span>
            Contact
          </h2>
          <div className="text-slate-300 space-y-3">
            <p>
              For watch additions, corrections, or general feedback:
            </p>
            <p>
              <strong className="text-white">Email:</strong>{' '}
              <span className="text-[#d4a853]">hello@WatchVsWatch.com</span>
            </p>
            <p className="text-slate-400 text-sm">
              We read every email and respond to content inquiries within 48 hours.
            </p>
          </div>
        </section>
      </div>

      {/* CTA */}
      <div className="mt-12 text-center bg-gradient-to-r from-[#d4a853]/10 to-[#b8863a]/10 border border-[#d4a853]/20 rounded-xl p-8">
        <h3 className="text-white font-bold text-xl mb-2">Ready to find your perfect watch?</h3>
        <p className="text-slate-400 mb-5">Take our 2-minute quiz or start comparing watches side-by-side</p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link href="/quiz" className="btn-gold">Take the Quiz</Link>
          <Link href="/compare" className="btn-outline">Compare Watches</Link>
        </div>
      </div>
    </div>
  )
}
