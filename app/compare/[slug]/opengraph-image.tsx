import { ImageResponse } from 'next/og'
import { getWatchBySlug } from '@/lib/watches'

export const runtime = 'edge'
export const alt = 'Watch comparison'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function OGImage({ params }: { params: { slug: string } }) {
  const vsIndex = params.slug.indexOf('-vs-')
  if (vsIndex === -1) {
    return new ImageResponse(
      <div style={{ width: '100%', height: '100%', display: 'flex', backgroundColor: '#FAFAFA' }} />,
      { ...size }
    )
  }

  const slug1 = params.slug.slice(0, vsIndex)
  const slug2 = params.slug.slice(vsIndex + 4)
  const w1 = getWatchBySlug(slug1)
  const w2 = getWatchBySlug(slug2)

  const name1 = w1 ? `${w1.brand} ${w1.name}` : slug1
  const name2 = w2 ? `${w2.brand} ${w2.name}` : slug2

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#FAFAFA',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {/* Top bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '32px 48px',
            backgroundColor: '#2D2D2D',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                backgroundColor: '#B8860B',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                fontSize: 18,
                fontWeight: 700,
              }}
            >
              W
            </div>
            <span style={{ color: '#FFFFFF', fontSize: 28, fontWeight: 700 }}>
              WatchVsWatch
            </span>
          </div>
          <span style={{ color: '#999999', fontSize: 20, marginLeft: 'auto' }}>
            Head-to-Head Comparison
          </span>
        </div>

        {/* Main content */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 48px',
            gap: 32,
          }}
        >
          {/* Watch 1 */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              flex: 1,
              padding: '28px 24px',
              backgroundColor: '#FFFFFF',
              borderRadius: 8,
              border: '2px solid #E5E5E5',
              minHeight: 200,
            }}
          >
            {w1 && (
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: '#B8860B',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  marginBottom: 8,
                }}
              >
                {w1.brand}
              </span>
            )}
            <span
              style={{
                fontSize: 32,
                fontWeight: 700,
                color: '#2D2D2D',
                textAlign: 'center',
                lineHeight: 1.2,
              }}
            >
              {w1 ? w1.name : name1}
            </span>
            {w1 && (
              <span style={{ fontSize: 14, color: '#888888', marginTop: 8 }}>
                {w1.case_diameter_mm}mm · {w1.movement_type} · {w1.water_resistance_m}m WR
              </span>
            )}
          </div>

          {/* VS badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 72,
              height: 72,
              borderRadius: '50%',
              backgroundColor: '#B8860B',
              color: '#FFFFFF',
              fontSize: 24,
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            VS
          </div>

          {/* Watch 2 */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              flex: 1,
              padding: '28px 24px',
              backgroundColor: '#FFFFFF',
              borderRadius: 8,
              border: '2px solid #E5E5E5',
              minHeight: 200,
            }}
          >
            {w2 && (
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: '#B8860B',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  marginBottom: 8,
                }}
              >
                {w2.brand}
              </span>
            )}
            <span
              style={{
                fontSize: 32,
                fontWeight: 700,
                color: '#2D2D2D',
                textAlign: 'center',
                lineHeight: 1.2,
              }}
            >
              {w2 ? w2.name : name2}
            </span>
            {w2 && (
              <span style={{ fontSize: 14, color: '#888888', marginTop: 8 }}>
                {w2.case_diameter_mm}mm · {w2.movement_type} · {w2.water_resistance_m}m WR
              </span>
            )}
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            display: 'flex',
            padding: '20px 48px',
            backgroundColor: '#F0F0F0',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <span style={{ color: '#666666', fontSize: 18 }}>
            watchvswatch.com — Specs, Reviews & Verdict
          </span>
        </div>
      </div>
    ),
    { ...size }
  )
}
