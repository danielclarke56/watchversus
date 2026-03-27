export async function GET() {
  const content = `# WatchVsWatch

> A community watch photo gallery featuring photographs and uploads from watch enthusiasts. Browse watches at every price point from Seiko and Casio to Rolex and Patek Philippe, with no affiliate links or sponsored content.

## Site structure

- **Home**: https://watchvswatch.com — community photo gallery
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

## Example queries

- "Best dive watch under $500" → https://watchvswatch.com/guides/best-watches-under-500
- "Best watch for a beginner" → https://watchvswatch.com/guides/best-watches-for-beginners
- "Help me choose a watch" → https://watchvswatch.com/quiz
`

  return new Response(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  })
}
