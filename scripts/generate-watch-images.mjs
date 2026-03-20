import OpenAI from 'openai'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'images', 'watches')

const openai = new OpenAI()

const watches = [
  {
    slug: 'omega-seamaster-300m',
    prompt: 'Omega Seamaster 300M dive watch, 42mm steel case, blue ceramic bezel with diving scale, blue dial with wave pattern, luminous hour markers, date window at 6 o\'clock, steel bracelet',
  },
  {
    slug: 'omega-speedmaster-moonwatch',
    prompt: 'Omega Speedmaster Moonwatch chronograph, 42mm steel case, black tachymeter bezel, black dial with three subdials, luminous hands, steel bracelet, manual winding chronograph',
  },
  {
    slug: 'omega-aqua-terra-38',
    prompt: 'Omega Seamaster Aqua Terra 38mm, steel case, silver-white dial with horizontal teak pattern lines, date window at 3 o\'clock, steel bracelet, subtle sport-dress watch',
  },
  {
    slug: 'omega-constellation-39',
    prompt: 'Omega Constellation 39mm, steel case with fluted bezel, silver sunburst dial, Roman numeral markers on the bezel edge, date at 6 o\'clock, integrated steel bracelet, dress luxury watch',
  },
  {
    slug: 'seiko-prospex-sbdc101',
    prompt: 'Seiko Prospex SBDC101 dive watch, 40.5mm steel case, black rotating bezel, dark green dial, luminous markers, date window, steel bracelet, Japanese automatic diver',
  },
  {
    slug: 'seiko-5-sports-srpe55',
    prompt: 'Seiko 5 Sports SRPE55, 42.5mm steel case, black rotating bezel, dark blue dial, luminous markers, day-date at 3 o\'clock, steel bracelet, sporty automatic watch',
  },
  {
    slug: 'seiko-presage-spb165',
    prompt: 'Seiko Presage SPB165, 40mm steel case, white porcelain-like enamel dial, blue hands, applied hour markers, date at 3 o\'clock, brown leather strap, elegant Japanese dress watch',
  },
  {
    slug: 'seiko-presage-spb167',
    prompt: 'Seiko Presage SPB167, 40.5mm steel case, dark blue textured dial with subtle pattern, silver hands and markers, date at 3 o\'clock, steel bracelet, sophisticated dress watch',
  },
  {
    slug: 'hamilton-khaki-field-auto-38',
    prompt: 'Hamilton Khaki Field Automatic 38mm, steel case, black dial with military-style numerals at 3-6-9-12, luminous hands, date at 3 o\'clock, brown leather strap, classic field watch',
  },
  {
    slug: 'hamilton-jazzmaster-40',
    prompt: 'Hamilton Jazzmaster 40mm, steel case, silver sunburst dial, applied baton markers, date window, thin bezel, black leather strap, classic American dress watch',
  },
  {
    slug: 'rolex-submariner-date',
    prompt: 'Luxury dive watch, 41mm steel case, black ceramic rotating bezel with minute markers, black dial with luminous round hour markers, date window with magnifying cyclops lens at 3 o\'clock, steel oyster bracelet, professional diving instrument',
  },
  {
    slug: 'cartier-ronde-solo',
    prompt: 'Cartier Ronde Solo 36mm, round polished steel case, silver guilloché dial, Roman numeral markers, blued steel sword-shaped hands, cabochon crown, black leather strap, classic French dress watch',
  },
  {
    slug: 'patek-philippe-calatrava-5119',
    prompt: 'Patek Philippe Calatrava 5119, 36mm white gold case, white lacquered dial with Clous de Paris hobnail pattern on the bezel, dauphine hands, slim profile, black leather strap, ultra-refined dress watch',
  },
  {
    slug: 'jaeger-lecoultre-master-ultra-thin',
    prompt: 'Jaeger-LeCoultre Master Ultra Thin 40mm, steel case extremely thin profile, silver sunburst dial, applied baton hour markers, date at 3 o\'clock, black alligator strap, elegant minimalist dress watch',
  },
  {
    slug: 'iwc-portofino-40',
    prompt: 'IWC Portofino 40mm, steel round case, silver dial, slim applied baton markers, date at 3 o\'clock, thin bezel, black leather strap, refined minimalist dress watch',
  },
]

async function generateImage(watch) {
  const outputPath = path.join(OUTPUT_DIR, `${watch.slug}.png`)

  console.log(`Generating: ${watch.slug}...`)

  const response = await openai.images.generate({
    model: 'gpt-image-1',
    prompt: `Professional product photography of a ${watch.prompt}. Studio lighting on a pure white background. Watch shown at a slight angle. Clean, high-end catalog style. No text, no logos, no watermarks. Photorealistic render.`,
    n: 1,
    size: '1024x1024',
    quality: 'medium',
  })

  const imageData = response.data[0].b64_json
  const buffer = Buffer.from(imageData, 'base64')
  fs.writeFileSync(outputPath, buffer)
  console.log(`  Saved: ${outputPath} (${Math.round(buffer.length / 1024)}KB)`)
}

async function main() {
  console.log(`Generating ${watches.length} watch images...\n`)

  for (const watch of watches) {
    try {
      await generateImage(watch)
    } catch (err) {
      console.error(`  FAILED: ${watch.slug} - ${err.message}`)
    }
  }

  console.log('\nDone! Now convert to webp:')
  console.log('  for f in public/images/watches/*.png; do npx sharp-cli -i "$f" -o "${f%.png}.webp" --format webp; done')
}

main()
