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
