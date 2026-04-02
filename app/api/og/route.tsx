import { ImageResponse } from '@vercel/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const type = searchParams.get('type') || 'default'
  const title = searchParams.get('title') || 'WatchVsWatch'
  const subtitle = searchParams.get('subtitle') || ''

  // Default / watch / photo layout
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
            backgroundColor: '#444444',
          }}
        >
          <span style={{ color: '#FFFFFF', fontSize: 28, fontWeight: 700 }}>
            WatchVsWatch
          </span>
          {type !== 'default' && (
            <span style={{ color: '#AAAAAA', fontSize: 20, marginLeft: 16 }}>
              {type === 'watch' ? 'Watch Profile' : ''}
            </span>
          )}
        </div>

        {/* Main content */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '0 64px',
            gap: 16,
          }}
        >
          <span
            style={{
              fontSize: 52,
              fontWeight: 700,
              color: '#444444',
              lineHeight: 1.15,
              maxWidth: '90%',
            }}
          >
            {title}
          </span>
          {subtitle && (
            <span
              style={{
                fontSize: 24,
                color: '#777777',
                lineHeight: 1.4,
                maxWidth: '80%',
              }}
            >
              {subtitle}
            </span>
          )}
        </div>

        {/* Bottom bar */}
        <div
          style={{
            display: 'flex',
            padding: '24px 48px',
            backgroundColor: '#F0F0F0',
            justifyContent: 'center',
          }}
        >
          <span style={{ color: '#777777', fontSize: 20 }}>
            watchems.com
          </span>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}
