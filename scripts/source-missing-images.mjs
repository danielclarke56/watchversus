/**
 * Source press photos for 14 SVG-only watches.
 * Strategy: Wikimedia Commons API search → download best match.
 * Fallback: log "NEEDS_AI" for any that can't be sourced.
 */

import { writeFileSync, readFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import https from 'https'
import http from 'http'
import { createWriteStream } from 'fs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_DIR = join(__dirname, '..', 'public', 'images', 'watches')
const MANIFEST_PATH = join(OUT_DIR, 'manifest.json')

// 14 watches needing images
const TARGETS = [
  { slug: 'rolex-submariner-41',         query: 'Rolex Submariner 124060 watch' },
  { slug: 'rolex-gmt-master-ii-pepsi',   query: 'Rolex GMT Master II 126710BLRO Pepsi watch' },
  { slug: 'rolex-datejust-36',           query: 'Rolex Datejust 36 126200 watch' },
  { slug: 'rolex-explorer-36',           query: 'Rolex Explorer 124270 watch' },
  { slug: 'rolex-day-date-40',           query: 'Rolex Day Date 40 228238 watch' },
  { slug: 'rolex-yacht-master-40',       query: 'Rolex Yacht Master 40 126622 watch' },
  { slug: 'cartier-santos',              query: 'Cartier Santos watch wristwatch' },
  { slug: 'cartier-tank-must',           query: 'Cartier Tank Must watch wristwatch' },
  { slug: 'nomos-tangente-38',           query: 'Nomos Tangente 38 watch' },
  { slug: 'baltic-bicompax-001',         query: 'Baltic Bicompax 001 watch' },
  { slug: 'halios-seaforth',             query: 'Halios Seaforth watch' },
  { slug: 'halios-tropik',               query: 'Halios Tropik watch' },
  { slug: 'zenith-el-primero-chronomaster', query: 'Zenith El Primero Chronomaster watch' },
  { slug: 'frederique-constant-classics-auto', query: 'Frederique Constant Classics Automatic watch' },
]

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? https : http
    lib.get(url, { headers: { 'User-Agent': 'WatchVsWatch/1.0 (contact@watchvswatch.com)' } }, (res) => {
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => {
        try { resolve(JSON.parse(data)) }
        catch (e) { reject(e) }
      })
    }).on('error', reject)
  })
}

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? https : http
    const file = createWriteStream(dest)
    lib.get(url, { headers: { 'User-Agent': 'WatchVsWatch/1.0 (contact@watchvswatch.com)' } }, (res) => {
      // Handle redirects
      if (res.statusCode === 301 || res.statusCode === 302) {
        file.close()
        return downloadFile(res.headers.location, dest).then(resolve).catch(reject)
      }
      if (res.statusCode !== 200) {
        file.close()
        return reject(new Error(`HTTP ${res.statusCode} for ${url}`))
      }
      res.pipe(file)
      file.on('finish', () => file.close(resolve))
      file.on('error', reject)
    }).on('error', reject)
  })
}

async function searchWikimedia(query) {
  // Search Wikimedia Commons for images matching query
  const searchUrl = `https://commons.wikimedia.org/w/api.php?action=query&list=search&srnamespace=6&srsearch=${encodeURIComponent(query)}&srlimit=5&format=json`
  const result = await fetchJson(searchUrl)
  const hits = result?.query?.search || []
  return hits
}

async function getWikimediaImageUrl(title) {
  // Get image info (direct URL) for a file title
  const infoUrl = `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=imageinfo&iiprop=url|size|mime&iiurlwidth=800&format=json`
  const result = await fetchJson(infoUrl)
  const pages = result?.query?.pages || {}
  const page = Object.values(pages)[0]
  const info = page?.imageinfo?.[0]
  return info
}

async function trySourceWatch(slug, query) {
  console.log(`\n[${slug}] Searching: "${query}"`)
  
  const hits = await searchWikimedia(query)
  if (!hits.length) {
    console.log(`  ✗ No Wikimedia results`)
    return null
  }

  for (const hit of hits) {
    const title = hit.title // e.g. "File:Rolex Submariner.jpg"
    if (!title.toLowerCase().includes('.jpg') && !title.toLowerCase().includes('.jpeg') && !title.toLowerCase().includes('.png')) {
      continue
    }
    
    console.log(`  → Checking: ${title}`)
    const info = await getWikimediaImageUrl(title)
    if (!info?.url) continue

    const mime = info.mime || ''
    if (!mime.startsWith('image/')) continue

    const ext = mime === 'image/png' ? 'png' : 'jpg'
    const destPath = join(OUT_DIR, `${slug}.${ext}`)
    
    try {
      await downloadFile(info.thumburl || info.url, destPath)
      const { statSync } = await import('fs')
      const size = statSync(destPath).size
      if (size < 5000) {
        console.log(`  ✗ File too small (${size} bytes), skipping`)
        continue
      }
      console.log(`  ✓ Downloaded ${ext.toUpperCase()}: ${(size/1024).toFixed(1)} KB`)
      return `/${ext === 'png' ? 'png' : 'jpg'}:${slug}.${ext}`
    } catch (e) {
      console.log(`  ✗ Download failed: ${e.message}`)
    }
  }
  
  return null
}

async function main() {
  const manifest = JSON.parse(readFileSync(MANIFEST_PATH, 'utf8'))
  const sourced = []
  const needsAI = []

  for (const { slug, query } of TARGETS) {
    const result = await trySourceWatch(slug, query)
    if (result) {
      const ext = result.startsWith('/png:') ? 'png' : 'jpg'
      manifest[slug] = `/images/watches/${slug}.${ext}`
      sourced.push(slug)
    } else {
      needsAI.push(slug)
    }
    // Polite delay
    await new Promise(r => setTimeout(r, 500))
  }

  writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2))

  console.log('\n=== RESULTS ===')
  console.log(`✓ Sourced (${sourced.length}): ${sourced.join(', ') || 'none'}`)
  console.log(`⚠ Needs AI (${needsAI.length}): ${needsAI.join(', ') || 'none'}`)
  console.log('\nManifest updated.')
}

main().catch(console.error)
