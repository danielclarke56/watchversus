import { Resend } from 'resend'

let _resend: Resend | null = null
function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY)
  return _resend
}

const TEMPLATE_ID = '7b7d895b-2ee5-4bc1-8f4e-700ada63a3c3'

// Cache the template HTML in memory (refreshed on cold start)
let templateCache: string | null = null

async function getTemplateHtml(): Promise<string | null> {
  if (templateCache) return templateCache
  try {
    const res = await fetch(`https://api.resend.com/templates/${TEMPLATE_ID}`, {
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}` },
    })
    if (!res.ok) return null
    const data = await res.json()
    const html = data.record?.html || data.html || null
    if (html) templateCache = html
    return html
  } catch {
    return null
  }
}

interface PhotoApprovalData {
  firstName?: string
  brandName?: string
  modelName?: string
  referenceNumber?: string
  slug?: string
  imageUrl?: string
}

interface BulkPhotoApprovalData {
  firstName?: string
  photos: Array<{
    brandName?: string
    modelName?: string
    referenceNumber?: string
    slug?: string
    imageUrl?: string
  }>
}

/**
 * Send a photo approval notification email via Resend,
 * using the "Watch Photo Live" template from the dashboard.
 */
export async function sendPhotoApprovedEmail(
  to: string,
  data: PhotoApprovalData
): Promise<{ success: boolean; error?: string }> {
  const resend = getResend()
  if (!resend) {
    console.warn('[Resend] Missing RESEND_API_KEY — skipping email')
    return { success: false, error: 'Resend not configured' }
  }

  const fromEmail = process.env.RESEND_FROM_EMAIL || 'Watchems <onboarding@resend.dev>'
  const watchName = [data.brandName, data.modelName].filter(Boolean).join(' ') || 'your watch'

  // Fetch and render the Resend dashboard template
  const templateHtml = await getTemplateHtml()
  if (!templateHtml) {
    console.error('[Resend] Could not fetch template — skipping email')
    return { success: false, error: 'Template not found' }
  }

  const vars: Record<string, string> = {
    firstName: data.firstName || 'there',
    slug: data.slug || '',
    imageUrl: data.imageUrl || '',
    brand: data.brandName || '',
    model: data.modelName || '',
    reference: data.referenceNumber || '',
  }

  let html = templateHtml
  for (const [key, val] of Object.entries(vars)) {
    html = html.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), val)
  }
  // Fix template URL: /w/ is for watch pages, /photo/ is for photo pages
  html = html.replace(/watchems\.com\/w\//g, 'watchems.com/photo/')

  try {
    const { error } = await resend.emails.send({
      from: fromEmail,
      to,
      subject: `Your ${watchName} photo is live on Watchems!`,
      html,
    })

    if (error) {
      console.error(`[Resend] Failed to send to ${to}:`, error)
      return { success: false, error: error.message }
    }

    console.log(`[Resend] Photo approval email sent to ${to}`)
    return { success: true }
  } catch (err) {
    console.error('[Resend] Error sending email:', err)
    return { success: false, error: (err as Error).message }
  }
}

/**
 * Send a single summary email when multiple photos are approved at once.
 * Uses plain HTML (no template) so it works regardless of template structure.
 */
export async function sendPhotoBulkApprovedEmail(
  to: string,
  data: BulkPhotoApprovalData
): Promise<{ success: boolean; error?: string }> {
  const resend = getResend()
  if (!resend) {
    console.warn('[Resend] Missing RESEND_API_KEY — skipping email')
    return { success: false, error: 'Resend not configured' }
  }

  const fromEmail = process.env.RESEND_FROM_EMAIL || 'Watchems <onboarding@resend.dev>'
  const firstName = data.firstName || 'there'
  const count = data.photos.length

  const photoRows = data.photos
    .map((p) => {
      const name = [p.brandName, p.modelName].filter(Boolean).join(' ') || 'Watch'
      const link = p.slug ? `https://watchems.com/photo/${p.slug}` : 'https://watchems.com'
      const thumb = p.imageUrl
        ? `<img src="${p.imageUrl}" alt="${name}" width="60" height="60" style="border-radius:6px;object-fit:cover;display:block;" />`
        : ''
      return `<tr>
        <td style="padding:8px 0;width:68px;vertical-align:top;">${thumb}</td>
        <td style="padding:8px 0 8px 12px;vertical-align:top;">
          <a href="${link}" style="color:#1a1a1a;font-weight:600;text-decoration:none;">${name}</a>
          ${p.referenceNumber ? `<br/><span style="color:#666;font-size:13px;">${p.referenceNumber}</span>` : ''}
          <br/><a href="${link}" style="color:#2563eb;font-size:13px;">View on Watchems →</a>
        </td>
      </tr>`
    })
    .join('')

  const html = `<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:system-ui,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;max-width:560px;">
        <tr><td style="background:#1a1a1a;padding:24px 32px;">
          <span style="color:#ffffff;font-size:20px;font-weight:700;">Watchems</span>
        </td></tr>
        <tr><td style="padding:32px;">
          <h2 style="margin:0 0 8px;font-size:22px;color:#1a1a1a;">Your photos are live, ${firstName}!</h2>
          <p style="margin:0 0 24px;color:#555;font-size:15px;">
            ${count === 1 ? 'Your photo has' : `All ${count} of your photos have`} been approved and ${count === 1 ? 'is' : 'are'} now live on Watchems.
          </p>
          <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #eee;">
            ${photoRows}
          </table>
          <p style="margin:24px 0 0;color:#888;font-size:13px;">
            Thank you for contributing to the Watchems community!
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`

  try {
    const subject =
      count === 1
        ? `Your ${[data.photos[0]?.brandName, data.photos[0]?.modelName].filter(Boolean).join(' ') || 'watch'} photo is live on Watchems!`
        : `Your ${count} watch photos are live on Watchems!`

    const { error } = await resend.emails.send({ from: fromEmail, to, subject, html })

    if (error) {
      console.error(`[Resend] Failed to send bulk approval to ${to}:`, error)
      return { success: false, error: error.message }
    }

    console.log(`[Resend] Bulk approval email (${count} photos) sent to ${to}`)
    return { success: true }
  } catch (err) {
    console.error('[Resend] Error sending bulk approval email:', err)
    return { success: false, error: (err as Error).message }
  }
}
