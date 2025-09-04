from pydantic_settings import BaseSettings
import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    database_url: str

    class Config:
        env_file = os.path.join(os.path.dirname(__file__), ".env")

settings = Settings()