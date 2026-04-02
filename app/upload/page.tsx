import type { Metadata } from 'next'
import UploadClient from './UploadClient'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Upload Your Watch Photo | WatchVsWatch',
  description: 'Share a photo of your watch. Real wrist shots from real owners.',
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: 'https://watchems.com/upload',
  },
}

export default function UploadPage() {
  return <UploadClient />
}
