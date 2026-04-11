import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { checkAdmin } from '@/lib/admin'
import { GoogleGenerativeAI } from '@google/generative-ai'

export const dynamic = 'force-dynamic'

/**
 * POST /api/admin/identify — identify a watch from an image URL.
 * Used by the admin split-photo flow to re-identify individual photos.
 */
export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!checkAdmin(userId)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { imageUrl } = (await req.json()) as { imageUrl: string }
  if (!imageUrl) return NextResponse.json({ error: 'Missing imageUrl' }, { status: 400 })

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'AI service not configured' }, { status: 500 })

  try {
    // Fetch the image as base64
    const imgRes = await fetch(imageUrl)
    if (!imgRes.ok) return NextResponse.json({ error: 'Failed to fetch image' }, { status: 400 })
    const buffer = await imgRes.arrayBuffer()
    const base64 = Buffer.from(buffer).toString('base64')
    const mimeType = imgRes.headers.get('content-type') || 'image/webp'

    const client = new GoogleGenerativeAI(apiKey)
    const model = client.getGenerativeModel({ model: 'gemini-2.5-flash' })

    const result = await model.generateContent([
      { inlineData: { mimeType, data: base64 } },
      {
        text: `You are an expert watch identifier. Identify the exact watch from this photo.

READ dial text, caseback text, and visual features carefully.

Return ONLY a JSON object:
{
  "brand": "exact brand name",
  "model": "exact model name",
  "reference": "reference number or null",
  "movement": "Automatic|Manual|Quartz or null",
  "caseSize": "numeric mm only or null",
  "lugToLug": "numeric mm only or null",
  "betweenLugs": "numeric mm only or null",
  "thickness": "numeric mm only or null",
  "waterResistance": "numeric meters only or null",
  "estimatedPrice": "numeric USD only or null",
  "productionYear": "4-digit year or range or null",
  "dialColor": "dial color or null",
  "bezelColor": "bezel color or null",
  "caseMaterial": "material name or null",
  "strapType": "strap/bracelet type or null",
  "watchStyle": "primary style category or null",
  "confidence": "high|medium|low"
}

No markdown, no explanation — JSON only.`,
      },
    ])

    const text = result.response.text()
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) return NextResponse.json({ error: 'Could not parse AI response' }, { status: 500 })

    const data = JSON.parse(jsonMatch[0])
    return NextResponse.json(data)
  } catch (error) {
    console.error('[Admin identify] Error:', error)
    return NextResponse.json({ error: 'Identification failed' }, { status: 500 })
  }
}
