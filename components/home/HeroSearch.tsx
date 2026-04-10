'use client'

import Link from 'next/link'
import GallerySearch from '@/components/home/GallerySearch'

export default function HeroSearch() {
  return (
    <section>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 pb-4 sm:pt-8 sm:pb-5">
        <h1 className="text-lg sm:text-xl font-bold text-gray-900 text-center mb-0.5">
          Watches worn in real life
        </h1>
        <p className="text-xs sm:text-sm text-gray-400 text-center mb-3">
          Real photos from watch owners around the world
          <span className="mx-1.5 text-gray-300">·</span>
          <Link href="/upload" className="text-gray-400 hover:text-gray-600 underline">
            Upload yours
          </Link>
        </p>
        <GallerySearch />
      </div>
    </section>
  )
}
