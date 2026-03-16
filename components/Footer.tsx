import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-[#f8fafc] border-t border-[#e2e8f0] mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-1 mb-3">
              <span className="text-[#b8860b] text-lg font-bold">Watch</span><span className="text-[#0f172a] text-lg font-bold">Vs</span><span className="text-[#b8860b] text-lg font-bold">Watch</span>
            </div>
            <p className="text-[#475569] text-sm leading-relaxed max-w-sm">
              Community-driven watch comparisons, reviews, and recommendations.
              We help you find the perfect watch through honest, expert community insights.
            </p>

          </div>

          <div>
            <h4 className="text-[#0f172a] font-semibold text-sm mb-4">Explore</h4>
            <ul className="space-y-2">
              {[
                { href: '/watches', label: 'Watch Index' },
                { href: '/compare', label: 'Compare Watches' },
                { href: '/reviews', label: 'Community Reviews' },
                { href: '/quiz', label: 'Find My Watch Quiz' },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-[#475569] hover:text-[#b8860b] text-sm transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-[#0f172a] font-semibold text-sm mb-4">Popular Comparisons</h4>
            <ul className="space-y-2">
              {[
                { href: '/compare/rolex-submariner-41-vs-tudor-black-bay-58', label: 'Sub 41 vs BB58' },
                { href: '/compare/rolex-gmt-master-ii-pepsi-vs-tudor-black-bay-gmt', label: 'GMT-II vs BB GMT' },
                { href: '/compare/tissot-prx-40-vs-hamilton-khaki-field-auto-38', label: 'PRX vs Khaki Field' },
                { href: '/compare/ap-royal-oak-15500-vs-patek-philippe-nautilus-5711', label: 'Royal Oak vs Nautilus' },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-[#475569] hover:text-[#b8860b] text-sm transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-[#e2e8f0] mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-[#94a3b8] text-xs">
            © {new Date().getFullYear()} WatchVsWatch. All rights reserved.
          </p>
          <div className="flex gap-5">
            <Link href="/about" className="text-[#94a3b8] hover:text-[#475569] text-xs transition-colors">About</Link>
            <Link href="/about#contact" className="text-[#94a3b8] hover:text-[#475569] text-xs transition-colors">Contact</Link>

          </div>
        </div>
      </div>
    </footer>
  )
}
