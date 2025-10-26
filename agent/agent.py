from dotenv import load_dotenv

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
                Before the interview begins, you will receive a system prompt that outlines the problem to be solved.
                Don't forget to greet the interviewee and provide a brief overview of how the interview will proceed. Then ask about the interviewee and their background.
                """,
        )


async def entrypoint(ctx: agents.JobContext):
    session = AgentSession(
        stt="assemblyai/universal-streaming:en",
        llm="openai/gpt-4.1-mini",
        tts="cartesia/sonic-2:9626c31c-bec5-4cca-baa8-f8ba9e84c8bc",
        vad=silero.VAD.load(),
        turn_detection=MultilingualModel(),
    )

    await session.start(
        room=ctx.room,
        agent=Assistant(),
        room_input_options=RoomInputOptions(
            # For telephony applications, use `BVCTelephony` instead for best results
            noise_cancellation=noise_cancellation.BVC(),
        ),
    )

    await session.generate_reply(
        instructions="Greet the user and offer your assistance."
    )


if __name__ == "__main__":
    agents.cli.run_app(agents.WorkerOptions(entrypoint_fnc=entrypoint))
