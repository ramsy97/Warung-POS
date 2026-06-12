import os
from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    PROJECT_NAME: str = "WarungKita POS"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "supersecretkeyforwarungpos1234567890!")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours
    
    # Database URL. Fallback to local SQLite if postgres is not provided.
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./warungpos.db")
    
    # CORS Origins for Vite dev server
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://localhost:8000",
    ]

    class Config:
        case_sensitive = True

settings = Settings()
