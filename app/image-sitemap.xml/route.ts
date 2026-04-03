import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { photos } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { desc } from 'drizzle-orm'
import { buildPhotoAltText } from '@/lib/photoAlt'

export const dynamic = 'force-dynamic'
export const revalidate = 3600 // 1 hour cache

/**
 * Escape XML special characters for safe inclusion in XML text content.
 */
function escapeXml(str: string | null | undefined): string {
  if (!str) return ''
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export async function GET() {
  // Query approved photos, ordered by createdAt DESC, limited to 50,000
  const allPhotos = await db
    .select({ 
      id: photos.id, 
      url: photos.url, 
      thumbnailUrl: photos.thumbnailUrl,
      brandName: photos.brandName, 
      modelName: photos.modelName,
      referenceNumber: photos.referenceNumber,
      userName: photos.userName,
      createdAt: photos.createdAt
    })
    .from(photos)
    .where(eq(photos.status, 'approved'))
    .orderBy(desc(photos.createdAt))
    .limit(50000)

  const baseUrl = 'https://watchems.com'

  // Build XML entries
  const entries = allPhotos
    .filter(photo => photo.url) // Skip photos with null/empty URL
    .map(photo => {
      // Use buildPhotoAltText for the title
      const altText = buildPhotoAltText({
        brandName: photo.brandName,
        modelName: photo.modelName,
        referenceNumber: photo.referenceNumber,
        userName: photo.userName,
      })

      // Build caption with reference number if available
      const caption = `On-wrist photo of ${photo.brandName || 'watch'} ${photo.modelName || ''}${
        photo.referenceNumber ? ` ref. ${photo.referenceNumber}` : ''
      } submitted by ${photo.userName}`.trim()

      // Use thumbnailUrl if available (faster for Google crawling), fallback to url
      const imageUrl = photo.thumbnailUrl || photo.url

      return `
  <url>
    <loc>${escapeXml(`${baseUrl}/photo/${photo.id}`)}</loc>
    <image:image>
      <image:loc>${escapeXml(imageUrl)}</image:loc>
      <image:title>${escapeXml(altText)}</image:title>
      <image:caption>${escapeXml(caption)}</image:caption>
    </image:image>
  </url>`
    })
    .join('')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${entries}
</urlset>`

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600'
    }
  })
}
