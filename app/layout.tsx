import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Mock Interview App',
  description: 'Practice technical interviews with AI',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
