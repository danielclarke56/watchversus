import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextRequest, NextResponse } from 'next/server'

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
    const base64 = Buffer.from(buffer).toString('base64')

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
  "watch": {
    "brand": "string or null",
    "model": "string or null",
    "reference": "string or null",
    "confidence": "high|medium|low"
  },
  "quality": {
    "score": "good|acceptable|poor",
    "issues": ["array of specific issues, e.g. 'blurry', 'poor lighting', 'watch not visible'"],
    "recommendation": "short 1-sentence tip if score is not good, else null"
  }
}
Set isWatch to false if the image does not contain a watch or wristwatch. If isWatch is false, set watch fields to null and quality score to "poor".
Return null for unknown fields. No markdown, no explanation — JSON only.`,
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
