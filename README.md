# ⛅ Crypto Weather

> Real-time crypto market conditions with a 7-day outlook, weather-style confidence scoring, and accuracy tracking.

![CI](https://github.com/maic93/crypto-weather/actions/workflows/ci.yml/badge.svg)
![License](https://img.shields.io/badge/license-MIT-blue)

---

## What it looks like

```
Bitcoin
⛅ Bullish

Current Price: $108,250
+2.36% today

Today's Forecast:
  High  $111,000    ↑
  Low   $106,500    ↓
  Confidence: 78%

7-Day Outlook:
  Thu  ⛅ Bullish      $105k – $112k   75%
  Fri  ⛅ Bullish      $104k – $113k   67%
  Sat  ☁️  Neutral      $103k – $114k   59%
  Sun  ☁️  Neutral      $101k – $113k   51%
  Mon  🌧️  Bearish      $99k  – $111k   43%
  Tue  ☁️  Neutral      $100k – $112k   35%
  Wed  ⛅ Bullish      $102k – $113k   27%
```

---

## Stack

| Layer    | Technology                              |
|----------|-----------------------------------------|
| Frontend | Next.js 14 · TypeScript · Tailwind CSS  |
| UI       | Framer Motion · Recharts · shadcn/ui    |
| Data     | TanStack Query                          |
| Backend  | FastAPI · Python 3.12                   |
| ML       | Pandas · NumPy · scikit-learn           |
| DB       | PostgreSQL · SQLAlchemy                 |
| Tests    | Pytest (≥90% coverage) · Vitest         |
| CI/CD    | GitHub Actions                          |
| Deploy   | Docker · docker-compose                 |

---

## Quick Start

### With Docker (recommended)

```bash
git clone https://github.com/maic93/crypto-weather
cd crypto-weather
docker compose up --build
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API docs: http://localhost:8000/docs

### Local Development

**Backend:**
```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

---

## API

| Endpoint             | Description                          |
|----------------------|--------------------------------------|
| `GET /api/health`    | Service health + DB status           |
| `GET /api/current`   | Live price                           |
| `GET /api/forecast`  | Full forecast (hero + 7-day)         |
| `GET /api/history`   | Historical OHLC (default 30d)        |
| `GET /api/accuracy`  | 30-day forecast accuracy report      |
| `GET /api/metrics`   | RSI, MACD, SMA, EMA, etc.           |

---

## Testing

```bash
# Backend (77 tests, 90% coverage)
cd backend
pytest

# Frontend (60 tests, 93% coverage)
cd frontend
npm test
```

---

## Project Structure

```
crypto-weather/
├── frontend/
│   ├── src/
│   │   ├── app/               # Next.js app router
│   │   ├── components/
│   │   │   ├── cards/         # HeroCard, ForecastCard, SevenDayCard…
│   │   │   ├── charts/        # PriceChart (recharts)
│   │   │   └── layout/        # AnimatedBackground, LoadingScreen…
│   │   ├── hooks/             # TanStack Query hooks
│   │   ├── lib/               # api client, utils
│   │   └── types/             # TypeScript interfaces
│   └── src/tests/             # Vitest unit + component tests
│
├── backend/
│   ├── app/
│   │   ├── api/routes/        # FastAPI route handlers
│   │   ├── core/              # Config, settings
│   │   ├── db/                # SQLAlchemy engine + session
│   │   ├── forecast/          # Ensemble forecast engine
│   │   ├── models/            # ORM models (PriceHistory, ForecastRecord)
│   │   ├── schemas/           # Pydantic response schemas
│   │   └── services/          # CoinGecko, price_service, forecast_service
│   └── tests/
│       ├── unit/              # Engine + service unit tests
│       └── integration/       # Full API route tests
│
├── docs/
│   ├── Architecture.md
│   ├── Forecasting.md
│   └── Contributing.md
│
├── .github/workflows/
│   ├── ci.yml                 # Test + lint + build on every push
│   ├── daily-forecast.yml     # Cron: sync + forecast + evaluate
│   └── deploy.yml             # Deploy on merge to main
│
└── docker-compose.yml
```

---

## Docs

- [Architecture](docs/Architecture.md)
- [Forecasting methodology](docs/Forecasting.md)
- [Contributing](docs/Contributing.md)

---

## License

MIT — see [LICENSE](LICENSE)
