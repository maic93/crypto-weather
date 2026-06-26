# backend/tests/conftest.py
import pytest
from unittest.mock import AsyncMock, patch, MagicMock
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.db.database import Base, get_db

TEST_DB_URL = "sqlite:///./test_crypto_weather.db"

engine = create_engine(TEST_DB_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="session", autouse=True)
def create_tables():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)
    import os
    if os.path.exists("test_crypto_weather.db"):
        os.remove("test_crypto_weather.db")


@pytest.fixture
def db():
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.rollback()
        session.close()


@pytest.fixture
def client(db):
    async def _noop_sync(*args, **kwargs):
        return 0

    mock_scheduler = MagicMock()
    mock_scheduler.add_job = MagicMock()
    mock_scheduler.start = MagicMock()
    mock_scheduler.shutdown = MagicMock()

    with patch("app.main.sync_price_history", _noop_sync), \
         patch("app.main._scheduler", mock_scheduler):
        from app.main import app
        def override_get_db():
            try:
                yield db
            finally:
                pass
        app.dependency_overrides[get_db] = override_get_db
        with TestClient(app) as c:
            yield c
        app.dependency_overrides.clear()


@pytest.fixture
def sample_ohlc():
    import random
    from datetime import date, timedelta
    random.seed(42)
    rows = []
    price = 65_000.0
    today = date.today()
    for i in range(30):
        d = (today - timedelta(days=30 - i)).isoformat()
        change = random.uniform(-0.04, 0.05)
        open_ = price
        close = price * (1 + change)
        high = max(open_, close) * random.uniform(1.001, 1.02)
        low  = min(open_, close) * random.uniform(0.98, 0.999)
        rows.append({"date": d, "open": open_, "high": high, "low": low,
                     "close": close, "volume": random.uniform(20e9, 40e9)})
        price = close
    return rows


@pytest.fixture
def populated_db(db, sample_ohlc):
    from app.models.price import PriceHistory
    for row in sample_ohlc:
        db.add(PriceHistory(**row, change_pct=0.0, market_cap=0.0))
    db.commit()
    return db


import uuid

@pytest.fixture
def isolated_db():
    """A fresh DB session with clean tables for each test."""
    session = TestingSessionLocal()
    # Delete all price history to avoid unique constraint issues
    from app.models.price import PriceHistory
    session.query(PriceHistory).delete()
    session.commit()
    try:
        yield session
    finally:
        session.rollback()
        session.close()
