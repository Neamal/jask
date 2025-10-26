from dotenv import load_dotenv

from livekit import agents
from livekit.agents import AgentSession, Agent, RoomInputOptions
from livekit.plugins import noise_cancellation, silero
from livekit.plugins.turn_detector.multilingual import MultilingualModel

load_dotenv("../.env.local")


class Assistant(Agent):
    def __init__(self) -> None:
        super().__init__(
            instructions="""
                You are JASK, a helpful AI senior technical interviewer. Your goal is to objectively evaluate the user's problem-solving skills, code quality, and technical communication as the
                interviewee works through technical problems. You are able to receive an analysis of the code the user has developed every now and then, and determine if the user is going in the right direction.
                The goal is to help the interviewee approach the solution on their own with little guidance, however do not instantly give away the core logic and solution.
                Don't forget to greet the interviewee and provide a brief overview of how the interview will proceed. Then ask about the interviewee and their background.
                """,
        )
        self.problem_statement_received = False



async def entrypoint(ctx: agents.JobContext):
    assistant = Assistant()

    print(f"🤖 Agent starting in room: {ctx.room.name}")

    # Register handler for lk.chat text stream (problem statement)
    def handle_chat_message(reader, participant_identity: str):
        import asyncio

        async def process():
            text = await reader.read_all()
            print(f"📨 Received chat message from {participant_identity}: {text[:100]}...")

            # If this is the problem statement, inject it into chat context
            if text.startswith("IMPORTANT: The user is working on this specific problem:") and not assistant.problem_statement_received:
                print(f"✅ Detected problem statement, injecting into chat context")
                assistant.problem_statement_received = True

                # Get the current chat context and add the problem statement
                chat_ctx = session.chat_ctx.copy()
                chat_ctx.add_message(role="system", content=text)

                # Update the chat context permanently
                await assistant.update_chat_ctx(chat_ctx)
                print(f"✅ Problem statement persisted to chat context")

        asyncio.create_task(process())

    # Register handler for code-analysis text stream
    def handle_code_analysis(reader, participant_identity: str):
        import asyncio

        async def process():
            analysis = await reader.read_all()
            print(f"🔍 Received code analysis from {participant_identity}: {analysis[:100]}...")

            # Interrupt and relay the analysis as if it's user input for the agent to respond to
            session.interrupt()
            await session.generate_reply(
                user_input=f"[AUTOMATED CODE ANALYSIS] {analysis}"
            )
            print(f"✅ Code analysis relayed to user")

        asyncio.create_task(process())

    ctx.room.register_text_stream_handler("lk.chat", handle_chat_message)
    ctx.room.register_text_stream_handler("code-analysis", handle_code_analysis)
    print(f"✅ Text stream handlers registered")

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
