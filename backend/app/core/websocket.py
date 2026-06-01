from fastapi import WebSocket
from typing import Any
import json

from agentscope.agent import Agent
from app.agents.chat import create_chat_agent, chat_stream


PRESET_PROMPTS: dict[str, str] = {
    "girlfriend": "你是一个温柔体贴的女友，名叫小软。你关心用户、善于倾听，用亲密自然的中文与用户聊天。回复温暖但不做作，可以适度使用语气词。",
    "assistant": "你是一个高效专业的 AI 助手。回答准确、简洁、有条理。用中文回复，语气礼貌而干练。",
    "friend": "你是一个随和有趣的朋友。聊天风格轻松随意，喜欢开玩笑和分享趣事。用中文回复，就像老朋友唠嗑。",
    "mentor": "你是一个耐心博学的导师。善于引导用户思考，解释复杂概念时深入浅出。用中文回复，鼓励探索精神。",
}


class WebSocketManager:
    """管理所有 WebSocket 连接和 Agent 实例"""

    def __init__(self):
        self._connections: dict[str, WebSocket] = {}
        self._agents: dict[str, Agent] = {}

    async def connect(self, user_id: str, websocket: WebSocket):
        await websocket.accept()
        self._connections[user_id] = websocket
        self._agents[user_id] = create_chat_agent()

    def disconnect(self, user_id: str):
        self._connections.pop(user_id, None)
        self._agents.pop(user_id, None)

    def get_agent(self, user_id: str) -> Agent | None:
        return self._agents.get(user_id)

    async def send_json(self, user_id: str, data: dict[str, Any]):
        ws = self._connections.get(user_id)
        if ws:
            await ws.send_json(data)

    async def handle_message(self, user_id: str, raw: str):
        try:
            message = json.loads(raw)
            msg_type = message.get("type", "")

            if msg_type == "chat":
                await self._handle_chat(user_id, message)
            elif msg_type == "switch_character":
                await self._handle_switch(user_id, message)
            elif msg_type == "interact":
                await self._handle_interact(user_id, message)
            elif msg_type == "ping":
                await self.send_json(user_id, {"type": "pong"})
            else:
                await self.send_json(user_id, {"type": "error", "message": f"未知消息类型: {msg_type}"})

        except json.JSONDecodeError:
            await self.send_json(user_id, {"type": "error", "message": "无效的 JSON"})

    async def _handle_chat(self, user_id: str, message: dict):
        content = message.get("content", "")
        session_id = message.get("session_id", "")
        agent = self._agents.get(user_id)

        if not agent or not content.strip():
            return

        await self.send_json(user_id, {
            "type": "typing_indicator",
            "session_id": session_id,
        })

        full = ""
        async for chunk in chat_stream(agent, content):
            full += chunk
            await self.send_json(user_id, {
                "type": "chat_chunk",
                "session_id": session_id,
                "content": chunk,
                "is_final": False,
            })

        await self.send_json(user_id, {
            "type": "chat_complete",
            "session_id": session_id,
            "full_response": full,
        })

    async def _handle_switch(self, user_id: str, message: dict):
        character_id = message.get("character_id", "")
        system_prompt = PRESET_PROMPTS.get(character_id)

        if system_prompt:
            self._agents[user_id] = create_chat_agent(system_prompt)
            await self.send_json(user_id, {
                "type": "character_switched",
                "character_id": character_id,
            })
        else:
            await self.send_json(user_id, {
                "type": "error",
                "message": f"未知角色: {character_id}",
            })

    async def _handle_interact(self, user_id: str, message: dict):
        action = message.get("action", "")
        action_map = {
            "head_pat": "blush",
            "tap_body": "surprised",
            "hold": "happy",
            "flick": "happy",
            "double_tap": "surprised",
        }
        expression = action_map.get(action, "smile")
        await self.send_json(user_id, {
            "type": "action",
            "action_name": expression,
            "duration": 3000,
        })

    async def broadcast(self, data: dict[str, Any]):
        for ws in self._connections.values():
            await ws.send_json(data)


manager = WebSocketManager()
