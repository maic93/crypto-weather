# Contributing

Thank you for your interest in Crypto Weather! Here's how to get started.

---

## Development Setup

```bash
git clone https://github.com/YOUR_USERNAME/crypto-weather
cd crypto-weather

# Backend
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload

# Frontend (new terminal)
cd frontend
npm install
npm run dev
```

---

## Running Tests

```bash
# Backend (from /backend)
pytest

# Frontend (from /frontend)
npm test
```

All PRs must pass CI (tests + linting + build).

---

## Code Standards

**Backend:**
- Type hints on all functions
- Pydantic schemas for all API responses
- No business logic in route handlers — use services
- New forecast signals go in `app/forecast/engine.py`

**Frontend:**
- TypeScript strict mode — no `any`
- All new components go in `src/components/`
- New API endpoints get a hook in `src/hooks/useWeatherData.ts`
- Prefer Tailwind utilities over inline styles

---

## Pull Request Guidelines

1. Branch from `develop`, not `main`
2. One feature/fix per PR
3. Include tests for new functionality
4. Update relevant docs if you change behaviour
5. Keep PRs focused and under ~400 lines

---

## Submitting Issues

Please include:
- What you expected vs. what happened
- Steps to reproduce
- Your OS + Python/Node version
- Any relevant error output

---

## Ideas for Contributions

- Add Ethereum / SOL support
- Sentiment signal from news API
- Fear & Greed index integration
- PWA support (install to home screen)
- Localization (non-USD currencies)
- Dark/light mode toggle
