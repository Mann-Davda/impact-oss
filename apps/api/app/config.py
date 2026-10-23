import os
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

# Locate base directory
BASE_DIR = Path(__file__).resolve().parent.parent

# Candidate env files. Missing files are ignored by pydantic-settings.
candidate_env_files = (
    BASE_DIR / ".env",
    BASE_DIR.parent.parent / ".env",  # impactos root
)


class Settings(BaseSettings):
    APP_ENV: str = "development"
    API_PORT: int = 8000
    API_HOST: str = "0.0.0.0"
    CORS_ORIGINS: str = "http://localhost:3000,http://127.0.0.1:3000"
    RATE_LIMIT_REQUESTS: int = 120
    RATE_LIMIT_WINDOW_SECONDS: int = 60

    # Gemini AI configuration
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-3.8-flash"

    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./impactos.db"

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"

    # Upload storage directory
    UPLOAD_DIR: str = str(BASE_DIR / "uploads")
    DEMO_ASSETS_DIR: str = str(BASE_DIR / "demo_assets")

    model_config = SettingsConfigDict(
        env_file=tuple(str(path) for path in candidate_env_files),
        extra="allow",
    )


settings = Settings()

# Ensure upload directory exists
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
