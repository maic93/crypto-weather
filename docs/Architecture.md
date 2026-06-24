# Architecture

## Overview

Crypto Weather is a monorepo with a Next.js frontend and a FastAPI backend. They communicate via a REST API. The backend fetches live data from CoinGecko, runs the forecast engine, and stores results in PostgreSQL (SQLite for local dev).

```
Browser ──► Next.js (frontend) ──► FastAPI (backend) ──► CoinGecko API
                                         │
                                    PostgreSQL
                                  (price history +
                                   forecast records)
```

---

## Frontend

**Framework:** Next.js 14 (App Router)  
**Language:** TypeScript (strict)  
**Styling:** Tailwind CSS + custom glassmorphism utilities  
**Animation:** Framer Motion  
**Data fetching:** TanStack Query (auto-refresh every 5 min)  
**Charts:** Recharts

Key design decisions:
- All API calls go through `src/lib/api.ts` — single source of truth for URLs and error handling
- TanStack Query handles caching, background refresh, and loading/error states
- Background gradient animates based on the current market condition (bullish = blue/green, bearish = purple/red)
- Components are purely presentational — all data lives in hooks

---

## Backend

**Framework:** FastAPI  
**Language:** Python 3.12  
**Database:** SQLAlchemy ORM + PostgreSQL (SQLite for tests)  
**Scheduler:** APScheduler (daily cron at 00:10 UTC)

### Layers

```
API Routes (app/api/routes/)
    │
    ▼
Services (app/services/)
  ├── coingecko.py     — HTTP client with caching + rate limiting
  ├── price_service.py — DB read/write for price history
  └── forecast_service.py — generate, store, evaluate forecasts
    │
    ▼
Forecast Engine (app/forecast/engine.py)
  └── Pure functions: run_forecast(), run_seven_day()
    │
    ▼
DB Models (app/models/)
  ├── PriceHistory     — daily OHLC
  └── ForecastRecord   — per-day forecasts + actuals
```

### Caching strategy

- CoinGecko responses are in-memory cached with TTLs:
  - Current price: 60 seconds
  - OHLC / market chart: 60 minutes
- Rate limiting: minimum 1.2s between CoinGecko requests

---

## Data Flow

### On startup
1. `init_db()` — create tables if not exist
2. `sync_price_history(days=90)` — pull 90 days of OHLC from CoinGecko

### On `/api/forecast` request
1. Check DB has ≥10 rows; sync if not
2. Fetch live price from CoinGecko
3. Run `run_forecast(ohlc)` → SignalResult
4. Run `run_seven_day(ohlc, score)` → list of 7 DayForecast dicts
5. Return composed ForecastResponse

### Daily cron (00:10 UTC)
1. Sync latest prices
2. Evaluate past forecasts (fill in actuals)
3. Generate and store new 7-day forecast

---

## Testing

- **Backend:** Pytest with SQLite in-memory DB. CoinGecko is monkeypatched in all integration tests. Target: ≥85% coverage.
- **Frontend:** Vitest + React Testing Library. Framer Motion is mocked. Target: ≥70% coverage.
- **CI:** GitHub Actions runs both suites on every push.
