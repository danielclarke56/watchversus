import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

/**
 * Auto-record terms acceptance on first authenticated page visit.
 * The sign-up modal displays "By signing up, you agree to our Terms
 * of Use and Privacy Policy" — creating an account = implicit acceptance.
 */
export async function ensureTermsAccepted(userId: string) {
  const row = await db
    .select({ clerkId: users.clerkId })
    .from(users)
    .where(eq(users.clerkId, userId))
    .limit(1)

  if (row.length === 0) {
    await db.insert(users).values({
      clerkId: userId,
      termsAcceptedAt: new Date(),
    })
  }
}
