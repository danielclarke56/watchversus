/**
 * Second-pass image downloader. Tries:
 * 1. Shopify product JSON API (no scraping needed)
 * 2. Alternative CDN URL patterns
 * 3. og:image scraping with better headers
 */

import { writeFileSync, existsSync, readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_DIR = join(__dirname, '..', 'public', 'images', 'watches')
const MANIFEST_PATH = join(OUT_DIR, 'manifest.json')

const manifest = JSON.parse(readFileSync(MANIFEST_PATH, 'utf8'))

const SVG_WATCHES = Object.entries(manifest)
  .filter(([, v]) => v.endsWith('.svg'))
  .map(([slug]) => slug)

console.log(`\nRemaining SVG placeholders: ${SVG_WATCHES.length}\n`)

const HEADERS_BROWSER = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
  'Accept-Encoding': 'gzip, deflate, br',
  'Connection': 'keep-alive',
  'Upgrade-Insecure-Requests': '1',
}

async function fetchJSON(url) {
  try {
    const controller = new AbortController()
    const t = setTimeout(() => controller.abort(), 10000)
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { ...HEADERS_BROWSER, 'Accept': 'application/json' },
    })
    clearTimeout(t)
    if (!res.ok) return null
    return await res.json()
  } catch { return null }
}

async function fetchHTML(url) {
  try {
    const controller = new AbortController()
    const t = setTimeout(() => controller.abort(), 10000)
    const res = await fetch(url, { signal: controller.signal, headers: HEADERS_BROWSER })
    clearTimeout(t)
    if (!res.ok) return null
    return await res.text()
  } catch { return null }
}

async function downloadImage(url, outputPath, referer) {
  try {
    const controller = new AbortController()
    const t = setTimeout(() => controller.abort(), 20000)
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        ...HEADERS_BROWSER,
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
  } catch { return false }
}

// Shopify product JSON API — returns product data including images
// Pattern: https://{store}/products/{handle}.json
const SHOPIFY_PRODUCTS = {
  'nomos-club-campus':            { store: 'nomos-glashuette.com', handle: 'club-710' },
  'nomos-tangente-38':            { store: 'nomos-glashuette.com', handle: 'tangente-139' },
  'baltic-aquascaphe':            { store: 'www.balticwatches.com', handle: 'aquascaphe' },
  'baltic-bicompax-001':          { store: 'www.balticwatches.com', handle: 'bicompax-001' },
  'halios-seaforth':              { store: 'halioswatches.com', handle: 'seaforth' },
  'halios-tropik':                { store: 'halioswatches.com', handle: 'tropik' },
  'christopher-ward-c65-trident': { store: 'www.christopherward.com', handle: 'c65-trident' },
}

// Alternative direct image URL patterns to try (arrays = try each in order)
const ALT_URLS = {
  'rolex-submariner-41': [
    'https://content2.rolex.com/dam/watches/family-page/all-models/m126610ln-hero.jpg?imwidth=800',
    'https://content2.rolex.com/dam/watches/family-page/featured-models/m126610ln-hero.jpg',
    'https://content2.rolex.com/dam/new-watches/Family-page/submariner/2020/m126610ln-0002/myn/m126610ln-0002-modelpage-hero-combined-model-and-bracelet.jpg',
  ],
  'rolex-gmt-master-ii-pepsi': [
    'https://content2.rolex.com/dam/watches/family-page/all-models/m126710blro-hero.jpg?imwidth=800',
    'https://content2.rolex.com/dam/watches/family-page/featured-models/m126710blro-hero.jpg',
  ],
  'rolex-datejust-36': [
    'https://content2.rolex.com/dam/watches/family-page/all-models/m126200-hero.jpg?imwidth=800',
    'https://content2.rolex.com/dam/watches/family-page/featured-models/m126200-hero.jpg',
  ],
  'rolex-explorer-36': [
    'https://content2.rolex.com/dam/watches/family-page/all-models/m124270-hero.jpg?imwidth=800',
    'https://content2.rolex.com/dam/watches/family-page/featured-models/m124270-hero.jpg',
  ],
  'rolex-day-date-40': [
    'https://content2.rolex.com/dam/watches/family-page/all-models/m228238-hero.jpg?imwidth=800',
    'https://content2.rolex.com/dam/watches/family-page/featured-models/m228238-hero.jpg',
  ],
  'rolex-yacht-master-40': [
    'https://content2.rolex.com/dam/watches/family-page/all-models/m126622-hero.jpg?imwidth=800',
    'https://content2.rolex.com/dam/watches/family-page/featured-models/m126622-hero.jpg',
  ],
  'tudor-black-bay-58': [
    'https://www.tudorwatch.com/media/catalog/product/T/U/TUDOR_M79030N-0001_1.png',
    'https://cdn.tudorwatch.com/media/catalog/product/M/7/M79030N-0001.jpg',
    'https://www.tudorwatch.com/media/catalog/product/cache/1/image/800x/17f82f742ffe127f42dca9de82fb58b1/T/U/TUDOR_M79030N-0001_1.jpg',
  ],
  'tag-heuer-carrera-42': [
    'https://media.tagheuer.com/is/image/TagHeuer/xlarge/CBN2A1B.BA0643_1.png?wid=800',
    'https://media.tagheuer.com/is/image/TagHeuer/large/CBN2A1B.BA0643_1.png',
    'https://www.tagheuer.com/on/demandware.static/-/Sites-tagheuer-master/default/dw/images/large/CBN2A1B.BA0643_1.jpg',
  ],
  'tag-heuer-aquaracer-300': [
    'https://media.tagheuer.com/is/image/TagHeuer/xlarge/WBP2010.BA0632_1.png?wid=800',
    'https://media.tagheuer.com/is/image/TagHeuer/large/WBP2010.BA0632_1.png',
    'https://www.tagheuer.com/on/demandware.static/-/Sites-tagheuer-master/default/dw/images/large/WBP2010.BA0632_1.jpg',
  ],
  'iwc-pilot-mark-xviii': [
    'https://www.iwc.com/content/dam/rcq/iwc/21/01/37/9/2101379.png.transform/large/img.png',
    'https://www.iwc.com/content/dam/rcq/iwc/15/75/63/2/1575632.png.transform/pdp-image-large/img.png',
  ],
  'panerai-luminor-44-pam01312': [
    'https://www.panerai.com/content/dam/rcq/pan/18/09/89/6/1809896.png.transform/large/img.png',
    'https://www.panerai.com/content/dam/rcq/pan/19/25/15/4/1925154.png.transform/pdp-main-image/img.png',
  ],
  'cartier-santos': [
    'https://www.cartier.com/dw/image/v2/BCRG_PRD/on/demandware.static/-/Sites-cartier-master/default/images/large/WSSA0018.png',
    'https://www.cartier.com/dw/image/v2/BCRG_PRD/on/demandware.static/-/Sites-cartier-master/default/images/xlarge/WSSA0018.png',
  ],
  'cartier-tank-must': [
    'https://www.cartier.com/dw/image/v2/BCRG_PRD/on/demandware.static/-/Sites-cartier-master/default/images/large/WSTA0041.png',
    'https://www.cartier.com/dw/image/v2/BCRG_PRD/on/demandware.static/-/Sites-cartier-master/default/images/xlarge/WSTA0041.png',
  ],
  'ap-royal-oak-15500': [
    'https://www.audemarspiguet.com/content/dam/ap/com/watches/collections/royal-oak/15500ST.OO.1220ST.01/images/main/15500ST.OO.1220ST.01_Front.jpg',
    'https://www.audemarspiguet.com/content/dam/ap/com/watches/search-listing/15500ST_OO_1220ST_01-front.jpg',
  ],
  'patek-philippe-nautilus-5711': [
    'https://www.patek.com/resource/img/photos/png/5711-1A-010_front.png',
    'https://www.patek.com/resource/img/photos/jpg/5711-1A-010_front.jpg',
  ],
  'vacheron-constantin-overseas-4500v': [
    'https://www.vacheron-constantin.com/dam/rcq/vac/15/36/44/7/1536447.png.transform/vccom-image-fullscreen/img.png',
    'https://www.vacheron-constantin.com/dam/rcq/vac/15/84/00/3/1584003.png.transform/vccom-image-medium/img.png',
  ],
  'zenith-el-primero-chronomaster': [
    'https://www.zenith-watches.com/media/catalog/product/0/3/03.3200.3600-69.m3200_front.jpg',
    'https://www.zenith-watches.com/media/catalog/product/0/3/03.3200.3600_69.m3200-1.jpg',
  ],
  'frederique-constant-classics-auto': [
    'https://www.frederique-constant.com/media/catalog/product/F/C/FC-306MC4S6B_front.jpg',
    'https://www.frederique-constant.com/media/catalog/product/cache/1/image/800x800/9df78eab33525d08d6e5fb8d27136e95/F/C/FC-306MC4S6B.jpg',
  ],
  'mido-ocean-star-tribute': [
    'https://www.mido.com/media/catalog/product/M/0/M026.807.11.041.00_front.jpg',
    'https://www.mido.com/media/catalog/product/M/0/M026.807.11.041.00-1.jpg',
  ],
  'swatch-sistem51': [
    'https://cdn.swatch.com/is/image/swatch/SVGK100_f?wid=800&fit=constrain',
    'https://www.swatch.com/dw/image/v2/AAJE_PRD/on/demandware.static/-/Sites-swatch-master/default/images/large/SVGK100.jpg',
    'https://cdn.swatch.com/dw/image/v2/AAJE_PRD/on/demandware.static/-/Sites-swatch-master/default/images/large/SVGK100_front.jpg',
  ],
}

// og:image fallback pages
const OG_PAGES = {
  'rolex-submariner-41':        'https://www.rolex.com/en-us/watches/submariner/m126610ln-0002.html',
  'rolex-gmt-master-ii-pepsi':  'https://www.rolex.com/en-us/watches/gmt-master-ii/m126710blro-0003.html',
  'rolex-datejust-36':          'https://www.rolex.com/en-us/watches/datejust/m126200-0021.html',
  'rolex-explorer-36':          'https://www.rolex.com/en-us/watches/explorer/m124270-0001.html',
  'rolex-day-date-40':          'https://www.rolex.com/en-us/watches/day-date/m228235-0042.html',
  'rolex-yacht-master-40':      'https://www.rolex.com/en-us/watches/yacht-master/m126622-0001.html',
  'tudor-black-bay-58':         'https://www.tudorwatch.com/en/watches/black-bay/m79030n-0001',
  'tag-heuer-carrera-42':       'https://www.tagheuer.com/us/en/watches/carrera/cbn2a1b.ba0643/',
  'tag-heuer-aquaracer-300':    'https://www.tagheuer.com/us/en/watches/aquaracer-professional-300/wbp2010.ba0632/',
  'iwc-pilot-mark-xviii':       'https://www.iwc.com/us/en/watch-collections/pilot-watches/iw327001-pilot-s-watch-mark-xviii.html',
  'panerai-luminor-44-pam01312':'https://www.panerai.com/en/collection/luminor/luminor-44mm-pam01312.html',
  'cartier-santos':             'https://www.cartier.com/en-us/watches/mens/santos-de-cartier/santos-de-cartier-watch-wssa0018.html',
  'cartier-tank-must':          'https://www.cartier.com/en-us/watches/womens/tank/tank-must-watch-wsta0041.html',
  'ap-royal-oak-15500':         'https://www.audemarspiguet.com/en/watches/royal-oak-selfwinding-15500st-oo-1220st-01/',
  'patek-philippe-nautilus-5711':'https://www.patek.com/en/collection/nautilus/5711-1A-010',
  'vacheron-constantin-overseas-4500v': 'https://www.vacheron-constantin.com/en/collections/overseas/4500v-110a-b483.html',
  'nomos-club-campus':          'https://nomos-glashuette.com/en/watches/club/710-club',
  'nomos-tangente-38':          'https://nomos-glashuette.com/en/watches/tangente/139-tangente',
  'zenith-el-primero-chronomaster': 'https://www.zenith-watches.com/en_US/products/chronomaster/chronomaster-original-38mm-03-3200-3600-69-m3200.html',
  'frederique-constant-classics-auto': 'https://www.frederique-constant.com/en/watches/classics',
  'mido-ocean-star-tribute':    'https://www.mido.com/en-us/watches/ocean-star/mido-ocean-star-tribute-m026-830-11-041-00',
  'swatch-sistem51':            'https://www.swatch.com/en-us/watches/originals/sistem51/svgk100.html',
}

let downloaded = 0
const missing = []

for (const slug of SVG_WATCHES) {
  const jpgPath = join(OUT_DIR, `${slug}.jpg`)
  process.stdout.write(`  ${slug}... `)
  let got = false

  // Strategy 1: Shopify product JSON API
  const shopify = SHOPIFY_PRODUCTS[slug]
  if (shopify && !got) {
    const data = await fetchJSON(`https://${shopify.store}/products/${shopify.handle}.json`)
    if (data?.product?.images?.[0]?.src) {
      let imgUrl = data.product.images[0].src
      if (imgUrl.startsWith('//')) imgUrl = 'https:' + imgUrl
      got = await downloadImage(imgUrl, jpgPath, `https://${shopify.store}`)
      if (got) console.log(`✓ Shopify JSON`)
    }
    // Also try with .json variant of handle
    if (!got) {
      const slugHandle = slug.replace(`${shopify.store.split('.')[0]}-`, '')
      const data2 = await fetchJSON(`https://${shopify.store}/products/${slugHandle}.json`)
      if (data2?.product?.images?.[0]?.src) {
        let imgUrl = data2.product.images[0].src
        if (imgUrl.startsWith('//')) imgUrl = 'https:' + imgUrl
        got = await downloadImage(imgUrl, jpgPath, `https://${shopify.store}`)
        if (got) console.log(`✓ Shopify JSON (alt handle)`)
      }
    }
  }

  // Strategy 2: Alt direct URLs
  const altUrls = ALT_URLS[slug] || []
  for (const url of altUrls) {
    if (got) break
    got = await downloadImage(url, jpgPath)
    if (got) console.log(`✓ direct URL`)
  }

  // Strategy 3: og:image from product page
  const pageUrl = OG_PAGES[slug]
  if (!got && pageUrl) {
    const html = await fetchHTML(pageUrl)
    if (html) {
      // Try og:image
      const m = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)
        || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i)
      if (m) {
        let imgUrl = m[1]
        if (imgUrl.startsWith('//')) imgUrl = 'https:' + imgUrl
        got = await downloadImage(imgUrl, jpgPath, pageUrl)
        if (got) console.log(`✓ og:image`)
      }
      // Try twitter:image
      if (!got) {
        const t = html.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i)
          || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["']/i)
        if (t) {
          let imgUrl = t[1]
          if (imgUrl.startsWith('//')) imgUrl = 'https:' + imgUrl
          got = await downloadImage(imgUrl, jpgPath, pageUrl)
          if (got) console.log(`✓ twitter:image`)
        }
      }
    }
  }

  if (got) {
    manifest[slug] = `/images/watches/${slug}.jpg`
    downloaded++
  } else {
    missing.push(slug)
    console.log(`◯ SVG`)
  }
}

writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2), 'utf8')

const missingPath = join(OUT_DIR, 'MISSING.txt')
writeFileSync(missingPath, missing.length > 0 ? missing.join('\n') + '\n' : '', 'utf8')

const totalJpg = Object.values(manifest).filter(v => v.endsWith('.jpg')).length
const totalSvg = Object.values(manifest).filter(v => v.endsWith('.svg')).length
console.log(`\nNew: ${downloaded}  Still SVG: ${missing.length}`)
console.log(`Total: ${totalJpg} JPG  ${totalSvg} SVG\n`)
if (missing.length > 0) console.log('Still missing:\n' + missing.map(s => '  ' + s).join('\n'))
