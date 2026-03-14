import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="max-w-xl mx-auto px-4 py-24 text-center">
      <div className="text-[#d4a853] text-7xl font-bold mb-4">404</div>
      <h1 className="text-2xl font-bold text-white mb-3">Page Not Found</h1>
      <p className="text-slate-400 mb-8">
        The watch or page you&apos;re looking for doesn&apos;t exist in our database.
      </p>
      <div className="flex flex-wrap gap-3 justify-center">
        <Link href="/watches" className="btn-gold">Browse Watches</Link>
        <Link href="/" className="btn-outline">Go Home</Link>
      </div>
    </div>
  )
}
