import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { neon } = require('@neondatabase/serverless');
const { config } = require('dotenv');
config({ path: '.env.local' });
const sql = neon(process.env.DATABASE_URL);
const rows = await sql`SELECT id, watch_id, status, url, created_at FROM photos ORDER BY created_at DESC LIMIT 20`;
console.log('Total rows:', rows.length);
rows.forEach(r => console.log(r.status, '|', r.watch_id, '|', (r.url || '').substring(0, 70)));
