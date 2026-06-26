# backend/app/main.py
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.db.database import init_db, SessionLocal
from app.api.routes.forecast import router
from app.services.price_service import sync_price_history
from app.services.forecast_service import generate_and_store, evaluate_past_forecasts

# Only use APScheduler when running locally (not on Vercel serverless)
_scheduler = None

if settings.use_scheduler:
    from apscheduler.schedulers.asyncio import AsyncIOScheduler
    _scheduler = AsyncIOScheduler()


async def daily_job():
    db = SessionLocal()
    try:
        await sync_price_history(db, days=90)
        evaluate_past_forecasts(db)
        generate_and_store(db)
    finally:
        db.close()


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    db = SessionLocal()
    try:
        await sync_price_history(db, days=90)
    except Exception as e:
        print(f"[startup] Price sync failed: {e}")
    finally:
        db.close()

    if _scheduler:
        _scheduler.add_job(daily_job, "cron", hour=0, minute=10)
        _scheduler.start()

    yield

    if _scheduler:
        _scheduler.shutdown()


app = FastAPI(
    title=settings.app_name,
    version=settings.version,
    description="Crypto market conditions forecast API.",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["GET"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api")


@app.get("/")
def root():
    return {"service": settings.app_name, "version": settings.version, "docs": "/docs"}
