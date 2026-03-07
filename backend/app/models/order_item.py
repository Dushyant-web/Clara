from sqlalchemy import Column, Integer, ForeignKey
from app.database.db import Base


class OrderItem(Base):

    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True)

    order_id = Column(Integer, ForeignKey("orders.id"))

    variant_id = Column(Integer, ForeignKey("product_variants.id"))

    quantity = Column(Integer)

    price = Column(Integer)