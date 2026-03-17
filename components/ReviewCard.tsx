import Link from 'next/link'
import type { Review } from '@/lib/types'
import { getWatchById } from '@/lib/watches'
import StarRating from './StarRating'

interface Props {
  review: Review
  showWatch?: boolean
}

export default function ReviewCard({ review, showWatch = true }: Props) {
  const watch = getWatchById(review.watch_id)
  const overallRating =
    Object.values(review.ratings).reduce((a, b) => a + b, 0) / Object.values(review.ratings).length

  return (
    <div className="card p-5">
      {showWatch && watch && (
        <Link
          href={`/watches/${watch.slug}`}
          className="text-xs text-accent font-semibold uppercase tracking-wider hover:text-accentHover transition-colors mb-2 block"
        >
          {watch.brand} {watch.name}
        </Link>
      )}

      <div className="flex items-start justify-between gap-3 mb-2">
        <h4 className="font-semibold text-textPrimary text-sm leading-snug">{review.title}</h4>
        <StarRating rating={overallRating} size="sm" showNumber />
      </div>

      <p className="text-textSecond text-sm leading-relaxed line-clamp-3 mb-3">{review.body}</p>

      <div className="flex items-center justify-between text-xs text-textMuted">
        <span>
          <span className="text-textPrimary font-medium">{review.reviewer_name}</span>
          {' · '}
          {new Date(review.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </span>
        <span>{review.helpful_count} found helpful</span>
      </div>
    </div>
  )
}
