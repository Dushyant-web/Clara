from sqlalchemy import Column, Integer, Text, String, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.types import TIMESTAMP
from app.database.db import Base


class VariantImage(Base):
    __tablename__ = "variant_images"

    id = Column(Integer, primary_key=True, index=True)
    variant_id = Column(Integer, ForeignKey("product_variants.id"))
    image_url = Column(Text, nullable=False)
    type = Column(String, default="gallery")  # main | hover | gallery
    position = Column(Integer, default=0)
    created_at = Column(TIMESTAMP, server_default=func.now())