from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.db import get_db
from app.models.cart_item import CartItem
from app.models.product_variant import ProductVariant
from app.models.order import Order
from app.models.order_item import OrderItem
from app.models.user import User
from app.services.invoice_service import generate_invoice
from app.services.email_service import send_email

router = APIRouter()


@router.post("/checkout")
def checkout(user_id: int, idempotency_key: str | None = None, db: Session = Depends(get_db)):

    # --- Idempotency check (prevents duplicate orders if user clicks pay twice) ---
    if idempotency_key:
        existing_order = db.query(Order).filter(
            Order.user_id == user_id,
            Order.status == "pending"
        ).first()

        if existing_order:
            return {
                "message": "order already created",
                "order_id": existing_order.id,
                "total": existing_order.total_amount
            }

    # Start single transaction for entire checkout
    with db.begin():

        cart_items = db.query(CartItem).filter(CartItem.user_id == user_id).all()

        if not cart_items:
            raise HTTPException(status_code=400, detail="Cart is empty")

        total = 0

        for item in cart_items:

            variant = db.query(ProductVariant).filter(ProductVariant.id == item.variant_id).with_for_update().first()

            if variant.stock < item.quantity:
                raise HTTPException(status_code=400, detail="Product out of stock")

            total += variant.price * item.quantity

        order = Order(
            user_id=user_id,
            total_amount=total
        )

        db.add(order)
        db.flush()  # ensures order gets an ID before creating order_items
        db.refresh(order)

        order_items = []

        for item in cart_items:

            variant = db.query(ProductVariant).filter(ProductVariant.id == item.variant_id).with_for_update().first()

            variant.stock -= item.quantity

            order_item = OrderItem(
                order_id=order.id,
                variant_id=item.variant_id,
                quantity=item.quantity,
                price=variant.price
            )

            db.add(order_item)
            order_items.append(order_item)

        db.query(CartItem).filter(CartItem.user_id == user_id).delete()

    invoice_path = generate_invoice(order, order_items)

    user = db.query(User).filter(User.id == user_id).first()

    if not user or not hasattr(user, "email"):
        raise HTTPException(status_code=400, detail="User email not available")

    try:
        send_email(
            to_email=user.email,
            subject="Order Confirmation - CLARA",
            body=f"""
Thank you for your order.

Order ID: {order.id}
Total: ₹{order.total_amount}

Track your order here:
https://clara.com/track/{order.id}

Invoice attached.
""",
            attachment=invoice_path
        )
    except Exception as e:
        print("Email sending failed:", e)

    return {
        "message": "order created",
        "order_id": order.id,
        "total": total
    }