# frontend/api/index.py
# Minimal Vercel serverless handler - serves pre-computed data from DB
# Heavy ML computation happens in the daily cron job only
import sys
import os

# Patch DB URL before any imports
db_url = os.environ.get("DATABASE_URL", "")
if db_url.startswith("postgresql://") or db_url.startswith("postgres://"):
    os.environ["DATABASE_URL"] = db_url.replace(
        "postgres://", "postgresql://"
    ).replace("postgresql://", "postgresql+pg8000://", 1)

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', 'backend'))

from mangum import Mangum
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from app.db.database import init_db, get_db
from app.core.config import settings

# Import only lightweight routes - NOT the forecast engine
from app.api.routes.forecast import router

app = FastAPI(title=settings.app_name, version=settings.version)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["GET"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api")

@app.get("/")
def root():
    return {"service": settings.app_name, "version": settings.version}

try:
    init_db()
except Exception as e:
    print(f"DB init warning: {e}")

handler = Mangum(app, lifespan="off")
