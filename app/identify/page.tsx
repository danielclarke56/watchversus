import type { Metadata } from 'next'
import { Suspense } from 'react'
import IdentifyClient from './IdentifyClient'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Identify a Watch | Watchems',
  description: 'Upload a photo of any watch and our AI will identify the brand, model, and key specs in seconds.',
  alternates: {
    canonical: 'https://watchems.com/identify',
  },
}

export default function IdentifyPage() {
  return (
    <Suspense>
      <IdentifyClient />
    </Suspense>
  )
}
