#!/usr/bin/env node
/**
 * Core Web Vitals Monitor
 * Fetches CrUX data from PageSpeed Insights API for watchvswatch.com
 * Runs nightly at 02:00 UTC
 * Logs metrics: LCP, FID, CLS
 * Alerts if thresholds are breached:
 * - LCP: < 2.5s ✅
 * - FID: < 100ms ✅
 * - CLS: < 0.1 ✅
 */

import fs from 'fs'
import path from 'path'
import https from 'https'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const metricsDir = path.join(__dirname, '..', 'logs')
const metricsFile = path.join(metricsDir, 'core-web-vitals.json')

// Ensure logs directory exists
if (!fs.existsSync(metricsDir)) {
  fs.mkdirSync(metricsDir, { recursive: true })
}

// Thresholds
const THRESHOLDS = {
  lcp: 2.5, // seconds
  fid: 0.1, // seconds (100ms)
  cls: 0.1, // unitless
}

/**
 * Fetch PageSpeed Insights data for a URL
 */
async function fetchPageSpeedInsights(url) {
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
            resolve(JSON.parse(data))
          } catch (e) {
            reject(new Error(`Failed to parse PageSpeed Insights response: ${e.message}`))
          }
        })
      })
      .on('error', reject)
  })
}

/**
 * Extract Core Web Vitals from PageSpeed Insights response
 */
function extractCoreWebVitals(data) {
  const metrics = data?.loadingExperience?.metrics || {}
  const fieldData = data?.lighthouseResult?.audits?.metrics?.details?.items?.[0] || {}

  return {
    lcp: fieldData.largest_contentful_paint_ms ? fieldData.largest_contentful_paint_ms / 1000 : null,
    fid: fieldData.first_input_delay_ms ? fieldData.first_input_delay_ms / 1000 : null,
    cls: fieldData.cumulative_layout_shift_value || null,
    timestamp: new Date().toISOString(),
  }
}

/**
 * Check thresholds and generate alerts
 */
function checkThresholds(metrics) {
  const alerts = []

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
 * Log metrics to file
 */
function logMetrics(metrics, alerts) {
  let history = []

  // Load existing history
  if (fs.existsSync(metricsFile)) {
    try {
      history = JSON.parse(fs.readFileSync(metricsFile, 'utf8'))
    } catch (e) {
      console.error('Warning: Could not load existing metrics file')
    }
  }

  // Add new entry
  const entry = {
    timestamp: metrics.timestamp,
    metrics: {
      lcp: metrics.lcp ? parseFloat(metrics.lcp.toFixed(2)) : null,
      fid: metrics.fid ? parseFloat(metrics.fid.toFixed(3)) : null,
      cls: metrics.cls ? parseFloat(metrics.cls.toFixed(3)) : null,
    },
    alerts: alerts.length > 0 ? alerts : null,
    status: alerts.length > 0 ? 'degraded' : 'healthy',
  }

  history.push(entry)

  // Keep last 90 days of data
  const ninetyDaysAgo = new Date()
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)
  history = history.filter((h) => new Date(h.timestamp) >= ninetyDaysAgo)

  // Write to file
  fs.writeFileSync(metricsFile, JSON.stringify(history, null, 2), 'utf8')

  return entry
}

/**
 * Main function
 */
async function main() {
  try {
    console.log(`[${new Date().toISOString()}] Fetching Core Web Vitals for watchvswatch.com...`)

    const data = await fetchPageSpeedInsights('https://watchvswatch.com')
    const metrics = extractCoreWebVitals(data)
    const alerts = checkThresholds(metrics)

    const entry = logMetrics(metrics, alerts)

    console.log(`✅ Core Web Vitals recorded:`)
    console.log(`  LCP: ${metrics.lcp ? metrics.lcp.toFixed(2) + 's' : 'N/A'} ${metrics.lcp <= THRESHOLDS.lcp ? '✅' : '⚠️'}`)
    console.log(`  FID: ${metrics.fid ? metrics.fid.toFixed(3) + 's' : 'N/A'} ${metrics.fid <= THRESHOLDS.fid ? '✅' : '⚠️'}`)
    console.log(`  CLS: ${metrics.cls ? metrics.cls.toFixed(3) : 'N/A'} ${metrics.cls <= THRESHOLDS.cls ? '✅' : '⚠️'}`)
    console.log(`  Status: ${entry.status.toUpperCase()}`)

    if (alerts.length > 0) {
      console.log(`\n⚠️  ALERTS (${alerts.length}):`)
      alerts.forEach((alert) => {
        console.log(`  - ${alert.message}`)
      })
    }

    console.log(`\n📁 Metrics saved to: ${metricsFile}`)
    process.exit(0)
  } catch (error) {
    console.error(`❌ Error fetching Core Web Vitals:`, error.message)
    process.exit(1)
  }
}

main()
