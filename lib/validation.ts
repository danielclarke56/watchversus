/** Validates that a slug/watchId contains only safe characters (a-z, 0-9, hyphens). */
export function isValidSlug(value: string): boolean {
  return /^[a-z0-9][a-z0-9-]{0,120}$/.test(value)
}

/** Sanitizes a text string: trims, removes control characters, enforces max length. */
export function sanitizeText(value: string, maxLength: number): string {
  // eslint-disable-next-line no-control-regex
  return value.trim().replace(/[\x00-\x1F\x7F]/g, '').slice(0, maxLength)
}
