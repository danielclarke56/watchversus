/**
 * Thin GA4 event helper.
 * Wraps window.gtag so callers don't need to guard against SSR or
 * ad-blockers — it fails silently if gtag isn't available.
 */

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
  }
}

export function trackEvent(
  eventName: string,
  params?: Record<string, string | number | boolean | null | undefined>
) {
  if (typeof window === 'undefined') return
  if (typeof window.gtag !== 'function') return
  window.gtag('event', eventName, params)
}
