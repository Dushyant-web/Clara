from sqlalchemy import Column, Integer, String, ForeignKey
from app.database.db import Base


class ProductVariant(Base):

    __tablename__ = "product_variants"

    id = Column(Integer, primary_key=True, index=True)

    product_id = Column(Integer, ForeignKey("products.id"))

    sku = Column(String)

    price = Column(Integer)

    stock = Column(Integer)