# backend/app/core/config.py
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # App
    app_name: str = "Crypto Weather API"
    version: str = "1.0.0"
    debug: bool = False

    # Database — set to Supabase connection string in production
    database_url: str = "sqlite:///./crypto_weather.db"

    # CoinGecko
    coingecko_base_url: str = "https://api.coingecko.com/api/v3"
    coingecko_rate_limit_delay: float = 1.2

    # Cache TTL (seconds)
    price_cache_ttl: int = 60
    forecast_cache_ttl: int = 300
    history_cache_ttl: int = 3600

    # Set to False on Vercel (cron handles scheduling instead)
    use_scheduler: bool = True

    # CORS — add your Vercel frontend URL here
    cors_origins: list[str] = [
        "http://localhost:3000",
        "https://*.vercel.app",
    ]

    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()
