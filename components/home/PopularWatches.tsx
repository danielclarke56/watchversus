import Image from 'next/image'
import Link from 'next/link'
import { watches } from '@/lib/watches'
import { Container } from '@/components/ui/Container'

export default function PopularWatches() {
  const topWatches = watches
    .slice()
    .sort((a, b) => `${a.brand} ${a.name}`.localeCompare(`${b.brand} ${b.name}`))
    .slice(0, 8)

  return (
    <section className="bg-surface py-12 md:py-14">
      <Container>
        <h2 className="text-2xl sm:text-3xl font-bold text-textPrimary mb-8">
          Popular Watches
        </h2>
        {/* Horizontal scroll on mobile, 4-col grid on desktop */}
        <div className="flex gap-4 overflow-x-auto pb-4 md:grid md:grid-cols-4 md:overflow-visible md:pb-0">
          {topWatches.map((watch) => (
            <Link
              key={watch.slug}
              href={`/watches/${watch.slug}`}
              className="group shrink-0 w-44 md:w-auto"
            >
              <div className="bg-surface border border-border rounded-sm overflow-hidden hover:shadow-sm transition-all">
                <div className="relative bg-surfaceAlt aspect-square flex items-center justify-center overflow-hidden">
                  {watch.image ? (
                    <Image
                      src={watch.image}
                      alt={watch.imageAlt ?? `${watch.brand} ${watch.name}`}
                      fill
                      className="object-contain p-2"
                      sizes="(max-width: 768px) 176px, 25vw"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full border-2 border-border flex items-center justify-center text-border">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="9" strokeWidth="1.5" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 7v5l3 3" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <p className="text-xs text-textMuted uppercase tracking-wider font-semibold mb-0.5">
                    {watch.brand}
                  </p>
                  <h3 className="text-sm font-semibold text-textPrimary group-hover:text-accent transition-colors">
                    {watch.name}
                  </h3>
                  <p className="text-xs text-textMuted mt-1">
                    {watch.owner_photo_count ?? 0} photos
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  )
}
