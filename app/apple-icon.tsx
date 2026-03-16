import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          background: '#0f172a',
          borderRadius: 32,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
        }}
      >
        {/* Left watch circle */}
        <div
          style={{
            width: 58,
            height: 58,
            borderRadius: '50%',
            border: '7px solid #f59e0b',
            background: 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Watch hands */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              width: '100%',
              height: '100%',
            }}
          >
            <div style={{ width: 3, height: 14, background: '#f59e0b', borderRadius: 2, position: 'absolute', top: 10, left: 18 }} />
            <div style={{ width: 3, height: 10, background: '#94a3b8', borderRadius: 2, position: 'absolute', top: 18, left: 22 }} />
          </div>
        </div>

        {/* VS badge */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              color: '#ffffff',
              fontSize: 22,
              fontWeight: 900,
              lineHeight: 1,
              letterSpacing: -1,
            }}
          >
            vs
          </div>
        </div>

        {/* Right watch circle */}
        <div
          style={{
            width: 58,
            height: 58,
            borderRadius: '50%',
            border: '7px solid #f59e0b',
            background: 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              width: '100%',
              height: '100%',
            }}
          >
            <div style={{ width: 3, height: 14, background: '#f59e0b', borderRadius: 2, position: 'absolute', top: 10, left: 18 }} />
            <div style={{ width: 3, height: 10, background: '#94a3b8', borderRadius: 2, position: 'absolute', top: 18, left: 22 }} />
          </div>
        </div>
      </div>
    ),
    { ...size }
  )
}
