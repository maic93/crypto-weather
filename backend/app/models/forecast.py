# backend/app/models/forecast.py
from sqlalchemy import Column, Integer, Float, String, DateTime, func
from app.db.database import Base


class ForecastRecord(Base):
    __tablename__ = "forecast_records"

    id = Column(Integer, primary_key=True, index=True)
    forecast_date = Column(String, index=True, nullable=False)   # date the forecast was MADE
    target_date = Column(String, index=True, nullable=False)     # date the forecast is FOR
    predicted_high = Column(Float, nullable=False)
    predicted_low = Column(Float, nullable=False)
    predicted_close = Column(Float, nullable=False)
    condition = Column(String, nullable=False)
    score = Column(Float, nullable=False)
    confidence = Column(Float, nullable=False)

    # Filled in after target_date passes
    actual_close = Column(Float, nullable=True)
    actual_high = Column(Float, nullable=True)
    actual_low = Column(Float, nullable=True)
    direction_correct = Column(Integer, nullable=True)   # 1 or 0
    within_range = Column(Integer, nullable=True)        # 1 or 0
    absolute_error = Column(Float, nullable=True)
    absolute_pct_error = Column(Float, nullable=True)

    created_at = Column(DateTime, server_default=func.now())
