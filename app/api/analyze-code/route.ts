import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export async function POST(request: NextRequest) {
  try {
    const { code, question } = await request.json()

    if (!code || !question) {
      return NextResponse.json(
        { error: 'Missing code or question' },
        { status: 400 }
      )
    }

    // Initialize Anthropic client
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    })

    // Call Claude to analyze the code
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: `You are a technical interviewer reviewing a candidate's code during a coding interview.

The problem they are solving:
${question}

The code they have written so far:
\`\`\`
${code}
\`\`\`

Analyze this code and provide:
1. Whether the approach is correct or heading in the right direction
2. Any logical errors or bugs you spot
3. Any syntax errors
4. Suggestions for improvement (without giving away the full solution)

Keep your response concise and constructive, as it will be relayed to the candidate by an AI interviewer. Format your response as a brief assessment that an interviewer would naturally say.`,
        },
      ],
    })

    // Extract the analysis text
    const analysis = message.content[0].type === 'text'
      ? message.content[0].text
      : 'Analysis failed'

    return NextResponse.json({
      analysis,
      codeLength: code.length,
    })
  } catch (error) {
    console.error('Code analysis error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze code' },
      { status: 500 }
    )
  }
}
