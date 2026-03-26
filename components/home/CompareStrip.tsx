import Link from 'next/link'
import { Container } from '@/components/ui/Container'

const pairs = [
  {
    label: 'Rolex Submariner vs Omega Seamaster',
    href: '/compare/omega-seamaster-300m-vs-rolex-submariner-41',
  },
  {
    label: 'Omega Speedmaster vs Breitling Navitimer',
    href: '/compare/breitling-navitimer-b01-42-vs-omega-speedmaster-moonwatch',
  },
  {
    label: 'Rolex Submariner vs Tudor Black Bay',
    href: '/compare/rolex-submariner-41-vs-tudor-black-bay-58',
  },
]

export default function CompareStrip() {
  return (
    <section className="bg-surface py-12 md:py-14">
      <Container>
        <h2 className="text-2xl sm:text-3xl font-bold text-textPrimary mb-8">
          Compare Side by Side
        </h2>
        <div className="space-y-3">
          {pairs.map((pair) => (
            <Link
              key={pair.href}
              href={pair.href}
              className="flex items-center justify-between bg-background border border-border rounded-sm px-5 py-4 hover:border-borderStrong transition-colors group"
            >
              <span className="text-sm font-medium text-textPrimary group-hover:text-accent transition-colors">
                {pair.label}
              </span>
              <span className="text-accent text-sm shrink-0 ml-4">→</span>
            </Link>
          ))}
        </div>
        <div className="text-center mt-6">
          <Link
            href="/compare"
            className="text-accent hover:text-accentHover font-medium text-sm transition-colors"
          >
            See all comparisons →
          </Link>
        </div>
      </Container>
    </section>
  )
}
