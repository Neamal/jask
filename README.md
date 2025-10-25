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
3. Open the frontend at # Jask - AI Interview Helper

An intelligent interview assistance platform that uses real-time video conferencing, AI-powered code analysis, and gesture detection to provide contextual help during coding interviews.

## 🚀 Features

- **Real-time Video Conferencing** - Powered by LiveKit for low-latency, high-quality video/audio
- **AI Code Analysis** - Claude AI analyzes code in real-time and provides intelligent suggestions  
- **Gesture Detection** - MediaPipe detects confusion signals through pauses and hand gestures
- **Smart Assistance** - Context-aware hints and suggestions based on user behavior
- **Modern UI** - Built with Next.js, Tailwind CSS, and Shadcn/ui components

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Next.js Web   │    │  Worker Service │    │  Infrastructure │
│                 │    │                 │    │                 │
│ • React Frontend│    │ • Claude AI     │    │ • PostgreSQL    │
│ • tRPC API      │    │ • BullMQ Jobs   │    │ • Redis         │
│ • LiveKit Client│    │ • Code Analysis │    │ • LiveKit Server│
│ • Gesture Detect│    │ • Event Process │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, tRPC, Prisma ORM
- **Real-time**: LiveKit for video/audio, WebSocket for events
- **AI**: Anthropic Claude for code analysis and suggestions
- **Detection**: MediaPipe for gesture detection, Web Audio API for pause detection  
- **Queue**: BullMQ with Redis for background job processing
- **Database**: PostgreSQL with Prisma ORM
- **Deployment**: Docker Compose for local development

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- Docker and Docker Compose
- Git

### 1. Clone and Setup

```bash
git clone <your-repo-url>
cd jask
npm install
```

### 2. Environment Setup

```bash
cp .env.example .env.local
# Edit .env.local with your API keys:
# - ANTHROPIC_API_KEY (required for AI features)
# - NEXTAUTH_SECRET (generate with: openssl rand -base64 32)
```

### 3. Start Infrastructure

```bash
# Start PostgreSQL, Redis, and LiveKit
npm run docker:up

# Run database migrations  
npm run db:migrate
```

### 4. Start Development

```bash
# Terminal 1: Start Next.js web app
cd packages/web && npm run dev

# Terminal 2: Start worker service  
cd packages/worker && npm run dev
```

### 5. Open Application

- Web App: http://localhost:3000
- Database Studio: `npm run db:studio` 
- LiveKit: http://localhost:7880

## 📁 Project Structure

```
jask/
├── packages/
│   ├── web/                 # Next.js application
│   │   ├── app/            # App router pages & API routes
│   │   ├── components/     # React components  
│   │   └── lib/           # Utilities and configurations
│   ├── worker/             # Background worker service
│   │   └── src/           # Worker implementation
│   └── shared/             # Shared types and utilities
│       └── src/           # Common schemas and types
├── infra/                  # Infrastructure configuration
│   ├── docker-compose.yml # Local development stack
│   └── livekit.yaml       # LiveKit server config
└── turbo.json             # Monorepo task configuration
```

## 🔧 Development Guide

### Database Operations

```bash
# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate  

# Open database studio
npm run db:studio

# Reset database
npm run db:reset
```

### Working with Jobs

The worker service processes two types of jobs:

1. **Code Analysis Jobs** - Triggered when code is submitted
2. **Gesture Event Jobs** - Triggered by pause/gesture detection

Example: Queue a code analysis job via tRPC:

```typescript
const result = await trpc.analysis.submitCode.mutate({
  code: "function hello() { return 'world'; }",
  language: "javascript", 
  sessionId: "session_123"
});
```

### LiveKit Integration

```typescript
// Join room
const room = new Room();
await room.connect(wsUrl, token);

// Send data events  
await room.localParticipant.publishData(
  JSON.stringify({ type: 'gesture', event: 'confusion' }),
  DataPacket_Kind.RELIABLE
);
```

## 🎯 How It Works

### 1. Interview Session Flow

1. User creates interview session → generates LiveKit room
2. Participant joins with camera/mic enabled
3. Client-side detection monitors for:
   - **Long pauses** (Web Audio API + silence detection)
   - **Confusion gestures** (MediaPipe hand tracking)
4. Events trigger background jobs for AI analysis
5. Suggestions delivered via LiveKit data tracks

### 2. AI Analysis Pipeline

1. Code submitted → queued for analysis
2. Worker enriches with context (previous submissions, session data)
3. Claude analyzes with structured prompt
4. Results stored and delivered to participants

### 3. Gesture Detection

- **Hand Gestures**: MediaPipe Hands detects raised hands, palm-to-forehead
- **Pause Detection**: Web Audio monitors audio levels + silence duration  
- **Confidence Scoring**: Events include confidence levels to avoid false positives

## 🔒 Security & Privacy

- **No Raw Media to AI**: Only structured events and code text sent to Claude
- **Encrypted Storage**: Database and file storage encrypted at rest
- **Short-lived Tokens**: LiveKit tokens expire quickly and are scoped per room
- **Sandboxed Execution**: User code runs in isolated containers with resource limits

## 🚀 Deployment

### Production with Docker

```bash
# Build production images
docker build -f packages/web/Dockerfile -t jask-web .
docker build -f packages/worker/Dockerfile -t jask-worker .

# Deploy with docker-compose
docker-compose -f docker-compose.prod.yml up -d
```

### Environment Variables (Production)

```bash
# Required for production
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
ANTHROPIC_API_KEY=sk-ant-...
LIVEKIT_API_KEY=...
LIVEKIT_API_SECRET=...
NEXTAUTH_SECRET=...
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`  
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/your-username/jask/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/jask/discussions)
- **Documentation**: See `/docs` folder for detailed guides

## 🔗 Links

- [LiveKit Documentation](https://docs.livekit.io/)
- [Anthropic Claude API](https://docs.anthropic.com/)
- [MediaPipe](https://developers.google.com/mediapipe)
- [Next.js Documentation](https://nextjs.org/docs)

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
