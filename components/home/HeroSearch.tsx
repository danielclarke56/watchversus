'use client'

import Link from 'next/link'
import GallerySearch from '@/components/home/GallerySearch'

export default function HeroSearch() {
  return (
    <section>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-6 sm:pt-14 sm:pb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 text-center mb-3">
          Watches worn in real life
        </h1>
        <p className="text-base sm:text-lg text-gray-500 text-center mb-6">
          Browse real photos from watch owners around the world
        </p>
        <div className="w-full">
          <GallerySearch />
          <p className="mt-2 text-sm text-center text-gray-400">
            📷 Own a watch?{' '}
            <Link href="/upload" className="hover:text-gray-600 underline">
              Upload a photo
            </Link>
          </p>
        </div>
      </div>
    </section>
  )
}
