from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, EmailStr
from ..core.config import settings
from ..core.auth import create_access_token
from typing import Optional

router = APIRouter(prefix="/users", tags=["用户"])


class RegisterRequest(BaseModel):
    username: str
    email: EmailStr
    password: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UpdateUserRequest(BaseModel):
    nickname: Optional[str] = None
    avatar_url: Optional[str] = None


@router.post("/register")
async def register(req: RegisterRequest):
    # TODO: 数据库存储用户
    token = create_access_token({"sub": req.username})
    return {
        "code": 201,
        "data": {"user_id": "temp-id", "username": req.username, "token": token},
    }


@router.post("/login")
async def login(req: LoginRequest):
    # TODO: 验证密码
    token = create_access_token({"sub": req.email})
    return {
        "code": 200,
        "data": {"user_id": "temp-id", "username": req.email, "token": token},
    }


@router.get("/me")
async def get_me():
    return {
        "code": 200,
        "data": {"username": "temp", "email": "temp@test.com", "nickname": "临时用户"},
    }


@router.put("/me")
async def update_me(req: UpdateUserRequest):
    return {"code": 200, "data": req.model_dump()}
