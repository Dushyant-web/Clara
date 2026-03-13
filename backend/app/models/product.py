from sqlalchemy import Column, Integer, String, Text, Numeric, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.database.db import Base

class Product(Base):

    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String, nullable=False)

    slug = Column(String, unique=True)

    description = Column(Text)

    price = Column(Numeric(10,2))

    compare_price = Column(Numeric(10,2))

    brand = Column(String)

    main_image = Column(String, nullable=True)
    hover_image = Column(String, nullable=True)

    category_id = Column(Integer, ForeignKey("categories.id"))
    collection_id = Column(Integer, ForeignKey("collections.id"), nullable=True)

    status = Column(String, default="active")

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    updated_at = Column(DateTime(timezone=True), server_default=func.now())
