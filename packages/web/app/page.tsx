import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Jask
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            AI-Powered Interview Helper with Real-time Assistance
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/interview">
              <Button size="lg" className="px-8">
                Start Interview
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="outline" size="lg" className="px-8">
                Dashboard
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🎥 Real-time Video
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Powered by LiveKit for high-quality, low-latency video conferencing
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🤖 AI Code Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Claude AI analyzes your code in real-time and provides intelligent suggestions
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                👋 Gesture Detection
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Detects confusion signals through pauses and hand gestures using MediaPipe
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>How It Works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <div className="bg-blue-100 rounded-full w-8 h-8 flex items-center justify-center text-blue-600 font-bold">
                1
              </div>
              <div>
                <h3 className="font-semibold">Join Interview Room</h3>
                <p className="text-gray-600">Connect to a LiveKit room with video, audio, and data streams</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="bg-blue-100 rounded-full w-8 h-8 flex items-center justify-center text-blue-600 font-bold">
                2
              </div>
              <div>
                <h3 className="font-semibold">AI Monitoring</h3>
                <p className="text-gray-600">Real-time gesture and pause detection triggers AI assistance</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="bg-blue-100 rounded-full w-8 h-8 flex items-center justify-center text-blue-600 font-bold">
                3
              </div>
              <div>
                <h3 className="font-semibold">Smart Suggestions</h3>
                <p className="text-gray-600">Claude analyzes code context and provides helpful hints</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
