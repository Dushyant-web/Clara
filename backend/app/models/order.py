from sqlalchemy import Column, Integer, ForeignKey, String, DateTime
from sqlalchemy.sql import func
from app.database.db import Base


class Order(Base):

    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id"))

    status = Column(String, default="pending")

    total_amount = Column(Integer)

    created_at = Column(DateTime(timezone=True), server_default=func.now())