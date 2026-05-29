from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from .core.config import settings
from .core.websocket import manager
from .api import users_router, sessions_router, characters_router
import uuid

app = FastAPI(title=settings.app_name, debug=settings.debug)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

if settings.require_auth:
    app.include_router(users_router, prefix="/api/v1")
app.include_router(sessions_router, prefix="/api/v1")
app.include_router(characters_router, prefix="/api/v1")


@app.get("/api/v1/health")
async def health():
    return {"status": "ok"}


@app.websocket("/ws/chat")
async def websocket_chat(websocket: WebSocket):
    if settings.require_auth:
        # TODO: 从 query 参数验证 token，获取 user_id
        user_id = "auth-user"
    else:
        user_id = str(uuid.uuid4())
    await manager.connect(user_id, websocket)
    try:
        while True:
            data = await websocket.receive_text()
            await manager.handle_message(user_id, data)
    except Exception:
        pass
    finally:
        manager.disconnect(user_id)
