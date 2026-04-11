import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

/**
 * Ensure the user has a record in the users table with terms accepted.
 * Since the sign-up page displays "By creating an account, you agree to
 * our Terms of Use and Privacy Policy", signing up = implicit acceptance.
 * This auto-creates the user record on first authenticated page visit.
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
