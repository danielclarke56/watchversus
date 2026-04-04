/**
 * Build descriptive alt text for watch photos for SEO and accessibility
 */

interface PhotoAltParams {
  watchBrand?: string | null
  watchName?: string | null
  watchReference?: string | null
  brandName?: string | null
  modelName?: string | null
  referenceNumber?: string | null
}

export function buildPhotoAltText(photo: PhotoAltParams): string {
  const parts: string[] = []

  // Use either the API-enriched fields or the photo-specific fields
  const brand = photo.watchBrand || photo.brandName
  const model = photo.watchName || photo.modelName
  const ref = photo.watchReference || photo.referenceNumber

  if (brand || model) {
    if (brand && model) {
      parts.push(`${brand} ${model}`)
    } else if (brand) {
      parts.push(brand)
    } else if (model) {
      parts.push(model)
    }
  }

  if (ref) {
    parts.push(`Ref. ${ref}`)
  }

  if (parts.length === 0) {
    return 'Watch photo'
  }

  return `${parts.join(', ')} watch photo`
}
