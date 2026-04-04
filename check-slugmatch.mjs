import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
dotenv.config({ path: '.env.local' });

const watches = JSON.parse(readFileSync('./data/watches.json', 'utf8'));
const slugSet = new Set(watches.map(w => w.slug));

const sql = neon(process.env.DATABASE_URL);
const rows = await sql`SELECT DISTINCT watch_id FROM photos ORDER BY watch_id`;

const missing = rows.filter(r => !slugSet.has(r.watch_id));
const found = rows.filter(r => slugSet.has(r.watch_id));
console.log('MISSING from watches.json:', missing.map(r => r.watch_id));
console.log('\nFOUND in watches.json:', found.map(r => r.watch_id));
