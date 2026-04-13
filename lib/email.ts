import { Resend } from 'resend'
import fs from 'fs'
import path from 'path'

let _resend: Resend | null = null
function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY)
  return _resend
}

// Cache templates in memory (refreshed on cold start)
const templateCache: Record<string, string> = {}

function getTemplateHtml(name: string): string | null {
  if (templateCache[name]) return templateCache[name]
  try {
    const filePath = path.join(process.cwd(), 'lib', 'email-templates', `${name}.html`)
    const html = fs.readFileSync(filePath, 'utf-8')
    templateCache[name] = html
    return html
  } catch {
    return null
  }
}

/** Replace {{var}} placeholders and strip {{#var}}...{{/var}} blocks when var is empty */
function renderTemplate(template: string, vars: Record<string, string>): string {
  let html = template
  // Conditional blocks: {{#var}}content{{/var}} — include only when var is non-empty
  html = html.replace(/\{\{#(\w+)\}\}([\s\S]*?)\{\{\/\1\}\}/g, (_, key, content) => {
    return vars[key] ? content : ''
  })
  // Simple substitution
  for (const [key, val] of Object.entries(vars)) {
    html = html.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), val)
  }
  return html
}

// Keep old single-template getter for backward compat
function getSingleTemplateHtml(): string | null {
  return getTemplateHtml('photo-approved')
}

interface PhotoRejectionData {
  firstName?: string
  brandName?: string
  modelName?: string
  referenceNumber?: string
  imageUrl?: string
  reasonLabel: string
  reasonDescription: string
  customNote?: string
}

export async function sendPhotoRejectedEmail(
  to: string,
  data: PhotoRejectionData
): Promise<{ success: boolean; error?: string }> {
  const resend = getResend()
  if (!resend) {
    console.warn('[Resend] Missing RESEND_API_KEY — skipping rejection email')
    return { success: false, error: 'Resend not configured' }
  }

  const templateHtml = getTemplateHtml('photo-rejected')
  if (!templateHtml) {
    console.error('[Resend] Could not load photo-rejected.html template — skipping email')
    return { success: false, error: 'Template not found' }
  }

  const fromEmail = process.env.RESEND_FROM_EMAIL || 'Watchems <onboarding@resend.dev>'
  const watchName = [data.brandName, data.modelName].filter(Boolean).join(' ') || 'your photo'

  const html = renderTemplate(templateHtml, {
    firstName: data.firstName || 'there',
    brand: data.brandName || '',
    model: data.modelName || '',
    reference: data.referenceNumber || '',
    imageUrl: data.imageUrl || '',
    reasonLabel: data.reasonLabel,
    reasonDescription: data.reasonDescription || '',
    customNote: data.customNote || '',
  })

  try {
    const { error } = await resend.emails.send({
      from: fromEmail,
      to,
      subject: `Your ${watchName} submission on Watchems`,
      html,
    })
    if (error) {
      console.error(`[Resend] Failed to send rejection email to ${to}:`, error)
      return { success: false, error: error.message }
    }
    console.log(`[Resend] Rejection email sent to ${to}`)
    return { success: true }
  } catch (err) {
    console.error('[Resend] Error sending rejection email:', err)
    return { success: false, error: (err as Error).message }
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
 * Send a photo approval notification email using the local HTML template
 * at lib/email-templates/photo-approved.html.
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

  const templateHtml = getSingleTemplateHtml()
  if (!templateHtml) {
    console.error('[Resend] Could not load photo-approved.html template — skipping email')
    return { success: false, error: 'Template not found' }
  }

  const html = renderTemplate(templateHtml, {
    firstName: data.firstName || 'there',
    slug: data.slug || '',
    imageUrl: data.imageUrl || '',
    brand: data.brandName || '',
    model: data.modelName || '',
    reference: data.referenceNumber || '',
  })

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
 * Send a single summary email when one or more photos are approved at once.
 * - 1 photo: uses the styled photo-approved.html template
 * - 2+ photos: uses an inline list-style email with all watches + dashboard links
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
  const count = data.photos.length

  // Single photo — use the full styled template
  if (count === 1) {
    return sendPhotoApprovedEmail(to, { ...data.photos[0], firstName: data.firstName })
  }

  // Multiple photos — build a list-style summary email
  const firstName = data.firstName || 'there'

  const photoRows = data.photos
    .map((p) => {
      const name = [p.brandName, p.modelName].filter(Boolean).join(' ') || 'Watch'
      const link = p.slug ? `https://watchems.com/photo/${p.slug}` : 'https://watchems.com'
      const thumb = p.imageUrl
        ? `<img src="${p.imageUrl}" alt="${name}" width="60" height="60" style="border-radius:6px;object-fit:cover;display:block;" />`
        : ''
      return `<tr>
        <td style="padding:10px 0;width:68px;vertical-align:top;">${thumb}</td>
        <td style="padding:10px 0 10px 14px;vertical-align:top;">
          <a href="${link}" style="color:#0f172a;font-weight:600;text-decoration:none;font-size:15px;">${name}</a>
          ${p.referenceNumber ? `<br/><span style="color:#94a3b8;font-size:13px;">${p.referenceNumber}</span>` : ''}
          <br/><a href="${link}" style="color:#2563eb;font-size:13px;">View on Watchems &#8594;</a>
        </td>
      </tr>`
    })
    .join('')

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Your photos are now live!</title>
</head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f1f5f9;padding:40px 20px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
        <!-- Header -->
        <tr>
          <td style="background-color:#ffffff;padding:24px 32px;border-radius:12px 12px 0 0;border-bottom:1px solid #e2e8f0;" align="center">
            <a href="https://watchems.com" target="_blank" style="text-decoration:none;">
              <img src="https://www.watchems.com/logo.svg" alt="Watchems" width="160" height="26" style="display:block;border:0;outline:none;" />
            </a>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="background-color:#ffffff;padding:48px 40px;">
            <!-- Green checkmark badge -->
            <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 24px;">
              <tr>
                <td align="center">
                  <div style="width:64px;height:64px;border-radius:50%;background-color:#dcfce7;text-align:center;line-height:64px;font-size:32px;">&#10003;</div>
                </td>
              </tr>
            </table>
            <!-- Headline -->
            <h1 style="margin:0 0 8px;text-align:center;font-size:28px;font-weight:700;color:#0f172a;">Your photos are now live!</h1>
            <p style="margin:0 0 32px;text-align:center;font-size:16px;color:#64748b;">Hey ${firstName}, all ${count} of your photos have been approved!</p>
            <!-- Photo list -->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #e2e8f0;margin:0 0 32px;">
              ${photoRows}
            </table>
            <!-- Description -->
            <p style="margin:0 0 32px;text-align:center;font-size:16px;line-height:1.6;color:#475569;">
              Your watch photos are now part of the Watchems gallery. Share them with fellow enthusiasts!
            </p>
            <!-- Divider -->
            <hr style="border:none;border-top:1px solid #e2e8f0;margin:0 0 32px;" />
            <!-- Dashboard nav links -->
            <p style="margin:0 0 16px;text-align:center;font-size:15px;font-weight:600;color:#0f172a;">Explore your dashboard</p>
            <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:0 0 32px;">
              <tr>
                <td style="padding:0 0 10px;">
                  <a href="https://watchems.com/dashboard" target="_blank" style="text-decoration:none;display:block;padding:16px 20px;border:1.5px solid #e2e8f0;border-radius:10px;background-color:#ffffff;">
                    <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td style="width:44px;vertical-align:middle;"><div style="width:40px;height:40px;border-radius:8px;background-color:#f0f9ff;text-align:center;line-height:40px;font-size:20px;">🖼️</div></td>
                        <td style="padding-left:14px;vertical-align:middle;"><p style="margin:0 0 2px;font-size:14px;font-weight:700;color:#0f172a;">My Watches</p><p style="margin:0;font-size:13px;color:#64748b;">See all the watches you've uploaded and their status.</p></td>
                        <td style="width:20px;text-align:right;vertical-align:middle;font-size:16px;color:#94a3b8;">&#8594;</td>
                      </tr>
                    </table>
                  </a>
                </td>
              </tr>
              <tr>
                <td style="padding:0 0 10px;">
                  <a href="https://watchems.com/dashboard/wrist-check" target="_blank" style="text-decoration:none;display:block;padding:16px 20px;border:1.5px solid #e2e8f0;border-radius:10px;background-color:#ffffff;">
                    <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td style="width:44px;vertical-align:middle;"><div style="width:40px;height:40px;border-radius:8px;background-color:#f0fdf4;text-align:center;line-height:40px;font-size:20px;">⌚</div></td>
                        <td style="padding-left:14px;vertical-align:middle;"><p style="margin:0 0 2px;font-size:14px;font-weight:700;color:#0f172a;">Wrist Check</p><p style="margin:0;font-size:13px;color:#64748b;">Track what you're wearing and log daily wrist shots.</p></td>
                        <td style="width:20px;text-align:right;vertical-align:middle;font-size:16px;color:#94a3b8;">&#8594;</td>
                      </tr>
                    </table>
                  </a>
                </td>
              </tr>
              <tr>
                <td style="padding:0;">
                  <a href="https://watchems.com/dashboard/boards" target="_blank" style="text-decoration:none;display:block;padding:16px 20px;border:1.5px solid #e2e8f0;border-radius:10px;background-color:#ffffff;">
                    <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td style="width:44px;vertical-align:middle;"><div style="width:40px;height:40px;border-radius:8px;background-color:#fefce8;text-align:center;line-height:40px;font-size:20px;">📋</div></td>
                        <td style="padding-left:14px;vertical-align:middle;"><p style="margin:0 0 2px;font-size:14px;font-weight:700;color:#0f172a;">Collections</p><p style="margin:0;font-size:13px;color:#64748b;">Organise your favourite watches into themed boards.</p></td>
                        <td style="width:20px;text-align:right;vertical-align:middle;font-size:16px;color:#94a3b8;">&#8594;</td>
                      </tr>
                    </table>
                  </a>
                </td>
              </tr>
            </table>
            <!-- Upload CTA -->
            <p style="margin:0 0 16px;text-align:center;font-size:15px;color:#475569;">Got more watches to show off?</p>
            <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
              <tr>
                <td align="center" style="border:2px solid #e2e8f0;border-radius:8px;">
                  <a href="https://watchems.com/upload" target="_blank" style="display:inline-block;padding:12px 32px;color:#0f172a;font-size:14px;font-weight:600;text-decoration:none;">Upload Another Photo</a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="background-color:#f8fafc;padding:24px 40px;border-radius:0 0 12px 12px;border-top:1px solid #e2e8f0;">
            <p style="margin:0;text-align:center;font-size:13px;color:#94a3b8;">&copy; 2026 Watchems. All rights reserved.</p>
            <p style="margin:8px 0 0;text-align:center;font-size:13px;color:#94a3b8;">
              <a href="https://watchems.com" target="_blank" style="color:#64748b;text-decoration:none;">watchems.com</a>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`

  try {
    const { error } = await resend.emails.send({
      from: fromEmail,
      to,
      subject: `Your ${count} watch photos are live on Watchems!`,
      html,
    })

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
