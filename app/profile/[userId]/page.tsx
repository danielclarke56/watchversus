import type { Metadata } from 'next'
import { ProfileClient } from './ProfileClient'

export async function generateMetadata({ params }: { params: { userId: string } }): Promise<Metadata> {
  return {
    title: 'Watch Photos | WatchVsWatch',
    description: 'Watch photos uploaded by this member of the WatchVsWatch community.',
    alternates: {
      canonical: `https://watchvswatch.com/profile/${params.userId}`,
    },
  }
}

export default function ProfilePage({ params }: { params: { userId: string } }) {
  return <ProfileClient userId={params.userId} />
}
