# api/cron/daily.py - at repo root
import sys
import os

db_url = os.environ.get("DATABASE_URL", "")
if db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql://", 1)
if db_url.startswith("postgresql://"):
    db_url = db_url.replace("postgresql://", "postgresql+pg8000://", 1)
if db_url:
    os.environ["DATABASE_URL"] = db_url

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', 'backend'))

from mangum import Mangum
from fastapi import FastAPI
from app.db.database import init_db, SessionLocal
from app.services.price_service import sync_price_history
from app.services.forecast_service import generate_and_store, evaluate_past_forecasts

cron_app = FastAPI()

@cron_app.get("/api/cron/daily")
async def daily_job():
    init_db()
    db = SessionLocal()
    results = {}
    try:
        synced = await sync_price_history(db, days=90)
        results["prices_synced"] = synced
        evaluated = evaluate_past_forecasts(db)
        results["forecasts_evaluated"] = evaluated
        generate_and_store(db)
        results["forecast_generated"] = True
    except Exception as e:
        results["error"] = str(e)
        return {"status": "error", **results}
    finally:
        db.close()
    return {"status": "ok", **results}

handler = Mangum(cron_app, lifespan="off")
