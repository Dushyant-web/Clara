from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.db import get_db
from app.models.order import Order
from app.models.order_item import OrderItem
from app.models.product_variant import ProductVariant

router = APIRouter()


@router.get("/order/{order_id}")
def get_order(order_id: int, db: Session = Depends(get_db)):

    order = db.query(Order).filter(Order.id == order_id).first()

    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    items = db.query(OrderItem).filter(OrderItem.order_id == order_id).all()

    result = []

    for item in items:

        variant = db.query(ProductVariant).filter(ProductVariant.id == item.variant_id).first()

        result.append({
            "variant_id": item.variant_id,
            "quantity": item.quantity,
            "price": item.price,
            "item_total": item.price * item.quantity
        })

    return {
        "order_id": order.id,
        "status": order.status,
        "total": order.total_amount,
        "items": result
    }

@router.get("/orders/{user_id}")
def get_user_orders(user_id: int, db: Session = Depends(get_db)):

    orders = db.query(Order).filter(Order.user_id == user_id).all()

    result = []

    for order in orders:
        result.append({
            "order_id": order.id,
            "status": order.status,
            "total": order.total_amount,
            "created_at": order.created_at
        })

    return result