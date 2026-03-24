import { redirect } from 'next/navigation'
import { getRedis } from '@/lib/redis'
import { checkAdmin } from '@/lib/admin'
import type { ComparisonRequest } from '@/app/api/comparison-requests/route'

async function getRequests(): Promise<ComparisonRequest[]> {
  const redis = getRedis()
  if (!redis) return []

  try {
    const raw = (await redis.lrange('comparison-requests', 0, -1)) as string[]
    return raw.map((r) => (typeof r === 'string' ? JSON.parse(r) : r))
  } catch {
    return []
  }
}

export default async function AdminComparisonRequestsPage() {
  let userId: string | null = null

  try {
    const { auth } = await import('@clerk/nextjs/server')
    const session = await auth()
    userId = session.userId
  } catch {
    // Clerk not configured
  }

  if (!userId) redirect('/')
  if (!checkAdmin(userId)) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <p className="text-red-400">Access denied.</p>
      </div>
    )
  }

  const requests = await getRequests()

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-textPrimary mb-1">Comparison Requests</h1>
        <p className="text-textSecond text-sm">
          {requests.length} request{requests.length !== 1 ? 's' : ''} from the community
        </p>
      </div>

      {requests.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-textMuted">No requests yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((req) => (
            <div key={req.id} className="card p-4">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-sm font-bold text-textPrimary">{req.watch1}</span>
                <span className="text-xs text-accent font-bold">VS</span>
                <span className="text-sm font-bold text-textPrimary">{req.watch2}</span>
                <span className="ml-auto text-xs text-textMuted">
                  {new Date(req.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
              {req.email && (
                <p className="text-xs text-textMuted mt-1">
                  Notify: {req.email}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
