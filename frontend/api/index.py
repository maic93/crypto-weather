# frontend/api/index.py
# Vercel serverless entry point
import sys
import os

# Path to backend from frontend/api/
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', 'backend'))

from mangum import Mangum
from app.core.config import settings
from app.db.database import init_db
from app.api.routes.forecast import router
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title=settings.app_name,
    version=settings.version,
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
    return {"service": settings.app_name, "version": settings.version}

init_db()
handler = Mangum(app, lifespan="off")
