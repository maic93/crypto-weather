# backend/app/forecast/engine.py
"""
Ensemble forecast engine combining:
  1. Trend (SMA / EMA crossover)
  2. Momentum (RSI, MACD)
  3. Volatility (ATR, historical vol)
  4. Market structure (support / resistance)

Outputs a 0–100 score → WeatherCondition + confidence.
"""
from __future__ import annotations

import numpy as np
import pandas as pd
from dataclasses import dataclass
from typing import Literal

WeatherCondition = Literal[
    "strong_bullish", "bullish", "neutral", "bearish", "strong_bearish"
]

WEATHER_MAP = [
    (90, "strong_bullish", "Strong Bullish", "☀️"),
    (70, "bullish",        "Bullish",        "⛅"),
    (45, "neutral",        "Neutral",        "☁️"),
    (25, "bearish",        "Bearish",        "🌧️"),
    (0,  "strong_bearish", "Strong Bearish", "⛈️"),
]


@dataclass
class SignalResult:
    score: float          # 0–100
    confidence: float     # 0–100
    condition: WeatherCondition
    label: str
    icon: str
    rsi: float
    macd_signal: str
    trend: str
    volatility: str
    support: float
    resistance: float
    sma_20: float
    sma_50: float
    ema_12: float
    ema_26: float
    atr: float
    today_high: float
    today_low: float


# ── Individual signal calculators ─────────────────────────────────────────────

def _sma(series: pd.Series, window: int) -> pd.Series:
    return series.rolling(window, min_periods=1).mean()


def _ema(series: pd.Series, span: int) -> pd.Series:
    return series.ewm(span=span, adjust=False).mean()


def _rsi(series: pd.Series, period: int = 14) -> float:
    delta = series.diff()
    gain = delta.clip(lower=0).rolling(period, min_periods=1).mean()
    loss = (-delta.clip(upper=0)).rolling(period, min_periods=1).mean()
    # When loss is 0, RSI = 100 (pure uptrend); when gain is 0, RSI = 0
    loss_safe = loss.replace(0, np.nan)
    rs = gain / loss_safe
    rsi = 100 - (100 / (1 + rs))
    # All-up = 100, All-down = 0, no data = 50
    rsi = rsi.fillna(gain.apply(lambda g: 100.0 if g > 0 else 0.0))
    return float(rsi.iloc[-1]) if not rsi.empty else 50.0


def _macd(series: pd.Series) -> tuple[float, float, float]:
    ema12 = _ema(series, 12)
    ema26 = _ema(series, 26)
    macd_line = ema12 - ema26
    signal_line = _ema(macd_line, 9)
    histogram = macd_line - signal_line
    return float(macd_line.iloc[-1]), float(signal_line.iloc[-1]), float(histogram.iloc[-1])


def _atr(df: pd.DataFrame, period: int = 14) -> float:
    high = df["high"]
    low = df["low"]
    close_prev = df["close"].shift(1)
    tr = pd.concat([
        high - low,
        (high - close_prev).abs(),
        (low - close_prev).abs(),
    ], axis=1).max(axis=1)
    return float(tr.rolling(period, min_periods=1).mean().iloc[-1])


def _support_resistance(df: pd.DataFrame, window: int = 20) -> tuple[float, float]:
    recent = df.tail(window)
    return float(recent["low"].min()), float(recent["high"].max())


def _historical_volatility(series: pd.Series, period: int = 14) -> float:
    returns = series.pct_change().dropna()
    return float(returns.tail(period).std() * np.sqrt(365) * 100)


# ── Signal scorers (each returns 0–100) ───────────────────────────────────────

def _score_trend(df: pd.DataFrame) -> float:
    close = df["close"]
    sma20 = _sma(close, 20).iloc[-1]
    sma50 = _sma(close, 50).iloc[-1]
    current = close.iloc[-1]

    scores = []
    # Price vs SMA20
    ratio20 = (current - sma20) / sma20 * 100
    scores.append(min(max(50 + ratio20 * 5, 0), 100))
    # SMA20 vs SMA50
    cross = (sma20 - sma50) / sma50 * 100
    scores.append(min(max(50 + cross * 3, 0), 100))
    # Recent 7d momentum
    if len(close) >= 7:
        week_change = (current - close.iloc[-7]) / close.iloc[-7] * 100
        scores.append(min(max(50 + week_change * 3, 0), 100))

    return float(np.mean(scores))


def _score_rsi(rsi: float) -> float:
    """RSI 70 → oversold bullish. Centre at 50 RSI = score 50."""
    if rsi >= 70:
        return 80.0   # Overbought – strong but might reverse
    if rsi <= 30:
        return 25.0   # Oversold – bearish momentum
    return (rsi - 30) / 40 * 100  # Linear mapping 30→0%, 70→100%


def _score_macd(histogram: float, close: float) -> float:
    norm = (histogram / close) * 10_000
    return float(min(max(50 + norm * 15, 0), 100))


def _score_volatility(vol: float, atr_pct: float) -> tuple[float, str]:
    """Lower volatility = more confidence in trend; extreme vol is bearish signal."""
    if vol < 30:
        return 60.0, "low"
    if vol < 60:
        return 50.0, "medium"
    if vol < 90:
        return 35.0, "high"
    return 20.0, "extreme"


def _score_structure(close: float, support: float, resistance: float) -> float:
    span = resistance - support
    if span <= 0:
        return 50.0
    position = (close - support) / span  # 0=at support, 1=at resistance
    return float(position * 100)


# ── Ensemble ──────────────────────────────────────────────────────────────────

WEIGHTS = {
    "trend":     0.35,
    "rsi":       0.20,
    "macd":      0.20,
    "structure": 0.15,
    "vol":       0.10,
}


def _condition_from_score(score: float) -> tuple[WeatherCondition, str, str]:
    for threshold, cond, label, icon in WEATHER_MAP:
        if score >= threshold:
            return cond, label, icon  # type: ignore
    return "strong_bearish", "Strong Bearish", "⛈️"


def _confidence(df: pd.DataFrame, score: float, vol: float) -> float:
    """
    Confidence is higher when:
    - Score is far from neutral (50)
    - Volatility is lower
    - Recent days are consistent in direction
    """
    extremeness = abs(score - 50) / 50  # 0=neutral, 1=extreme

    # Consistency: fraction of last 10 days moving in predicted direction
    close = df["close"]
    if len(close) >= 10:
        changes = close.diff().dropna().tail(10)
        going_up = (changes > 0).sum() / len(changes)
        consistency = going_up if score > 50 else (1 - going_up)
    else:
        consistency = 0.5

    vol_factor = max(0, 1 - vol / 150)  # high vol → low confidence

    raw = (extremeness * 0.4 + consistency * 0.4 + vol_factor * 0.2) * 100
    # Clamp between 30 and 92 — never claim certainty
    return round(min(max(raw, 30), 92), 1)


def _forecast_range(close: float, atr: float, condition: WeatherCondition) -> tuple[float, float]:
    """Today's expected high/low based on ATR and condition bias."""
    bias_map = {
        "strong_bullish": 0.6,
        "bullish":        0.3,
        "neutral":        0.0,
        "bearish":       -0.3,
        "strong_bearish":-0.6,
    }
    bias = bias_map.get(condition, 0.0)
    center = close + bias * atr
    return round(center + atr * 0.8, 2), round(center - atr * 0.8, 2)


def _seven_day_forecast(
    df: pd.DataFrame, base_score: float, close: float, atr: float
) -> list[dict]:
    """Project 7 days forward with decaying confidence and mean-reversion."""
    days = []
    score = base_score

    for i in range(1, 8):
        from datetime import date, timedelta
        target = date.today() + timedelta(days=i)

        # Mean reversion: score drifts toward 50
        score = score * 0.85 + 50 * 0.15
        # Small random noise for realism (deterministic seed from close price)
        rng = np.random.default_rng(int(close) + i)
        noise = float(rng.normal(0, 3))
        day_score = float(np.clip(score + noise, 0, 100))

        cond, label, icon = _condition_from_score(day_score)
        bias_map = {
            "strong_bullish": 0.5, "bullish": 0.25,
            "neutral": 0.0, "bearish": -0.25, "strong_bearish": -0.5,
        }
        bias = bias_map.get(cond, 0.0)
        spread = atr * (1 + i * 0.06)   # widen range further out
        center = close + bias * atr * (i * 0.3)
        confidence = max(30, 92 - i * 8)

        days.append({
            "date": target.isoformat(),
            "condition": cond,
            "label": label,
            "icon": icon,
            "high": round(center + spread, 2),
            "low": round(center - spread, 2),
            "confidence": confidence,
            "score": round(day_score, 1),
        })

    return days


# ── Public entry point ─────────────────────────────────────────────────────────

def run_forecast(ohlc_rows: list[dict]) -> SignalResult:
    """
    ohlc_rows: list of dicts with keys date, open, high, low, close, volume
    Returns a full SignalResult.
    """
    df = pd.DataFrame(ohlc_rows).sort_values("date").reset_index(drop=True)
    df = df.astype({"open": float, "high": float, "low": float, "close": float, "volume": float})

    close = df["close"]
    current = float(close.iloc[-1])

    sma20 = float(_sma(close, 20).iloc[-1])
    sma50 = float(_sma(close, 50).iloc[-1])
    ema12 = float(_ema(close, 12).iloc[-1])
    ema26 = float(_ema(close, 26).iloc[-1])
    rsi = _rsi(close)
    macd_val, macd_sig, macd_hist = _macd(close)
    atr = _atr(df)
    support, resistance = _support_resistance(df)
    vol = _historical_volatility(close)

    # Individual scores
    s_trend = _score_trend(df)
    s_rsi = _score_rsi(rsi)
    s_macd = _score_macd(macd_hist, current)
    s_vol, vol_label = _score_volatility(vol, atr / current * 100)
    s_struct = _score_structure(current, support, resistance)

    # Ensemble weighted score
    score = (
        s_trend     * WEIGHTS["trend"]   +
        s_rsi       * WEIGHTS["rsi"]     +
        s_macd      * WEIGHTS["macd"]    +
        s_struct    * WEIGHTS["structure"] +
        s_vol       * WEIGHTS["vol"]
    )
    score = float(np.clip(score, 0, 100))

    condition, label, icon = _condition_from_score(score)
    confidence = _confidence(df, score, vol)
    today_high, today_low = _forecast_range(current, atr, condition)

    # Trend direction
    if sma20 > sma50 and close.iloc[-1] > sma20:
        trend = "up"
    elif sma20 < sma50 and close.iloc[-1] < sma20:
        trend = "down"
    else:
        trend = "sideways"

    # MACD signal
    if macd_hist > 0:
        macd_signal = "bullish"
    elif macd_hist < 0:
        macd_signal = "bearish"
    else:
        macd_signal = "neutral"

    return SignalResult(
        score=round(score, 1),
        confidence=confidence,
        condition=condition,
        label=label,
        icon=icon,
        rsi=round(rsi, 1),
        macd_signal=macd_signal,
        trend=trend,
        volatility=vol_label,
        support=round(support, 2),
        resistance=round(resistance, 2),
        sma_20=round(sma20, 2),
        sma_50=round(sma50, 2),
        ema_12=round(ema12, 2),
        ema_26=round(ema26, 2),
        atr=round(atr, 2),
        today_high=today_high,
        today_low=today_low,
    )


def run_seven_day(ohlc_rows: list[dict], base_score: float) -> list[dict]:
    df = pd.DataFrame(ohlc_rows).sort_values("date").reset_index(drop=True)
    close = float(df["close"].iloc[-1])
    atr = _atr(df)
    return _seven_day_forecast(df, base_score, close, atr)
