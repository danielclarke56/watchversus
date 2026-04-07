export const dynamic = 'force-dynamic'

import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextRequest, NextResponse } from 'next/server'
import sharp from 'sharp'

const client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const photo = formData.get('photo') as File

    if (!photo) {
      return NextResponse.json(
        { error: 'No photo provided' },
        { status: 400 }
      )
    }

    // Convert file to buffer, then to base64
    const buffer = await photo.arrayBuffer()
    const sharpBuffer = Buffer.from(buffer)
    const base64 = sharpBuffer.toString('base64')

    // Layer 1: EXIF check — real photos almost always have EXIF metadata
    let hasCamera = false
    try {
      const metadata = await sharp(sharpBuffer).metadata()
      hasCamera = !!(metadata.exif)
    } catch {
      // If sharp fails to read metadata, default to false
      hasCamera = false
    }

    // Determine MIME type
    const mimeType = photo.type || 'image/jpeg'

    // Call Gemini 2.5 Flash to identify the watch
    const model = client.getGenerativeModel({ model: 'gemini-2.5-flash' })

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: mimeType,
          data: base64,
        },
      },
      {
        text: `You are a watch identification expert. Analyze this photo and return ONLY valid JSON with this exact structure:
{
  "isWatch": true or false,
  "isAiGenerated": true or false,
  "candidates": [
    {
      "brand": "string",
      "model": "string",
      "reference": "string or null",
      "movement": "Automatic|Mechanical|Quartz|Digital or null",
      "caseSize": "e.g. '40mm' or null",
      "wristSize": null,
      "estimatedPrice": null,
      "productionYear": "e.g. '2020' or null",
      "lugToLug": "e.g. '47mm' or null",
      "betweenLugs": "e.g. '20mm' or null",
      "thickness": "e.g. '12.5mm' or null",
      "waterResistance": "e.g. '300m / 1000ft' or null",
      "confidence": "high|medium|low",
      "reasoning": "brief explanation of why this match is plausible"
    }
  ]
}

Rules:
1. If isWatch=false, return candidates as empty array [].
2. If isWatch=true, return up to 3 most likely watch candidates, ranked by confidence.
3. Confidence levels: "high" for well-known watches or clear details, "medium" for reasonable guesses, "low" for speculative matches.
4. Set isAiGenerated=true only if the image is clearly a render, CGI, or synthetic image. Real photos with perfect lighting are still real. Use EXIF hint: hasCamera=${hasCamera}.
5. Return null for any field you cannot reliably determine.
6. No markdown, no explanation — JSON only.`,
      },
    ])

    const text = result.response.text()

    // Parse the JSON response
    let responseData
    try {
      // Extract JSON from the response (may contain markdown code blocks or extra text)
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        return NextResponse.json({
          error: 'Failed to parse response',
        })
      }
      responseData = JSON.parse(jsonMatch[0])
    } catch {
      return NextResponse.json({
        error: 'Failed to parse identification response',
      })
    }

    return NextResponse.json(responseData)
  } catch (error: unknown) {
    console.error('Watch identification error:', error)
    return NextResponse.json(
      { error: 'identification failed' },
      { status: 500 }
    )
  }
}
