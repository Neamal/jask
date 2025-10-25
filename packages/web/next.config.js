/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  env: {
    LIVEKIT_WS_URL: process.env.LIVEKIT_WS_URL,
    LIVEKIT_API_KEY: process.env.LIVEKIT_API_KEY,
  },
}

module.exports = nextConfig
