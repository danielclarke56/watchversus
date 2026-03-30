'use client'

import { useAuth } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'

export default function AdminDashboard() {
  const { userId } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!userId) {
      router.push('/sign-in')
      return
    }
  }, [userId, router])

  if (!userId) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

        <div className="grid gap-6">
          {/* Photo Moderation Card */}
          <Link href="/admin/photos">
            <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <h2 className="text-xl font-semibold mb-2">Photo Moderation</h2>
              <p className="text-gray-600 mb-4">
                Review, edit watch metadata, and approve community-submitted photos
              </p>
              <div className="text-blue-600 hover:underline font-medium">
                Go to Photo Moderation →
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
