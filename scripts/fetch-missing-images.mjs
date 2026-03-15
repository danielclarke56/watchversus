/**
 * Targeted image downloader for watches still on SVG placeholders.
 * Uses known CDN URL patterns and og:image scraping.
 */

import { writeFileSync, existsSync, readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_DIR = join(__dirname, '..', 'public', 'images', 'watches')
const MANIFEST_PATH = join(OUT_DIR, 'manifest.json')

const manifest = JSON.parse(readFileSync(MANIFEST_PATH, 'utf8'))

// Only target watches still on SVG
const SVG_WATCHES = Object.entries(manifest)
  .filter(([, v]) => v.endsWith('.svg'))
  .map(([slug]) => slug)

console.log(`\nSVG placeholders to replace: ${SVG_WATCHES.length}`)
console.log(SVG_WATCHES.join(', '))
console.log()

// Known CDN URL patterns for each brand
// These are direct image URLs that don't require JS rendering
const DIRECT_IMAGE_URLS = {
  // Rolex CDN — publicly accessible content2.rolex.com
  'rolex-submariner-41':        'https://content2.rolex.com/dam/watches/family-page/all-models/m126610ln-hero.jpg',
  'rolex-gmt-master-ii-pepsi':  'https://content2.rolex.com/dam/watches/family-page/all-models/m126710blro-hero.jpg',
  'rolex-datejust-36':          'https://content2.rolex.com/dam/watches/family-page/all-models/m126200-hero.jpg',
  'rolex-explorer-36':          'https://content2.rolex.com/dam/watches/family-page/all-models/m124270-hero.jpg',
  'rolex-day-date-40':          'https://content2.rolex.com/dam/watches/family-page/all-models/m228238-hero.jpg',
  'rolex-yacht-master-40':      'https://content2.rolex.com/dam/watches/family-page/all-models/m126622-hero.jpg',

  // Tudor CDN
  'tudor-black-bay-58':         'https://www.tudorwatch.com/media/catalog/product/cache/1/image/800x800/9df78eab33525d08d6e5fb8d27136e95/T/U/TUDOR_M79030N-0001_1.jpg',

  // Omega — product catalog CDN (reference-based paths)
  'omega-seamaster-300m':       'https://www.omegawatches.com/media/catalog/product/2/1/210.30.42.20.03.001_001.jpg',
  'omega-speedmaster-moonwatch':'https://www.omegawatches.com/media/catalog/product/3/1/310.30.42.50.01.001_001.jpg',
  'omega-aqua-terra-38':        'https://www.omegawatches.com/media/catalog/product/2/2/220.10.38.20.03.001_001.jpg',
  'omega-constellation-39':     'https://www.omegawatches.com/media/catalog/product/1/3/131.10.39.20.01.001_001.jpg',

  // TAG Heuer product CDN
  'tag-heuer-carrera-42':       'https://media.tagheuer.com/is/image/TagHeuer/xlarge/CBN2A1B.BA0643_1.png',
  'tag-heuer-aquaracer-300':    'https://media.tagheuer.com/is/image/TagHeuer/xlarge/WBP2010.BA0632_1.png',

  // IWC media server
  'iwc-pilot-mark-xviii':       'https://www.iwc.com/content/dam/rcq/iwc/21/01/37/9/2101379.png.transform/large/img.png',

  // Panerai CDN
  'panerai-luminor-44-pam01312':'https://www.panerai.com/content/dam/rcq/pan/18/09/89/6/1809896.png.transform/large/img.png',

  // Cartier CDN
  'cartier-santos':             'https://www.cartier.com/dw/image/v2/BCRG_PRD/on/demandware.static/-/Sites-cartier-master/default/dw7d3b9b4b/images/large/637709a0c2bf08a00b421d17/637709a0c2bf08a00b421d17.png',
  'cartier-tank-must':          'https://www.cartier.com/dw/image/v2/BCRG_PRD/on/demandware.static/-/Sites-cartier-master/default/dw6e9b7c8f/images/large/638f7e93c2bf08a00b421d43/638f7e93c2bf08a00b421d43.png',

  // AP — public press images
  'ap-royal-oak-15500':         'https://www.audemarspiguet.com/content/dam/ap/com/watches/collections/royal-oak/15500ST.OO.1220ST.01/images/main/15500ST.OO.1220ST.01_Front.jpg',

  // Patek
  'patek-philippe-nautilus-5711':'https://www.patek.com/resource/img/photos/png/5711-1A-010_front.png',

  // Vacheron
  'vacheron-constantin-overseas-4500v': 'https://www.vacheron-constantin.com/dam/rcq/vac/15/36/44/7/1536447.png.transform/vccom-image-fullscreen/img.png',

  // NOMOS (Shopify-based, product images are served via CDN)
  'nomos-club-campus':          'https://nomos-glashuette.com/cdn/shop/products/nomos-club-campus-710-front.jpg',
  'nomos-tangente-38':          'https://nomos-glashuette.com/cdn/shop/products/nomos-tangente-38-139-front.jpg',

  // Baltic (Shopify)
  'baltic-aquascaphe':          'https://www.balticwatches.com/cdn/shop/products/Baltic-Aquascaphe-Black-Dial-front.jpg',
  'baltic-bicompax-001':        'https://www.balticwatches.com/cdn/shop/products/Baltic-Bicompax-001-front.jpg',

  // Halios (Shopify)
  'halios-seaforth':            'https://halioswatches.com/cdn/shop/products/Seaforth-Black-Dial-front.jpg',
  'halios-tropik':              'https://halioswatches.com/cdn/shop/products/Tropik-Black-Dial-front.jpg',

  // Christopher Ward (Shopify)
  'christopher-ward-c65-trident': 'https://www.christopherward.com/cdn/shop/products/c65-trident-front.jpg',

  // Jaeger-LeCoultre CDN
  'jaeger-lecoultre-reverso-classic': 'https://www.jaeger-lecoultre.com/content/dam/rcq/jlc/14/50/93/2/1450932.png.transform/jlc-image-fullscreen/img.png',

  // Zenith CDN
  'zenith-el-primero-chronomaster': 'https://www.zenith-watches.com/media/catalog/product/0/3/03.3200.3600-69.m3200_front.jpg',

  // Frédérique Constant CDN
  'frederique-constant-classics-auto': 'https://www.frederique-constant.com/media/catalog/product/F/C/FC-306MC4S6B_front.jpg',

  // Mido CDN (Swatch Group)
  'mido-ocean-star-tribute':    'https://www.mido.com/media/catalog/product/M/0/M026.807.11.041.00_front.jpg',

  // Swatch CDN
  'swatch-sistem51':            'https://www.swatch.com/dw/image/v2/AAJE_PRD/on/demandware.static/-/Sites-swatch-master/default/images/large/SVGK100_front.jpg',
}

// Fallback og:image scrape for watches without a known CDN URL
const PAGE_URLS = {
  'tudor-black-bay-58':         'https://www.tudorwatch.com/en/watches/black-bay/m79030n-0001',
  'nomos-club-campus':          'https://nomos-glashuette.com/en/watches/club/710-club',
  'nomos-tangente-38':          'https://nomos-glashuette.com/en/watches/tangente/139-tangente',
  'baltic-aquascaphe':          'https://www.balticwatches.com/products/aquascaphe',
  'baltic-bicompax-001':        'https://www.balticwatches.com/products/bicompax-001',
  'halios-seaforth':            'https://halioswatches.com/products/seaforth',
  'halios-tropik':              'https://halioswatches.com/products/tropik',
  'christopher-ward-c65-trident': 'https://www.christopherward.com/collections/c65-trident',
  'zenith-el-primero-chronomaster': 'https://www.zenith-watches.com/en_US/products/chronomaster/chronomaster-original-38mm-03-3200-3600-69-m3200.html',
  'frederique-constant-classics-auto': 'https://www.frederique-constant.com/en/watches/classics/classics-automatic',
  'mido-ocean-star-tribute':    'https://www.mido.com/en-us/watches/ocean-star/mido-ocean-star-tribute-m026-830-11-041-00',
  'swatch-sistem51':            'https://www.swatch.com/en-us/watches/originals/sistem51/svgk100.html',
  'panerai-luminor-44-pam01312':'https://www.panerai.com/en/collection/luminor/luminor-1950-3-days-acciaio-44mm-pam01312.html',
  'jaeger-lecoultre-reverso-classic': 'https://www.jaeger-lecoultre.com/us/en/watches/reverso/reverso-classic-medium-thin-q2548520.html',
  'vacheron-constantin-overseas-4500v': 'https://www.vacheron-constantin.com/en/collections/overseas/4500v-110a-b483.html',
  'patek-philippe-nautilus-5711': 'https://www.patek.com/en/collection/nautilus/5711-1A-010',
  'cartier-santos':             'https://www.cartier.com/en-us/men-s-watches/santos-de-cartier-watch.html',
  'ap-royal-oak-15500':         'https://www.audemarspiguet.com/en/watches/royal-oak-selfwinding-15500st-oo-1220st-01/',
}

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
  'Cache-Control': 'no-cache',
}

async function downloadImage(url, outputPath, referer) {
  try {
    const controller = new AbortController()
    const t = setTimeout(() => controller.abort(), 15000)
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        ...HEADERS,
        'Accept': 'image/avif,image/webp,image/png,image/jpeg,*/*',
        ...(referer ? { 'Referer': referer } : {}),
      },
    })
    clearTimeout(t)
    if (!res.ok) return false
    const ct = res.headers.get('content-type') || ''
    if (!ct.includes('image/') && !ct.includes('application/octet')) return false
    const buf = await res.arrayBuffer()
    if (buf.byteLength < 5000) return false
    writeFileSync(outputPath, Buffer.from(buf))
    return true
  } catch {
    return false
  }
}

async function scrapeOgImage(pageUrl) {
  try {
    const controller = new AbortController()
    const t = setTimeout(() => controller.abort(), 10000)
    const res = await fetch(pageUrl, { signal: controller.signal, headers: HEADERS })
    clearTimeout(t)
    if (!res.ok) return null
    const html = await res.text()
    // og:image
    const m = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)
      || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i)
    if (m) {
      let url = m[1]
      if (url.startsWith('//')) url = 'https:' + url
      return url
    }
    return null
  } catch {
    return null
  }
}

const missing = []
let downloaded = 0
let kept = 0

for (const slug of SVG_WATCHES) {
  const jpgPath = join(OUT_DIR, `${slug}.jpg`)
  process.stdout.write(`  ${slug}... `)

  // Strategy 1: try known CDN URL
  const cdnUrl = DIRECT_IMAGE_URLS[slug]
  if (cdnUrl) {
    const ok = await downloadImage(cdnUrl, jpgPath)
    if (ok) {
      manifest[slug] = `/images/watches/${slug}.jpg`
      downloaded++
      console.log(`✓ CDN`)
      continue
    }
  }

  // Strategy 2: scrape og:image from product page
  const pageUrl = PAGE_URLS[slug]
  if (pageUrl) {
    const imgUrl = await scrapeOgImage(pageUrl)
    if (imgUrl) {
      const ok = await downloadImage(imgUrl, jpgPath, pageUrl)
      if (ok) {
        manifest[slug] = `/images/watches/${slug}.jpg`
        downloaded++
        console.log(`✓ og:image`)
        continue
      }
    }
  }

  // Keep SVG
  missing.push(slug)
  kept++
  console.log(`◯ keeping SVG`)
}

// Update manifest
writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2), 'utf8')

// Write MISSING.txt for ones still on SVG
const missingPath = join(OUT_DIR, 'MISSING.txt')
if (missing.length > 0) {
  writeFileSync(missingPath, missing.join('\n') + '\n', 'utf8')
} else if (existsSync(missingPath)) {
  writeFileSync(missingPath, '', 'utf8')
}

const totalJpg = Object.values(manifest).filter(v => v.endsWith('.jpg')).length
const totalSvg = Object.values(manifest).filter(v => v.endsWith('.svg')).length
console.log(`\nNew downloads: ${downloaded}  Still SVG: ${kept}`)
console.log(`Total: ${totalJpg} JPG  ${totalSvg} SVG`)
console.log('Manifest updated.\n')
