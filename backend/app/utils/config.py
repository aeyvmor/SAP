from pydantic_settings import BaseSettings
import os

class Settings(BaseSettings):
    database_url: str = os.getenv("DATABASE_URL", "sqlite:///default.db")

    class Config:
        env_file = os.path.join(os.path.dirname(__file__), ".env")

settings = Settings()

if not settings.database_url:
    raise ValueError("DATABASE_URL is not set or invalid.")