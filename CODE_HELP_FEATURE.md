# Code Help Detection & Analysis Feature

## Overview

The AI agent can now detect when you're asking for help with your code and automatically trigger Claude analysis to provide intelligent feedback!

## How It Works

### 1. **Speech Detection**
When you speak to the agent, it listens for phrases that indicate you need code help:

**Trigger Phrases:**
- "Can you look at my code?"
- "Am I on the right track?"
- "How's my code looking?"
- "Can you help me with this?"
- "What should I do next?"
- "Is my approach correct?"
- "Review my code"
- "Check my code"
- "Any feedback?"
- "I'm stuck"
- "Not sure how to..."

### 2. **Automatic Analysis Flow**

```
User speaks → Agent detects help request → Agent checks current code
                     ↓
Agent calls Claude API → Claude analyzes code + problem
                     ↓
Claude returns feedback → Agent adds to chat context
                     ↓
Agent speaks feedback to user (Text-to-Speech)
```

### 3. **Code Tracking**

The system continuously tracks your code in two ways:

**A. Automatic 10-Second Analysis (Background)**
- Every 10 seconds after you stop typing
- Sends code to agent via `code-update` topic
- Runs Claude analysis
- Sends results to agent via `code-analysis` topic
- Agent stores but doesn't speak it automatically

**B. On-Demand Analysis (Triggered by Speech)**
- When you ask for help verbally
- Agent uses stored code + problem
- Calls Claude API directly from Python
- Speaks results immediately

## Technical Implementation

### Frontend (`app/interview/page.tsx`)

**Code Update Stream:**
```typescript
// Sends code to agent every 10 seconds
await localParticipant.sendText(code, {
  topic: 'code-update',
})
```

**Analysis Result Stream:**
```typescript
// Sends Claude analysis to agent
await localParticipant.sendText(data.analysis, {
  topic: 'code-analysis',
})
```

### Backend (`agent/agent.py`)

**Text Stream Handlers:**
```python
# Receives code updates
ctx.room.register_text_stream_handler("code-update", handle_code_update)

# Receives analysis from frontend
ctx.room.register_text_stream_handler("code-analysis", handle_code_analysis)
```

**Speech Hook:**
```python
async def on_user_speech_committed(self, user_speech: str):
    # Detect help request
    if self.is_code_help_request(user_speech):
        # Trigger analysis
        analysis = await self.trigger_code_analysis()
        
        # Add to chat context
        await self.update_chat_ctx(chat_ctx)
        # Agent will now speak the feedback!
```

**Pattern Matching:**
```python
def is_code_help_request(self, user_input: str) -> bool:
    help_patterns = [
        r"look at (my )?code",
        r"(am i|is this) (on the )?(right track|correct)",
        r"how('s| is) (my )?code",
        # ... more patterns
    ]
    # Returns True if any pattern matches
```

## Setup Requirements

### 1. Environment Variables

Add to your `.env.local`:
```bash
# Required for code analysis
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Required for agent voice
OPENAI_API_KEY=your_openai_api_key_here
ASSEMBLYAI_API_KEY=your_assemblyai_api_key_here
CARTESIA_API_KEY=your_cartesia_api_key_here

# LiveKit
LIVEKIT_API_KEY=...
LIVEKIT_API_SECRET=...
NEXT_PUBLIC_LIVEKIT_URL=...
```

### 2. Install Dependencies

**Python (agent):**
```bash
cd agent
uv sync  # or pip install -e .
```

This installs the new `aiohttp` dependency needed for API calls.

**Node.js (frontend):**
```bash
npm install @anthropic-ai/sdk
```

## Usage Examples

### Example 1: Basic Help Request

**You say:** "Can you look at my code?"

**Agent thinks:**
1. 🎤 Detects speech: "Can you look at my code?"
2. 🚨 Matches pattern: "look at (my )?code"
3. 🔍 Triggers analysis with current code + problem
4. 📊 Gets Claude's analysis
5. 💬 Adds to chat context
6. 🗣️ Speaks feedback to you

### Example 2: Direction Check

**You say:** "Am I on the right track with this approach?"

**Agent:**
1. Detects "right track" pattern
2. Analyzes your code
3. Responds with something like:
   - "Let me review your code... Yes, you're heading in the right direction! Your approach using a hash map is efficient. However, I notice you're not handling the edge case where..."

### Example 3: Stuck

**You say:** "I'm stuck, not sure what to do next"

**Agent:**
1. Detects "stuck" and "not sure what" patterns
2. Triggers analysis
3. Provides guidance without giving away the solution

## Configuration

### Adjust Help Detection Sensitivity

Edit `agent/agent.py`:

```python
def is_code_help_request(self, user_input: str) -> bool:
    help_patterns = [
        # Add your own patterns here
        r"your custom pattern",
    ]
```

### Change Analysis Timing

Edit `app/interview/page.tsx`:

```typescript
const timer = setTimeout(async () => {
  // Change 10000 (10 seconds) to your preferred delay
}, 10000)
```

### Customize Claude's Analysis

Edit `app/api/analyze-code/route.ts`:

```typescript
content: `You are a technical interviewer...
// Modify the prompt to change analysis style
`
```

## Debugging

### Check Agent Logs

Watch for these messages in the Python agent terminal:

```
🎤 User said: Can you look at my code?
🚨 HELP REQUEST DETECTED!
🔍 Triggering code analysis...
   Code length: 245 chars
   Problem: Write a function to reverse...
✅ Analysis received: 523 chars
✅ Analysis added to chat context, agent will respond
```

### Check Frontend Logs

Watch the Debug Console in the interview page:

```
[timestamp] Code changed, waiting 10s before analysis...
[timestamp] 📤 Sending code update to agent...
[timestamp] ✅ Code sent to agent
[timestamp] ⚙️ Analyzing code with Claude...
[timestamp] ✅ Analysis complete
[timestamp] 📤 Sending analysis to agent...
```

## Troubleshooting

### Agent doesn't respond to help requests

**Check:**
1. Is `ANTHROPIC_API_KEY` set in `.env.local`?
2. Is the agent terminal showing "HELP REQUEST DETECTED"?
3. Try speaking more clearly: "Can you help me with my code?"

### Analysis fails

**Check:**
1. Is the Next.js server running (`npm run dev`)?
2. Is `/api/analyze-code` accessible at `http://localhost:3000`?
3. Check browser console for API errors

### Agent responds but doesn't mention code

**Check:**
1. Have you written some code in the editor?
2. Wait 10 seconds after typing for code to be sent
3. Check agent logs for "Code updated" messages

## API Flow Diagram

```
┌─────────────┐
│   User      │
│   Types     │
│   Code      │
└──────┬──────┘
       │
       │ (10s delay)
       ▼
┌─────────────────────────┐
│  Frontend sends code    │
│  via "code-update"      │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐      ┌──────────────────┐
│  Frontend calls         │────▶ │  Claude API      │
│  /api/analyze-code      │      │  (Anthropic)     │
└───────────┬─────────────┘      └────────┬─────────┘
            │                              │
            │ ◀────────────────────────────┘
            │ (analysis results)
            ▼
┌─────────────────────────┐
│  Frontend sends         │
│  analysis via           │
│  "code-analysis"        │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│  Agent stores analysis  │
│  in memory              │
└───────────┬─────────────┘
            │
            │ (User asks for help)
            │
            ▼
┌─────────────────────────┐
│  Agent detects speech   │
│  "Can you help?"        │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐      ┌──────────────────┐
│  Agent has two options: │      │  Option 1:       │
│                         │────▶ │  Use stored      │
│  1. Use stored analysis │      │  analysis from   │
│  2. Call API directly   │      │  frontend        │
└───────────┬─────────────┘      └──────────────────┘
            │
            │                     ┌──────────────────┐
            └────────────────────▶│  Option 2:       │
                                  │  Call Claude API │
                                  │  directly from   │
                                  │  Python agent    │
                                  └────────┬─────────┘
                                           │
                                           ▼
                                  ┌──────────────────┐
                                  │  Agent speaks    │
                                  │  feedback via    │
                                  │  TTS             │
                                  └──────────────────┘
```

## Next Steps

1. **Install `aiohttp`**: Run `cd agent && uv sync`
2. **Add API keys** to `.env.local`
3. **Test it**: 
   - Start both servers
   - Enter a question
   - Write some code
   - Say "Can you look at my code?"
   - Listen to the agent's feedback!

Enjoy your intelligent code review agent! 🚀
