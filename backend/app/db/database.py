# backend/app/db/database.py
import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

_raw_url = os.environ.get("DATABASE_URL", "sqlite:///./crypto_weather.db")

# Normalize URL variants to what SQLAlchemy expects
DATABASE_URL = (
    _raw_url
    .replace("postgres://", "postgresql://")
    .replace("postgresql+asyncpg://", "postgresql://")
)

if "sqlite" in DATABASE_URL:
    connect_args = {"check_same_thread": False}
    engine = create_engine(DATABASE_URL, connect_args=connect_args)
elif "pg8000" in _raw_url:
    # pg8000 driver path (Vercel) — needs ssl
    engine = create_engine(
        DATABASE_URL.replace("postgresql://", "postgresql+pg8000://"),
        connect_args={"ssl_context": True},
    )
else:
    # Standard psycopg2 path (local/Docker)
    engine = create_engine(DATABASE_URL)

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
