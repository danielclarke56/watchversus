import type { Metadata } from 'next'
import { SignUp } from '@clerk/nextjs'

export const metadata: Metadata = {
  title: 'Sign Up | Watchems',
  robots: { index: false, follow: true },
}

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <SignUp forceRedirectUrl="/accept-terms" />
    </div>
  )
}
