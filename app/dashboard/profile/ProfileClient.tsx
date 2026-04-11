'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useUser } from '@clerk/nextjs'

interface ProfileClientProps {
  userId: string
  displayName: string
  firstName: string
  lastName: string
  username: string
  avatarUrl: string | null
  email: string
}

export default function ProfileClient({
  userId,
  displayName,
  firstName: initialFirst,
  lastName: initialLast,
  username,
  avatarUrl: initialAvatar,
  email,
}: ProfileClientProps) {
  const { user, isLoaded } = useUser()
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState(initialAvatar)
  const [firstName, setFirstName] = useState(initialFirst)
  const [lastName, setLastName] = useState(initialLast)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const profileHref = username ? `/u/${username}` : `/profile/${userId}`

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !user) return

    setUploading(true)
    try {
      await user.setProfileImage({ file })
      // Refresh to get the new URL
      await user.reload()
      setAvatarUrl(user.imageUrl)
    } catch (err) {
      console.error('Failed to upload avatar:', err)
      alert('Failed to upload image. Please try a smaller file.')
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  async function handleRemoveAvatar() {
    if (!user) return
    if (!confirm('Remove your profile photo?')) return
    setUploading(true)
    try {
      await user.setProfileImage({ file: null })
      await user.reload()
      setAvatarUrl(null)
    } catch (err) {
      console.error('Failed to remove avatar:', err)
    } finally {
      setUploading(false)
    }
  }

  async function handleSaveName() {
    if (!user) return
    setSaving(true)
    setSaved(false)
    try {
      await user.update({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      console.error('Failed to update name:', err)
    } finally {
      setSaving(false)
    }
  }

  const initials = displayName
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('')

  return (
    <div className="py-6 sm:py-8 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">My Profile</h1>

        {/* Avatar section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Profile Photo</h2>
          <div className="flex items-center gap-5">
            <div className="relative shrink-0">
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt={displayName}
                  width={80}
                  height={80}
                  className="w-20 h-20 rounded-full object-cover"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center text-xl font-semibold text-gray-500">
                  {initials}
                </div>
              )}
              {uploading && (
                <div className="absolute inset-0 bg-white/70 rounded-full flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
            <div className="space-y-2">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading || !isLoaded}
                  className="px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors disabled:opacity-50"
                >
                  {avatarUrl ? 'Change Photo' : 'Upload Photo'}
                </button>
                {avatarUrl && (
                  <button
                    type="button"
                    onClick={handleRemoveAvatar}
                    disabled={uploading || !isLoaded}
                    className="px-3 py-1.5 text-sm font-medium text-red-500 hover:text-red-700 transition-colors disabled:opacity-50"
                  >
                    Remove
                  </button>
                )}
              </div>
              <p className="text-xs text-gray-500">JPG, PNG, or WebP. Max 10MB.</p>
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleAvatarUpload}
                className="hidden"
              />
            </div>
          </div>
        </div>

        {/* Name section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Display Name</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">First name</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                maxLength={50}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Last name</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                maxLength={50}
              />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-3">
            <button
              type="button"
              onClick={handleSaveName}
              disabled={saving || !isLoaded}
              className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            {saved && <span className="text-sm text-green-600 font-medium">Saved</span>}
          </div>
        </div>

        {/* Info section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Account Info</h2>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Email</span>
              <span className="text-gray-900">{email}</span>
            </div>
            {username && (
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Username</span>
                <span className="text-gray-900">@{username}</span>
              </div>
            )}
          </div>
        </div>

        {/* Public profile link */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-2">Public Profile</h2>
          <p className="text-sm text-gray-500 mb-3">
            Your public profile shows your approved photos and is visible to everyone.
          </p>
          <Link
            href={profileHref}
            className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
          >
            View your public profile
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  )
}
