from agentscope.agent import Agent
from agentscope.model import DeepSeekChatModel
from agentscope.credential import DeepSeekCredential
from agentscope.message import UserMsg
from ..core.config import settings


def create_chat_agent(system_prompt: str | None = None) -> Agent:
    """创建通用对话 Agent"""
    model = DeepSeekChatModel(
        credential=DeepSeekCredential(api_key=settings.llm_api_key),
        model=settings.llm_model,
        stream=True,
    )

    default_prompt = """你是一个友好的 AI 助手，请用自然、温暖的中文与用户对话。回复简洁有力，不要过度啰嗦。"""

    return Agent(
        name="ChatAgent",
        system_prompt=system_prompt or default_prompt,
        model=model,
    )


async def chat_stream(agent: Agent, content: str):
    """流式对话，逐 token 产出文本"""
    msg = UserMsg(name="user", content=content)
    async for event in agent.reply_stream(msg):
        delta = getattr(event, "delta", None)
        if delta:
            yield delta
