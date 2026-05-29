from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "软软"
    debug: bool = True

    # 数据库
    database_url: str = "postgresql+asyncpg://soft:soft@localhost:5432/soft_db"
    redis_url: str = "redis://localhost:6379/0"

    # JWT
    jwt_secret: str = "change-me-in-production"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 1440

    # LLM
    llm_api_key: str = ""
    llm_api_base: str = "https://api.openai.com/v1"
    llm_model: str = "gpt-4o"

    # 认证（false = 免登录模式）
    require_auth: bool = False

    # CORS
    cors_origins: list[str] = ["http://localhost:5173"]

    # 限流
    rate_limit_per_minute: int = 30

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()
