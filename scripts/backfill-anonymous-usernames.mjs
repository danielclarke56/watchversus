/**
 * Backfill script: Replace "Anonymous" userName values in the photos table
 * with a proper display name looked up from Clerk.
 *
 * Fallback chain (matches the app's upload logic):
 *   1. firstName + last initial
 *   2. username
 *   3. email local-part (before @)
 *   4. keep "Anonymous" if nothing else is available
 *
 * Usage:
 *   DATABASE_URL="..." CLERK_SECRET_KEY="sk_live_..." node scripts/backfill-anonymous-usernames.mjs [--dry-run]
 */

import { neon } from '@neondatabase/serverless'
import { createClerkClient } from '@clerk/backend'

const DRY_RUN = process.argv.includes('--dry-run')

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is required')
  process.exit(1)
}
if (!process.env.CLERK_SECRET_KEY) {
  console.error('CLERK_SECRET_KEY is required')
  process.exit(1)
}

const sql = neon(process.env.DATABASE_URL)
const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY })

function buildDisplayName(user) {
  const firstName = user.firstName?.trim()
  const lastName = user.lastName?.trim()
  const username = user.username?.trim()
  const email = user.emailAddresses?.[0]?.emailAddress

  if (firstName) {
    return `${firstName}${lastName ? ' ' + lastName.charAt(0) + '.' : ''}`
  }
  if (username) return username
  if (email) return email.split('@')[0]
  return 'Anonymous'
}

async function main() {
  console.log(`\n=== Backfill Anonymous Usernames ${DRY_RUN ? '(DRY RUN)' : ''} ===\n`)

  // Get unique users with Anonymous photos
  const anonUsers = await sql`
    SELECT user_id, COUNT(*)::int AS photo_count
    FROM photos
    WHERE user_name = 'Anonymous'
    GROUP BY user_id
    ORDER BY photo_count DESC
  `

  console.log(`Found ${anonUsers.length} distinct users with Anonymous photos\n`)

  let totalUpdated = 0
  let totalSkipped = 0

  for (const { user_id, photo_count } of anonUsers) {
    try {
      const user = await clerk.users.getUser(user_id)
      const newName = buildDisplayName(user)

      if (newName === 'Anonymous') {
        console.log(`  [SKIP] ${user_id} — no usable name found in Clerk (${photo_count} photos)`)
        totalSkipped += photo_count
        continue
      }

      console.log(`  [${DRY_RUN ? 'DRY' : 'UPDATE'}] ${user_id} → "${newName}" (${photo_count} photos)`)

      if (!DRY_RUN) {
        await sql`UPDATE photos SET user_name = ${newName} WHERE user_id = ${user_id} AND user_name = 'Anonymous'`
      }
      totalUpdated += photo_count
    } catch (err) {
      console.log(`  [ERROR] ${user_id} — ${err.message}`)
      totalSkipped += photo_count
    }
  }

  console.log(`\n=== Summary ===`)
  console.log(`Photos updated: ${totalUpdated}`)
  console.log(`Photos skipped: ${totalSkipped}`)
  console.log(`${DRY_RUN ? '(Dry run — no changes written)' : 'Done.'}\n`)
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
