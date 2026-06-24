# backend/app/main.py
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from app.core.config import settings
from app.db.database import init_db, SessionLocal
from app.api.routes.forecast import router
from app.services.price_service import sync_price_history
from app.services.forecast_service import generate_and_store, evaluate_past_forecasts

scheduler = AsyncIOScheduler()


async def daily_job():
    """Run every day: sync prices → evaluate past → generate new forecast."""
    db = SessionLocal()
    try:
        await sync_price_history(db, days=90)
        evaluate_past_forecasts(db)
        generate_and_store(db)
    finally:
        db.close()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    init_db()

    # Initial sync on startup
    db = SessionLocal()
    try:
        await sync_price_history(db, days=90)
    except Exception as e:
        print(f"[startup] Price sync failed (will retry): {e}")
    finally:
        db.close()

    # Schedule daily job at 00:10 UTC
    scheduler.add_job(daily_job, "cron", hour=0, minute=10)
    scheduler.start()

    yield

    # Shutdown
    scheduler.shutdown()


app = FastAPI(
    title=settings.app_name,
    version=settings.version,
    description="Bitcoin market conditions forecast API — like a weather app for BTC.",
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
