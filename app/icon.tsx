import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          background: '#0f172a',
          borderRadius: 5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
        }}
      >
        {/* Left watch circle */}
        <div
          style={{
            width: 11,
            height: 11,
            borderRadius: '50%',
            border: '2.5px solid #f59e0b',
            background: 'transparent',
          }}
        />

        {/* VS text */}
        <div
          style={{
            color: '#e2e8f0',
            fontSize: 7,
            fontWeight: 900,
            lineHeight: 1,
            letterSpacing: -1,
          }}
        >
          vs
        </div>

        {/* Right watch circle */}
        <div
          style={{
            width: 11,
            height: 11,
            borderRadius: '50%',
            border: '2.5px solid #f59e0b',
            background: 'transparent',
          }}
        />
      </div>
    ),
    { ...size }
  )
}
