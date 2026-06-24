# backend/app/api/routes/forecast.py
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.schemas.forecast import (
    ForecastResponse, CurrentPrice, HistoricalDay,
    AccuracyMetrics, MarketMetrics, HealthResponse, WeatherState
)
from app.services.coingecko import coingecko
from app.services.price_service import get_history, get_all_ohlc, sync_price_history
from app.services.forecast_service import generate_and_store, get_accuracy
from app.forecast.engine import run_forecast, run_seven_day
from app.core.config import settings

router = APIRouter()


@router.get("/health", response_model=HealthResponse)
async def health(db: Session = Depends(get_db)):
    from app.models.price import PriceHistory
    last = db.query(PriceHistory).order_by(PriceHistory.date.desc()).first()
    return HealthResponse(
        status="ok",
        version=settings.version,
        database="connected",
        last_price_update=last.date if last else None,
    )


@router.get("/current", response_model=CurrentPrice)
async def get_current():
    try:
        data = await coingecko.get_current_price()
        return CurrentPrice(
            price=data["usd"],
            change_24h=data.get("usd_24h_change", 0) / 100 * data["usd"],
            change_24h_pct=round(data.get("usd_24h_change", 0), 2),
            market_cap=data.get("usd_market_cap", 0),
            volume_24h=data.get("usd_24h_vol", 0),
            last_updated=datetime.fromtimestamp(
                data.get("last_updated_at", datetime.now().timestamp())
            ).isoformat(),
        )
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Price fetch failed: {e}")


@router.get("/forecast", response_model=ForecastResponse)
async def get_forecast(db: Session = Depends(get_db)):
    try:
        # Ensure we have price data
        ohlc = get_all_ohlc(db)
        if len(ohlc) < 10:
            await sync_price_history(db, days=90)
            ohlc = get_all_ohlc(db)

        current_data = await coingecko.get_current_price()
        result = run_forecast(ohlc)
        seven_day = run_seven_day(ohlc, result.score)

        return ForecastResponse(
            current=CurrentPrice(
                price=current_data["usd"],
                change_24h=current_data.get("usd_24h_change", 0) / 100 * current_data["usd"],
                change_24h_pct=round(current_data.get("usd_24h_change", 0), 2),
                market_cap=current_data.get("usd_market_cap", 0),
                volume_24h=current_data.get("usd_24h_vol", 0),
                last_updated=datetime.fromtimestamp(
                    current_data.get("last_updated_at", datetime.now().timestamp())
                ).isoformat(),
            ),
            weather=WeatherState(
                condition=result.condition,
                label=result.label,
                icon=result.icon,
                score=result.score,
            ),
            today_high=result.today_high,
            today_low=result.today_low,
            confidence=result.confidence,
            seven_day=seven_day,
            generated_at=datetime.now().isoformat(),
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/history", response_model=list[HistoricalDay])
async def get_history_route(days: int = 30, db: Session = Depends(get_db)):
    rows = get_history(db, days)
    if not rows:
        await sync_price_history(db, days=max(days, 90))
        rows = get_history(db, days)
    return [
        HistoricalDay(
            date=r.date,
            open=r.open,
            high=r.high,
            low=r.low,
            close=r.close,
            volume=r.volume,
            change_pct=r.change_pct or 0.0,
        )
        for r in rows
    ]


@router.get("/accuracy", response_model=AccuracyMetrics)
def get_accuracy_route(period: int = 30, db: Session = Depends(get_db)):
    return get_accuracy(db, period)


@router.get("/metrics", response_model=MarketMetrics)
async def get_metrics(db: Session = Depends(get_db)):
    ohlc = get_all_ohlc(db)
    if len(ohlc) < 10:
        await sync_price_history(db, days=90)
        ohlc = get_all_ohlc(db)
    result = run_forecast(ohlc)
    return MarketMetrics(
        rsi=result.rsi,
        macd_signal=result.macd_signal,
        trend=result.trend,
        volatility=result.volatility,
        support=result.support,
        resistance=result.resistance,
        sma_20=result.sma_20,
        sma_50=result.sma_50,
        ema_12=result.ema_12,
        ema_26=result.ema_26,
    )
