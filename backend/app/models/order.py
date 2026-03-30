from sqlalchemy import Column, Integer, ForeignKey, String, DateTime,Numeric
from sqlalchemy.sql import func
from app.database.db import Base


class Order(Base):

    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id"))

    # Order lifecycle status
    # pending → order created, payment not completed
    # paid → payment confirmed
    # processing → order being prepared/packed
    # shipped → courier picked up
    # delivered → order delivered to customer
    # cancelled → order cancelled/refunded
    status = Column(String, default="pending", index=True)

    total_amount = Column(Numeric(10, 2))

    # Shipping address reference (required for logistics / Shiprocket)
    shipping_address_id = Column(Integer, ForeignKey("addresses.id"))

    # Shiprocket tracking integrations
    shiprocket_order_id = Column(String(255), nullable=True)
    shiprocket_shipment_id = Column(String(255), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())