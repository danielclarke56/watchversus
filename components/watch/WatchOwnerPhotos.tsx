import type { Watch } from '@/lib/types'

interface WatchOwnerPhotosProps {
  watch: Watch
}

/**
 * Owner Photos — only renders when real photos exist (owner_photo_count > 0).
 * Returns null for the MVP since no photos are approved yet.
 * The upload CTA lives in the review form instead.
 */
export default function WatchOwnerPhotos({ watch }: WatchOwnerPhotosProps) {
  const photoCount = watch.owner_photo_count ?? 0

  // Don't render an empty gallery — it hurts credibility
  if (photoCount === 0) return null

  // Future: fetch and display real owner photos here
  return (
    <section className="py-10 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-textPrimary mb-6">
          Owner Photos
          <span className="text-textMuted font-normal text-base ml-2">({photoCount})</span>
        </h2>
        {/* Gallery grid will be implemented when photos are available */}
      </div>
    </section>
  )
}
