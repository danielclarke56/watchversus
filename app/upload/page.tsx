import type { Metadata } from 'next'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import UploadClient from './UploadClient'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Upload Your Watch Photo | Watchems',
  description: 'Share a photo of your watch. Real wrist shots from real owners.',
  robots: {
    index: false,
    follow: true,
  },
  alternates: {
    canonical: 'https://watchems.com/upload',
  },
}

export default async function UploadPage() {
  const { userId } = await auth()

  // If signed in, check terms acceptance
  if (userId) {
    const row = await db
      .select({ termsAcceptedAt: users.termsAcceptedAt })
      .from(users)
      .where(eq(users.clerkId, userId))
      .limit(1)

    const hasAccepted = row.length > 0 && row[0].termsAcceptedAt !== null
    if (!hasAccepted) {
      redirect('/accept-terms')
    }
  }

  return <UploadClient />
}
