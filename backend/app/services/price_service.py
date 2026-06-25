# backend/app/services/price_service.py
from datetime import date, timedelta
from sqlalchemy.orm import Session
from app.models.price import PriceHistory
from app.services.coingecko import coingecko


async def sync_price_history(db: Session, days: int = 90) -> int:
    """Fetch OHLC from CoinGecko and upsert into DB. Returns rows saved."""
    ohlc = await coingecko.get_ohlc(days)

    # CoinGecko OHLC: [timestamp_ms, open, high, low, close]
    rows_saved = 0
    for ts, open_, high, low, close in ohlc:
        day_str = date.fromtimestamp(ts / 1000).isoformat()
        existing = db.query(PriceHistory).filter_by(date=day_str).first()
        if existing:
            existing.open = open_
            existing.high = high
            existing.low = low
            existing.close = close
        else:
            db.add(PriceHistory(
                date=day_str,
                open=open_,
                high=high,
                low=low,
                close=close,
                volume=0.0,  # OHLC endpoint doesn't include volume
            ))
            rows_saved += 1

    # Enrich with volume from market_chart
    chart = await coingecko.get_market_chart(days)
    volumes = {
        date.fromtimestamp(ts / 1000).isoformat(): vol
        for ts, vol in chart.get("total_volumes", [])
    }
    for row in db.query(PriceHistory).all():
        if row.date in volumes:
            row.volume = volumes[row.date]

    # Compute change_pct
    rows = db.query(PriceHistory).order_by(PriceHistory.date).all()
    for i, row in enumerate(rows):
        if i > 0:
            prev = rows[i - 1].close
            row.change_pct = ((row.close - prev) / prev * 100) if prev else 0.0

    db.commit()
    return rows_saved


def get_history(db: Session, days: int = 30) -> list[PriceHistory]:
    cutoff = (date.today() - timedelta(days=days)).isoformat()
    return (
        db.query(PriceHistory)
        .filter(PriceHistory.date >= cutoff)
        .order_by(PriceHistory.date)
        .all()
    )


def get_all_ohlc(db: Session) -> list[dict]:
    rows = db.query(PriceHistory).order_by(PriceHistory.date).all()
    return [
        {
            "date": r.date,
            "open": r.open,
            "high": r.high,
            "low": r.low,
            "close": r.close,
            "volume": r.volume,
        }
        for r in rows
    ]
