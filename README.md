# Interview Helper — Prototype Template

This repository is a starter template for a realtime interview helper:
- LiveKit-based WebRTC room for audio/video
- Client-side detectors (VAD, MediaPipe hand/pose) emitting events
- Backend event router and LLM coordinator (Claude) for code analysis
- Monaco editor for code editing and targeted code hints

Getting started (prototype)
1. Copy .env.example -> .env and set LIVEKIT / CLAUDE / other keys.
2. Run with docker-compose:
   docker-compose up --build
3. Open the frontend at http://localhost:3000

What’s included
- frontend/: React + TypeScript + LiveKit client + Monaco editor + detector stubs
- backend/: Fastify + TypeScript + Claude integration stub + event router
- docker-compose.yml and Dockerfiles for quick local dev

Next steps
- Plug in LiveKit credentials and verify rooms.
- Implement client detectors with MediaPipe / WebAudio.
- Implement Claude API calls with proper chunking and streaming.
- Add authentication & session storage.

License: MIT
