# backend/app/services/forecast_service.py
from datetime import date
from sqlalchemy.orm import Session
from app.models.forecast import ForecastRecord
from app.models.price import PriceHistory
from app.forecast.engine import run_forecast, run_seven_day, SignalResult
from app.services.price_service import get_all_ohlc
from app.schemas.forecast import AccuracyMetrics


def generate_and_store(db: Session) -> SignalResult:
    """Run the forecast engine and persist all 7 predictions."""
    ohlc = get_all_ohlc(db)
    if not ohlc:
        raise ValueError("No price history in DB — run sync first")

    result = run_forecast(ohlc)
    seven_day = run_seven_day(ohlc, result.score)
    today_str = date.today().isoformat()

    for day in seven_day:
        # Avoid duplicate forecasts for the same target date made today
        existing = (
            db.query(ForecastRecord)
            .filter_by(forecast_date=today_str, target_date=day["date"])
            .first()
        )
        if not existing:
            db.add(ForecastRecord(
                forecast_date=today_str,
                target_date=day["date"],
                predicted_high=day["high"],
                predicted_low=day["low"],
                predicted_close=(day["high"] + day["low"]) / 2,
                condition=day["condition"],
                score=day["score"],
                confidence=day["confidence"],
            ))

    db.commit()
    return result


def evaluate_past_forecasts(db: Session) -> int:
    """
    Fill in actual_close / accuracy fields for any forecast whose target_date
    has now passed and we have actual data for.
    Returns number of records updated.
    """
    today_str = date.today().isoformat()
    pending = (
        db.query(ForecastRecord)
        .filter(ForecastRecord.target_date < today_str)
        .filter(ForecastRecord.actual_close.is_(None))
        .all()
    )
    updated = 0
    for record in pending:
        actual = (
            db.query(PriceHistory)
            .filter_by(date=record.target_date)
            .first()
        )
        if not actual:
            continue
        record.actual_close = actual.close
        record.actual_high = actual.high
        record.actual_low = actual.low
        record.absolute_error = abs(record.predicted_close - actual.close)
        record.absolute_pct_error = record.absolute_error / actual.close * 100
        record.within_range = int(actual.close <= record.predicted_high and actual.close >= record.predicted_low)

        # Direction: compare predicted close vs the close on forecast_date
        forecast_day = db.query(PriceHistory).filter_by(date=record.forecast_date).first()
        if forecast_day:
            predicted_up = record.predicted_close > forecast_day.close
            actual_up = actual.close > forecast_day.close
            record.direction_correct = int(predicted_up == actual_up)

        updated += 1

    db.commit()
    return updated


def get_accuracy(db: Session, period_days: int = 30) -> AccuracyMetrics:
    cutoff = (
        date.today().replace(day=date.today().day)
        .__class__(date.today().year, date.today().month, date.today().day)
    )
    from datetime import timedelta
    cutoff_str = (cutoff - timedelta(days=period_days)).isoformat()

    records = (
        db.query(ForecastRecord)
        .filter(ForecastRecord.target_date >= cutoff_str)
        .filter(ForecastRecord.actual_close.isnot(None))
        .all()
    )

    if not records:
        return AccuracyMetrics(
            period_days=period_days,
            mean_absolute_error=0.0,
            mean_absolute_pct_error=0.0,
            direction_accuracy=0.0,
            within_range_accuracy=0.0,
            total_forecasts=0,
        )

    mae = sum(r.absolute_error for r in records if r.absolute_error) / len(records)
    mape = sum(r.absolute_pct_error for r in records if r.absolute_pct_error) / len(records)
    dir_acc = sum(r.direction_correct for r in records if r.direction_correct is not None) / len(records) * 100
    range_acc = sum(r.within_range for r in records if r.within_range is not None) / len(records) * 100

    return AccuracyMetrics(
        period_days=period_days,
        mean_absolute_error=round(mae, 2),
        mean_absolute_pct_error=round(mape, 2),
        direction_accuracy=round(dir_acc, 1),
        within_range_accuracy=round(range_acc, 1),
        total_forecasts=len(records),
    )
