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
    return NextResponse.json({ error: 'AI service not configured' }, { status: 500 })
  }

  try {
    const client = new GoogleGenerativeAI(apiKey)

    // Use Pro for better factual recall; enable Google Search grounding for live spec lookup
    const model = client.getGenerativeModel({
      model: 'gemini-2.5-pro',
      tools: [{ googleSearchRetrieval: {} }],
    })

    const watchDescription = referenceNumber
      ? `${brandName} ${modelName} (ref. ${referenceNumber})`
      : `${brandName} ${modelName}`

    // Fetch up to 3 images as base64 for vision analysis
    type ContentPart = { text: string } | { inlineData: { mimeType: string; data: string } }
    const parts: ContentPart[] = []

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

    const prompt = `You are a watch specification expert with access to Google Search for live data lookup.

Watch: ${watchDescription}
${referenceNumber ? `\nThe reference number "${referenceNumber}" is the most specific identifier — always prioritize specs for this exact reference.` : ''}
${parts.length > 0 ? `\nPhoto(s) of this watch are attached. STEP 1: Carefully examine the images for any visible spec clues — dial text, caseback engravings, depth ratings, case markings, strap/bracelet type, crown guards, bezel type. Extract everything you can see directly from the photos.` : ''}

STEP 2: Use Google Search to look up the exact technical specifications for ${watchDescription}. Search for the official specs from the manufacturer or trusted watch databases (WatchBase, Chrono24, Bob's Watches, official brand sites). Cross-reference with what is visible in the photos.

Return ONLY a JSON object with these exact keys (use empty string "" if genuinely unknown after both image analysis and search — do NOT guess):
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
- movement: "Automatic", "Manual", or "Quartz" only
- caseSize: numeric mm only, no unit → e.g. "40"
- lugToLug: numeric mm only, no unit → e.g. "47"
- betweenLugs: numeric mm only, no unit → e.g. "20"
- thickness: numeric mm only, no unit → e.g. "12.5"
- waterResistance: numeric meters only, no unit → e.g. "300"
- estimatedPrice: current retail USD, numeric only, no symbol → e.g. "9500"
- wristSize: leave empty string ""
- caseMaterial: material name → e.g. "Stainless Steel", "Titanium", "Gold"

No markdown, no explanation — JSON only.`

    parts.push({ text: prompt })

    const result = await model.generateContent(parts)
    const text = result.response.text()

    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      console.error('Could not extract JSON from Gemini response:', text)
      return NextResponse.json({ error: 'Could not parse AI response' }, { status: 500 })
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
      return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 })
    }
    return NextResponse.json({ error: 'Failed to generate specs' }, { status: 500 })
  }
}
