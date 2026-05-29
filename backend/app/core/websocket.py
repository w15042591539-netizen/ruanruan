from fastapi import WebSocket, WebSocketDisconnect
from typing import Any
import json
import uuid


class WebSocketManager:
    """管理所有 WebSocket 连接"""

    def __init__(self):
        self._connections: dict[str, WebSocket] = {}

    async def connect(self, user_id: str, websocket: WebSocket):
        await websocket.accept()
        self._connections[user_id] = websocket

    def disconnect(self, user_id: str):
        self._connections.pop(user_id, None)

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

        # TODO: 对接 AgentScope 生成回复
        reply = f"你说: {content}"

        await self.send_json(user_id, {
            "type": "chat_complete",
            "session_id": session_id,
            "full_response": reply,
            "emotion": "neutral",
            "live2d_expression": "smile",
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
