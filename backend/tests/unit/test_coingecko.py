# backend/tests/unit/test_coingecko.py
import pytest
import time
from unittest.mock import AsyncMock, MagicMock, patch
from app.services.coingecko import CoinGeckoService, _get_cache, _set_cache, _cache


class TestCache:
    def test_set_and_get(self):
        _set_cache("test_key", {"data": 42})
        result = _get_cache("test_key", ttl=60)
        assert result == {"data": 42}

    def test_expired_returns_none(self):
        _set_cache("expired_key", "stale")
        result = _get_cache("expired_key", ttl=0)
        assert result is None

    def test_missing_key_returns_none(self):
        result = _get_cache("nonexistent_key_xyz", ttl=60)
        assert result is None

    def test_fresh_entry_within_ttl(self):
        _set_cache("fresh_key", [1, 2, 3])
        result = _get_cache("fresh_key", ttl=3600)
        assert result == [1, 2, 3]


class TestCoinGeckoService:
    @pytest.fixture
    def svc(self):
        return CoinGeckoService()

    @pytest.mark.asyncio
    async def test_get_current_price_from_api(self, svc, monkeypatch):
        mock_data = {
            "bitcoin": {
                "usd": 65000,
                "usd_24h_change": 2.5,
                "usd_market_cap": 1.28e12,
                "usd_24h_vol": 35e9,
                "last_updated_at": 1700000000,
            }
        }

        async def mock_get(self, path):
            return mock_data

        monkeypatch.setattr(CoinGeckoService, "_get", mock_get)
        # Clear cache to force API call
        _cache.pop("current_price", None)

        result = await svc.get_current_price()
        assert result["usd"] == 65000

    @pytest.mark.asyncio
    async def test_get_current_price_uses_cache(self, svc):
        _set_cache("current_price", {"usd": 99999, "cached": True})
        result = await svc.get_current_price()
        assert result["usd"] == 99999

    @pytest.mark.asyncio
    async def test_get_ohlc_parses_response(self, svc, monkeypatch):
        mock_ohlc = [
            [1700000000000, 60000, 62000, 58000, 61000],
            [1700086400000, 61000, 63000, 59000, 62000],
        ]

        async def mock_get(self, path):
            return mock_ohlc

        monkeypatch.setattr(CoinGeckoService, "_get", mock_get)
        _cache.pop("ohlc_30", None)

        result = await svc.get_ohlc(30)
        assert result == mock_ohlc

    @pytest.mark.asyncio
    async def test_get_ohlc_uses_cache(self, svc):
        cached = [[1700000000000, 60000, 62000, 58000, 61000]]
        _set_cache("ohlc_7", cached)
        result = await svc.get_ohlc(7)
        assert result == cached

    @pytest.mark.asyncio
    async def test_get_market_chart_uses_cache(self, svc):
        cached = {"prices": [[1700000000000, 65000]], "total_volumes": []}
        _set_cache("market_chart_30", cached)
        result = await svc.get_market_chart(30)
        assert result == cached

    @pytest.mark.asyncio
    async def test_get_raises_on_http_error(self, svc, monkeypatch):
        import httpx

        async def mock_get_raise(self, path):
            raise httpx.HTTPStatusError("429", request=MagicMock(), response=MagicMock(status_code=429))

        monkeypatch.setattr(CoinGeckoService, "_get", mock_get_raise)
        _cache.pop("current_price", None)

        with pytest.raises(Exception):
            await svc.get_current_price()

