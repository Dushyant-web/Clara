from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from datetime import datetime
from app.database.db import Base

class ProductImage(Base):
    __tablename__ = "product_images"

    id = Column(Integer, primary_key=True)
    product_id = Column(Integer, ForeignKey("products.id"))
    image_url = Column(String)
    # image role: main | hover | gallery
    type = Column(String, default="gallery")

    # order inside gallery
    position = Column(Integer, default=0)

    created_at = Column(DateTime, default=datetime.utcnow)