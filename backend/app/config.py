import os
from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    PROJECT_NAME: str = "WarungKita POS"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "supersecretkeyforwarungpos1234567890!")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours
    
    # Database URL. Supports DATABASE_URL, or Vercel Postgres env vars as fallback.
    DATABASE_URL: str = os.getenv("DATABASE_URL") or os.getenv("POSTGRES_URL") or os.getenv("POSTGRES_URL_NON_POOLING") or "sqlite:///./warungpos.db"
    
    # CORS Origins for Vite dev server + Vercel deployment
    # Override via env var CORS_ORIGINS (comma-separated) or default to all in Vercel
    CORS_ORIGINS: List[str] = (
        os.getenv("CORS_ORIGINS", "").split(",") if os.getenv("CORS_ORIGINS")
        else (["*"] if os.getenv("VERCEL") else [
            "http://localhost:5173",
            "http://127.0.0.1:5173",
            "http://localhost:3000",
            "http://localhost:8000",
        ])
    )

    class Config:
        case_sensitive = True

settings = Settings()
