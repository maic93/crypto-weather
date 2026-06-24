# backend/tests/integration/test_api.py
import pytest
from unittest.mock import AsyncMock, patch


MOCK_PRICE = {
    "usd": 65000,
    "usd_24h_change": 2.5,
    "usd_market_cap": 1_280_000_000_000,
    "usd_24h_vol": 35_000_000_000,
    "last_updated_at": 1700000000,
}


@pytest.fixture(autouse=True)
def mock_coingecko(monkeypatch):
    """Patch CoinGecko so tests never hit the real API."""
    mock = AsyncMock(return_value=MOCK_PRICE)
    monkeypatch.setattr(
        "app.services.coingecko.CoinGeckoService.get_current_price", mock
    )

    async def mock_ohlc(self, days=30):
        import random, time
        random.seed(42)
        rows, price = [], 65000.0
        for i in range(days):
            ts = int(time.time() * 1000) - (days - i) * 86400000
            chg = random.uniform(-0.03, 0.04)
            close = price * (1 + chg)
            rows.append([ts, price, max(price, close) * 1.01,
                         min(price, close) * 0.99, close])
            price = close
        return rows

    async def mock_market_chart(self, days=90):
        import time
        prices = [[int(time.time() * 1000) - i * 86400000, 65000 + i * 10]
                  for i in range(days)]
        volumes = [[int(time.time() * 1000) - i * 86400000, 30e9]
                   for i in range(days)]
        return {"prices": prices, "total_volumes": volumes}

    monkeypatch.setattr("app.services.coingecko.CoinGeckoService.get_ohlc", mock_ohlc)
    monkeypatch.setattr("app.services.coingecko.CoinGeckoService.get_market_chart", mock_market_chart)


class TestHealthEndpoint:
    def test_returns_200(self, client):
        r = client.get("/api/health")
        assert r.status_code == 200

    def test_status_ok(self, client):
        r = client.get("/api/health")
        assert r.json()["status"] == "ok"

    def test_has_version(self, client):
        r = client.get("/api/health")
        assert "version" in r.json()


class TestCurrentEndpoint:
    def test_returns_200(self, client):
        r = client.get("/api/current")
        assert r.status_code == 200

    def test_has_price(self, client):
        r = client.get("/api/current")
        data = r.json()
        assert "price" in data
        assert data["price"] == 65000

    def test_has_change(self, client):
        r = client.get("/api/current")
        assert "change_24h_pct" in r.json()

    def test_has_market_cap(self, client):
        r = client.get("/api/current")
        assert r.json()["market_cap"] > 0


class TestForecastEndpoint:
    def test_returns_200(self, client):
        r = client.get("/api/forecast")
        assert r.status_code == 200

    def test_has_weather(self, client):
        r = client.get("/api/forecast")
        data = r.json()
        assert "weather" in data
        assert "condition" in data["weather"]
        assert "score" in data["weather"]

    def test_weather_condition_valid(self, client):
        r = client.get("/api/forecast")
        valid = {"strong_bullish", "bullish", "neutral", "bearish", "strong_bearish"}
        assert r.json()["weather"]["condition"] in valid

    def test_has_seven_day(self, client):
        r = client.get("/api/forecast")
        assert "seven_day" in r.json()
        assert len(r.json()["seven_day"]) == 7

    def test_today_high_above_low(self, client):
        r = client.get("/api/forecast")
        data = r.json()
        assert data["today_high"] > data["today_low"]

    def test_confidence_in_range(self, client):
        r = client.get("/api/forecast")
        conf = r.json()["confidence"]
        assert 0 <= conf <= 100

    def test_generated_at_is_set(self, client):
        r = client.get("/api/forecast")
        assert "generated_at" in r.json()


class TestHistoryEndpoint:
    def test_returns_200(self, client):
        r = client.get("/api/history")
        assert r.status_code == 200

    def test_returns_list(self, client):
        r = client.get("/api/history")
        assert isinstance(r.json(), list)

    def test_items_have_ohlc(self, client):
        r = client.get("/api/history")
        data = r.json()
        if data:
            item = data[0]
            for key in ["date", "open", "high", "low", "close", "volume"]:
                assert key in item

    def test_respects_days_param(self, client):
        r7 = client.get("/api/history?days=7")
        r30 = client.get("/api/history?days=30")
        assert len(r7.json()) <= len(r30.json())


class TestAccuracyEndpoint:
    def test_returns_200(self, client):
        r = client.get("/api/accuracy")
        assert r.status_code == 200

    def test_has_required_fields(self, client):
        r = client.get("/api/accuracy")
        data = r.json()
        for f in ["period_days", "direction_accuracy", "mean_absolute_pct_error", "total_forecasts"]:
            assert f in data


class TestMetricsEndpoint:
    def test_returns_200(self, client):
        r = client.get("/api/metrics")
        assert r.status_code == 200

    def test_has_rsi(self, client):
        r = client.get("/api/metrics")
        assert 0 <= r.json()["rsi"] <= 100

    def test_has_trend(self, client):
        r = client.get("/api/metrics")
        assert r.json()["trend"] in {"up", "down", "sideways"}

    def test_support_below_resistance(self, client):
        r = client.get("/api/metrics")
        data = r.json()
        assert data["support"] <= data["resistance"]
