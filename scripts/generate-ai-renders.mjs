/**
 * Generates AI renders for watches still on SVG placeholders.
 * Uses OpenAI gpt-image-1 — transparent background, no logos/text on dial.
 * Saves as /public/images/watches/{slug}.png and updates manifest.json.
 */

import { writeFileSync, readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import OpenAI from 'openai'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_DIR = join(__dirname, '..', 'public', 'images', 'watches')
const MANIFEST_PATH = join(OUT_DIR, 'manifest.json')

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
const manifest = JSON.parse(readFileSync(MANIFEST_PATH, 'utf8'))

// Watches that still have SVG placeholders and need AI renders
const WATCHES = {
  'rolex-submariner-41': 'Luxury Swiss automatic dive wristwatch with black dial, unidirectional rotating black ceramic bezel with platinum diving scale, stainless steel oyster bracelet, date window at 3 o\'clock, luminous hour markers and hands, 41mm case, no text or logos on dial, professional studio photography, white background, highly detailed',
  'rolex-gmt-master-ii-pepsi': 'Luxury Swiss automatic GMT wristwatch with black dial, bidirectional red and blue ceramic bezel, stainless steel oyster bracelet, date window, extra GMT hand, luminous hour markers, 40mm stainless steel case, no text or logos on dial, professional studio photography, white background, highly detailed',
  'rolex-datejust-36': 'Luxury Swiss automatic dress wristwatch with silver sunburst dial, fluted bezel, jubilee bracelet, cyclops date window at 3 o\'clock, luminous index hour markers, 36mm stainless steel case, no text or logos on dial, professional studio photography, white background, highly detailed',
  'rolex-explorer-36': 'Luxury Swiss automatic sport wristwatch with matte black dial, white 3-6-9 Arabic numeral hour markers, no date, oyster bracelet, luminous hands, 36mm stainless steel case with smooth bezel, no text or logos on dial, professional studio photography, white background, highly detailed',
  'rolex-day-date-40': 'Luxury Swiss automatic yellow gold president wristwatch with champagne dial, day display at 12 o\'clock, date at 3 o\'clock, fluted bezel, president bracelet, diamond hour markers, 40mm 18k yellow gold case, no text or logos on dial, professional studio photography, white background, highly detailed',
  'rolex-yacht-master-40': 'Luxury Swiss automatic yacht wristwatch with rhodium dial, bidirectional rotating bezel with raised numerals, oysterflex rubber bracelet, luminous hour markers, 40mm stainless steel and platinum case, no text or logos on dial, professional studio photography, white background, highly detailed',
  'cartier-santos': 'Luxury Swiss quartz square wristwatch with cream dial, Roman numerals, blued sword-shaped hands, signature screws on bezel, integrated steel and gold bracelet, 39mm stainless steel square case with rounded corners, sapphire crystal, no text or logos on dial, professional studio photography, white background, highly detailed',
  'cartier-tank-must': 'Luxury Swiss quartz rectangular dress wristwatch with cream dial, Roman numerals, blued sword-shaped hands, black leather strap with deployment clasp, flat rectangular stainless steel case with distinctive parallel lines, no text or logos on dial, professional studio photography, white background, highly detailed',
  'nomos-tangente-38': 'Minimalist German manual-wind dress wristwatch with white dial, thin Roman numeral hour markers, blued steel hands, slim leather strap, 38mm round stainless steel case, clean modernist bauhaus design, no text or logos on dial, professional studio photography, white background, highly detailed',
  'baltic-bicompax-001': 'Vintage-inspired French automatic chronograph wristwatch with panda dial, white dial with two black subdials, column wheel pusher chronograph, tachymeter scale bezel, leather strap, 39mm stainless steel case, no text or logos on dial, professional studio photography, white background, highly detailed',
  'halios-seaforth': 'Canadian microbrand automatic dive wristwatch with cushion-shaped case, dark blue dial, uni-directional dive bezel with 60-minute scale, stainless steel bracelet, date display, luminous hour markers and hands, 41mm stainless steel case, no text or logos on dial, professional studio photography, white background, highly detailed',
  'halios-tropik': 'Canadian microbrand automatic sports wristwatch with olive green or cream textured dial, clean minimalist design, smooth bezel, leather strap, vintage-inspired cushion case, luminous hands and markers, 38mm stainless steel case, no text or logos on dial, professional studio photography, white background, highly detailed',
  'zenith-el-primero-chronomaster': 'Swiss luxury automatic chronograph wristwatch with silver dial, three tri-color subdials in blue gray and rose, integrated column-wheel chronograph, pushers at 2 and 4 o\'clock, stainless steel bracelet, 38mm stainless steel case, no text or logos on dial, professional studio photography, white background, highly detailed',
  'frederique-constant-classics-auto': 'Swiss automatic classic dress wristwatch with silver guilloché dial, date window at 3 o\'clock, dauphine hands, applied baton hour markers, leather strap, 40mm stainless steel case with polished finish, no text or logos on dial, professional studio photography, white background, highly detailed',
}

const results = { generated: [], failed: [] }

for (const [slug, prompt] of Object.entries(WATCHES)) {
  // Skip if we already have a JPG or PNG
  const current = manifest[slug]
  if (current && !current.endsWith('.svg')) {
    console.log(`  ${slug}: already has ${current.split('.').pop()} — skipping`)
    continue
  }

  process.stdout.write(`  Generating ${slug}... `)

  try {
    const response = await client.images.generate({
      model: 'gpt-image-1',
      prompt,
      n: 1,
      size: '1024x1024',
      quality: 'medium',
    })

    const imageData = response.data[0]
    const pngPath = join(OUT_DIR, `${slug}.png`)

    if (imageData.b64_json) {
      writeFileSync(pngPath, Buffer.from(imageData.b64_json, 'base64'))
      manifest[slug] = `/images/watches/${slug}.png`
      results.generated.push(slug)
      console.log('✓ saved PNG')
    } else if (imageData.url) {
      const imgRes = await fetch(imageData.url)
      const buf = await imgRes.arrayBuffer()
      writeFileSync(pngPath, Buffer.from(buf))
      manifest[slug] = `/images/watches/${slug}.png`
      results.generated.push(slug)
      console.log('✓ saved PNG (from URL)')
    } else {
      console.log('✗ no image data in response')
      results.failed.push(slug)
    }
  } catch (err) {
    console.log(`✗ ${err.message}`)
    results.failed.push(slug)
  }

  // Small delay to stay within rate limits
  await new Promise(r => setTimeout(r, 1000))
}

// Save manifest
writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2), 'utf8')

console.log(`\nGenerated: ${results.generated.length}  Failed: ${results.failed.length}`)
if (results.failed.length > 0) {
  console.log('Failed slugs:', results.failed.join(', '))
  // Append to STILL_MISSING.txt
  const missingPath = join(OUT_DIR, 'STILL_MISSING.txt')
  const existing = (() => { try { return readFileSync(missingPath, 'utf8') } catch { return '' } })()
  const newEntries = results.failed.filter(s => !existing.includes(s))
  if (newEntries.length > 0) {
    writeFileSync(missingPath, (existing + newEntries.join('\n') + '\n').trimStart(), 'utf8')
  }
}
console.log('Manifest updated.\n')
