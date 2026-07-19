"""
Central app configuration.

Why this file exists:
Every setting (DB URL, JWT secret, etc.) should come from environment
variables — never hardcoded — so the same code works in dev, Docker,
and production just by changing a .env file. pydantic-settings reads
env vars automatically and validates their types for us.
"""
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    PROJECT_NAME: str = "SupportIQ CRM"
    API_V1_PREFIX: str = "/api/v1"

    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/supportiq"

    JWT_SECRET_KEY: str = "change-me-in-.env"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24h, fine for a portfolio project

    GEMINI_API_KEY: str = ""

    # CORS: which frontend origins are allowed to call this API
    CORS_ORIGINS: list[str] = ["http://localhost:5173"]


settings = Settings()
