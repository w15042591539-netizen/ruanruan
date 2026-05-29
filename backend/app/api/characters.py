from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/characters", tags=["角色"])


class UpdateCharacterRequest(BaseModel):
    preset_id: Optional[str] = None
    custom_name: Optional[str] = None
    custom_prompt: Optional[str] = None
    personality_params: Optional[dict] = None


@router.get("/presets")
async def list_presets():
    return {
        "code": 200,
        "data": [
            {
                "id": "gentle",
                "name": "温柔女友",
                "description": "温柔体贴，善解人意",
                "avatar_url": "",
                "live2d_model": "hiyori",
            },
            {
                "id": "tsundere",
                "name": "傲娇女友",
                "description": "表面高冷，内心火热",
                "avatar_url": "",
                "live2d_model": "hiyori",
            },
            {
                "id": "lively",
                "name": "活泼女友",
                "description": "元气满满，活力四射",
                "avatar_url": "",
                "live2d_model": "hiyori",
            },
        ],
    }


@router.get("/my-character")
async def get_my_character():
    return {
        "code": 200,
        "data": {
            "preset_id": "gentle",
            "custom_name": "小软",
            "custom_prompt": "",
            "personality_params": {"affection": 80, "humor": 60, "caring": 90},
            "live2d_model": "hiyori",
        },
    }


@router.put("/my-character")
async def update_my_character(req: UpdateCharacterRequest):
    return {"code": 200, "data": req.model_dump()}
