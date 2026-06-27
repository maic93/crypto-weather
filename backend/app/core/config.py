# backend/app/core/config.py
import os

try:
    # Full pydantic-settings version for local/Docker use
    from pydantic_settings import BaseSettings

    class Settings(BaseSettings):
        app_name: str = "Crypto Weather API"
        version: str = "1.0.0"
        debug: bool = False
        database_url: str = "sqlite:///./crypto_weather.db"
        coingecko_base_url: str = "https://api.coingecko.com/api/v3"
        coingecko_rate_limit_delay: float = 1.2
        price_cache_ttl: int = 60
        forecast_cache_ttl: int = 300
        history_cache_ttl: int = 3600
        use_scheduler: bool = True
        cors_origins: list[str] = [
            "http://localhost:3000",
            "https://*.vercel.app",
        ]

        class Config:
            env_file = ".env"
            case_sensitive = False

    settings = Settings()

except ImportError:
    # Minimal fallback for Vercel serverless (no pydantic-settings)
    class _Settings:
        app_name = "Crypto Weather API"
        version = "1.0.0"
        debug = False
        database_url = os.environ.get("DATABASE_URL", "sqlite:///./crypto_weather.db")
        coingecko_base_url = "https://api.coingecko.com/api/v3"
        coingecko_rate_limit_delay = 1.2
        price_cache_ttl = 60
        forecast_cache_ttl = 300
        history_cache_ttl = 3600
        use_scheduler = False
        cors_origins = ["*"]

    settings = _Settings()
