/**
 * Playwright-based image downloader for watches still on SVG placeholders.
 * Uses a real browser to defeat bot detection and extract product images.
 *
 * Run: node scripts/download-brand-images.mjs
 */

import { writeFileSync, readFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { chromium } from 'playwright'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_DIR = join(__dirname, '..', 'public', 'images', 'watches')
const MANIFEST_PATH = join(OUT_DIR, 'manifest.json')

const manifest = JSON.parse(readFileSync(MANIFEST_PATH, 'utf8'))

const SVG_WATCHES = Object.entries(manifest)
  .filter(([, v]) => v.endsWith('.svg'))
  .map(([slug]) => slug)

console.log(`\nSVG watches to attempt: ${SVG_WATCHES.length}`)
console.log(SVG_WATCHES.join(', '))
console.log()

// Product pages and image extraction strategies per watch
const WATCHES = {
  // ── Rolex ────────────────────────────────────────────────────────────────
  'rolex-submariner-41': {
    url: 'https://www.rolex.com/en-us/watches/submariner/m126610ln-0002.html',
    // Try content2.rolex.com CDN URLs directly (bypass JS)
    directUrls: [
      'https://content2.rolex.com/dam/watches/family-page/all-models/m126610ln-hero.jpg?imwidth=1240',
      'https://content2.rolex.com/dam/watches/family-page/all-models/m126610ln-hero.jpg',
      'https://content2.rolex.com/dam/new-watches/Family-page/submariner/2020/m126610ln-0002/myn/m126610ln-0002-modelpage-hero-combined-model-and-bracelet.jpg',
      'https://content2.rolex.com/dam/watches/2022/submariner-date/m126610ln-0002/modelpage/hero/m126610ln-0002-modelpage-hero-combined-model-and-bracelet.jpg',
    ],
    // CSS selectors to try for image extraction in browser
    imgSelectors: ['picture.rlx-hero__picture img', '.rlx-product-hero img', 'img[src*="content2.rolex.com"]', 'img.rlx-model-card__img'],
  },
  'rolex-gmt-master-ii-pepsi': {
    url: 'https://www.rolex.com/en-us/watches/gmt-master-ii/m126710blro-0003.html',
    directUrls: [
      'https://content2.rolex.com/dam/watches/family-page/all-models/m126710blro-hero.jpg?imwidth=1240',
      'https://content2.rolex.com/dam/watches/family-page/all-models/m126710blro-hero.jpg',
      'https://content2.rolex.com/dam/new-watches/Family-page/gmt-master-ii/2021/m126710blro-0003/myn/m126710blro-0003-modelpage-hero-combined-model-and-bracelet.jpg',
    ],
    imgSelectors: ['picture.rlx-hero__picture img', '.rlx-product-hero img', 'img[src*="content2.rolex.com"]'],
  },
  'rolex-datejust-36': {
    url: 'https://www.rolex.com/en-us/watches/datejust/m126200-0021.html',
    directUrls: [
      'https://content2.rolex.com/dam/watches/family-page/all-models/m126200-hero.jpg?imwidth=1240',
      'https://content2.rolex.com/dam/watches/family-page/all-models/m126200-hero.jpg',
    ],
    imgSelectors: ['picture.rlx-hero__picture img', '.rlx-product-hero img', 'img[src*="content2.rolex.com"]'],
  },
  'rolex-explorer-36': {
    url: 'https://www.rolex.com/en-us/watches/explorer/m124270-0001.html',
    directUrls: [
      'https://content2.rolex.com/dam/watches/family-page/all-models/m124270-hero.jpg?imwidth=1240',
      'https://content2.rolex.com/dam/watches/family-page/all-models/m124270-hero.jpg',
    ],
    imgSelectors: ['picture.rlx-hero__picture img', '.rlx-product-hero img', 'img[src*="content2.rolex.com"]'],
  },
  'rolex-day-date-40': {
    url: 'https://www.rolex.com/en-us/watches/day-date/m228235-0042.html',
    directUrls: [
      'https://content2.rolex.com/dam/watches/family-page/all-models/m228238-hero.jpg?imwidth=1240',
      'https://content2.rolex.com/dam/watches/family-page/all-models/m228235-hero.jpg?imwidth=1240',
      'https://content2.rolex.com/dam/watches/family-page/all-models/m228238-hero.jpg',
    ],
    imgSelectors: ['picture.rlx-hero__picture img', '.rlx-product-hero img', 'img[src*="content2.rolex.com"]'],
  },
  'rolex-yacht-master-40': {
    url: 'https://www.rolex.com/en-us/watches/yacht-master/m126622-0001.html',
    directUrls: [
      'https://content2.rolex.com/dam/watches/family-page/all-models/m126622-hero.jpg?imwidth=1240',
      'https://content2.rolex.com/dam/watches/family-page/all-models/m126622-hero.jpg',
    ],
    imgSelectors: ['picture.rlx-hero__picture img', '.rlx-product-hero img', 'img[src*="content2.rolex.com"]'],
  },

  // ── IWC ────────────────────────────────────────────────────────────────
  'iwc-pilot-mark-xviii': {
    url: 'https://www.iwc.com/us/en/watch-collections/pilot-watches/iw327001-pilot-s-watch-mark-xviii.html',
    directUrls: [
      'https://www.iwc.com/content/dam/rcq/iwc/21/01/37/9/2101379.png.transform/large/img.png',
      'https://www.iwc.com/content/dam/rcq/iwc/23/82/49/8/2382498.png.transform/large/img.png',
      'https://www.iwc.com/content/dam/rcq/iwc/16/61/05/7/1661057.png.transform/large/img.png',
    ],
    imgSelectors: ['[data-testid="product-image"] img', '.pdp-gallery img', 'img[src*="iwc.com/content/dam"]'],
  },

  // ── Panerai ────────────────────────────────────────────────────────────
  'panerai-luminor-44-pam01312': {
    url: 'https://www.panerai.com/en/collection/luminor/luminor-44mm-pam01312.html',
    directUrls: [
      'https://www.panerai.com/content/dam/rcq/pan/18/09/89/6/1809896.png.transform/large/img.png',
      'https://www.panerai.com/content/dam/rcq/pan/19/25/15/4/1925154.png.transform/pdp-main-image/img.png',
      'https://www.panerai.com/content/dam/rcq/pan/20/73/95/4/2073954.png.transform/large/img.png',
    ],
    imgSelectors: ['[data-testid="product-image"] img', '.product-image img', 'img[src*="panerai.com/content/dam"]'],
  },

  // ── Cartier ────────────────────────────────────────────────────────────
  'cartier-santos': {
    url: 'https://www.cartier.com/en-us/watches/mens-watches/santos-de-cartier/santos-de-cartier-watch--steel-case--xl-model--mechanical-movement-with-automatic-winding---steel-bracelet-W2SA0016.html',
    directUrls: [
      'https://www.cartier.com/dw/image/v2/BCRG_PRD/on/demandware.static/-/Sites-cartier-master/default/images/large/WSSA0018_1.png',
      'https://www.cartier.com/dw/image/v2/BCRG_PRD/on/demandware.static/-/Sites-cartier-master/default/images/xlarge/WSSA0018_1.png',
      'https://www.cartier.com/dw/image/v2/BCRG_PRD/on/demandware.static/-/Sites-cartier-master/default/images/large/WSSA0018.png',
    ],
    imgSelectors: ['.pdp-image img', '.product-gallery img', 'img[src*="cartier.com/dw/image"]'],
  },
  'cartier-tank-must': {
    url: 'https://www.cartier.com/en-us/watches/womens-watches/tank/tank-must-watch---steel-case---quartz-movement---blue-leather-strap-WSTA0056.html',
    directUrls: [
      'https://www.cartier.com/dw/image/v2/BCRG_PRD/on/demandware.static/-/Sites-cartier-master/default/images/large/WSTA0056_1.png',
      'https://www.cartier.com/dw/image/v2/BCRG_PRD/on/demandware.static/-/Sites-cartier-master/default/images/xlarge/WSTA0056_1.png',
      'https://www.cartier.com/dw/image/v2/BCRG_PRD/on/demandware.static/-/Sites-cartier-master/default/images/large/WSTA0041_1.png',
      'https://www.cartier.com/dw/image/v2/BCRG_PRD/on/demandware.static/-/Sites-cartier-master/default/images/large/WSTA0041.png',
    ],
    imgSelectors: ['.pdp-image img', '.product-gallery img', 'img[src*="cartier.com/dw/image"]'],
  },

  // ── Audemars Piguet ────────────────────────────────────────────────────
  'ap-royal-oak-15500': {
    url: 'https://www.audemarspiguet.com/en/watches/royal-oak-selfwinding-15500st-oo-1220st-01/',
    directUrls: [
      'https://www.audemarspiguet.com/content/dam/ap/com/watches/collections/royal-oak/15500ST.OO.1220ST.01/images/main/15500ST.OO.1220ST.01_Front.jpg',
      'https://www.audemarspiguet.com/content/dam/ap/com/watches/search-listing/15500ST_OO_1220ST_01-front.jpg',
      'https://www.audemarspiguet.com/content/dam/ap/com/watches/collections/royal-oak/15500ST.OO.1220ST.01/images/main/15500STOO1220ST01_Front.jpg',
    ],
    imgSelectors: ['.pdp-gallery__main-image img', '.product-image img', 'img[src*="audemarspiguet.com/content/dam"]'],
  },

  // ── Patek Philippe ─────────────────────────────────────────────────────
  'patek-philippe-nautilus-5711': {
    url: 'https://www.patek.com/en/collection/nautilus/5711-1A-010',
    directUrls: [
      'https://www.patek.com/resource/img/photos/png/5711-1A-010_front.png',
      'https://www.patek.com/resource/img/photos/jpg/5711-1A-010_front.jpg',
      'https://www.patek.com/resource/img/products/5711-1A-010_front.jpg',
    ],
    imgSelectors: ['.watch-detail__main-image img', '.product-image img', 'img[src*="patek.com/resource"]'],
  },

  // ── Vacheron Constantin ────────────────────────────────────────────────
  'vacheron-constantin-overseas-4500v': {
    url: 'https://www.vacheron-constantin.com/en/collections/overseas/4500v-110a-b483.html',
    directUrls: [
      'https://www.vacheron-constantin.com/dam/rcq/vac/15/36/44/7/1536447.png.transform/vccom-image-fullscreen/img.png',
      'https://www.vacheron-constantin.com/dam/rcq/vac/15/84/00/3/1584003.png.transform/vccom-image-medium/img.png',
      'https://www.vacheron-constantin.com/dam/rcq/vac/17/58/73/5/1758735.png.transform/vccom-image-fullscreen/img.png',
    ],
    imgSelectors: ['.product-image img', '.watch-detail img', 'img[src*="vacheron-constantin.com/dam"]'],
  },

  // ── NOMOS ────────────────────────────────────────────────────────────
  'nomos-tangente-38': {
    url: 'https://nomos-glashuette.com/en/watches/tangente/139-tangente',
    directUrls: [], // Shopify — try product JSON
    shopify: { store: 'nomos-glashuette.com', handles: ['tangente-38', '139-tangente', 'tangente-139', 'tangente-38-datum', '101'] },
    imgSelectors: ['.product__media img', '.product-single__photo img', 'img[src*="cdn.shopify.com"]'],
  },

  // ── Baltic ────────────────────────────────────────────────────────────
  'baltic-bicompax-001': {
    url: 'https://www.balticwatches.com/products/bicompax-001',
    directUrls: [], // Shopify
    shopify: { store: 'www.balticwatches.com', handles: ['bicompax-001', 'bicompax001'] },
    imgSelectors: ['.product__media img', '.product-single__photo img', 'img[src*="cdn.shopify.com"]'],
  },

  // ── Halios ────────────────────────────────────────────────────────────
  'halios-seaforth': {
    url: 'https://halioswatches.com/products/seaforth',
    directUrls: [], // Shopify
    shopify: { store: 'halioswatches.com', handles: ['seaforth', 'seaforth-black'] },
    imgSelectors: ['.product__media img', '.product-single__photo img', 'img[src*="cdn.shopify.com"]'],
  },
  'halios-tropik': {
    url: 'https://halioswatches.com/products/tropik',
    directUrls: [], // Shopify
    shopify: { store: 'halioswatches.com', handles: ['tropik', 'tropik-black'] },
    imgSelectors: ['.product__media img', '.product-single__photo img', 'img[src*="cdn.shopify.com"]'],
  },

  // ── Zenith ────────────────────────────────────────────────────────────
  'zenith-el-primero-chronomaster': {
    url: 'https://www.zenith-watches.com/en_US/products/chronomaster/chronomaster-original-38mm-03-3200-3600-69-m3200.html',
    directUrls: [
      'https://www.zenith-watches.com/media/catalog/product/0/3/03.3200.3600-69.m3200_front.jpg',
      'https://www.zenith-watches.com/media/catalog/product/0/3/03.3200.3600_69.m3200-1.jpg',
      'https://www.zenith-watches.com/media/catalog/product/cache/2/image/800x800/9df78eab33525d08d6e5fb8d27136e95/0/3/03.3200.3600-69.m3200_front.jpg',
    ],
    imgSelectors: ['.product-image img', '.product-gallery img', 'img.gallery-image'],
  },

  // ── Frédérique Constant ────────────────────────────────────────────────
  'frederique-constant-classics-auto': {
    url: 'https://www.frederique-constant.com/en/watches/classics/classics-automatic/fc-306mc4s6b',
    directUrls: [
      'https://www.frederique-constant.com/media/catalog/product/F/C/FC-306MC4S6B_front.jpg',
      'https://www.frederique-constant.com/media/catalog/product/cache/1/image/1000x1000/9df78eab33525d08d6e5fb8d27136e95/F/C/FC-306MC4S6B_front.jpg',
      'https://www.frederique-constant.com/media/catalog/product/cache/1/image/800x800/9df78eab33525d08d6e5fb8d27136e95/F/C/FC-306MC4S6B.jpg',
    ],
    imgSelectors: ['.product-image img', '.product-gallery img', 'img[src*="frederique-constant.com/media"]'],
  },

  // ── Swatch ────────────────────────────────────────────────────────────
  'swatch-sistem51': {
    url: 'https://www.swatch.com/en-us/watches/originals/sistem51/sistem-blue/SVGK100.html',
    directUrls: [
      'https://cdn.swatch.com/is/image/swatch/SVGK100_f?wid=1000&fit=constrain&fmt=jpg',
      'https://cdn.swatch.com/is/image/swatch/SVGK100_f?wid=800&fmt=jpg',
      'https://cdn.swatch.com/is/image/swatch/SVGK100_f',
    ],
    imgSelectors: ['.product-image img', '.pdp-gallery img', 'img[src*="swatch.com"]'],
  },
}

// ── Helpers ─────────────────────────────────────────────────────────────────

async function downloadBuffer(url, referer) {
  const controller = new AbortController()
  const t = setTimeout(() => controller.abort(), 20000)
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'image/avif,image/webp,image/png,image/jpeg,*/*',
        'Accept-Language': 'en-US,en;q=0.9',
        ...(referer ? { 'Referer': referer } : {}),
      },
    })
    clearTimeout(t)
    if (!res.ok) return null
    const ct = res.headers.get('content-type') || ''
    if (!ct.includes('image/') && !ct.includes('application/octet')) return null
    const buf = await res.arrayBuffer()
    if (buf.byteLength < 5000) return null
    return Buffer.from(buf)
  } catch {
    clearTimeout(t)
    return null
  }
}

async function tryShopifyAPI(slug, config) {
  if (!config.shopify) return null
  const { store, handles } = config.shopify
  for (const handle of handles) {
    const url = `https://${store}/products/${handle}.json`
    try {
      const controller = new AbortController()
      const t = setTimeout(() => controller.abort(), 8000)
      const res = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'application/json',
        },
      })
      clearTimeout(t)
      if (!res.ok) continue
      const data = await res.json()
      if (data?.product?.images?.[0]?.src) {
        let imgUrl = data.product.images[0].src
        if (imgUrl.startsWith('//')) imgUrl = 'https:' + imgUrl
        return imgUrl
      }
    } catch { /* continue */ }
  }
  return null
}

// ── Main ─────────────────────────────────────────────────────────────────────

const downloaded = []
const failed = []

const browser = await chromium.launch({
  headless: true,
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-blink-features=AutomationControlled',
    '--disable-dev-shm-usage',
  ],
})

const context = await browser.newContext({
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  viewport: { width: 1440, height: 900 },
  extraHTTPHeaders: {
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br',
  },
})

// Route to capture image responses
const capturedImages = new Map()

context.on('response', async (response) => {
  const url = response.url()
  const ct = response.headers()['content-type'] || ''
  if (ct.startsWith('image/') && response.status() === 200) {
    try {
      const buf = await response.body()
      if (buf.byteLength > 10000) {
        capturedImages.set(url, buf)
      }
    } catch { /* ignore */ }
  }
})

for (const slug of SVG_WATCHES) {
  if (!WATCHES[slug]) {
    console.log(`  ${slug}... ◯ no config — skipping`)
    failed.push({ slug, reason: 'no config' })
    continue
  }

  const config = WATCHES[slug]
  const jpgPath = join(OUT_DIR, `${slug}.jpg`)
  process.stdout.write(`  ${slug}... `)
  let buf = null
  let source = null

  // Strategy 1: Shopify JSON API (for Shopify stores)
  if (!buf && config.shopify) {
    const imgUrl = await tryShopifyAPI(slug, config)
    if (imgUrl) {
      buf = await downloadBuffer(imgUrl, `https://${config.shopify.store}`)
      if (buf) source = `Shopify API → ${imgUrl.slice(0, 60)}`
    }
  }

  // Strategy 2: Direct CDN URLs
  for (const url of (config.directUrls || [])) {
    if (buf) break
    buf = await downloadBuffer(url)
    if (buf) source = `direct → ${url.slice(0, 60)}`
  }

  // Strategy 3: Browser automation — navigate to product page and extract image
  if (!buf && config.url) {
    capturedImages.clear()
    const page = await context.newPage()

    try {
      await page.goto(config.url, { waitUntil: 'domcontentloaded', timeout: 30000 })

      // Wait a bit for lazy-loaded images
      await page.waitForTimeout(3000)

      // Try CSS selectors to get image src
      for (const selector of (config.imgSelectors || [])) {
        if (buf) break
        try {
          const el = await page.$(selector)
          if (el) {
            let src = await el.getAttribute('src') || await el.getAttribute('data-src') || await el.getAttribute('data-lazy-src')
            if (src) {
              if (src.startsWith('//')) src = 'https:' + src
              if (src.startsWith('/')) {
                const urlObj = new URL(config.url)
                src = urlObj.origin + src
              }
              // Prefer largest image — try srcset
              const srcset = await el.getAttribute('srcset')
              if (srcset) {
                const largest = srcset.split(',')
                  .map(s => s.trim().split(/\s+/))
                  .filter(([, w]) => w)
                  .sort((a, b) => parseInt(b[1]) - parseInt(a[1]))[0]
                if (largest?.[0]) src = largest[0]
              }
              buf = await downloadBuffer(src, config.url)
              if (buf) source = `selector(${selector}) → ${src.slice(0, 60)}`
            }
          }
        } catch { /* continue */ }
      }

      // Try og:image from page meta
      if (!buf) {
        try {
          const ogImg = await page.$eval(
            'meta[property="og:image"]',
            el => el.getAttribute('content')
          )
          if (ogImg) {
            let src = ogImg
            if (src.startsWith('//')) src = 'https:' + src
            buf = await downloadBuffer(src, config.url)
            if (buf) source = `og:image → ${src.slice(0, 60)}`
          }
        } catch { /* no og:image */ }
      }

      // Use the largest captured image from network traffic
      if (!buf && capturedImages.size > 0) {
        let biggest = null
        let biggestSize = 0
        for (const [url, imgBuf] of capturedImages.entries()) {
          // Skip icons, logos, tiny images, tracking pixels
          if (url.includes('logo') || url.includes('icon') || url.includes('pixel') || url.includes('tracking')) continue
          // Prefer product-related URLs
          const score = (url.includes('product') || url.includes('watch') || url.includes('catalog') || url.includes('dam')) ? 2 : 1
          if (imgBuf.byteLength * score > biggestSize) {
            biggestSize = imgBuf.byteLength * score
            biggest = imgBuf
            source = `network capture → ${url.slice(0, 60)}`
          }
        }
        if (biggest && biggest.byteLength > 50000) {
          buf = biggest
        }
      }

    } catch (err) {
      // timeout or navigation error
    } finally {
      await page.close()
    }
  }

  if (buf) {
    writeFileSync(jpgPath, buf)
    manifest[slug] = `/images/watches/${slug}.jpg`
    downloaded.push(slug)
    console.log(`✓ [${source}]`)
  } else {
    failed.push({ slug, reason: 'all strategies failed' })
    console.log(`✗ failed`)
  }
}

await browser.close()

// Update manifest
writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2), 'utf8')

// Report
console.log(`\n${'─'.repeat(60)}`)
console.log(`Downloaded: ${downloaded.length}  Failed: ${failed.length}`)
if (downloaded.length > 0) {
  console.log('\n✓ Downloaded:')
  downloaded.forEach(s => console.log(`  ${s}`))
}
if (failed.length > 0) {
  console.log('\n✗ Still SVG:')
  failed.forEach(({ slug, reason }) => console.log(`  ${slug} (${reason})`))
}
console.log()
