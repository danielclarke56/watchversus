/**
 * Brevo (formerly Sendinblue) API integration.
 * Creates/updates contacts and tracks events when photos are approved.
 */

const BREVO_API_KEY = process.env.BREVO_API_KEY || ''
const BREVO_LIST_ID = process.env.BREVO_LIST_ID
  ? parseInt(process.env.BREVO_LIST_ID, 10)
  : undefined

const BASE_URL = 'https://api.brevo.com/v3'

interface BrevoContactPayload {
  email: string
  attributes: Record<string, string | boolean>
  listIds?: number[]
  updateEnabled: boolean
}

interface BrevoEventPayload {
  event: string
  identifiers: { email_id: string }
  properties: Record<string, string>
}

interface BrevoResult {
  success: boolean
  error?: string
}

/**
 * Notify Brevo that a user's photo was approved.
 * 1. Creates or updates the contact with attributes.
 * 2. Tracks a `photo_approved` event to trigger automations.
 */
export async function notifyPhotoApproved(
  email: string,
  data: {
    firstName?: string
    brandName?: string
    modelName?: string
    referenceName?: string
    watchId?: string
    userName?: string
    slug?: string
  }
): Promise<BrevoResult> {
  if (!BREVO_API_KEY) {
    console.warn('[Brevo] Missing BREVO_API_KEY env var — skipping')
    return { success: false, error: 'Brevo not configured' }
  }

  const headers = {
    'api-key': BREVO_API_KEY,
    'Content-Type': 'application/json',
  }

  // Step 1: Create or update contact
  try {
    const contactBody: BrevoContactPayload = {
      email,
      attributes: {
        FIRSTNAME: data.firstName || '',
        PHOTO_APPROVED: true,
      },
      updateEnabled: true,
    }
    if (BREVO_LIST_ID) {
      contactBody.listIds = [BREVO_LIST_ID]
    }

    const contactRes = await fetch(`${BASE_URL}/contacts`, {
      method: 'POST',
      headers,
      body: JSON.stringify(contactBody),
    })

    if (!contactRes.ok) {
      const body = await contactRes.text()
      console.error(`[Brevo] Failed to create/update contact ${email}: ${contactRes.status} ${body}`)
    } else {
      console.log(`[Brevo] Contact created/updated for ${email}`)
    }
  } catch (contactError) {
    console.error('[Brevo] Error creating/updating contact:', contactError)
  }

  // Step 2: Track photo_approved event
  try {
    const eventBody: BrevoEventPayload = {
      event: 'photo_approved',
      identifiers: { email_id: email },
      properties: {
        brand: data.brandName || '',
        model: data.modelName || '',
        reference: data.referenceName || '',
        watch_id: data.watchId || '',
        user_name: data.userName || '',
        slug: data.slug || '',
      },
    }

    const eventRes = await fetch(`${BASE_URL}/events`, {
      method: 'POST',
      headers,
      body: JSON.stringify(eventBody),
    })

    if (!eventRes.ok) {
      const body = await eventRes.text()
      console.error(`[Brevo] Failed to track event for ${email}: ${eventRes.status} ${body}`)
      return { success: false, error: `Brevo event API error: ${eventRes.status}` }
    }

    console.log(`[Brevo] Tracked photo_approved event for ${email}`)
    return { success: true }
  } catch (eventError) {
    console.error('[Brevo] Error tracking event:', eventError)
    return { success: false, error: (eventError as Error).message }
  }
}
