require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);
sql`SELECT id, watch_id, status, url, created_at FROM photos WHERE status = 'approved' ORDER BY created_at ASC LIMIT 10`
  .then(r => {
    console.log('approved count:', r.length);
    r.forEach(p => console.log(p.status, '|', p.watch_id, '|', (p.url || '').slice(0, 70)));
  })
  .catch(e => console.error('DB error:', e.message));
