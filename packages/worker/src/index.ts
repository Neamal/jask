import { Worker, Queue } from 'bullmq'
import Redis from 'ioredis'
import Anthropic from '@anthropic-ai/sdk'
import { z } from 'zod'
import dotenv from 'dotenv'

dotenv.config()

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379')

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

// Job schemas
const codeAnalysisJobSchema = z.object({
  code: z.string(),
  language: z.string(),
  sessionId: z.string(),
  userId: z.string().optional(),
  context: z.string().optional()
})

const gestureEventJobSchema = z.object({
  eventType: z.enum(['pause', 'confusion_gesture', 'raised_hand']),
  sessionId: z.string(),
  timestamp: z.number(),
  confidence: z.number(),
  metadata: z.record(z.any()).optional()
})

// Code Analysis Worker
const codeAnalysisWorker = new Worker(
  'code-analysis',
  async (job) => {
    const data = codeAnalysisJobSchema.parse(job.data)
    
    console.log(`Processing code analysis for session: ${data.sessionId}`)
    
    try {
      const prompt = `
You are an expert programming mentor helping during a coding interview. 
Analyze this ${data.language} code and provide helpful guidance:

\`\`\`${data.language}
${data.code}
\`\`\`

${data.context ? `Additional context: ${data.context}` : ''}

Please provide:
1. A brief explanation of what the code does
2. Any potential issues or bugs
3. Suggestions for improvement
4. Any missing edge cases to consider

Keep your response concise and interview-appropriate.
`

      const response = await anthropic.messages.create({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 1000,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })

      const analysis = response.content[0].type === 'text' 
        ? response.content[0].text 
        : 'Unable to analyze code'

      // Store result in database or cache
      // TODO: Implement database storage
      
      return {
        sessionId: data.sessionId,
        analysis,
        suggestions: extractSuggestions(analysis),
        timestamp: Date.now()
      }
    } catch (error) {
      console.error('Code analysis failed:', error)
      throw error
    }
  },
  { connection: redis }
)

// Gesture Event Worker
const gestureEventWorker = new Worker(
  'gesture-events',
  async (job) => {
    const data = gestureEventJobSchema.parse(job.data)
    
    console.log(`Processing gesture event: ${data.eventType} for session: ${data.sessionId}`)
    
    try {
      let response = ''
      
      switch (data.eventType) {
        case 'pause':
          response = await handlePauseEvent(data)
          break
        case 'confusion_gesture':
          response = await handleConfusionGesture(data)
          break
        case 'raised_hand':
          response = await handleRaisedHand(data)
          break
      }
      
      // Send response back to interview room via LiveKit or WebSocket
      // TODO: Implement real-time response delivery
      
      return {
        sessionId: data.sessionId,
        response,
        eventType: data.eventType,
        timestamp: Date.now()
      }
    } catch (error) {
      console.error('Gesture event processing failed:', error)
      throw error
    }
  },
  { connection: redis }
)

// Helper functions
function extractSuggestions(analysis: string): string[] {
  // Simple extraction - in production, this could be more sophisticated
  const lines = analysis.split('\n')
  return lines
    .filter(line => line.includes('suggestion') || line.includes('consider') || line.includes('try'))
    .slice(0, 3)
}

async function handlePauseEvent(data: z.infer<typeof gestureEventJobSchema>): Promise<string> {
  const prompt = `
The user has been silent for an extended period during their coding interview. 
This might indicate they are stuck or thinking deeply. 

Session: ${data.sessionId}
Confidence: ${data.confidence}

Provide a gentle, encouraging prompt to help them continue. Keep it brief and supportive.
`

  const response = await anthropic.messages.create({
    model: 'claude-3-haiku-20240307',
    max_tokens: 200,
    messages: [{ role: 'user', content: prompt }]
  })

  return response.content[0].type === 'text' 
    ? response.content[0].text 
    : "Take your time! Would you like to talk through your approach?"
}

async function handleConfusionGesture(data: z.infer<typeof gestureEventJobSchema>): Promise<string> {
  return "I noticed you might be feeling stuck. Would you like me to provide a hint or help clarify the problem?"
}

async function handleRaisedHand(data: z.infer<typeof gestureEventJobSchema>): Promise<string> {
  return "I see you have a question! How can I help you?"
}

// Error handling
codeAnalysisWorker.on('completed', (job) => {
  console.log(`Code analysis job ${job.id} completed`)
})

codeAnalysisWorker.on('failed', (job, err) => {
  console.error(`Code analysis job ${job?.id} failed:`, err)
})

gestureEventWorker.on('completed', (job) => {
  console.log(`Gesture event job ${job.id} completed`)
})

gestureEventWorker.on('failed', (job, err) => {
  console.error(`Gesture event job ${job?.id} failed:`, err)
})

console.log('🚀 Workers started successfully')
console.log('- Code Analysis Worker: processing code analysis jobs')
console.log('- Gesture Event Worker: processing gesture and pause events')

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down workers...')
  await Promise.all([
    codeAnalysisWorker.close(),
    gestureEventWorker.close()
  ])
  await redis.quit()
  process.exit(0)
})
