# backend/app/db/database.py
import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

def _get_sync_url(url: str) -> str:
    """Convert asyncpg URL back to sync for SQLAlchemy sync engine."""
    return url.replace("postgresql+asyncpg://", "postgresql://")

_raw_url = os.environ.get("DATABASE_URL", "sqlite:///./crypto_weather.db")
DATABASE_URL = _get_sync_url(_raw_url)

connect_args = {"check_same_thread": False} if "sqlite" in DATABASE_URL else {}

engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    from app.models import price, forecast  # noqa: F401
    Base.metadata.create_all(bind=engine)
