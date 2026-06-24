# backend/tests/unit/test_services.py
import pytest
from datetime import date, timedelta
from unittest.mock import AsyncMock, patch, MagicMock
from app.services.forecast_service import get_accuracy, evaluate_past_forecasts
from app.models.forecast import ForecastRecord
from app.models.price import PriceHistory
from app.schemas.forecast import AccuracyMetrics


class TestGetAccuracy:
    def test_returns_zero_when_no_records(self, db):
        result = get_accuracy(db, 30)
        assert isinstance(result, AccuracyMetrics)
        assert result.total_forecasts == 0
        assert result.direction_accuracy == 0.0

    def test_calculates_correctly_with_records(self, db):
        today = date.today()
        # Add some evaluated forecast records
        for i in range(5):
            target = (today - timedelta(days=i + 1)).isoformat()
            rec = ForecastRecord(
                forecast_date=(today - timedelta(days=i + 2)).isoformat(),
                target_date=target,
                predicted_high=66000,
                predicted_low=64000,
                predicted_close=65000,
                condition="bullish",
                score=72.0,
                confidence=75.0,
                actual_close=65200,
                actual_high=66100,
                actual_low=63900,
                direction_correct=1,
                within_range=1,
                absolute_error=200.0,
                absolute_pct_error=0.31,
            )
            db.add(rec)
        db.commit()

        result = get_accuracy(db, 30)
        assert result.total_forecasts >= 5
        assert result.direction_accuracy > 0
        assert result.mean_absolute_error > 0

    def test_direction_accuracy_range(self, db):
        result = get_accuracy(db, 30)
        assert 0 <= result.direction_accuracy <= 100

    def test_within_range_accuracy_range(self, db):
        result = get_accuracy(db, 30)
        assert 0 <= result.within_range_accuracy <= 100


class TestEvaluatePastForecasts:
    def test_fills_in_actuals(self, isolated_db):
        today = date.today()
        past = (today - timedelta(days=2)).isoformat()
        forecast_day = (today - timedelta(days=3)).isoformat()

        # Add actual price for that day
        isolated_db.add(PriceHistory(
            date=past, open=64000, high=67000, low=63000,
            close=65500, volume=30e9, change_pct=1.5,
        ))
        # Add forecast record without actuals
        rec = ForecastRecord(
            forecast_date=forecast_day,
            target_date=past,
            predicted_high=67000,
            predicted_low=63000,
            predicted_close=65000,
            condition="bullish",
            score=70.0,
            confidence=72.0,
        )
        isolated_db.add(rec)
        isolated_db.commit()

        updated = evaluate_past_forecasts(isolated_db)
        assert updated >= 1

        isolated_db.refresh(rec)
        assert rec.actual_close == 65500
        assert rec.absolute_error is not None
        assert rec.within_range is not None


class TestPriceService:
    def test_get_history_returns_list(self, isolated_db, sample_ohlc):
        from app.models.price import PriceHistory
        from app.services.price_service import get_history
        for row in sample_ohlc:
            isolated_db.add(PriceHistory(**row, change_pct=0.0, market_cap=0.0))
        isolated_db.commit()
        rows = get_history(isolated_db, 30)
        assert isinstance(rows, list)
        assert len(rows) > 0

    def test_get_history_ordered_by_date(self, isolated_db, sample_ohlc):
        from app.models.price import PriceHistory
        from app.services.price_service import get_history
        for row in sample_ohlc:
            isolated_db.add(PriceHistory(**row, change_pct=0.0, market_cap=0.0))
        isolated_db.commit()
        rows = get_history(isolated_db, 30)
        dates = [r.date for r in rows]
        assert dates == sorted(dates)

    def test_get_all_ohlc_returns_dicts(self, isolated_db, sample_ohlc):
        from app.models.price import PriceHistory
        from app.services.price_service import get_all_ohlc
        for row in sample_ohlc:
            isolated_db.add(PriceHistory(**row, change_pct=0.0, market_cap=0.0))
        isolated_db.commit()
        rows = get_all_ohlc(isolated_db)
        assert len(rows) > 0
        assert all(isinstance(r, dict) for r in rows)
        assert all("close" in r for r in rows)
