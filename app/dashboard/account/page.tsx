'use client'

import { UserProfile } from '@clerk/nextjs'

export const dynamic = 'force-dynamic'

export default function AccountPage() {
  return (
    <div className="py-6 sm:py-8 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
          <p className="text-gray-600 text-sm mt-1">
            Manage your profile, email, and connected accounts.
          </p>
        </div>

        <UserProfile
          appearance={{
            elements: {
              rootBox: 'w-full',
              cardBox: 'w-full shadow-none',
              card: 'w-full shadow-none border border-gray-200 rounded-lg',
              navbar: 'hidden',
              pageScrollBox: 'p-0',
            },
          }}
        />
      </div>
    </div>
  )
}
