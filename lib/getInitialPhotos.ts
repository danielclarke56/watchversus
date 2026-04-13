import { db } from '@/lib/db'
import { photos } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { checkAdmin } from '@/lib/admin'

const PAGE_SIZE = 20

export interface InitialPhoto {
  id: string
  slug: string | undefined
  watchId: string
  userId: string
  url: string
  userName: string
  isOfficial: boolean
  createdAt: string
  watchSlug: string
  watchName: string
  watchBrand: string | undefined
  watchReference: string | undefined
  brandName: string | undefined
  modelName: string | undefined
  referenceNumber: string | undefined
  movement: string | undefined
  caseSize: string | undefined
  wristSize: string | undefined
  estimatedPrice: string | undefined
  productionYear: string | undefined
  lugToLug: string | undefined
  betweenLugs: string | undefined
  thickness: string | undefined
  waterResistance: string | undefined
}

export interface InitialPhotosData {
  photos: InitialPhoto[]
  nextCursor: string | null
}

const unslugify = (slug: string): string =>
  slug.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')

export async function getInitialPhotos(): Promise<InitialPhotosData> {
  try {
    const photoRecords = await db
      .select({
        id: photos.id,
        watchId: photos.watchId,
        userId: photos.userId,
        userName: photos.userName,
        url: photos.url,
        createdAt: photos.createdAt,
        brandName: photos.brandName,
        modelName: photos.modelName,
        referenceNumber: photos.referenceNumber,
        movement: photos.movement,
        caseSize: photos.caseSize,
        wristSize: photos.wristSize,
        estimatedPrice: photos.estimatedPrice,
        productionYear: photos.productionYear,
        lugToLug: photos.lugToLug,
        betweenLugs: photos.betweenLugs,
        thickness: photos.thickness,
        waterResistance: photos.waterResistance,
        slug: photos.slug,
      })
      .from(photos)
      .where(eq(photos.status, 'approved'))
      .orderBy(desc(photos.createdAt))
      .limit(PAGE_SIZE + 1)

    const enriched: InitialPhoto[] = photoRecords.map((p) => {
      return {
        id: p.id,
        slug: p.slug ?? undefined,
        watchId: p.watchId,
        userId: p.userId,
        userName: p.userName,
        isOfficial: p.userId ? checkAdmin(p.userId) : false,
        url: p.url,
        createdAt: p.createdAt.toISOString(),
        watchSlug: p.watchId,
        watchName: [p.brandName, p.modelName].filter(Boolean).join(' ') || unslugify(p.watchId),
        watchBrand: p.brandName ?? undefined,
        watchReference: p.referenceNumber ?? undefined,
        brandName: p.brandName ?? undefined,
        modelName: p.modelName ?? undefined,
        referenceNumber: p.referenceNumber ?? undefined,
        movement: p.movement ?? undefined,
        caseSize: p.caseSize ?? undefined,
        wristSize: p.wristSize ?? undefined,
        estimatedPrice: p.estimatedPrice ?? undefined,
        productionYear: p.productionYear ?? undefined,
        lugToLug: p.lugToLug ?? undefined,
        betweenLugs: p.betweenLugs ?? undefined,
        thickness: p.thickness ?? undefined,
        waterResistance: p.waterResistance ?? undefined,
      }
    })

    const result = enriched.slice(0, PAGE_SIZE)
    const nextCursor = enriched.length > PAGE_SIZE ? result[result.length - 1]?.createdAt ?? null : null

    return { photos: result, nextCursor }
  } catch {
    // Fall back to empty — client will fetch on mount
    return { photos: [], nextCursor: null }
  }
}
