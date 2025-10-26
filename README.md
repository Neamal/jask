# Mock Interview App

A simple mock interview application that uses LiveKit for real-time voice conversations during technical interviews.

## Features

- **Landing Page**: Submit a LeetCode-style coding question
- **Live Interview**: Real-time voice conversation with AI interviewer
- **Code Editor**: Write your solution while discussing your approach
- **Simple Setup**: Minimal dependencies, powered by LiveKit

## Setup

### 1. Install Web App Dependencies

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

### 3. Set Up the AI Agent (Python)

The AI interviewer runs as a separate Python service:

1. **Install Python dependencies** (requires Python 3.11+):
   ```bash
   cd agent
   pip install -e .
   ```

2. **Configure API keys** in `agent/.env.local`:
   ```env
   # Already has LiveKit credentials
   ASSEMBLYAI_API_KEY=your_assemblyai_key_here
   OPENAI_API_KEY=your_openai_key_here
   CARTESIA_API_KEY=your_cartesia_key_here
   ```

3. **Get API keys**:
   - [AssemblyAI](https://www.assemblyai.com/) - Speech-to-text
   - [OpenAI](https://platform.openai.com/) - GPT-4 mini for conversation
   - [Cartesia](https://cartesia.ai/) - Text-to-speech

### 4. Run the Application

**Terminal 1 - Web App:**
```bash
npm run dev
```

**Terminal 2 - AI Agent:**
```bash
cd agent
python agent.py dev
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
├── agent/
│   ├── agent.py              # LiveKit AI agent
│   ├── pyproject.toml        # Python dependencies
│   └── .env.local            # Agent API keys
├── .env.example
├── .env.local
├── package.json
└── README.md
```

## How the Agent Works

The AI interviewer (JASK) automatically joins interview rooms and:
- Greets the candidate and asks about their background
- Listens to the candidate's voice explanations
- Provides guidance and hints without giving away the solution
- Evaluates problem-solving skills and technical communication
- Uses AssemblyAI for speech recognition
- Uses OpenAI GPT-4 for intelligent responses
- Uses Cartesia for natural-sounding voice output

## License

MIT
