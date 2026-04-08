import Link from 'next/link'

interface UserAttributionProps {
  userName: string
  userId: string
  isOfficial?: boolean
  className?: string
  onClick?: (e: React.MouseEvent) => void
}

export default function UserAttribution({
  userName,
  userId,
  isOfficial = false,
  className = 'text-gray-400 text-xs',
  onClick,
}: UserAttributionProps) {
  return (
    <p className={className}>
      by{' '}
      {isOfficial ? (
        <span className="text-amber-600">Watchems</span>
      ) : (
        <Link
          href={`/profile/${userId}`}
          className="text-amber-600 hover:text-amber-700 underline transition-colors"
          onClick={onClick}
        >
          {userName}
        </Link>
      )}
    </p>
  )
}
