# api/index.py
# Vercel serverless entry point — wraps FastAPI with Mangum (ASGI adapter)
import sys
import os

# Add backend to path so all app.* imports work
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

from mangum import Mangum
from app.core.config import settings
from app.db.database import init_db
from app.api.routes.forecast import router
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title=settings.app_name,
    version=settings.version,
    description="Bitcoin market conditions forecast API.",
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

# Initialize DB tables on cold start
init_db()

# Mangum wraps the ASGI app for AWS Lambda / Vercel
handler = Mangum(app, lifespan="off")
