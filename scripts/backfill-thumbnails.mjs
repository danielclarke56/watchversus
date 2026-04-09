/**
 * Backfill script: Generate 600px WebP thumbnails for all approved photos
 * that currently have no thumbnailUrl. Downloads each main image from R2,
 * resizes via sharp, uploads back to R2 under .thumb.webp suffix, and
 * updates the photos.thumbnail_url column.
 *
 * Usage:
 *   DATABASE_URL="..." \
 *   R2_ACCOUNT_ID="..." R2_ACCESS_KEY_ID="..." R2_SECRET_ACCESS_KEY="..." \
 *   R2_BUCKET_NAME="..." R2_PUBLIC_URL="..." \
 *   node scripts/backfill-thumbnails.mjs [--dry-run]
 */

import { neon } from '@neondatabase/serverless'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import sharp from 'sharp'

const DRY_RUN = process.argv.includes('--dry-run')

const required = ['DATABASE_URL', 'R2_ACCOUNT_ID', 'R2_ACCESS_KEY_ID', 'R2_SECRET_ACCESS_KEY', 'R2_BUCKET_NAME', 'R2_PUBLIC_URL']
for (const k of required) {
  if (!process.env[k]) {
    console.error(`Missing required env var: ${k}`)
    process.exit(1)
  }
}

const sql = neon(process.env.DATABASE_URL)

const s3 = new S3Client({
  region: 'auto',
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
})

const BUCKET = process.env.R2_BUCKET_NAME
const PUBLIC_URL = process.env.R2_PUBLIC_URL

function r2KeyFromUrl(url) {
  if (!url.startsWith(PUBLIC_URL)) return null
  return url.replace(PUBLIC_URL, '').replace(/^\//, '')
}

async function main() {
  console.log(`\n=== Backfill Thumbnails ${DRY_RUN ? '(DRY RUN)' : ''} ===\n`)

  const rows = await sql`
    SELECT id, watch_id, url
    FROM photos
    WHERE status = 'approved' AND thumbnail_url IS NULL
    ORDER BY created_at DESC
  `
  console.log(`Found ${rows.length} approved photos without a thumbnail\n`)

  let success = 0
  let failed = 0

  for (const row of rows) {
    const key = r2KeyFromUrl(row.url)
    if (!key) {
      console.log(`  [SKIP] ${row.id.slice(0, 8)} — non-R2 URL: ${row.url}`)
      failed++
      continue
    }

    try {
      const res = await fetch(row.url)
      if (!res.ok) throw new Error(`fetch failed: ${res.status}`)
      const arrayBuffer = await res.arrayBuffer()
      const buf = Buffer.from(arrayBuffer)

      const thumbBuf = await sharp(buf)
        .rotate()
        .resize(600, 600, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 75 })
        .toBuffer()

      const thumbKey = `user-photos/${row.watch_id}/${row.id}.thumb.webp`
      const thumbUrl = `${PUBLIC_URL}/${thumbKey}`

      if (DRY_RUN) {
        console.log(`  [DRY] ${row.id.slice(0, 8)} → ${thumbBuf.length} bytes → ${thumbUrl}`)
      } else {
        await s3.send(
          new PutObjectCommand({
            Bucket: BUCKET,
            Key: thumbKey,
            Body: thumbBuf,
            ContentType: 'image/webp',
            CacheControl: 'public, max-age=31536000, immutable',
          })
        )
        await sql`UPDATE photos SET thumbnail_url = ${thumbUrl} WHERE id = ${row.id}`
        console.log(`  [OK] ${row.id.slice(0, 8)} → ${thumbBuf.length} bytes`)
      }
      success++
    } catch (err) {
      console.log(`  [ERROR] ${row.id.slice(0, 8)} — ${err.message}`)
      failed++
    }
  }

  console.log(`\n=== Summary ===`)
  console.log(`Succeeded: ${success}`)
  console.log(`Failed: ${failed}`)
  console.log(`${DRY_RUN ? '(Dry run — no changes written)' : 'Done.'}\n`)
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
