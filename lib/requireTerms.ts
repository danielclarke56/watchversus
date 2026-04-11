import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

/**
 * Server-side check: redirect to /accept-terms if the user hasn't accepted.
 * Call this in any server component or layout that requires terms acceptance.
 */
export async function requireTermsAccepted(userId: string) {
  const row = await db
    .select({ termsAcceptedAt: users.termsAcceptedAt })
    .from(users)
    .where(eq(users.clerkId, userId))
    .limit(1)

  const hasAccepted = row.length > 0 && row[0].termsAcceptedAt !== null
  if (!hasAccepted) {
    redirect('/accept-terms')
  }
}
