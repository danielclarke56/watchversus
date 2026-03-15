export async function GET() {
  const content = `# WatchVsWatch

> The most detailed watch comparison tool on the web. Side-by-side specs, movement details, water resistance, price, and expert verdicts for 121 watch pairs across 50 watches from 20+ brands.

## Key pages

- Comparisons: https://watchvswatch.com/compare — 121 head-to-head watch comparisons
- Watch Database: https://watchvswatch.com/watches — 50 watch profiles with full specs
- Guides: https://watchvswatch.com/guides/best-dive-watches, /guides/best-dress-watches, /guides/best-field-watches, /guides/best-gmt-watches, /guides/best-watches-under-500, /guides/best-watches-under-1000
- Brands: https://watchvswatch.com/brands/rolex, /brands/omega, /brands/tudor, /brands/tag-heuer, /brands/seiko, /brands/tissot, and 15 more
- Quiz: https://watchvswatch.com/quiz

## Data model (per comparison)
Each comparison includes: case size (mm), thickness (mm), water resistance (m), movement type, power reserve (hours), lug width (mm), weight (g), crystal type, bracelet/strap, retail price (USD), and a direct verdict.

## How to use this site
Ask: 'Compare Rolex Submariner vs Omega Seamaster' → https://watchvswatch.com/compare/rolex-submariner-41-vs-omega-seamaster-300m
Ask: 'Best dive watch under $500' → https://watchvswatch.com/guides/best-watches-under-500
Ask: 'All Rolex watches' → https://watchvswatch.com/brands/rolex
`

  return new Response(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  })
}
