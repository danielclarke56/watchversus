/**
 * Second pass: broader queries for remaining SVG-only watches.
 * Also validates the rolex-explorer-36 image downloaded in pass 1.
 */

import { writeFileSync, readFileSync, existsSync, statSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import https from 'https'
import http from 'http'
import { createWriteStream } from 'fs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_DIR = join(__dirname, '..', 'public', 'images', 'watches')
const MANIFEST_PATH = join(OUT_DIR, 'manifest.json')

// Remaining 11 + retry explorer with better query
const TARGETS = [
  { slug: 'rolex-submariner-41',    queries: ['Rolex Submariner watch', 'Rolex Submariner dive watch stainless', 'Submariner 124060'] },
  { slug: 'rolex-datejust-36',      queries: ['Rolex Datejust watch', 'Rolex Datejust 36 stainless white dial', 'Datejust 36'] },
  { slug: 'rolex-day-date-40',      queries: ['Rolex Day Date watch', 'Rolex Day-Date 40 gold', 'Day Date 228238'] },
  { slug: 'rolex-yacht-master-40',  queries: ['Rolex Yacht-Master watch', 'Rolex Yacht Master 40 oystersteel', 'Yacht-Master 40'] },
  { slug: 'cartier-tank-must',      queries: ['Cartier Tank watch', 'Cartier Tank Must wristwatch', 'Cartier Tank automatic'] },
  { slug: 'nomos-tangente-38',      queries: ['Nomos Tangente watch', 'Nomos watch Glashütte', 'Nomos Glashutte Tangente'] },
  { slug: 'baltic-bicompax-001',    queries: ['Baltic watch bicompax chronograph', 'Baltic Bicompax chronograph'] },
  { slug: 'halios-seaforth',        queries: ['Halios watch', 'Halios Seaforth diver watch'] },
  { slug: 'halios-tropik',          queries: ['Halios Tropik watch', 'Halios dive watch'] },
  { slug: 'zenith-el-primero-chronomaster', queries: ['Zenith El Primero watch', 'Zenith chronograph El Primero', 'Zenith Chronomaster watch'] },
  { slug: 'frederique-constant-classics-auto', queries: ['Frederique Constant watch', 'Frederique Constant Classics automatic', 'Frederique Constant dress watch'] },
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

function downloadFile(url, dest, redirectCount = 0) {
  return new Promise((resolve, reject) => {
    if (redirectCount > 5) return reject(new Error('Too many redirects'))
    const lib = url.startsWith('https') ? https : http
    const file = createWriteStream(dest)
    lib.get(url, { headers: { 'User-Agent': 'WatchVsWatch/1.0 (contact@watchvswatch.com)' } }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        file.close()
        return downloadFile(res.headers.location, dest, redirectCount + 1).then(resolve).catch(reject)
      }
      if (res.statusCode !== 200) {
        file.close()
        return reject(new Error(`HTTP ${res.statusCode}`))
      }
      res.pipe(file)
      file.on('finish', () => file.close(resolve))
      file.on('error', reject)
    }).on('error', reject)
  })
}

async function searchWikimedia(query) {
  const url = `https://commons.wikimedia.org/w/api.php?action=query&list=search&srnamespace=6&srsearch=${encodeURIComponent(query)}&srlimit=10&format=json`
  const result = await fetchJson(url)
  return result?.query?.search || []
}

async function getImageInfo(title) {
  const url = `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=imageinfo&iiprop=url|size|mime&iiurlwidth=800&format=json`
  const result = await fetchJson(url)
  const pages = result?.query?.pages || {}
  return Object.values(pages)[0]?.imageinfo?.[0]
}

async function trySource(slug, queries) {
  // Skip if already has a JPG
  const existing = [join(OUT_DIR, `${slug}.jpg`), join(OUT_DIR, `${slug}.png`)]
  for (const p of existing) {
    if (existsSync(p) && statSync(p).size > 10000) {
      console.log(`[${slug}] Already has image — skipping`)
      return true
    }
  }

  for (const query of queries) {
    console.log(`[${slug}] Query: "${query}"`)
    const hits = await searchWikimedia(query)
    
    for (const hit of hits) {
      const title = hit.title
      const titleLower = title.toLowerCase()
      if (!titleLower.endsWith('.jpg') && !titleLower.endsWith('.jpeg') && !titleLower.endsWith('.png')) continue
      
      // Basic relevance filter — skip obviously wrong matches
      const brand = slug.split('-')[0]
      if (brand === 'rolex' && !titleLower.includes('rolex')) continue
      if (brand === 'cartier' && !titleLower.includes('cartier')) continue
      if (brand === 'zenith' && !titleLower.includes('zenith')) continue
      if (brand === 'nomos' && !titleLower.includes('nomos')) continue
      if (brand === 'frederique' && !titleLower.includes('frederiqu')) continue
      
      const info = await getImageInfo(title)
      if (!info?.url) continue
      if (!info.mime?.startsWith('image/')) continue
      
      const ext = info.mime === 'image/png' ? 'png' : 'jpg'
      const dest = join(OUT_DIR, `${slug}.${ext}`)
      
      try {
        await downloadFile(info.thumburl || info.url, dest)
        const size = statSync(dest).size
        if (size < 10000) { console.log(`  ✗ Too small (${size}B)`); continue }
        console.log(`  ✓ ${title} — ${(size/1024).toFixed(1)} KB`)
        return ext
      } catch (e) {
        console.log(`  ✗ ${e.message}`)
      }
      await new Promise(r => setTimeout(r, 300))
    }
  }
  return null
}

async function main() {
  const manifest = JSON.parse(readFileSync(MANIFEST_PATH, 'utf8'))
  const sourced = []
  const needsAI = []

  for (const { slug, queries } of TARGETS) {
    const result = await trySource(slug, queries)
    if (result) {
      const ext = result === true ? (existsSync(join(OUT_DIR, `${slug}.jpg`)) ? 'jpg' : 'png') : result
      manifest[slug] = `/images/watches/${slug}.${ext}`
      sourced.push(slug)
    } else {
      needsAI.push(slug)
    }
    await new Promise(r => setTimeout(r, 400))
  }

  writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2))
  console.log(`\n✓ Sourced: ${sourced.join(', ') || 'none'}`)
  console.log(`⚠ Needs AI: ${needsAI.join(', ') || 'none'}`)
}

main().catch(console.error)
