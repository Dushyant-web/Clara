from sqlalchemy import Column, Integer, String, Numeric, Boolean, DateTime
from app.database.db import Base
from datetime import datetime


class PromoCode(Base):
    __tablename__ = "promo_codes"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(50), unique=True, nullable=False)
    discount_type = Column(String(20))
    discount_value = Column(Numeric(10,2))
    min_order_amount = Column(Numeric(10,2))
    max_discount = Column(Numeric(10,2))
    usage_limit = Column(Integer)
    used_count = Column(Integer, default=0)
    expires_at = Column(DateTime)
    active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)