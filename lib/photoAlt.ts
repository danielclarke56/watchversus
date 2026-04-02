/**
 * Build consistent, SEO-rich alt text for watch photos.
 */
export function buildPhotoAltText(photo: {
  watchBrand?: string | null
  brandName?: string | null
  watchName?: string | null
  modelName?: string | null
  watchReference?: string | null
  referenceNumber?: string | null
  userName?: string
}): string {
  const brand = photo.brandName || photo.watchBrand || ''
  const model = photo.modelName || photo.watchName || ''
  const ref = photo.referenceNumber || photo.watchReference || ''
  const user = photo.userName || 'unknown'

  const subject = [brand, model].filter(Boolean).join(' ') || 'Watch'
  const refPart = ref ? ` ref. ${ref}` : ''

  return `${subject}${refPart} wrist photo by ${user}`
}
