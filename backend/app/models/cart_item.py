from sqlalchemy import Column, Integer, ForeignKey, DateTime
from sqlalchemy.sql import func
from app.database.db import Base

class CartItem(Base):

    __tablename__ = "cart_items"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id"))

    variant_id = Column(Integer, ForeignKey("product_variants.id"))

    quantity = Column(Integer, default=1)

    created_at = Column(DateTime(timezone=True), server_default=func.now())