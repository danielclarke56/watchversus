import 'dotenv/config'
import { Client } from 'pg'

const client = new Client({ connectionString: process.env.DATABASE_URL })

try {
  await client.connect()
  const res = await client.query(
    `SELECT column_name, data_type FROM information_schema.columns WHERE table_name='photos' ORDER BY ordinal_position`
  )
  console.log('=== Columns in photos table ===')
  res.rows.forEach(r => console.log(`  ${r.column_name}: ${r.data_type}`))
  console.log(`\nTotal columns: ${res.rows.length}`)
} catch (err) {
  console.error('Query failed:', err.message)
} finally {
  await client.end()
}
