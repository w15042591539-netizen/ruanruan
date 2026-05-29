from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/sessions", tags=["会话"])


class CreateSessionRequest(BaseModel):
    title: str = "新对话"


@router.get("")
async def list_sessions(page: int = 1, page_size: int = 20):
    # TODO: 从数据库查询
    return {
        "code": 200,
        "data": {"items": [], "total": 0, "page": page},
    }


@router.post("")
async def create_session(req: CreateSessionRequest):
    # TODO: 数据库创建
    return {"code": 201, "data": {"session_id": "temp-session-id"}}


@router.get("/{session_id}/messages")
async def get_messages(session_id: str, page: int = 1, page_size: int = 50):
    # TODO: 从数据库查询
    return {"code": 200, "data": {"items": [], "total": 0, "page": page}}


@router.delete("/{session_id}")
async def delete_session(session_id: str):
    return {"code": 200, "message": "已删除"}
