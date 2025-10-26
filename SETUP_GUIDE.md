# JASK Setup Guide

## Overview
Your mock interview app now sends the coding question from the frontend to the AI agent using LiveKit text streams!

## How It Works

1. **User enters question** in `page.tsx` 
2. **User clicks "Start Interview"** → redirected to interview page
3. **Interview room connects** to LiveKit
4. **AI agent joins** the room and starts the session
5. **Frontend waits 2 seconds** for agent to initialize
6. **Question is sent** via text stream to agent (topic: `interview-question`)
7. **Agent receives question** and calls `update_chat_ctx()` to add it to the conversation context
8. **Agent greets the candidate** with the specific problem included
9. **Interview begins** with the AI fully aware of the problem to solve

## Setup Instructions

### 1. Environment Variables

Make sure your `.env.local` has all required credentials:

```bash
# LiveKit Configuration (already set)
LIVEKIT_API_KEY=API9StxmxjEHS7a
LIVEKIT_API_SECRET=noAxqs98S3dqsblyc3PiMXsmuBhucZv26dDIUqbPDWC
NEXT_PUBLIC_LIVEKIT_URL=wss://jask-2ec6u9ah.livekit.cloud

# AI Services (you need to add these)
OPENAI_API_KEY=sk-...                    # Get from https://platform.openai.com/
ASSEMBLYAI_API_KEY=...                   # Get from https://www.assemblyai.com/
CARTESIA_API_KEY=...                     # Get from https://cartesia.ai/
```

### 2. Install Python Dependencies

```bash
cd agent
# If using uv (recommended):
uv sync

# Or using pip:
pip install -e .
```

### 3. Run the Application

You need TWO terminals running simultaneously:

#### Terminal 1: Next.js Frontend
```bash
npm run dev
```
This runs at http://localhost:3000

#### Terminal 2: Python Agent
```bash
cd agent
python agent.py dev
```

### 4. Test the Flow

1. Open http://localhost:3000
2. Enter a coding question (e.g., "Write a function to reverse a linked list")
3. Click "Start Interview"
4. **Watch the debug console** on the interview page - you should see:
   - Connection established
   - Agent participant connected
   - "Waiting for agent to initialize..."
   - "Sending question to agent..."
   - "Question sent successfully"
5. **Check the Python agent terminal** - you should see:
   - "Text stream received from Candidate"
   - "Problem statement received"
6. **Listen** - The AI should greet you and mention the problem!

## Troubleshooting

### "project does not match agent subdomain" error
This means your LiveKit CLI isn't configured. You don't need to use `lk agent create` - just run the agent directly with `python agent.py dev`.

### No agent connecting
- Make sure the Python agent is running (`python agent.py dev`)
- Check that all API keys are set in `.env.local`
- Verify the agent terminal shows "Agent starting in room: ..."

### Question not being sent
- Check the debug console in the browser
- Make sure the agent identity includes "agent" in the name
- Look for any errors in the browser console (F12)

### No voice output
- Verify OPENAI_API_KEY, ASSEMBLYAI_API_KEY, and CARTESIA_API_KEY are set
- Check the Python agent terminal for any errors
- Make sure your browser has microphone permissions enabled

## Code Changes Made

### Frontend (`app/interview/page.tsx`)
- Added `questionSent` state to track if question was sent
- Modified `handleParticipantConnected` to detect when agent joins
- Added 2-second delay before sending question
- Uses `room.localParticipant.sendText()` to send question with topic `interview-question`

### Backend (`agent/agent.py`)
- Added `problem_statement` property to Assistant class
- Created `handle_problem_statement` async function to receive text streams
- Registered text stream handler for topic `interview-question`
- **Uses `session.update_chat_ctx()` to inject the problem into the agent's conversation context as a system message**
- Agent greets immediately after receiving and processing the problem
- Added 5-second wait for question to arrive before fallback greeting
- Added detailed console logging to track the entire flow

## Next Steps

1. **Get API Keys**: Sign up for OpenAI, AssemblyAI, and Cartesia
2. **Update .env.local**: Add the API keys
3. **Install dependencies**: Run `uv sync` or `pip install -e .` in agent folder
4. **Test it out**: Run both terminals and try an interview!
