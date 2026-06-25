# backend/app/schemas/forecast.py
from pydantic import BaseModel, Field
from typing import Literal, Optional

WeatherCondition = Literal[
    "strong_bullish", "bullish", "neutral", "bearish", "strong_bearish"
]


class WeatherState(BaseModel):
    condition: WeatherCondition
    label: str
    icon: str
    score: float = Field(ge=0, le=100)


class CurrentPrice(BaseModel):
    price: float
    change_24h: float
    change_24h_pct: float
    market_cap: float
    volume_24h: float
    last_updated: str


class DayForecast(BaseModel):
    date: str
    condition: WeatherCondition
    label: str
    icon: str
    high: float
    low: float
    confidence: float = Field(ge=0, le=100)
    score: float = Field(ge=0, le=100)


class ForecastResponse(BaseModel):
    current: CurrentPrice
    weather: WeatherState
    today_high: float
    today_low: float
    confidence: float
    seven_day: list[DayForecast]
    generated_at: str


class HistoricalDay(BaseModel):
    date: str
    open: float
    high: float
    low: float
    close: float
    volume: float
    change_pct: float


class AccuracyMetrics(BaseModel):
    period_days: int
    mean_absolute_error: float
    mean_absolute_pct_error: float
    direction_accuracy: float
    within_range_accuracy: float
    total_forecasts: int


class MarketMetrics(BaseModel):
    rsi: float
    macd_signal: Literal["bullish", "bearish", "neutral"]
    trend: Literal["up", "down", "sideways"]
    volatility: Literal["low", "medium", "high", "extreme"]
    support: float
    resistance: float
    sma_20: float
    sma_50: float
    ema_12: float
    ema_26: float


class HealthResponse(BaseModel):
    status: str
    version: str
    database: str
    last_price_update: Optional[str] = None
