export interface Photo {
  id: string
  slug?: string | null
  watchId: string
  userId: string
  userName: string
  isOfficial?: boolean
  url: string
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
  sortOrder?: number
  originalUrl?: string | null
  createdAt: string
}

export interface PendingPhoto extends Photo {
  approved: false
  likeCount?: number
  saveCount?: number
  rejectionReason?: string | null
}

export interface ApprovedPhoto extends Photo {
  approved: true
  likeCount?: number
  saveCount?: number
}

export const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif']
export const MAX_FILE_SIZE = 20 * 1024 * 1024 // 20 MB (pre-compression client validation)
export const PHOTOS_PER_PAGE = 12
