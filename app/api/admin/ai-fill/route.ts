import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { checkAdmin } from '@/lib/admin'
import Anthropic from '@anthropic-ai/sdk'

interface AiFillRequest {
  brandName: string
  modelName: string
  referenceNumber: string
}

interface AiFillResponse {
  movement: string
  caseSize: string
  lugToLug: string
  betweenLugs: string
  thickness: string
  waterResistance: string
  estimatedPrice: string
}

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!checkAdmin(userId)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = (await req.json()) as AiFillRequest
  const { brandName, modelName, referenceNumber } = body

  if (!brandName || !modelName || !referenceNumber) {
    return NextResponse.json(
      { error: 'Missing required fields: brandName, modelName, referenceNumber' },
      { status: 400 }
    )
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    console.error('ANTHROPIC_API_KEY not configured')
    return NextResponse.json(
      { error: 'AI service not configured' },
      { status: 500 }
    )
  }

  try {
    const client = new Anthropic({ apiKey })

    const prompt = `You are a watch specification database. Given a watch's brand, model name, and reference number, return its known technical specifications as JSON.

Watch: ${brandName} ${modelName} ${referenceNumber}

Return ONLY a JSON object with these exact keys (use empty string "" if unknown):
{
  "movement": "",
  "caseSize": "",
  "lugToLug": "",
  "betweenLugs": "",
  "thickness": "",
  "waterResistance": "",
  "estimatedPrice": ""
}

For caseSize, lugToLug, betweenLugs, thickness: return numeric value only (no "mm" unit).
For waterResistance: return numeric value only (no "m" unit).
For estimatedPrice: return numeric value only in USD (no "$" or "USD").`

    const message = await client.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 256,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    })

    // Extract text content from response
    const textContent = message.content.find((block) => block.type === 'text')
    if (!textContent || textContent.type !== 'text') {
      console.error('No text content in Claude response')
      return NextResponse.json(
        { error: 'Invalid response from AI service' },
        { status: 500 }
      )
    }

    // Parse the JSON response
    const jsonMatch = textContent.text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      console.error('Could not extract JSON from Claude response:', textContent.text)
      return NextResponse.json(
        { error: 'Could not parse AI response' },
        { status: 500 }
      )
    }

    const specs = JSON.parse(jsonMatch[0]) as AiFillResponse

    // Ensure all required fields exist and are strings
    const result: AiFillResponse = {
      movement: specs.movement ?? '',
      caseSize: specs.caseSize ?? '',
      lugToLug: specs.lugToLug ?? '',
      betweenLugs: specs.betweenLugs ?? '',
      thickness: specs.thickness ?? '',
      waterResistance: specs.waterResistance ?? '',
      estimatedPrice: specs.estimatedPrice ?? '',
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error calling Anthropic API:', error)
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
