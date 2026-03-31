import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

const all = await sql`SELECT id, watch_id, user_name, url, status FROM photos WHERE status = 'approved' ORDER BY created_at DESC`;
console.log('Total approved:', all.length);
console.log('Unique watchIds:', [...new Set(all.map(p => p.watch_id))].length);

// Check for duplicates
const watchIdCounts = {};
for (const p of all) {
  watchIdCounts[p.watch_id] = (watchIdCounts[p.watch_id] || 0) + 1;
}
const dupes = Object.entries(watchIdCounts).filter(([, c]) => c > 1);
if (dupes.length) console.log('Duplicate watchIds:', JSON.stringify(dupes));

// Check for non-R2 URLs
const nonR2 = all.filter(p => !p.url.startsWith('https://pub-'));
if (nonR2.length) console.log('Non-R2 URLs:', JSON.stringify(nonR2.map(p => p.url)));
else console.log('All URLs are R2');

// List all watchIds
console.log('All watchIds:', all.map(p => p.watch_id));
