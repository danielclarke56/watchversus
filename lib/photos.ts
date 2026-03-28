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
  createdAt: string
}

export interface PendingPhoto extends Photo {
  approved: false
}

export interface ApprovedPhoto extends Photo {
  approved: true
}

export const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
export const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5 MB
export const PHOTOS_PER_PAGE = 12
