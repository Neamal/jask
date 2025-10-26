'use client'

import { useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import {
  LiveKitRoom,
  RoomAudioRenderer,
  useTracks,
  useLocalParticipant,
  useRoomContext,
} from '@livekit/components-react'
import { Track, RoomEvent, ConnectionState } from 'livekit-client'

function InterviewRoom({ question }: { question: string }) {
  const [code, setCode] = useState('')
  const [debugLogs, setDebugLogs] = useState<string[]>([])
  const tracks = useTracks([Track.Source.Microphone])
  const { localParticipant } = useLocalParticipant()
  const room = useRoomContext()

  useEffect(() => {
    const addLog = (msg: string) => {
      const timestamp = new Date().toLocaleTimeString()
      setDebugLogs(prev => [...prev, `[${timestamp}] ${msg}`].slice(-20))
    }

    addLog(`Room state: ${room.state}`)
    addLog(`Local participant: ${localParticipant.identity}`)
    addLog(`Microphone enabled: ${localParticipant.isMicrophoneEnabled}`)

    // Send problem statement to any agents already in the room
    const sendProblemStatementToAgent = async (participantIdentity: string) => {
      try {
        addLog(`Sending problem statement to ${participantIdentity}...`)
        const streamInfo = await localParticipant.sendText(
          `IMPORTANT: The user is working on this specific problem: ${question}. Always refer to THIS problem when discussing their code or approach. Do not make up a different problem.`,
          {
            topic: 'lk.chat',
          }
        )
        addLog(`✅ Problem statement sent via lk.chat (stream ID: ${streamInfo.id})`)
      } catch (error) {
        addLog(`❌ Failed to send problem statement: ${error}`)
      }
    }

    // Check for existing agent participants
    Array.from(room.remoteParticipants.values()).forEach((participant) => {
      if (participant.identity.startsWith('agent-')) {
        addLog(`Found existing agent: ${participant.identity}`)
        sendProblemStatementToAgent(participant.identity)
      }
    })

    const handleConnectionStateChange = (state: ConnectionState) => {
      addLog(`Connection state changed: ${state}`)
    }

    const handleParticipantConnected = async (participant: any) => {
      addLog(`Participant connected: ${participant.identity}`)

      // Send problem statement to agent when it joins
      if (participant.identity !== localParticipant.identity && participant.identity.startsWith('agent-')) {
        await sendProblemStatementToAgent(participant.identity)
      }
    }

    const handleParticipantDisconnected = (participant: any) => {
      addLog(`Participant disconnected: ${participant.identity}`)
    }

    const handleTrackSubscribed = (track: any, publication: any, participant: any) => {
      addLog(`Track subscribed from ${participant.identity}: ${track.kind}`)
    }

    const handleDataReceived = (payload: Uint8Array, participant: any) => {
      const text = new TextDecoder().decode(payload)
      addLog(`Data received from ${participant?.identity || 'unknown'}: ${text}`)
    }

    room.on(RoomEvent.ConnectionStateChanged, handleConnectionStateChange)
    room.on(RoomEvent.ParticipantConnected, handleParticipantConnected)
    room.on(RoomEvent.ParticipantDisconnected, handleParticipantDisconnected)
    room.on(RoomEvent.TrackSubscribed, handleTrackSubscribed)
    room.on(RoomEvent.DataReceived, handleDataReceived)

    return () => {
      room.off(RoomEvent.ConnectionStateChanged, handleConnectionStateChange)
      room.off(RoomEvent.ParticipantConnected, handleParticipantConnected)
      room.off(RoomEvent.ParticipantDisconnected, handleParticipantDisconnected)
      room.off(RoomEvent.TrackSubscribed, handleTrackSubscribed)
      room.off(RoomEvent.DataReceived, handleDataReceived)
    }
  }, [room, localParticipant])

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <RoomAudioRenderer />

      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-800">Interview Session</h1>
          <p className="text-sm text-gray-600 mt-1">
            {localParticipant.isMicrophoneEnabled ? (
              <span className="text-green-600">🎤 Microphone Active</span>
            ) : (
              <span className="text-red-600">🎤 Microphone Off</span>
            )}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Question Panel */}
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Question</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{question}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Instructions</h2>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• Speak your thoughts out loud as you code</li>
              <li>• The AI interviewer can hear you and provide feedback</li>
              <li>• Write your solution in the code editor</li>
              <li>• Explain your approach and time/space complexity</li>
            </ul>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-gray-700 mb-2">
              <strong>⚠️ Note:</strong> This app currently only establishes a LiveKit room.
              To have an AI interviewer that speaks to you, you need to set up a LiveKit Agent.
            </p>
          </div>

          {/* Debug Panel */}
          <div className="bg-gray-900 rounded-lg shadow overflow-hidden">
            <div className="bg-gray-800 px-4 py-2">
              <h3 className="text-sm font-semibold text-white">Debug Console</h3>
            </div>
            <div className="p-4 h-48 overflow-y-auto font-mono text-xs">
              {debugLogs.length === 0 ? (
                <p className="text-gray-500">Waiting for events...</p>
              ) : (
                debugLogs.map((log, i) => (
                  <div key={i} className="text-green-400 mb-1">{log}</div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Code Editor Panel */}
        <div className="bg-white rounded-lg shadow overflow-hidden flex flex-col">
          <div className="bg-gray-800 text-white px-4 py-2 flex items-center justify-between">
            <span className="text-sm font-medium">Code Editor</span>
            <span className="text-xs text-gray-400">JavaScript</span>
          </div>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="flex-1 p-4 font-mono text-sm resize-none focus:outline-none bg-gray-900 text-gray-100"
            placeholder="// Write your solution here...

function solution() {
  // Your code
}
"
            spellCheck={false}
          />
          <div className="bg-gray-100 px-4 py-2 text-xs text-gray-600">
            Lines: {code.split('\n').length} | Characters: {code.length}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function InterviewPage() {
  const searchParams = useSearchParams()
  const question = searchParams.get('question') || 'No question provided'
  const [token, setToken] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function getToken() {
      try {
        const response = await fetch('/api/livekit-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            roomName: 'interview-' + Date.now(),
            participantName: 'Candidate',
          }),
        })
        const data = await response.json()
        setToken(data.token)
      } catch (error) {
        console.error('Failed to get token:', error)
      } finally {
        setIsLoading(false)
      }
    }
    getToken()
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Setting up interview room...</p>
        </div>
      </div>
    )
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md">
          <h2 className="text-xl font-bold text-red-600 mb-2">Connection Error</h2>
          <p className="text-gray-600">Failed to connect to interview room. Please check your configuration.</p>
        </div>
      </div>
    )
  }

  return (
    <LiveKitRoom
      token={token}
      serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
      connect={true}
      audio={true}
      video={false}
    >
      <InterviewRoom question={question} />
    </LiveKitRoom>
  )
}
