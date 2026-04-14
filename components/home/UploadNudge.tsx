'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { X } from 'lucide-react'

const SESSION_KEY = 'watchems_upload_nudge_seen'
const DELAY_MS = 3000

export default function UploadNudge() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY)) return

    const t = setTimeout(() => {
      setVisible(true)
      sessionStorage.setItem(SESSION_KEY, '1')
    }, DELAY_MS)

    return () => clearTimeout(t)
  }, [])

  if (!visible) return null

  return (
    <div
      className="fixed bottom-6 right-6 z-50 max-w-xs w-full animate-slide-up"
      role="status"
      aria-live="polite"
    >
      <div className="bg-gray-900 text-white rounded-2xl shadow-2xl px-5 py-4 flex items-start gap-3">
        {/* Watch icon */}
        <span className="text-2xl leading-none mt-0.5" aria-hidden="true">⌚</span>

        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm leading-snug">
            Got a watch on your wrist?
          </p>
          <p className="text-gray-400 text-xs mt-0.5 leading-snug">
            Share a photo and help other enthusiasts see it in the wild.
          </p>
          <Link
            href="/upload"
            onClick={() => setVisible(false)}
            className="inline-block mt-2.5 text-xs font-semibold bg-white text-gray-900 rounded-lg px-3 py-1.5 hover:bg-gray-100 transition-colors"
          >
            Upload a photo →
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setVisible(false)}
          className="text-gray-500 hover:text-white transition-colors shrink-0 -mt-0.5 -mr-1"
          aria-label="Dismiss"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  )
}
