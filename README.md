# Mock Interview App

A simple mock interview application that uses LiveKit for real-time voice conversations during technical interviews.

## Features

- **Landing Page**: Submit a LeetCode-style coding question
- **Live Interview**: Real-time voice conversation with AI interviewer
- **Code Editor**: Write your solution while discussing your approach
- **Simple Setup**: Minimal dependencies, powered by LiveKit

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure LiveKit

1. Sign up for a free account at [LiveKit Cloud](https://cloud.livekit.io/)
2. Create a new project
3. Copy your API Key, API Secret, and WebSocket URL
4. Create a `.env.local` file:

```bash
cp .env.example .env.local
```

5. Edit `.env.local` with your LiveKit credentials:

```env
LIVEKIT_API_KEY=your_api_key_here
LIVEKIT_API_SECRET=your_api_secret_here
NEXT_PUBLIC_LIVEKIT_URL=wss://your-project.livekit.cloud
```

### 3. Run the App

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## How It Works

1. **Enter Question**: On the landing page, enter a coding question (e.g., "Write a function to find the longest palindromic substring")

2. **Start Interview**: Click "Start Interview" to enter the interview room

3. **Enable Microphone**: Allow microphone access when prompted

4. **Code & Talk**: Write your solution in the code editor while discussing your approach out loud

5. **AI Interaction**: The LiveKit room enables voice communication (you'll need to implement the AI agent separately using LiveKit's Agent Framework)

## Tech Stack

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **LiveKit** - Real-time voice communication
- **@livekit/components-react** - Pre-built LiveKit UI components

## Project Structure

```
jask/
├── app/
│   ├── api/
│   │   └── livekit-token/    # Token generation endpoint
│   ├── interview/             # Interview room page
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx              # Landing page
├── .env.example
├── package.json
└── README.md
```

## Next Steps

To add AI interviewer functionality, you can:

1. Set up a LiveKit Agent using the [LiveKit Agents framework](https://docs.livekit.io/agents/)
2. Implement speech-to-text and text-to-speech
3. Connect an LLM (like Claude or GPT) to process the conversation
4. Have the agent join the room automatically when a user starts an interview

## License

MIT
