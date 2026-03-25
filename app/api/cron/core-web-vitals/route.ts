import { NextRequest, NextResponse } from 'next/server'
import https from 'https'

/**
 * Core Web Vitals Monitoring Cron Job
 * Runs nightly at 02:00 UTC via Vercel Cron Jobs
 * Fetches CrUX data from PageSpeed Insights API
 * Logs metrics: LCP, FID, CLS
 * Alerts if thresholds are breached
 */

// Thresholds
const THRESHOLDS = {
  lcp: 2.5, // seconds
  fid: 0.1, // seconds (100ms)
  cls: 0.1, // unitless
}

/**
 * Fetch PageSpeed Insights data for a URL
 */
async function fetchPageSpeedInsights(url: string): Promise<PageSpeedResponse> {
  return new Promise((resolve, reject) => {
    const apiUrl = new URL('https://www.googleapis.com/pagespeedonline/v5/runPagespeed')
    apiUrl.searchParams.append('url', url)
    apiUrl.searchParams.append('category', 'performance')

    https
      .get(apiUrl.toString(), (res) => {
        let data = ''
        res.on('data', (chunk) => {
          data += chunk
        })
        res.on('end', () => {
          try {
            resolve(JSON.parse(data) as PageSpeedResponse)
          } catch (e) {
            reject(new Error(`Failed to parse PageSpeed Insights response: ${(e as Error).message}`))
          }
        })
      })
      .on('error', reject)
  })
}

interface PageSpeedResponse {
  lighthouseResult?: {
    audits?: {
      metrics?: {
        details?: {
          items?: Array<{
            largest_contentful_paint_ms?: number
            first_input_delay_ms?: number
            cumulative_layout_shift_value?: number
          }>
        }
      }
    }
  }
}

interface CoreWebVitalsMetrics {
  lcp: number | null
  fid: number | null
  cls: number | null
  timestamp: string
}

/**
 * Extract Core Web Vitals from PageSpeed Insights response
 */
function extractCoreWebVitals(data: PageSpeedResponse): CoreWebVitalsMetrics {
  const fieldData = data?.lighthouseResult?.audits?.metrics?.details?.items?.[0] || {}

  return {
    lcp: fieldData.largest_contentful_paint_ms ? fieldData.largest_contentful_paint_ms / 1000 : null,
    fid: fieldData.first_input_delay_ms ? fieldData.first_input_delay_ms / 1000 : null,
    cls: fieldData.cumulative_layout_shift_value || null,
    timestamp: new Date().toISOString(),
  }
}

interface Alert {
  level: string
  metric: string
  value: string
  unit: string
  threshold: number
  message: string
}

/**
 * Check thresholds and generate alerts
 */
function checkThresholds(metrics: CoreWebVitalsMetrics): Alert[] {
  const alerts: Alert[] = []

  if (metrics.lcp !== null && metrics.lcp > THRESHOLDS.lcp) {
    alerts.push({
      level: 'warning',
      metric: 'LCP',
      value: metrics.lcp.toFixed(2),
      unit: 's',
      threshold: THRESHOLDS.lcp,
      message: `LCP exceeds threshold: ${metrics.lcp.toFixed(2)}s > ${THRESHOLDS.lcp}s`,
    })
  }

  if (metrics.fid !== null && metrics.fid > THRESHOLDS.fid) {
    alerts.push({
      level: 'warning',
      metric: 'FID',
      value: metrics.fid.toFixed(3),
      unit: 's',
      threshold: THRESHOLDS.fid,
      message: `FID exceeds threshold: ${metrics.fid.toFixed(3)}s > ${THRESHOLDS.fid}s`,
    })
  }

  if (metrics.cls !== null && metrics.cls > THRESHOLDS.cls) {
    alerts.push({
      level: 'warning',
      metric: 'CLS',
      value: metrics.cls.toFixed(3),
      unit: 'unitless',
      threshold: THRESHOLDS.cls,
      message: `CLS exceeds threshold: ${metrics.cls.toFixed(3)} > ${THRESHOLDS.cls}`,
    })
  }

  return alerts
}

/**
 * Verify Vercel cron secret token (optional but recommended for security)
 */
function verifyVercelCronSecret(request: NextRequest): boolean {
  // Vercel cron jobs automatically add an Authorization header
  // with the value: Bearer <cron_secret>
  // This is set in your Vercel project settings or vercel.json
  const authHeader = request.headers.get('authorization')
  if (!authHeader) {
    return false
  }

  // In production, verify against VERCEL_CRON_SECRET environment variable
  const secret = process.env.VERCEL_CRON_SECRET
  if (secret && authHeader === `Bearer ${secret}`) {
    return true
  }

  // Allow requests from Vercel's cron service
  // (in development, you can call this endpoint manually)
  return process.env.NODE_ENV === 'development'
}

export async function GET(request: NextRequest) {
  try {
    // Verify cron request (optional security check)
    if (process.env.VERCEL_CRON_SECRET && !verifyVercelCronSecret(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log(`[${new Date().toISOString()}] Fetching Core Web Vitals for watchvswatch.com...`)

    const data = await fetchPageSpeedInsights('https://watchvswatch.com')
    const metrics = extractCoreWebVitals(data)
    const alerts = checkThresholds(metrics)

    const logEntry = {
      timestamp: metrics.timestamp,
      metrics: {
        lcp: metrics.lcp ? parseFloat(metrics.lcp.toFixed(2)) : null,
        fid: metrics.fid ? parseFloat(metrics.fid.toFixed(3)) : null,
        cls: metrics.cls ? parseFloat(metrics.cls.toFixed(3)) : null,
      },
      alerts: alerts.length > 0 ? alerts : null,
      status: alerts.length > 0 ? 'degraded' : 'healthy',
    }

    console.log(`✅ Core Web Vitals recorded:`)
    console.log(`  LCP: ${metrics.lcp ? metrics.lcp.toFixed(2) + 's' : 'N/A'} ${metrics.lcp !== null && metrics.lcp <= THRESHOLDS.lcp ? '✅' : '⚠️'}`)
    console.log(`  FID: ${metrics.fid ? metrics.fid.toFixed(3) + 's' : 'N/A'} ${metrics.fid !== null && metrics.fid <= THRESHOLDS.fid ? '✅' : '⚠️'}`)
    console.log(`  CLS: ${metrics.cls ? metrics.cls.toFixed(3) : 'N/A'} ${metrics.cls !== null && metrics.cls <= THRESHOLDS.cls ? '✅' : '⚠️'}`)
    console.log(`  Status: ${logEntry.status.toUpperCase()}`)

    if (alerts.length > 0) {
      console.log(`\n⚠️  ALERTS (${alerts.length}):`)
      alerts.forEach((alert) => {
        console.log(`  - ${alert.message}`)
      })
    }

    return NextResponse.json(logEntry)
  } catch (error) {
    console.error(`❌ Error fetching Core Web Vitals:`, (error as Error).message)
    return NextResponse.json(
      { 
        error: 'Failed to fetch Core Web Vitals',
        message: (error as Error).message 
      },
      { status: 500 }
    )
  }
}
