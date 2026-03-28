import { neon } from '@neondatabase/serverless'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

async function main() {
  const sql = neon(process.env.DATABASE_URL!)
  const rows = await sql`SELECT id, watch_id, status, url, created_at FROM photos ORDER BY created_at DESC LIMIT 20`
  console.log('Total rows:', rows.length)
  rows.forEach((r: Record<string, unknown>) => console.log(r.status, '|', r.watch_id, '|', String(r.url || '').substring(0, 80)))
}

main().catch(console.error)
