# backend/app/services/coingecko.py
import httpx
import asyncio
import time
from typing import Optional
from app.core.config import settings

_cache: dict[str, tuple[float, object]] = {}


def _get_cache(key: str, ttl: int) -> Optional[object]:
    if key in _cache:
        ts, val = _cache[key]
        if time.time() - ts < ttl:
            return val
    return None


def _set_cache(key: str, val: object) -> None:
    _cache[key] = (time.time(), val)


class CoinGeckoService:
    BASE = settings.coingecko_base_url
    COIN_ID = "bitcoin"
    _last_request: float = 0.0

    async def _get(self, path: str) -> dict:
        # Respect rate limit
        elapsed = time.time() - self._last_request
        if elapsed < settings.coingecko_rate_limit_delay:
            await asyncio.sleep(settings.coingecko_rate_limit_delay - elapsed)
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.get(f"{self.BASE}{path}")
            resp.raise_for_status()
            CoinGeckoService._last_request = time.time()
            return resp.json()

    async def get_current_price(self) -> dict:
        key = "current_price"
        cached = _get_cache(key, settings.price_cache_ttl)
        if cached:
            return cached  # type: ignore
        data = await self._get(
            f"/simple/price?ids={self.COIN_ID}"
            "&vs_currencies=usd"
            "&include_market_cap=true"
            "&include_24hr_vol=true"
            "&include_24hr_change=true"
            "&include_last_updated_at=true"
        )
        result = data[self.COIN_ID]
        _set_cache(key, result)
        return result

    async def get_ohlc(self, days: int = 30) -> list[list[float]]:
        key = f"ohlc_{days}"
        cached = _get_cache(key, settings.history_cache_ttl)
        if cached:
            return cached  # type: ignore
        data = await self._get(f"/coins/{self.COIN_ID}/ohlc?vs_currency=usd&days={days}")
        _set_cache(key, data)
        return data

    async def get_market_chart(self, days: int = 90) -> dict:
        key = f"market_chart_{days}"
        cached = _get_cache(key, settings.history_cache_ttl)
        if cached:
            return cached  # type: ignore
        data = await self._get(
            f"/coins/{self.COIN_ID}/market_chart?vs_currency=usd&days={days}&interval=daily"
        )
        _set_cache(key, data)
        return data


coingecko = CoinGeckoService()
