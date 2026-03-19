#!/usr/bin/env node
/**
 * Google Search Console API Integration
 * Fetches ranking metrics from GSC for watchvswatch.com
 * Requires: Service account JSON key file path or GOOGLE_APPLICATION_CREDENTIALS
 * Metrics: top keywords, average position, CTR, impressions
 */

import fs from 'fs'
import path from 'path'
import https from 'https'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const metricsDir = path.join(__dirname, '..', 'logs')
const metricsFile = path.join(metricsDir, 'gsc-metrics.json')

// Ensure logs directory exists
if (!fs.existsSync(metricsDir)) {
  fs.mkdirSync(metricsDir, { recursive: true })
}

// Configuration
const PROPERTY_URL = 'https://watchvswatch.com/'
const API_ENDPOINT = 'https://www.googleapis.com/webmasters/v3'
const SCOPES = ['https://www.googleapis.com/auth/webmasters.readonly']
const ROWS_PER_REQUEST = 25000 // GSC API max

/**
 * Load service account credentials
 */
function loadServiceAccount() {
  // First, check environment variable
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    try {
      const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS)
      return credentials
    } catch (e) {
      // If it's a file path
      if (fs.existsSync(process.env.GOOGLE_APPLICATION_CREDENTIALS)) {
        return JSON.parse(fs.readFileSync(process.env.GOOGLE_APPLICATION_CREDENTIALS, 'utf8'))
      }
    }
  }

  // Check for key file in project
  const keyPath = path.join(__dirname, '..', '..', 'helpful-skyline-490601-q4-b6a6be0841ea.json')
  if (fs.existsSync(keyPath)) {
    return JSON.parse(fs.readFileSync(keyPath, 'utf8'))
  }

  throw new Error(
    'GSC service account key not found. Set GOOGLE_APPLICATION_CREDENTIALS env var or place key file in project root.',
  )
}

/**
 * Generate JWT access token
 */
async function getAccessToken(serviceAccount) {
  return new Promise((resolve, reject) => {
    const header = {
      alg: 'RS256',
      typ: 'JWT',
      kid: serviceAccount.private_key_id,
    }

    const now = Math.floor(Date.now() / 1000)
    const payload = {
      iss: serviceAccount.client_email,
      scope: SCOPES.join(' '),
      aud: 'https://oauth2.googleapis.com/token',
      exp: now + 3600,
      iat: now,
    }

    // Simple base64url encoding
    const headerStr = Buffer.from(JSON.stringify(header)).toString('base64url')
    const payloadStr = Buffer.from(JSON.stringify(payload)).toString('base64url')
    const signingInput = `${headerStr}.${payloadStr}`

    // Sign with private key
    const crypto = require('crypto')
    const signer = crypto.createSign('RSA-SHA256')
    signer.update(signingInput)
    const signature = signer.sign(serviceAccount.private_key, 'base64url')

    const jwt = `${signingInput}.${signature}`

    // Exchange JWT for access token
    const postData = new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    })

    const options = {
      hostname: 'oauth2.googleapis.com',
      port: 443,
      path: '/token',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': postData.toString().length,
      },
    }

    const req = https.request(options, (res) => {
      let data = ''
      res.on('data', (chunk) => {
        data += chunk
      })
      res.on('end', () => {
        try {
          const json = JSON.parse(data)
          resolve(json.access_token)
        } catch (e) {
          reject(new Error(`Failed to parse OAuth response: ${e.message}`))
        }
      })
    })

    req.on('error', reject)
    req.write(postData.toString())
    req.end()
  })
}

/**
 * Fetch GSC metrics
 */
async function fetchGSCMetrics(accessToken) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      dimensions: ['query'],
      rowLimit: ROWS_PER_REQUEST,
      startRow: 0,
    })

    const path = `/sites/${encodeURIComponent(PROPERTY_URL)}/searchAnalytics/query`
    const options = {
      hostname: 'www.googleapis.com',
      port: 443,
      path: path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
        Authorization: `Bearer ${accessToken}`,
      },
    }

    const req = https.request(options, (res) => {
      let data = ''
      res.on('data', (chunk) => {
        data += chunk
      })
      res.on('end', () => {
        try {
          resolve(JSON.parse(data))
        } catch (e) {
          reject(new Error(`Failed to parse GSC response: ${e.message}`))
        }
      })
    })

    req.on('error', reject)
    req.write(payload)
    req.end()
  })
}

/**
 * Log metrics to file
 */
function logMetrics(metrics) {
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
    timestamp: new Date().toISOString(),
    totalClicks: metrics.rows?.reduce((sum, row) => sum + row.clicks, 0) || 0,
    totalImpressions: metrics.rows?.reduce((sum, row) => sum + row.impressions, 0) || 0,
    averagePosition: metrics.rows?.reduce((sum, row) => sum + row.position, 0) / (metrics.rows?.length || 1) || 0,
    averageCTR: metrics.rows?.reduce((sum, row) => sum + row.ctr, 0) / (metrics.rows?.length || 1) || 0,
    topQueries: (metrics.rows || []).slice(0, 20).map((row) => ({
      query: row.keys[0],
      clicks: row.clicks,
      impressions: row.impressions,
      position: parseFloat(row.position.toFixed(2)),
      ctr: parseFloat((row.ctr * 100).toFixed(2)) + '%',
    })),
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
    console.log(`[${new Date().toISOString()}] Fetching GSC metrics for watchvswatch.com...`)

    const serviceAccount = loadServiceAccount()
    console.log(`Using service account: ${serviceAccount.client_email}`)

    const accessToken = await getAccessToken(serviceAccount)
    console.log('Access token obtained')

    const metrics = await fetchGSCMetrics(accessToken)

    if (metrics.error) {
      throw new Error(`GSC API error: ${metrics.error.message}`)
    }

    const entry = logMetrics(metrics)

    console.log('SUCCESS: GSC metrics recorded')
    console.log(`Total Clicks (90d): ${entry.totalClicks}`)
    console.log(`Total Impressions (90d): ${entry.totalImpressions}`)
    console.log(`Average Position: ${entry.averagePosition.toFixed(2)}`)
    console.log(`Average CTR: ${entry.averageCTR.toFixed(4) * 100}%`)
    console.log(`\nTop 5 Queries:`)
    entry.topQueries.slice(0, 5).forEach((q, i) => {
      console.log(
        `  ${i + 1}. "${q.query}" - Pos: ${q.position}, Clicks: ${q.clicks}, Impressions: ${q.impressions}, CTR: ${q.ctr}`,
      )
    })

    console.log(`\nMetrics saved to: ${metricsFile}`)
    process.exit(0)
  } catch (error) {
    console.error(`ERROR: ${error.message}`)
    process.exit(1)
  }
}

main()
