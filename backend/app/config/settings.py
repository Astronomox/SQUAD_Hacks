from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str
    SECRET_KEY: str

    SQUAD_SECRET: str
    SQUAD_BASE_URL: str
    SQUAD_SECRET_KEY: str

    class Config:
        env_file = ".env",
        extra="ignore"


settings = Settings()