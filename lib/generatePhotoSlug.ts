/**
 * Generates an SEO-friendly slug for a photo.
 * Pattern: {brand}-{model}-{first8charsOfUUID}
 * Falls back to {watchId}-{first8charsOfUUID} if brand/model are unavailable.
 *
 * Must stay in sync with the SQL in 0006_photo_slug.sql.
 */
export function generatePhotoSlug(
  brandName: string | null | undefined,
  modelName: string | null | undefined,
  watchId: string,
  id: string
): string {
  const source =
    brandName && modelName
      ? `${brandName} ${modelName}`
      : watchId.replace(/-/g, ' ')

  const base = source
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  const shortId = id.replace(/-/g, '').slice(0, 8)
  return `${base}-${shortId}`
}
