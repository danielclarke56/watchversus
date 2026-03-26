import type { Metadata } from 'next'
import UploadClient from './UploadClient'

export const metadata: Metadata = {
  title: 'Upload Your Watch Photo | WatchVsWatch',
  description: 'Share a photo of your watch. Real wrist shots from real owners.',
}

export default function UploadPage() {
  return <UploadClient />
}
