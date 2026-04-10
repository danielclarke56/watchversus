import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

// Use watchems.com domain once verified, fall back to Resend's test sender
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'Watchems <onboarding@resend.dev>'

interface PhotoApprovalData {
  firstName?: string
  brandName?: string
  modelName?: string
  slug?: string
}

/**
 * Send a photo approval notification email via Resend.
 */
export async function sendPhotoApprovedEmail(
  to: string,
  data: PhotoApprovalData
): Promise<{ success: boolean; error?: string }> {
  if (!process.env.RESEND_API_KEY) {
    console.warn('[Resend] Missing RESEND_API_KEY — skipping email')
    return { success: false, error: 'Resend not configured' }
  }

  const name = data.firstName || 'there'
  const watchName = [data.brandName, data.modelName].filter(Boolean).join(' ') || 'your watch'
  const photoUrl = data.slug
    ? `https://watchems.com/photo/${data.slug}`
    : 'https://watchems.com'

  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `Your ${watchName} photo is live on Watchems!`,
      html: `
        <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:560px;margin:0 auto;padding:32px 24px">
          <h2 style="font-size:20px;font-weight:700;color:#111;margin:0 0 16px">Your photo is live!</h2>
          <p style="font-size:15px;line-height:24px;color:#444;margin:0 0 24px">
            Hey ${name}, your <strong>${watchName}</strong> photo has been approved and is now live on Watchems.
          </p>
          <a href="${photoUrl}" style="display:inline-block;background:#111;color:#fff;font-size:14px;font-weight:600;text-decoration:none;padding:12px 32px;border-radius:8px">
            View in Gallery →
          </a>
          <p style="font-size:13px;line-height:20px;color:#777;margin:24px 0 0">
            Thanks for contributing to the community.
          </p>
          <hr style="border:none;border-top:1px solid #eee;margin:24px 0" />
          <p style="font-size:11px;color:#aaa;margin:0">
            © ${new Date().getFullYear()} Watchems · <a href="https://watchems.com" style="color:#aaa">watchems.com</a>
          </p>
        </div>
      `,
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
