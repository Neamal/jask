'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const [question, setQuestion] = useState('')
  const router = useRouter()

  const handleStart = () => {
    if (question.trim()) {
      const encodedQuestion = encodeURIComponent(question)
      router.push(`/interview?question=${encodedQuestion}`)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">
          Mock Interview Practice
        </h1>
        <p className="text-gray-600 mb-8">
          Practice your technical interview skills with AI-powered feedback
        </p>

        <div className="space-y-4">
          <div>
            <label htmlFor="question" className="block text-sm font-medium text-gray-700 mb-2">
              Enter your coding question
            </label>
            <textarea
              id="question"
              rows={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none"
              placeholder="Example: Write a function that returns the nth Fibonacci number..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
          </div>

          <button
            onClick={handleStart}
            disabled={!question.trim()}
            className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Start Interview
          </button>
        </div>

        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-gray-800 mb-2">How it works:</h3>
          <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
            <li>Enter a LeetCode-style question</li>
            <li>Start the interview and enable your microphone</li>
            <li>Write your solution in the code editor</li>
            <li>Discuss your approach with the AI interviewer</li>
          </ul>
        </div>
      </div>
    </main>
  )
}
