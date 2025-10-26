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

Analyze this code carefully. ONLY provide feedback if you find:
- Significant logical errors or bugs
- Critical syntax errors that would prevent the code from running
- The approach is heading in a fundamentally wrong direction

If the code is generally on the right track, even if incomplete or could be optimized, return ONLY the word "PASS" with no other text.

If there ARE issues worth mentioning, provide a brief, constructive comment that an interviewer would naturally say (1-2 sentences max). Be sparing with feedback - we want to interject only when truly necessary.`,
        },
      ],
    })

    // Extract the analysis text
    const analysis = message.content[0].type === 'text'
      ? message.content[0].text
      : 'Analysis failed'

    return NextResponse.json({
      analysis,
      shouldNotify: analysis.trim() !== 'PASS',
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
