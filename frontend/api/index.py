# frontend/api/index.py
import sys
import os

# Patch DB URL before any imports
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
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Crypto Weather API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET"],
    allow_headers=["*"],
)

# Import routes after path and env are set
from app.api.routes.forecast import router
app.include_router(router, prefix="/api")

@app.get("/")
def root():
    return {"service": "Crypto Weather API", "version": "1.0.0"}

# Init DB tables on cold start
try:
    from app.db.database import init_db
    init_db()
except Exception as e:
    print(f"DB init warning: {e}")

handler = Mangum(app, lifespan="off")
