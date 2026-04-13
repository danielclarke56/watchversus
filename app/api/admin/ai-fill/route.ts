import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { checkAdmin } from '@/lib/admin'
import { GoogleGenerativeAI } from '@google/generative-ai'

export const dynamic = 'force-dynamic'

interface AiFillRequest {
  brandName: string
  modelName: string
  referenceNumber?: string
  imageUrls?: string[]
}

interface AiFillResponse {
  movement: string
  caseSize: string
  lugToLug: string
  betweenLugs: string
  thickness: string
  waterResistance: string
  estimatedPrice: string
  wristSize: string
  caseMaterial: string
}

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!checkAdmin(userId)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = (await req.json()) as AiFillRequest
  const { brandName, modelName, referenceNumber, imageUrls } = body

  if (!brandName || !modelName) {
    return NextResponse.json(
      { error: 'Missing required fields: brandName, modelName' },
      { status: 400 }
    )
  }

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    console.error('GEMINI_API_KEY not configured')
    return NextResponse.json(
      { error: 'AI service not configured' },
      { status: 500 }
    )
  }

  try {
    const client = new GoogleGenerativeAI(apiKey)
    const model = client.getGenerativeModel({ model: 'gemini-2.5-flash' })

    // Build watch description — reference number is the most specific identifier
    const watchDescription = referenceNumber
      ? `${brandName} ${modelName} (ref. ${referenceNumber})`
      : `${brandName} ${modelName}`

    const prompt = `You are a watch specification database expert with deep knowledge of watch technical specs.

Watch to look up: ${watchDescription}

${referenceNumber ? `IMPORTANT: The reference number "${referenceNumber}" is the most specific identifier — prioritize specs for this exact reference over generic model specs. Different references of the same model can have different case sizes, materials, and features.` : ''}

${imageUrls?.length ? 'Photos of the watch are attached. Use them to confirm or refine specs visible in the image (case size markings, dial text, caseback engravings, depth ratings).' : ''}

Return ONLY a JSON object with these exact keys (use empty string "" if genuinely unknown — do NOT guess):
{
  "movement": "",
  "caseSize": "",
  "lugToLug": "",
  "betweenLugs": "",
  "thickness": "",
  "waterResistance": "",
  "estimatedPrice": "",
  "wristSize": "",
  "caseMaterial": ""
}

Field rules (strict — wrong format breaks the UI):
- movement: movement type only → "Automatic", "Manual", or "Quartz"
- caseSize: numeric mm only, no unit → e.g. "40"
- lugToLug: numeric mm only, no unit → e.g. "47"
- betweenLugs: numeric mm only, no unit → e.g. "20"
- thickness: numeric mm only, no unit → e.g. "12.5"
- waterResistance: numeric meters only, no unit → e.g. "300"
- estimatedPrice: numeric USD retail only, no symbol → e.g. "9500"
- wristSize: leave empty string "" (we do not have this data)
- caseMaterial: material name only → e.g. "Stainless Steel", "Titanium", "Gold"

No markdown, no explanation — JSON only.`

    // Build content parts: text + optional images
    type ContentPart = { text: string } | { inlineData: { mimeType: string; data: string } }
    const parts: ContentPart[] = [{ text: prompt }]

    // Fetch up to 3 images as base64 for Gemini vision
    if (imageUrls && imageUrls.length > 0) {
      const imagesToFetch = imageUrls.slice(0, 3)
      const imageResults = await Promise.allSettled(
        imagesToFetch.map(async (url) => {
          const res = await fetch(url)
          if (!res.ok) throw new Error(`Failed to fetch image: ${url}`)
          const buffer = await res.arrayBuffer()
          const base64 = Buffer.from(buffer).toString('base64')
          const mimeType = res.headers.get('content-type') || 'image/jpeg'
          return { base64, mimeType }
        })
      )

      for (const result of imageResults) {
        if (result.status === 'fulfilled') {
          parts.push({
            inlineData: {
              mimeType: result.value.mimeType,
              data: result.value.base64,
            },
          })
        }
      }
    }

    const result = await model.generateContent(parts)
    const text = result.response.text()

    // Parse the JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      console.error('Could not extract JSON from Gemini response:', text)
      return NextResponse.json(
        { error: 'Could not parse AI response' },
        { status: 500 }
      )
    }

    const specs = JSON.parse(jsonMatch[0]) as AiFillResponse

    const response: AiFillResponse = {
      movement: specs.movement ?? '',
      caseSize: specs.caseSize ?? '',
      lugToLug: specs.lugToLug ?? '',
      betweenLugs: specs.betweenLugs ?? '',
      thickness: specs.thickness ?? '',
      waterResistance: specs.waterResistance ?? '',
      estimatedPrice: specs.estimatedPrice ?? '',
      wristSize: specs.wristSize ?? '',
      caseMaterial: specs.caseMaterial ?? '',
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error calling Gemini API:', error)
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Failed to parse AI response' },
        { status: 500 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to generate specs' },
      { status: 500 }
    )
  }
}
