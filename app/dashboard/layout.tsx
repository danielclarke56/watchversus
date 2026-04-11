import type { Metadata } from 'next'
import { auth, clerkClient } from '@clerk/nextjs/server'

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}
import { redirect } from 'next/navigation'
import DashboardSidebar from './DashboardSidebar'
import { requireTermsAccepted } from '@/lib/requireTerms'

export const dynamic = 'force-dynamic'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth()

  if (!userId) {
    redirect('/sign-in')
  }

  await requireTermsAccepted(userId)

  // Fetch user details for sidebar
  const client = await clerkClient()
  const user = await client.users.getUser(userId)

  const displayName = user.firstName
    ? `${user.firstName}${user.lastName ? ' ' + user.lastName : ''}`
    : user.username || 'User'

  const email = user.emailAddresses?.[0]?.emailAddress || ''

  const initials = displayName
    .split(' ')
    .slice(0, 2)
    .map((word: string) => word[0]?.toUpperCase())
    .join('')

  const sidebarUser = {
    displayName,
    email,
    avatarUrl: user.imageUrl || null,
    initials,
    username: user.username,
    userId,
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-4rem)]">
      <DashboardSidebar user={sidebarUser} />
      <div className="flex-1 bg-gray-50">
        {children}
      </div>
    </div>
  )
}
