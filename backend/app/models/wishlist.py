from sqlalchemy import Column, Integer, DateTime
from datetime import datetime
from app.database import Base

class Wishlist(Base):
    __tablename__ = "wishlist"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False)
    product_id = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)