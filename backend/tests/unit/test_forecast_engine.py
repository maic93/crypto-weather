# backend/tests/unit/test_forecast_engine.py
import pytest
import random
from app.forecast.engine import (
    run_forecast, run_seven_day, _rsi, _macd, _atr,
    _score_rsi, _score_macd, _condition_from_score,
    _confidence, _forecast_range, WEIGHTS,
)


def make_ohlc(n=30, start=65_000, seed=42):
    random.seed(seed)
    rows, price = [], float(start)
    for i in range(n):
        from datetime import date, timedelta
        d = (date.today() - timedelta(days=n - i)).isoformat()
        chg = random.uniform(-0.03, 0.04)
        open_ = price
        close = price * (1 + chg)
        rows.append({
            "date": d, "open": open_,
            "high": max(open_, close) * 1.01,
            "low": min(open_, close) * 0.99,
            "close": close, "volume": 25e9,
        })
        price = close
    return rows


class TestConditionMapping:
    def test_strong_bullish_above_90(self):
        cond, label, icon = _condition_from_score(95)
        assert cond == "strong_bullish"
        assert icon == "☀️"

    def test_bullish_70_to_89(self):
        cond, _, _ = _condition_from_score(75)
        assert cond == "bullish"

    def test_neutral_45_to_69(self):
        cond, _, _ = _condition_from_score(55)
        assert cond == "neutral"

    def test_bearish_25_to_44(self):
        cond, _, _ = _condition_from_score(35)
        assert cond == "bearish"

    def test_strong_bearish_below_25(self):
        cond, label, icon = _condition_from_score(10)
        assert cond == "strong_bearish"
        assert icon == "⛈️"

    def test_boundary_90_is_strong_bullish(self):
        cond, _, _ = _condition_from_score(90)
        assert cond == "strong_bullish"

    def test_boundary_70_is_bullish(self):
        cond, _, _ = _condition_from_score(70)
        assert cond == "bullish"


class TestRSI:
    def test_rsi_returns_float(self):
        import pandas as pd
        prices = pd.Series([65000 + i * 100 for i in range(20)])
        result = _rsi(prices)
        assert isinstance(result, float)

    def test_rsi_range(self):
        import pandas as pd
        # Trending up strongly
        prices = pd.Series([60000 + i * 500 for i in range(20)])
        result = _rsi(prices)
        assert 0 <= result <= 100

    def test_rsi_high_for_uptrend(self):
        import pandas as pd
        prices = pd.Series([60000 + i * 1000 for i in range(30)])
        assert _rsi(prices) > 60

    def test_rsi_low_for_downtrend(self):
        import pandas as pd
        prices = pd.Series([90000 - i * 1000 for i in range(30)])
        assert _rsi(prices) < 40


class TestScoreRSI:
    def test_oversold_is_bearish(self):
        assert _score_rsi(20) < 40

    def test_overbought_is_bullish(self):
        assert _score_rsi(75) > 60

    def test_midrange_is_neutral(self):
        score = _score_rsi(50)
        assert 40 < score < 70


class TestWeights:
    def test_weights_sum_to_one(self):
        assert abs(sum(WEIGHTS.values()) - 1.0) < 1e-9


class TestRunForecast:
    def test_returns_signal_result(self):
        from app.forecast.engine import SignalResult
        ohlc = make_ohlc(30)
        result = run_forecast(ohlc)
        assert isinstance(result, SignalResult)

    def test_score_in_range(self):
        result = run_forecast(make_ohlc(30))
        assert 0 <= result.score <= 100

    def test_confidence_clamped(self):
        result = run_forecast(make_ohlc(30))
        assert 30 <= result.confidence <= 92

    def test_today_high_above_low(self):
        result = run_forecast(make_ohlc(30))
        assert result.today_high > result.today_low

    def test_support_below_resistance(self):
        result = run_forecast(make_ohlc(30))
        assert result.support <= result.resistance

    def test_condition_is_valid(self):
        result = run_forecast(make_ohlc(30))
        valid = {"strong_bullish", "bullish", "neutral", "bearish", "strong_bearish"}
        assert result.condition in valid

    def test_trend_is_valid(self):
        result = run_forecast(make_ohlc(30))
        assert result.trend in {"up", "down", "sideways"}

    def test_macd_signal_is_valid(self):
        result = run_forecast(make_ohlc(30))
        assert result.macd_signal in {"bullish", "bearish", "neutral"}

    def test_rsi_in_valid_range(self):
        result = run_forecast(make_ohlc(30))
        assert 0 <= result.rsi <= 100


class TestSevenDay:
    def test_returns_seven_items(self):
        ohlc = make_ohlc(30)
        days = run_seven_day(ohlc, 65.0)
        assert len(days) == 7

    def test_dates_are_future(self):
        from datetime import date
        ohlc = make_ohlc(30)
        days = run_seven_day(ohlc, 65.0)
        today = date.today().isoformat()
        for d in days:
            assert d["date"] > today

    def test_confidence_decreases(self):
        ohlc = make_ohlc(30)
        days = run_seven_day(ohlc, 65.0)
        confidences = [d["confidence"] for d in days]
        assert confidences[0] >= confidences[-1]

    def test_each_day_has_required_keys(self):
        ohlc = make_ohlc(30)
        for day in run_seven_day(ohlc, 50.0):
            assert all(k in day for k in ["date", "condition", "label", "icon", "high", "low", "confidence", "score"])

    def test_high_above_low(self):
        for day in run_seven_day(make_ohlc(30), 60.0):
            assert day["high"] > day["low"]

    def test_scores_mean_revert_toward_50(self):
        """Starting from extreme score should drift toward 50 over 7 days."""
        days_bull = run_seven_day(make_ohlc(30), 95.0)
        days_bear = run_seven_day(make_ohlc(30), 5.0)
        # Last day score should be closer to 50 than first
        assert abs(days_bull[-1]["score"] - 50) < abs(days_bull[0]["score"] - 50)
        assert abs(days_bear[-1]["score"] - 50) < abs(days_bear[0]["score"] - 50)


class TestForecastRange:
    def test_high_above_low(self):
        from app.forecast.engine import _forecast_range
        high, low = _forecast_range(65000, 1500, "bullish")
        assert high > low

    def test_bullish_center_above_bearish(self):
        from app.forecast.engine import _forecast_range
        bull_high, _ = _forecast_range(65000, 1500, "strong_bullish")
        bear_high, _ = _forecast_range(65000, 1500, "strong_bearish")
        assert bull_high > bear_high
