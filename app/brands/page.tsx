import type { Metadata } from 'next'
import Link from 'next/link'
import { brands } from '@/lib/brandData'

export const metadata: Metadata = {
  title: 'Watch Brands — Reviews, History & Comparisons',
  description: 'Explore watch brands from Rolex and Omega to Grand Seiko and Hamilton. Brand histories, model overviews, and head-to-head comparisons.',
  alternates: {
    canonical: 'https://watchvswatch.com/brands',
  },
  openGraph: {
    title: 'Watch Brands | WatchVsWatch',
    description: 'Explore watch brands from Rolex and Omega to Grand Seiko and Hamilton.',
    url: 'https://watchvswatch.com/brands',
    type: 'website',
  },
}

// Tier groupings for display
const tiers = [
  {
    label: 'Haute Horlogerie',
    slugs: ['patek-philippe', 'audemars-piguet', 'jaeger-lecoultre'],
  },
  {
    label: 'Prestige Swiss',
    slugs: ['rolex', 'omega', 'iwc', 'cartier', 'panerai', 'breitling', 'zenith'],
  },
  {
    label: 'Japanese Excellence',
    slugs: ['grand-seiko', 'seiko', 'citizen', 'casio'],
  },
  {
    label: 'Accessible Swiss',
    slugs: ['tudor', 'tag-heuer', 'longines', 'hamilton', 'tissot', 'frederique-constant'],
  },
]

export default function BrandsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <nav className="text-sm text-slate-500 mb-6 flex items-center gap-2">
        <Link href="/" className="hover:text-[#d4a853] transition-colors">Home</Link>
        <span>/</span>
        <span className="text-white">Brands</span>
      </nav>

      <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">Watch Brands</h1>
      <p className="text-slate-400 mb-10 leading-relaxed">
        Brand overviews, model listings from our database, and popular head-to-head comparisons — organized by tier.
      </p>

      <div className="space-y-10">
        {tiers.map((tier) => {
          const tierBrands = tier.slugs
            .map((slug) => brands.find((b) => b.slug === slug))
            .filter((b): b is NonNullable<typeof b> => b !== undefined)

          return (
            <div key={tier.label}>
              <h2 className="text-xs text-slate-500 uppercase tracking-widest mb-4 font-semibold">{tier.label}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {tierBrands.map((brand) => (
                  <Link
                    key={brand.slug}
                    href={`/brands/${brand.slug}`}
                    className="card p-5 hover:border-[#d4a853]/40 transition-colors group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-bold group-hover:text-[#d4a853] transition-colors mb-1">
                          {brand.name}
                        </h3>
                        <p className="text-slate-500 text-xs">{brand.country} · Est. {brand.founded}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-12 text-center bg-[#1e293b] border border-[#334155] rounded-xl p-8">
        <h3 className="text-white font-semibold text-lg mb-2">Compare Any Two Watches</h3>
        <p className="text-slate-400 text-sm mb-5">Full specs, community ratings, and pricing side by side</p>
        <Link href="/compare" className="btn-gold">
          Compare Watches
        </Link>
      </div>
    </div>
  )
}
