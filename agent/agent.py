from dotenv import load_dotenv
import aiohttp
import os
import re

from livekit import agents
from livekit.agents import AgentSession, Agent, RoomInputOptions
from livekit.plugins import noise_cancellation, silero
from livekit.plugins.turn_detector.multilingual import MultilingualModel

load_dotenv(".env.local")


class Assistant(Agent):
    def __init__(self) -> None:
        super().__init__(
            instructions="""
                You are JASK, a helpful AI senior technical interviewer. Your goal is to objectively evaluate the user's problem-solving skills, code quality, and technical communication as the
                interviewee works through technical problems. You are able to receive an analysis of the code the user has developed every now and then, and determine if the user is going in the right direction.
                The goal is to help the interviewee approach the solution on their own with little guidance, however do not instantly give away the core logic and solution.
                
                IMPORTANT: When the user asks questions about their code, how to proceed, if they're on the right track, or requests help with their implementation, 
                you should trigger a code analysis. Listen for phrases like:
                - "Can you look at my code?"
                - "Am I on the right track?"
                - "How's my code looking?"
                - "Can you help me with this?"
                - "What should I do next?"
                - "Is my approach correct?"
                
                Don't forget to greet the interviewee and provide a brief overview of how the interview will proceed. Then ask about the interviewee and their background.
                """,
        )
        self.problem_statement_received = False
        self.current_code = ""
        self.current_problem = ""
        self.agent_session = None

    def is_code_help_request(self, user_input: str) -> bool:
        """Detect if user is asking for code help"""
        help_patterns = [
            r"look at (my )?code",
            r"(am i|is this) (on the )?(right track|correct)",
            r"how('s| is) (my )?code",
            r"(can you )?help (me )?(with )?",
            r"what should i do",
            r"(is )?my approach (correct|good|right)",
            r"review (my )?code",
            r"check (my )?code",
            r"(any )?feedback",
            r"stuck",
            r"not sure (how|what)",
        ]
        
        user_lower = user_input.lower()
        for pattern in help_patterns:
            if re.search(pattern, user_lower):
                return True
        return False

    async def trigger_code_analysis(self):
        """Call the Claude API to analyze the current code"""
        if not self.current_code or not self.current_problem:
            print("⚠️ Cannot analyze: missing code or problem statement")
            return None
        
        print(f"🔍 Triggering code analysis...")
        print(f"   Code length: {len(self.current_code)} chars")
        print(f"   Problem: {self.current_problem[:50]}...")
        
        try:
            # Get the API URL from environment or use default
            api_url = os.getenv("NEXT_PUBLIC_API_URL", "http://localhost:3000")
            
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    f"{api_url}/api/analyze-code",
                    json={
                        "code": self.current_code,
                        "question": self.current_problem,
                    },
                    headers={"Content-Type": "application/json"}
                ) as response:
                    if response.status == 200:
                        data = await response.json()
                        analysis = data.get("analysis", "")
                        print(f"✅ Analysis received: {len(analysis)} chars")
                        return analysis
                    else:
                        error_text = await response.text()
                        print(f"❌ API error {response.status}: {error_text}")
                        return None
        except Exception as e:
            print(f"❌ Code analysis failed: {e}")
            return None

    async def on_enter(self, ctx):
        """Hook called when agent enters - use to set up text stream handlers"""
        print(f"🎯 Agent entered, setting up listeners")
        
        self.agent_session = ctx.agent_session

        # Register handler for lk.chat text stream (problem statements)
        async def handle_chat_message(reader, participant_identity: str):
            text = await reader.read_all()
            print(f"📨 Received chat from {participant_identity}: {text[:100]}...")

            # If this is the problem statement, inject it into chat context
            if text.startswith("IMPORTANT: The user is working on this specific problem:") and not self.problem_statement_received:
                print(f"✅ Detected problem statement, injecting into chat context")
                self.problem_statement_received = True
                
                # Extract and store the problem
                self.current_problem = text.replace("IMPORTANT: The user is working on this specific problem: ", "").replace(". Always refer to THIS problem when discussing their code or approach. Do not make up a different problem.", "")
                
                # Get the current chat context and add the problem statement
                chat_ctx = ctx.agent_session.chat_ctx.copy()
                chat_ctx.add_message(role="system", content=text)

                # Update the chat context permanently
                await self.update_chat_ctx(chat_ctx)
                print(f"✅ Problem statement persisted to chat context")

        # Register handler for code updates
        async def handle_code_update(reader, participant_identity: str):
            code = await reader.read_all()
            self.current_code = code
            print(f"📝 Code updated: {len(code)} chars")

        # Register handler for code analysis results from frontend
        async def handle_code_analysis(reader, participant_identity: str):
            analysis = await reader.read_all()
            print(f"📊 Received code analysis from frontend: {len(analysis)} chars")
            
            # Add analysis to chat context
            chat_ctx = ctx.agent_session.chat_ctx.copy()
            chat_ctx.add_message(
                role="system", 
                content=f"CODE ANALYSIS RESULT:\n{analysis}\n\nUse this analysis to provide helpful feedback to the candidate."
            )
            await self.update_chat_ctx(chat_ctx)

        ctx.room.register_text_stream_handler("lk.chat", handle_chat_message)
        ctx.room.register_text_stream_handler("code-update", handle_code_update)
        ctx.room.register_text_stream_handler("code-analysis", handle_code_analysis)
        print(f"✅ All text stream handlers registered")

    async def on_user_speech_committed(self, user_speech: str):
        """Hook called when user's speech is transcribed and committed"""
        print(f"🎤 User said: {user_speech}")
        
        # Check if this is a code help request
        if self.is_code_help_request(user_speech):
            print(f"🚨 HELP REQUEST DETECTED!")
            
            # Trigger code analysis
            analysis = await self.trigger_code_analysis()
            
            if analysis and self.agent_session:
                print(f"✅ Analysis received, preparing to speak feedback")
                
                # Add analysis to chat context as system message
                chat_ctx = self.agent_session.chat_ctx.copy()
                chat_ctx.add_message(
                    role="system",
                    content=f"CODE ANALYSIS RESULT:\n{analysis}\n\nYou must provide this feedback to the candidate in a helpful, conversational way. Explain what they're doing right and what needs improvement."
                )
                await self.update_chat_ctx(chat_ctx)
                
                # Generate and speak the response based on the analysis
                await self.agent_session.generate_reply(
                    instructions=f"Based on this code analysis, provide helpful feedback to the candidate: {analysis}"
                )
                
                print(f"✅ Agent is now speaking the code feedback")
                
                # Send signal to frontend that help was provided
                # This will reset the 10-second analysis timer
                try:
                    room = self.agent_session._room if hasattr(self.agent_session, '_room') else None
                    if room:
                        await room.local_participant.send_text(
                            self.current_code,  # Send the code that was just analyzed
                            topic="help-provided"
                        )
                        print(f"📤 Sent 'help-provided' signal to frontend")
                except Exception as e:
                    print(f"⚠️ Failed to send help-provided signal: {e}")
            else:
                print(f"⚠️ Analysis failed or no agent session, agent will respond without analysis")
                # Let the agent respond naturally without the analysis
                if self.agent_session:
                    await self.agent_session.generate_reply(
                        instructions="The candidate asked for help but the code analysis failed. Apologize and ask them to describe what they're working on verbally."
                    )


async def entrypoint(ctx: agents.JobContext):
    assistant = Assistant()

    print(f"🤖 Agent starting in room: {ctx.room.name}")

    session = AgentSession(
        stt="assemblyai/universal-streaming:en",
        llm="openai/gpt-4.1-mini",
        tts="cartesia/sonic-2:9626c31c-bec5-4cca-baa8-f8ba9e84c8bc",
        vad=silero.VAD.load(),
        turn_detection=MultilingualModel(),
    )

    await session.start(
        room=ctx.room,
        agent=assistant,
        room_input_options=RoomInputOptions(
            noise_cancellation=noise_cancellation.BVC(),
        ),
    )

    await session.generate_reply(instructions="Greet the user and offer your assistance.")


if __name__ == "__main__":
    agents.cli.run_app(agents.WorkerOptions(entrypoint_fnc=entrypoint))
