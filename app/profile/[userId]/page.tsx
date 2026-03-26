import type { Metadata } from 'next'
import { ProfileClient } from './ProfileClient'

export const metadata: Metadata = {
  title: 'Watch Photos | WatchVsWatch',
  description: 'Watch photos uploaded by this member of the WatchVsWatch community.',
}

export default function ProfilePage({ params }: { params: { userId: string } }) {
  return <ProfileClient userId={params.userId} />
}
