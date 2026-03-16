'use client'

import dynamic from 'next/dynamic'

interface Props {
  watchId: string
  watchName: string
}

// Load the Clerk-aware form only on the client (ssr:false prevents prerender crash)
const ReviewFormContent = dynamic(() => import('./ReviewFormContent'), { ssr: false })

// Fallback shown when Clerk is not configured
function ReviewFormDisabled({ watchName }: Props) {
  return (
    <div className="card p-6 text-center">
      <h3 className="text-[#0f172a] font-semibold mb-2">Write a Review</h3>
      <p className="text-[#475569] text-sm mb-4">
        Sign in to share your experience with the {watchName}.
      </p>
      <button
        className="btn-outline px-6 py-2 text-sm opacity-50 cursor-not-allowed"
        disabled
      >
        Sign In to Review
      </button>
    </div>
  )
}

export default function ReviewForm(props: Props) {
  const hasClerk = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
  if (!hasClerk) return <ReviewFormDisabled {...props} />
  return <ReviewFormContent {...props} />
}
