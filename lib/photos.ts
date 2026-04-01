export interface Photo {
  id: string
  watchId: string
  userId: string
  userName: string
  url: string
  caption?: string | null
  brandName?: string | null
  modelName?: string | null
  referenceNumber?: string | null
  movement?: string | null
  caseSize?: string | null
  wristSize?: string | null
  estimatedPrice?: string | null
  productionYear?: string | null
  lugToLug?: string | null
  betweenLugs?: string | null
  thickness?: string | null
  waterResistance?: string | null
  createdAt: string
}

export interface PendingPhoto extends Photo {
  approved: false
}

export interface ApprovedPhoto extends Photo {
  approved: true
}

// Supported image formats. HEIC/HEIF (iPhone) are auto-converted to JPEG during compression.
// On iOS Safari, WebP encoding is disabled to use JPEG fallback due to canvas.toBlob() issues.
export const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/heic', 'image/heif']
export const MAX_FILE_SIZE = 20 * 1024 * 1024 // 20 MB (pre-compression client validation)
export const PHOTOS_PER_PAGE = 12
