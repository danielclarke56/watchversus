import { drizzle } from 'drizzle-orm/neon-http'
import { sql } from 'drizzle-orm'
import * as schema from './schema'

// Lazy db instance — only created on first use, avoids build-time errors when
// DATABASE_URL is not configured (local dev without Neon).
let _db: ReturnType<typeof drizzle<typeof schema>> | null = null

export function getDb() {
  if (_db) return _db
  const DATABASE_URL = process.env.DATABASE_URL
  if (!DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set')
  }
  _db = drizzle(DATABASE_URL, { schema })
  return _db
}

// Convenience alias — routes that import `db` directly will still work.
// We use a Proxy so the module-level import doesn't eagerly evaluate.
export const db = new Proxy({} as ReturnType<typeof drizzle<typeof schema>>, {
  get(_target, prop) {
    return (getDb() as unknown as Record<string | symbol, unknown>)[prop]
  },
})

/**
 * Health check for database connectivity
 */
export async function checkDatabase() {
  try {
    await getDb().execute(sql`SELECT 1`)
    return { ok: true }
  } catch (error) {
    return { ok: false, error }
  }
}
