/**
 * Kit (formerly ConvertKit) v3 API integration.
 * Subscribes users and applies tags when their photos are approved.
 */

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const KIT_API_KEY = process.env.KIT_API_KEY || ''
const KIT_API_SECRET = process.env.KIT_API_SECRET || ''
const KIT_TAG_PHOTO_APPROVED = process.env.KIT_TAG_PHOTO_APPROVED || ''

const BASE_URL = 'https://api.convertkit.com/v3'

interface KitSubscriber {
  id: number
  email_address: string
  first_name: string | null
  state: string
}

interface KitTagSubscriptionResponse {
  subscription: {
    id: number
    subscriber: KitSubscriber
  }
}

/**
 * Subscribe a user to the "photo-approved" tag in Kit.
 * If the subscriber already exists, Kit upserts — no duplicates.
 */
export async function tagPhotoApprovedSubscriber(
  email: string,
  firstName?: string
): Promise<{ success: boolean; subscriberId?: number; error?: string }> {
  if (!KIT_API_SECRET || !KIT_TAG_PHOTO_APPROVED) {
    console.warn('[Kit] Missing KIT_API_SECRET or KIT_TAG_PHOTO_APPROVED env vars — skipping')
    return { success: false, error: 'Kit not configured' }
  }

  try {
    const res = await fetch(`${BASE_URL}/tags/${KIT_TAG_PHOTO_APPROVED}/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_secret: KIT_API_SECRET,
        email,
        first_name: firstName || undefined,
      }),
    })

    if (!res.ok) {
      const body = await res.text()
      console.error(`[Kit] Failed to tag subscriber ${email}: ${res.status} ${body}`)
      return { success: false, error: `Kit API error: ${res.status}` }
    }

    const data = (await res.json()) as KitTagSubscriptionResponse
    console.log(`[Kit] Tagged ${email} with photo-approved (subscriber ${data.subscription.subscriber.id})`)
    return { success: true, subscriberId: data.subscription.subscriber.id }
  } catch (error) {
    console.error('[Kit] Error subscribing user:', error)
    return { success: false, error: (error as Error).message }
  }
}
