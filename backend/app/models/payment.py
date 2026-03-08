from sqlalchemy import Column, Integer, String, Numeric, ForeignKey, DateTime
from sqlalchemy.sql import func
from app.database.db import Base


class Payment(Base):

    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)

    order_id = Column(Integer, ForeignKey("orders.id"))

    provider = Column(String)

    payment_id = Column(String)

    status = Column(String)

    amount = Column(Numeric)

    created_at = Column(DateTime(timezone=True), server_default=func.now())