/**
 * Download official watch product images from brand websites.
 * Falls back to branded SVG placeholders when sites block scraping.
 * Outputs public/images/watches/{slug}.jpg or {slug}.svg
 * Writes public/images/watches/manifest.json with actual paths.
 */

import { writeFileSync, mkdirSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_DIR = join(__dirname, '..', 'public', 'images', 'watches')

if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true })

// Official product page URLs and brand colors for each watch
const WATCHES = [
  { slug: 'rolex-submariner-41', brand: 'Rolex', name: 'Submariner 41', color: '#2d4a3e', accent: '#c9a84c', url: 'https://www.rolex.com/watches/submariner/m126610ln-0002.html' },
  { slug: 'rolex-gmt-master-ii-pepsi', brand: 'Rolex', name: 'GMT-Master II Pepsi', color: '#1c3f6e', accent: '#c9a84c', url: 'https://www.rolex.com/watches/gmt-master-ii/m126710blro-0003.html' },
  { slug: 'rolex-datejust-36', brand: 'Rolex', name: 'Datejust 36', color: '#2a2a2a', accent: '#c9a84c', url: 'https://www.rolex.com/watches/datejust/m126200-0021.html' },
  { slug: 'rolex-explorer-36', brand: 'Rolex', name: 'Explorer 36', color: '#1a1a1a', accent: '#c9a84c', url: 'https://www.rolex.com/watches/explorer/m124270-0001.html' },
  { slug: 'rolex-day-date-40', brand: 'Rolex', name: 'Day-Date 40', color: '#3d2b1f', accent: '#c9a84c', url: 'https://www.rolex.com/watches/day-date/m228235-0042.html' },
  { slug: 'tudor-black-bay-58', brand: 'Tudor', name: 'Black Bay 58', color: '#1a1a1a', accent: '#c41e3a', url: 'https://www.tudorwatch.com/watches/black-bay/m79030n-0001' },
  { slug: 'tudor-black-bay-gmt', brand: 'Tudor', name: 'Black Bay GMT', color: '#1a1a1a', accent: '#c41e3a', url: 'https://www.tudorwatch.com/watches/black-bay-gmt/m79830rb-0001' },
  { slug: 'tudor-pelagos-39', brand: 'Tudor', name: 'Pelagos 39', color: '#003366', accent: '#c41e3a', url: 'https://www.tudorwatch.com/watches/pelagos/m25600tb-0001' },
  { slug: 'omega-seamaster-300m', brand: 'Omega', name: 'Seamaster 300M', color: '#003087', accent: '#b8a05a', url: 'https://www.omegawatches.com/watches/seamaster/diver-300m/210-30-42-20-03-001' },
  { slug: 'omega-speedmaster-moonwatch', brand: 'Omega', name: 'Speedmaster Moonwatch', color: '#1a1a1a', accent: '#b8a05a', url: 'https://www.omegawatches.com/watches/speedmaster/moonwatch-professional/310-30-42-50-01-002' },
  { slug: 'omega-aqua-terra-38', brand: 'Omega', name: 'Aqua Terra 38', color: '#1a3a5c', accent: '#b8a05a', url: 'https://www.omegawatches.com/watches/seamaster/aqua-terra-150m/220-13-38-20-03-001' },
  { slug: 'tag-heuer-carrera-42', brand: 'TAG Heuer', name: 'Carrera 42', color: '#1a1a1a', accent: '#e8251a', url: 'https://www.tagheuer.com/us/en/watches/carrera/cbn2a1b.ba0643/' },
  { slug: 'tag-heuer-aquaracer-300', brand: 'TAG Heuer', name: 'Aquaracer 300', color: '#003366', accent: '#e8251a', url: 'https://www.tagheuer.com/us/en/watches/aquaracer-professional-300/wbp201a.ba0632/' },
  { slug: 'seiko-prospex-spb143', brand: 'Seiko', name: 'Prospex SPB143', color: '#001f3f', accent: '#c0a84c', url: 'https://www.seikowatches.com/us-en/products/prospex/spb143j1' },
  { slug: 'seiko-prospex-sbdc101', brand: 'Seiko', name: 'Prospex SBDC101', color: '#1a3a1a', accent: '#c0a84c', url: 'https://www.seikowatches.com/us-en/products/prospex/sbdc101' },
  { slug: 'seiko-5-sports-srpe55', brand: 'Seiko', name: '5 Sports SRPE55', color: '#2d1a4a', accent: '#c0a84c', url: 'https://www.seikowatches.com/us-en/products/5sports/srpe55k1' },
  { slug: 'seiko-presage-spb165', brand: 'Seiko', name: 'Presage SPB165', color: '#1a2a4a', accent: '#c0a84c', url: 'https://www.seikowatches.com/us-en/products/presage/spb165j1' },
  { slug: 'grand-seiko-sbga211-snowflake', brand: 'Grand Seiko', name: 'SBGA211 Snowflake', color: '#c8d8e8', accent: '#1a3a5c', url: 'https://www.grand-seiko.com/us-en/collections/sbga211' },
  { slug: 'grand-seiko-sbgw231', brand: 'Grand Seiko', name: 'SBGW231', color: '#f5f0e8', accent: '#1a3a5c', url: 'https://www.grand-seiko.com/us-en/collections/sbgw231' },
  { slug: 'iwc-pilot-mark-xviii', brand: 'IWC', name: 'Pilot Mark XVIII', color: '#1a1a1a', accent: '#c0a030', url: 'https://www.iwc.com/us/en/watch-collections/pilot-watches/iw327001-pilot-s-watch-mark-xviii.html' },
  { slug: 'iwc-portugieser-40', brand: 'IWC', name: 'Portugieser 40', color: '#f5f0e8', accent: '#c0a030', url: 'https://www.iwc.com/us/en/watch-collections/portugieser/iw358303-portugieser-automatic-40.html' },
  { slug: 'panerai-luminor-44-pam01312', brand: 'Panerai', name: 'Luminor 44 PAM01312', color: '#1a1a1a', accent: '#8b0000', url: 'https://www.panerai.com/us/en/watches/luminor/luminor-base-logo-44mm/pam01312.html' },
  { slug: 'cartier-santos', brand: 'Cartier', name: 'Santos', color: '#f5f0e8', accent: '#c0a030', url: 'https://www.cartier.com/en-us/men-s-watches/santos-de-cartier-watch-steel-and-yellow-gold-wssa0018.html' },
  { slug: 'cartier-tank-must', brand: 'Cartier', name: 'Tank Must', color: '#f5f0e8', accent: '#c0a030', url: 'https://www.cartier.com/en-us/women-s-watches/tank-must-watch-wsta0041.html' },
  { slug: 'ap-royal-oak-15500', brand: 'Audemars Piguet', name: 'Royal Oak 15500', color: '#1a2a3a', accent: '#c0a030', url: 'https://www.audemarspiguet.com/en/watches/royal-oak-selfwinding-15500st-oo-1220st-01/' },
  { slug: 'patek-philippe-nautilus-5711', brand: 'Patek Philippe', name: 'Nautilus 5711', color: '#1a3a5c', accent: '#c0a030', url: 'https://www.patek.com/en/collection/nautilus/5711-1A-010' },
  { slug: 'vacheron-constantin-overseas-4500v', brand: 'Vacheron Constantin', name: 'Overseas 4500V', color: '#1a3a5c', accent: '#c0a030', url: 'https://www.vacheron-constantin.com/en/collections/overseas/4500v-110a-b483.html' },
  { slug: 'breitling-navitimer-b01-42', brand: 'Breitling', name: 'Navitimer B01 42', color: '#1a1a1a', accent: '#003087', url: 'https://www.breitling.com/us-en/watches/navitimer/navitimer-b01-chronograph-42/AB0138241C1A1/' },
  { slug: 'breitling-superocean-42', brand: 'Breitling', name: 'Superocean 42', color: '#003087', accent: '#003087', url: 'https://www.breitling.com/us-en/watches/superocean-heritage/superocean-heritage-b20-automatic-42/AB2010121B1A1/' },
  { slug: 'nomos-club-campus', brand: 'NOMOS', name: 'Club Campus', color: '#e8f0e8', accent: '#2d5a27', url: 'https://nomos-glashuette.com/en/watches/club/710-club' },
  { slug: 'nomos-tangente-38', brand: 'NOMOS', name: 'Tangente 38', color: '#f5f0e8', accent: '#2d5a27', url: 'https://nomos-glashuette.com/en/watches/tangente/139-tangente' },
  { slug: 'longines-hydroconquest-41', brand: 'Longines', name: 'HydroConquest 41', color: '#003087', accent: '#c0a030', url: 'https://www.longines.com/en-us/watch-hydroconquest-l3-781-4-56-6' },
  { slug: 'longines-master-collection-40', brand: 'Longines', name: 'Master Collection 40', color: '#f5f0e8', accent: '#c0a030', url: 'https://www.longines.com/en-us/watch-the-longines-master-collection-l2-793-4-72-0' },
  { slug: 'hamilton-khaki-field-auto-38', brand: 'Hamilton', name: 'Khaki Field Auto 38', color: '#2d3a1a', accent: '#8b7355', url: 'https://www.hamiltonwatch.com/en-us/h70455533-khaki-field-auto.html' },
  { slug: 'hamilton-jazzmaster-40', brand: 'Hamilton', name: 'Jazzmaster 40', color: '#1a1a2e', accent: '#8b7355', url: 'https://www.hamiltonwatch.com/en-us/h32475730-jazzmaster-auto.html' },
  { slug: 'tissot-prx-40', brand: 'Tissot', name: 'PRX 40', color: '#1a1a2e', accent: '#c0a030', url: 'https://www.tissotwatches.com/en-us/t1374071104100.html' },
  { slug: 'tissot-seastar-1000', brand: 'Tissot', name: 'Seastar 1000', color: '#003087', accent: '#c0a030', url: 'https://www.tissotwatches.com/en-us/t1204071104100.html' },
  { slug: 'baltic-aquascaphe', brand: 'Baltic', name: 'Aquascaphe', color: '#001a3a', accent: '#e0c060', url: 'https://www.balticwatches.com/products/aquascaphe' },
  { slug: 'baltic-bicompax-001', brand: 'Baltic', name: 'Bicompax 001', color: '#1a1a2e', accent: '#e0c060', url: 'https://www.balticwatches.com/products/bicompax-001' },
  { slug: 'halios-seaforth', brand: 'Halios', name: 'Seaforth', color: '#002a1a', accent: '#c0d080', url: 'https://halioswatches.com/collections/seaforth' },
  { slug: 'halios-tropik', brand: 'Halios', name: 'Tropik', color: '#1a2a1a', accent: '#c0d080', url: 'https://halioswatches.com/collections/tropik' },
  { slug: 'christopher-ward-c65-trident', brand: 'Christopher Ward', name: 'C65 Trident', color: '#003066', accent: '#c0a030', url: 'https://www.christopherward.com/collections/c65-trident' },
  { slug: 'seiko-presage-spb167', brand: 'Seiko', name: 'Presage SPB167', color: '#2a1a3a', accent: '#c0a84c', url: 'https://www.seikowatches.com/us-en/products/presage/spb167j1' },
  { slug: 'omega-constellation-39', brand: 'Omega', name: 'Constellation 39', color: '#1a1a2e', accent: '#b8a05a', url: 'https://www.omegawatches.com/watches/constellation/constellation/131-10-39-20-01-001' },
  { slug: 'rolex-yacht-master-40', brand: 'Rolex', name: 'Yacht-Master 40', color: '#1a1a4a', accent: '#c9a84c', url: 'https://www.rolex.com/watches/yacht-master/m126621-0001.html' },
  { slug: 'jaeger-lecoultre-reverso-classic', brand: 'Jaeger-LeCoultre', name: 'Reverso Classic', color: '#f5f0e8', accent: '#c0a030', url: 'https://www.jaeger-lecoultre.com/us/en/collections/reverso/q2548520.html' },
  { slug: 'zenith-el-primero-chronomaster', brand: 'Zenith', name: 'El Primero Chronomaster', color: '#1a1a1a', accent: '#c0a030', url: 'https://www.zenith-watches.com/en_US/products/chronomaster/chronomaster-original-38mm-03-3200-3600-69-m3200.html' },
  { slug: 'frederique-constant-classics-auto', brand: 'Frédérique Constant', name: 'Classics Auto', color: '#f5f0e8', accent: '#c0a030', url: 'https://www.frederique-constant.com/en/watches/classics/classics-automatic' },
  { slug: 'mido-ocean-star-tribute', brand: 'Mido', name: 'Ocean Star Tribute', color: '#002a4a', accent: '#c0a030', url: 'https://www.mido.com/en-us/watches/ocean-star/mido-ocean-star-tribute-m026-830-11-041-00' },
  { slug: 'swatch-sistem51', brand: 'Swatch', name: 'Sistem51', color: '#ff0000', accent: '#ffffff', url: 'https://www.swatch.com/en-us/watches/sistem51' },
]

// Brand accent colors for SVG placeholders
function makeSvg(brand, name, bgColor, accentColor) {
  // Sanitize text for SVG
  const escBrand = brand.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  const escName = name.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

  // Determine text color based on bg brightness
  const isLight = bgColor.startsWith('#f') || bgColor.startsWith('#e') || bgColor.startsWith('#d') || bgColor.startsWith('#c8')
  const textColor = isLight ? '#1a1a2e' : '#ffffff'
  const subTextColor = isLight ? '#444444' : '#94a3b8'

  return `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${bgColor};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${adjustColor(bgColor, -20)};stop-opacity:1" />
    </linearGradient>
    <linearGradient id="ring" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${accentColor};stop-opacity:0.8" />
      <stop offset="100%" style="stop-color:${accentColor};stop-opacity:0.3" />
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="800" height="600" fill="url(#bg)"/>

  <!-- Subtle grid pattern -->
  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="${accentColor}" stroke-width="0.3" opacity="0.15"/>
  </pattern>
  <rect width="800" height="600" fill="url(#grid)"/>

  <!-- Watch case outer ring -->
  <circle cx="400" cy="280" r="155" fill="none" stroke="url(#ring)" stroke-width="3" opacity="0.6"/>

  <!-- Watch bezel -->
  <circle cx="400" cy="280" r="140" fill="${isLight ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.3)'}" stroke="${accentColor}" stroke-width="2" opacity="0.5"/>

  <!-- Watch dial -->
  <circle cx="400" cy="280" r="115" fill="${isLight ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.4)'}"/>

  <!-- Hour markers -->
  ${[0,1,2,3,4,5,6,7,8,9,10,11].map(i => {
    const angle = (i * 30 - 90) * Math.PI / 180
    const x1 = 400 + 100 * Math.cos(angle)
    const y1 = 280 + 100 * Math.sin(angle)
    const x2 = 400 + (i % 3 === 0 ? 82 : 89) * Math.cos(angle)
    const y2 = 280 + (i % 3 === 0 ? 82 : 89) * Math.sin(angle)
    return `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${accentColor}" stroke-width="${i % 3 === 0 ? 3 : 1.5}" opacity="0.8"/>`
  }).join('\n  ')}

  <!-- Hour hand -->
  <line x1="400" y1="280" x2="400" y2="220" stroke="${accentColor}" stroke-width="4" stroke-linecap="round" opacity="0.9"/>
  <!-- Minute hand -->
  <line x1="400" y1="280" x2="435" y2="198" stroke="${textColor}" stroke-width="2.5" stroke-linecap="round" opacity="0.7"/>
  <!-- Seconds hand -->
  <line x1="400" y1="295" x2="395" y2="245" stroke="${accentColor}" stroke-width="1.5" stroke-linecap="round" opacity="0.6"/>

  <!-- Center dot -->
  <circle cx="400" cy="280" r="4" fill="${accentColor}"/>

  <!-- Crown -->
  <rect x="538" y="270" width="18" height="20" rx="4" fill="${accentColor}" opacity="0.5"/>

  <!-- Lugs top -->
  <rect x="382" y="132" width="36" height="14" rx="5" fill="${accentColor}" opacity="0.3"/>
  <!-- Lugs bottom -->
  <rect x="382" y="414" width="36" height="14" rx="5" fill="${accentColor}" opacity="0.3"/>

  <!-- Brand name -->
  <text x="400" y="490" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="22" font-weight="bold" fill="${accentColor}" letter-spacing="4" opacity="0.9">${escBrand.toUpperCase()}</text>

  <!-- Watch name -->
  <text x="400" y="525" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="14" fill="${subTextColor}" letter-spacing="2" opacity="0.8">${escName}</text>

  <!-- Decorative line -->
  <line x1="300" y1="475" x2="500" y2="475" stroke="${accentColor}" stroke-width="0.5" opacity="0.4"/>
</svg>`
}

function adjustColor(hex, amount) {
  try {
    const num = parseInt(hex.slice(1), 16)
    const r = Math.max(0, Math.min(255, (num >> 16) + amount))
    const g = Math.max(0, Math.min(255, ((num >> 8) & 0xff) + amount))
    const b = Math.max(0, Math.min(255, (num & 0xff) + amount))
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)
  } catch {
    return hex
  }
}

async function tryDownloadImage(pageUrl, outputPath) {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 8000)

    const pageRes = await fetch(pageUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    })
    clearTimeout(timeout)

    if (!pageRes.ok) return null

    const html = await pageRes.text()

    // Try og:image first
    const ogMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)
      || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i)

    let imgUrl = ogMatch ? ogMatch[1] : null

    // Try product image patterns if og:image not found
    if (!imgUrl) {
      const imgMatch = html.match(/["'](https:\/\/[^"']+\.(jpg|jpeg|png|webp))[^"']*["']/i)
      imgUrl = imgMatch ? imgMatch[1] : null
    }

    if (!imgUrl) return null
    if (imgUrl.startsWith('//')) imgUrl = 'https:' + imgUrl

    // Download the actual image
    const imgController = new AbortController()
    const imgTimeout = setTimeout(() => imgController.abort(), 10000)

    const imgRes = await fetch(imgUrl, {
      signal: imgController.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': new URL(pageUrl).origin,
      },
    })
    clearTimeout(imgTimeout)

    if (!imgRes.ok) return null

    const contentType = imgRes.headers.get('content-type') || ''
    if (!contentType.includes('image/')) return null

    const buffer = await imgRes.arrayBuffer()
    if (buffer.byteLength < 5000) return null // Too small, probably not a real image

    writeFileSync(outputPath, Buffer.from(buffer))
    return outputPath
  } catch {
    return null
  }
}

const manifest = {}

console.log(`\nDownloading watch images to: ${OUT_DIR}\n`)
console.log('='.repeat(60))

for (const watch of WATCHES) {
  const jpgPath = join(OUT_DIR, `${watch.slug}.jpg`)
  const svgPath = join(OUT_DIR, `${watch.slug}.svg`)

  process.stdout.write(`[${WATCHES.indexOf(watch) + 1}/${WATCHES.length}] ${watch.brand} ${watch.name}... `)

  // Try to download real image
  const downloaded = await tryDownloadImage(watch.url, jpgPath)

  if (downloaded) {
    manifest[watch.slug] = `/images/watches/${watch.slug}.jpg`
    console.log('✓ downloaded')
  } else {
    // Create branded SVG placeholder
    const svg = makeSvg(watch.brand, watch.name, watch.color, watch.accent)
    writeFileSync(svgPath, svg, 'utf8')
    manifest[watch.slug] = `/images/watches/${watch.slug}.svg`
    console.log('◯ SVG placeholder')
  }
}

// Write manifest
const manifestPath = join(OUT_DIR, 'manifest.json')
writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8')

console.log('\n' + '='.repeat(60))
console.log(`\nManifest written to: ${manifestPath}`)
const downloaded = Object.values(manifest).filter(v => v.endsWith('.jpg')).length
const placeholders = Object.values(manifest).filter(v => v.endsWith('.svg')).length
console.log(`Downloaded: ${downloaded}, SVG placeholders: ${placeholders}`)
console.log('\nDone!\n')
