from pydantic_settings import BaseSettings
from typing import Optional
import os
from pathlib import Path

# Locate base directory
BASE_DIR = Path(__file__).resolve().parent.parent

# Candidate env files
candidate_env_files = [
    BASE_DIR / ".env",
    BASE_DIR.parent.parent / ".env",  # impactos root
]
valid_env_files = []
for ef in candidate_env_files:
    try:
        if ef.is_file():
            with open(ef, "r") as _f:
                valid_env_files.append(str(ef))
    except Exception:
        pass

class Settings(BaseSettings):
    APP_ENV: str = "development"
    API_PORT: int = 8000
    API_HOST: str = "0.0.0.0"
    
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

    class Config:
        env_file = tuple(valid_env_files)
        extra = "allow"

settings = Settings()

# Ensure upload directory exists
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
