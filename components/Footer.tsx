'use client'

import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-surfaceAlt border-t border-border mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center mb-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.svg" alt="Watchems" className="h-7 w-auto" />
            </div>
            <p className="text-textSecond text-sm leading-relaxed max-w-sm">
              A community photo gallery for watch enthusiasts. Browse and upload real watch
              photos — from Seiko to Rolex, no affiliate links, no sponsored content.
            </p>
          </div>

          <div>
            <h4 className="text-textPrimary font-semibold text-sm mb-4">Community</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/upload" className="text-textSecond hover:text-accent text-sm transition-colors">
                  Upload a Photo
                </Link>
              </li>
              <li>
                <Link href="/" className="text-textSecond hover:text-accent text-sm transition-colors">
                  Browse Gallery
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-textMuted text-xs">
            © {new Date().getFullYear()} Watchems. All rights reserved.
          </p>
          <div className="flex flex-wrap gap-1 sm:gap-2">
            <Link href="/about" className="text-textMuted hover:text-textSecond text-xs transition-colors px-2 py-2 min-h-[44px] flex items-center">About</Link>
            <Link href="/about#contact" className="text-textMuted hover:text-textSecond text-xs transition-colors px-2 py-2 min-h-[44px] flex items-center">Contact</Link>
            <Link href="/privacy" className="text-textMuted hover:text-textSecond text-xs transition-colors px-2 py-2 min-h-[44px] flex items-center">Privacy</Link>
            <Link href="/terms" className="text-textMuted hover:text-textSecond text-xs transition-colors px-2 py-2 min-h-[44px] flex items-center">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
