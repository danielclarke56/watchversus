import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
const sql = neon(process.env.DATABASE_URL);
const rows = await sql`SELECT watch_id, COUNT(*) as cnt FROM photos GROUP BY watch_id ORDER BY cnt DESC LIMIT 20`;
console.log(JSON.stringify(rows, null, 2));
