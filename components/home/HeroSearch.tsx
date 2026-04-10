'use client'

import Link from 'next/link'

export default function HeroSearch() {
  return (
    <section>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-2">
        <h1 className="text-sm sm:text-base font-semibold text-gray-900 text-center">
          Watches worn in real life
          <span className="mx-1.5 text-gray-300 font-normal">·</span>
          <span className="text-gray-400 font-normal">Real photos from watch owners</span>
          <span className="mx-1.5 text-gray-300 font-normal">·</span>
          <Link href="/upload" className="text-gray-400 hover:text-gray-600 underline font-normal">
            Upload yours
          </Link>
        </h1>
      </div>
    </section>
  )
}
