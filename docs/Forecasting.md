# Forecasting Methodology

Crypto Weather uses an **ensemble of technical signals** to produce a normalized score between 0 and 100, which maps to a weather condition. It does not claim to predict exact prices.

---

## The Score

The composite score is a weighted average of four signal groups:

| Signal Group   | Weight | Description                              |
|----------------|--------|------------------------------------------|
| Trend          | 35%    | Price vs SMA20/SMA50, recent momentum   |
| RSI            | 20%    | Relative Strength Index (14-period)     |
| MACD           | 20%    | MACD histogram normalized to price      |
| Market Structure | 15%  | Price position between support/resistance|
| Volatility     | 10%    | Historical vol penalizes extreme scores |

Each signal is individually normalized to 0–100 before weighting.

---

## Weather Conditions

| Score   | Condition      | Icon |
|---------|----------------|------|
| 90–100  | Strong Bullish | ☀️   |
| 70–89   | Bullish        | ⛅   |
| 45–69   | Neutral        | ☁️   |
| 25–44   | Bearish        | 🌧️   |
| 0–24    | Strong Bearish | ⛈️   |

---

## Confidence Score

Confidence (30–92%) is derived from:

1. **Extremeness** — how far the score is from neutral (50)
2. **Consistency** — fraction of recent days moving in the forecast direction
3. **Volatility** — higher volatility reduces confidence

Confidence is intentionally capped at 92% — we never claim certainty.

---

## 7-Day Outlook

Each future day is projected using:

1. **Mean reversion** — the score drifts 15% back toward neutral each day
2. **Seeded noise** — deterministic pseudo-random variation keeps forecasts stable across refreshes
3. **Range widening** — the high/low spread grows ~6% per day to reflect increasing uncertainty

---

## Accuracy Tracking

Every forecast is stored. Once the target date passes and actual data is available, the system computes:

- **Direction accuracy** — did we predict up/down correctly?
- **Within range** — did actual price land between predicted high and low?
- **MAE / MAPE** — mean absolute error and mean absolute percentage error

These are exposed at `/api/accuracy` and displayed in the dashboard.

---

## Limitations

- This is a technical analysis system, not a machine learning model trained on future data.
- No fundamental data (news, sentiment, on-chain) is used.
- Crypto markets are highly volatile and subject to external shocks that no model can predict.
- **This is not financial advice.** Use it for fun and education only.
