import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { photos } from '@/lib/db/schema'
import { eq, and, sql, desc } from 'drizzle-orm'

/**
 * GET /api/brands
 * Fetch all distinct brand names with approved photos, sorted by count (most first)
 */
export async function GET() {
  try {
    const brandData = await db
      .select({
        brand: sql<string>`LOWER(TRIM(${photos.brandName}))`,
        count: sql<number>`COUNT(*)`,
      })
      .from(photos)
      .where(and(eq(photos.status, 'approved'), sql`${photos.brandName} IS NOT NULL`))
      .groupBy(sql`LOWER(TRIM(${photos.brandName}))`)
      .orderBy(desc(sql<number>`COUNT(*)`))

    // Get the display brand names (with proper casing) by finding one example of each
    const displayBrandMap = new Map<string, string>()
    const brandRecords = await db
      .select({ brandName: photos.brandName })
      .from(photos)
      .where(and(eq(photos.status, 'approved'), sql`${photos.brandName} IS NOT NULL`))

    brandRecords.forEach((record) => {
      if (record.brandName) {
        const lower = record.brandName.toLowerCase().trim()
        if (!displayBrandMap.has(lower)) {
          displayBrandMap.set(lower, record.brandName.trim())
        }
      }
    })

    // Map to display names and sort by count
    const brands = brandData.map((row) => displayBrandMap.get(row.brand) || row.brand)

    return NextResponse.json({ brands })
  } catch (error) {
    console.error('Failed to fetch brands:', error)
    return NextResponse.json({ brands: [] }, { status: 500 })
  }
}
