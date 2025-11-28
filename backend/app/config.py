from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    MONGO_URI: str
    JWT_SECRET: str
    JWT_ALGO: str = "HS256"

    class Config:
        env_file = ".env"

settings = Settings()