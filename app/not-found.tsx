import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="max-w-xl mx-auto px-4 py-24 text-center">
      <div className="text-[#5C5C5C] text-7xl font-bold mb-4">404</div>
      <h1 className="text-2xl font-bold text-[#0f172a] mb-3">Page Not Found</h1>
      <p className="text-[#475569] mb-8">
        The watch or page you&apos;re looking for doesn&apos;t exist in our database.
      </p>
      <div className="flex flex-wrap gap-3 justify-center">
        <Link href="/watches" className="btn-gold">Browse Watches</Link>
        <Link href="/" className="btn-outline">Go Home</Link>
      </div>
    </div>
  )
}
