from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, UniqueConstraint, Numeric
from app.database.db import Base
from datetime import datetime


class ProductVariant(Base):

    __tablename__ = "product_variants"
    __table_args__ = (
        UniqueConstraint("product_id", "color", "size", name="unique_variant_per_product"),
    )

    id = Column(Integer, primary_key=True, index=True)

    product_id = Column(Integer, ForeignKey("products.id"))

    size = Column(String)
    color = Column(String)

    sku = Column(String)
    image_url = Column(String)

    price = Column(Numeric(10, 2))

    stock = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow)