export async function GET() {
  const content = `# WatchVsWatch

> The most detailed watch comparison tool on the web. Side-by-side specs, movement details, water resistance, price, and expert verdicts for 121 watch pairs across 50 watches from 20+ brands.

## Site structure

- **Home**: https://watchvswatch.com
- **Comparisons**: https://watchvswatch.com/compare — 121 head-to-head watch comparisons
- **Watch Database**: https://watchvswatch.com/watches — 50 watch profiles with full specs, reviews, and photos
- **Quiz**: https://watchvswatch.com/quiz — interactive watch finder quiz

## Buying guides (16 guides)

- https://watchvswatch.com/guides/best-watches-under-500 — Best Watches Under $500
- https://watchvswatch.com/guides/best-watches-under-1000 — Best Watches Under $1,000
- https://watchvswatch.com/guides/best-watches-under-3000 — Best Watches Under $3,000
- https://watchvswatch.com/guides/best-watches-under-5000 — Best Watches Under $5,000
- https://watchvswatch.com/guides/best-luxury-watches-under-10000 — Best Luxury Watches Under $10,000
- https://watchvswatch.com/guides/best-dive-watches — Best Dive Watches
- https://watchvswatch.com/guides/best-dive-watches-under-1000 — Best Dive Watches Under $1,000
- https://watchvswatch.com/guides/best-dress-watches — Best Dress Watches
- https://watchvswatch.com/guides/best-dress-watches-under-500 — Best Dress Watches Under $500
- https://watchvswatch.com/guides/best-field-watches — Best Field Watches
- https://watchvswatch.com/guides/best-gmt-watches — Best GMT Watches
- https://watchvswatch.com/guides/best-pilot-watches — Best Pilot Watches
- https://watchvswatch.com/guides/best-chronograph-watches-under-5000 — Best Chronographs Under $5,000
- https://watchvswatch.com/guides/best-sports-watches — Best Sports Watches
- https://watchvswatch.com/guides/best-watches-for-beginners — Best Watches for Beginners
- https://watchvswatch.com/guides/rolex-new-vs-pre-owned-buying-guide — Rolex: New vs Pre-Owned

## Brands covered

Rolex, Omega, Tudor, Grand Seiko, Seiko, Breitling, Tag Heuer, IWC, Cartier, Panerai, Longines, Hamilton, Tissot, Zenith, Frederique Constant, Nomos, Baltic, Christopher Ward, Casio, Citizen, and more.

## Data per watch

Each watch profile includes: brand, model name, reference number, case diameter (mm), case thickness (mm), lug-to-lug (mm), lug width (mm), weight (g), water resistance (m), movement type (automatic/manual/quartz), caliber, power reserve (hours), crystal type, bracelet/strap material, retail price range (USD), and a full text description.

## Data per comparison

Each comparison page includes side-by-side specs for both watches, a generated verdict, 6 FAQ items with detailed answers, community votes, and links to related comparisons and guides.

## Example queries

- "Compare Rolex Submariner vs Omega Seamaster" → https://watchvswatch.com/compare/rolex-submariner-41-vs-omega-seamaster-300m
- "Best dive watch under $500" → https://watchvswatch.com/guides/best-watches-under-500
- "Omega Speedmaster specs and reviews" → https://watchvswatch.com/watches/omega-speedmaster-moonwatch
- "Best watch for a beginner" → https://watchvswatch.com/guides/best-watches-for-beginners
- "Help me choose a watch" → https://watchvswatch.com/quiz
`

  return new Response(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  })
}
