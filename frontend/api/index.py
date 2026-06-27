# frontend/api/index.py
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', 'backend'))

# Patch DATABASE_URL to use pg8000 driver (pure Python, works on any Python version)
db_url = os.environ.get("DATABASE_URL", "")
if db_url.startswith("postgresql://"):
    os.environ["DATABASE_URL"] = db_url.replace(
        "postgresql://", "postgresql+pg8000://", 1
    )
elif db_url.startswith("postgres://"):
    os.environ["DATABASE_URL"] = db_url.replace(
        "postgres://", "postgresql+pg8000://", 1
    )

from mangum import Mangum
from app.core.config import settings
from app.db.database import init_db
from app.api.routes.forecast import router
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title=settings.app_name, version=settings.version)

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
    return {"service": settings.app_name, "version": settings.version}

init_db()
handler = Mangum(app, lifespan="off")
