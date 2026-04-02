import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { photos } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { getWatchById } from '@/lib/watches'

export const dynamic = 'force-dynamic'
export const revalidate = 3600 // 1 hour cache

export async function GET() {
  const allPhotos = await db
    .select({ 
      id: photos.id, 
      url: photos.url, 
      watchId: photos.watchId, 
      brandName: photos.brandName, 
      modelName: photos.modelName 
    })
    .from(photos)
    .where(eq(photos.status, 'approved'))

  const baseUrl = 'https://watchems.com'

  const entries = allPhotos.map(photo => {
    const watch = getWatchById(photo.watchId)
    const title = watch
      ? `${watch.brand} ${watch.name} wrist photo`
      : photo.brandName && photo.modelName
        ? `${photo.brandName} ${photo.modelName} wrist photo`
        : 'Watch wrist photo'

    return `
  <url>
    <loc>${baseUrl}/photo/${photo.id}</loc>
    <image:image>
      <image:loc>${photo.url}</image:loc>
      <image:title>${title.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</image:title>
    </image:image>
  </url>`
  }).join('')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${entries}
</urlset>`

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600'
    }
  })
}
