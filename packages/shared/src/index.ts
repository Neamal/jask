import { z } from 'zod'

// Session schemas
export const sessionSchema = z.object({
  id: z.string(),
  userId: z.string(),
  roomName: z.string(),
  status: z.enum(['waiting', 'active', 'ended']),
  createdAt: z.date(),
  endedAt: z.date().optional()
})

// Event schemas
export const gestureEventSchema = z.object({
  id: z.string(),
  sessionId: z.string(),
  type: z.enum(['pause', 'confusion_gesture', 'raised_hand', 'thumbs_up']),
  confidence: z.number().min(0).max(1),
  timestamp: z.number(),
  metadata: z.record(z.any()).optional()
})

export const codeSubmissionSchema = z.object({
  id: z.string(),
  sessionId: z.string(),
  code: z.string(),
  language: z.string(),
  timestamp: z.number(),
  lineCount: z.number().optional()
})

// Analysis schemas
export const analysisResultSchema = z.object({
  id: z.string(),
  codeSubmissionId: z.string(),
  analysis: z.string(),
  suggestions: z.array(z.string()),
  confidence: z.number().min(0).max(1),
  processingTimeMs: z.number(),
  timestamp: z.number()
})

// LiveKit schemas
export const livekitTokenRequestSchema = z.object({
  room: z.string(),
  identity: z.string(),
  name: z.string().optional(),
  metadata: z.string().optional()
})

export const livekitTokenResponseSchema = z.object({
  token: z.string(),
  url: z.string(),
  room: z.string(),
  identity: z.string()
})

// API Response types
export const apiResponseSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  error: z.string().optional(),
  timestamp: z.number()
})

// Types
export type Session = z.infer<typeof sessionSchema>
export type GestureEvent = z.infer<typeof gestureEventSchema>
export type CodeSubmission = z.infer<typeof codeSubmissionSchema>
export type AnalysisResult = z.infer<typeof analysisResultSchema>
export type LivekitTokenRequest = z.infer<typeof livekitTokenRequestSchema>
export type LivekitTokenResponse = z.infer<typeof livekitTokenResponseSchema>
export type ApiResponse<T = any> = Omit<z.infer<typeof apiResponseSchema>, 'data'> & { data?: T }

// Constants
export const SUPPORTED_LANGUAGES = [
  'javascript',
  'typescript',
  'python',
  'java',
  'cpp',
  'c',
  'go',
  'rust',
  'swift',
  'kotlin'
] as const

export const GESTURE_TYPES = [
  'pause',
  'confusion_gesture', 
  'raised_hand',
  'thumbs_up'
] as const

export const SESSION_STATUS = [
  'waiting',
  'active', 
  'ended'
] as const

// Utility functions
export function createApiResponse<T>(
  success: boolean,
  data?: T,
  error?: string
): ApiResponse<T> {
  return {
    success,
    data,
    error,
    timestamp: Date.now()
  }
}

export function isValidLanguage(language: string): language is typeof SUPPORTED_LANGUAGES[number] {
  return SUPPORTED_LANGUAGES.includes(language as any)
}

export function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

export function generateRoomName(sessionId: string): string {
  return `interview_${sessionId}`
}
