from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.db import get_db
from app.models.cart_item import CartItem
from app.models.product_variant import ProductVariant
from app.models.order import Order
from app.models.order_item import OrderItem

router = APIRouter()


@router.post("/checkout")
def checkout(user_id: int, db: Session = Depends(get_db)):

    cart_items = db.query(CartItem).filter(CartItem.user_id == user_id).all()

    if not cart_items:
        raise HTTPException(status_code=400, detail="Cart is empty")

    total = 0

    for item in cart_items:

        variant = db.query(ProductVariant).filter(ProductVariant.id == item.variant_id).first()

        total += variant.price * item.quantity

    order = Order(
        user_id=user_id,
        total_amount=total
    )

    db.add(order)
    db.commit()
    db.refresh(order)

    for item in cart_items:

        variant = db.query(ProductVariant).filter(ProductVariant.id == item.variant_id).first()

        order_item = OrderItem(
            order_id=order.id,
            variant_id=item.variant_id,
            quantity=item.quantity,
            price=variant.price
        )

        db.add(order_item)

    db.commit()

    db.query(CartItem).filter(CartItem.user_id == user_id).delete()
    db.commit()

    return {
        "message": "order created",
        "order_id": order.id,
        "total": total
    }