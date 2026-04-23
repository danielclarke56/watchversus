/**
 * Deterministic watch name normalizer.
 *
 * Fixes the systematic issues that caused watchId fragmentation:
 *   - Diacritics in slugs (Hermétique → hermetique, Mühle-Glashütte → muhle-glashutte)
 *   - All-caps brand names (OMEGA → Omega, SEIKO → Seiko)
 *   - Brand name repeated at start of model (Seiko / "Seiko 5 Sports" → "5 Sports")
 *   - Hash/size suffixes in watchIds (these are now generated server-side, not client-side)
 *
 * No network calls — purely deterministic. Used by the upload API route so
 * normalization is enforced server-side regardless of what the client sends.
 */

/** Strip diacritics and produce a clean URL slug */
export function toWatchSlug(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')   // strip combining diacritical marks
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

/**
 * Normalize brand name to title case.
 * Handles ALL-CAPS submissions (OMEGA → Omega, SEIKO → Seiko).
 * Preserves known mixed-case brands (TAG Heuer, IWC, etc.).
 */
export function normalizeBrand(brand: string): string {
  const trimmed = brand.trim()
  if (!trimmed) return trimmed

  // If already mixed case (not all-caps, not all-lower), trust it
  if (trimmed !== trimmed.toUpperCase() && trimmed !== trimmed.toLowerCase()) {
    return trimmed
  }

  // All-caps or all-lower: apply title case
  return trimmed
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

/**
 * Normalize model name.
 * Strips the brand name from the start if the user accidentally included it
 * (e.g. brand="Seiko", model="Seiko 5 Sports" → model="5 Sports").
 */
export function normalizeModel(model: string, brand: string): string {
  const trimmed = model.trim()
  if (!trimmed) return trimmed

  const normalizedBrand = normalizeBrand(brand)
  const brandLower = normalizedBrand.toLowerCase()
  const modelLower = trimmed.toLowerCase()

  // Strip brand prefix if present (only when followed by a space or end of string)
  if (modelLower.startsWith(brandLower + ' ')) {
    return trimmed.slice(normalizedBrand.length + 1).trim()
  }
  if (modelLower === brandLower) {
    return trimmed
  }

  return trimmed
}

/**
 * Derive the canonical watchId from normalized brand + model.
 * Always generates from brand+model — never trusts a client-supplied watchId.
 */
export function deriveWatchId(brand: string, model: string): string {
  const normalizedBrand = normalizeBrand(brand)
  const normalizedModel = normalizeModel(model, brand)
  return toWatchSlug(`${normalizedBrand} ${normalizedModel}`)
}

/**
 * Full normalization pass. Returns cleaned brand, model, and canonical watchId.
 */
export function normalizeWatch(brand: string, model: string): {
  brand: string
  model: string
  watchId: string
} {
  const cleanBrand = normalizeBrand(brand)
  const cleanModel = normalizeModel(model, brand)
  const watchId = toWatchSlug(`${cleanBrand} ${cleanModel}`)
  return { brand: cleanBrand, model: cleanModel, watchId }
}
