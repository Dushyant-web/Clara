from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from datetime import datetime, timedelta

from app.database.db import get_db
from app.models.cart_item import CartItem
from app.models.product_variant import ProductVariant
from app.models.product import Product
from app.models.inventory_reservation import InventoryReservation
from app.models.order import Order
from app.models.order_item import OrderItem
from app.models.payment import Payment
from app.utils.jwt_handler import get_current_user_id


router = APIRouter()


@router.post("/shipping/rates")
def get_shipping_rates(pincode: str | None = None):
    """
    Returns available shipping options.
    Hardcoded tiers — extend with Shiprocket rate API if needed.
    """
    return {
        "rates": [
            {
                "id": "standard",
                "label": "Standard Delivery",
                "description": "3-5 Business Days",
                "price": 60
            },
            {
                "id": "express",
                "label": "Express Delivery",
                "description": "1-2 Business Days",
                "price": 150
            }
        ]
    }


# Ensure index exists for fast reservation expiry cleanup
from sqlalchemy import text
from sqlalchemy import func

def ensure_reservation_index(db: Session):
    try:
        db.execute(text(
            "CREATE INDEX IF NOT EXISTS idx_inventory_reservation_expires_at "
            "ON inventory_reservation (expires_at);"
        ))
        db.commit()
    except Exception:
        db.rollback()


@router.post("/checkout")
def checkout(user_id: int, address_id: int, payment_method: str = "prepaid", promo_code: str | None = None, idempotency_key: str | None = None, db: Session = Depends(get_db), auth_user_id: int = Depends(get_current_user_id)):
    if auth_user_id != user_id:
        raise HTTPException(status_code=403, detail="Cannot checkout for another user")

    # Server-side shipping cost — never trust frontend.
    # Prepaid = free, COD = ₹99 handling fee.
    if payment_method == "cod":
        shipping_cost = 99.0
    elif payment_method == "prepaid":
        shipping_cost = 0.0
    else:
        raise HTTPException(status_code=400, detail="Invalid payment method")

    ensure_reservation_index(db)
    # --- Cleanup expired inventory reservations using expires_at ---
    now = datetime.utcnow()
    db.query(InventoryReservation).filter(
        InventoryReservation.expires_at < now
    ).delete()
    db.commit()

    # --- Cleanup previous unpaid order ---
    existing_order = db.query(Order).filter(
        Order.user_id == user_id,
        Order.status == "pending"
    ).order_by(Order.created_at.desc()).first()

    if existing_order:

        # check if payment already exists for this order
        payment_exists = db.query(Payment).filter(
            Payment.order_id == existing_order.id
        ).first()

        # only delete the order if no payment record exists
        if not payment_exists:

            db.query(OrderItem).filter(
                OrderItem.order_id == existing_order.id
            ).delete()

            db.query(InventoryReservation).filter(
                InventoryReservation.user_id == user_id
            ).delete()

            db.delete(existing_order)
            db.commit()

    # Transaction handled by FastAPI session

    cart_items = db.query(CartItem).filter(CartItem.user_id == user_id).all()

    if not cart_items:
        raise HTTPException(status_code=400, detail="Cart is empty")

    total = 0

    for item in cart_items:
        variant = db.query(ProductVariant).filter(
            ProductVariant.id == item.variant_id
        ).with_for_update().first()

        product = db.query(Product).filter(Product.id == variant.product_id).first()
        if not product or product.status != "active":
            raise HTTPException(status_code=403, detail=f"Item {product.name} is no longer available")

        # Calculate reserved quantity that has not expired
        reserved_total = db.query(
            func.coalesce(func.sum(InventoryReservation.quantity), 0)
        ).filter(
            InventoryReservation.variant_id == item.variant_id,
            InventoryReservation.expires_at > datetime.utcnow()
        ).scalar()

        available_stock = variant.stock - reserved_total

        if available_stock < item.quantity:
            raise HTTPException(status_code=400, detail="Product out of stock")

        # Reserve stock for this variant (temporary hold during checkout)
        reservation = InventoryReservation(
            user_id=user_id,
            variant_id=item.variant_id,
            quantity=item.quantity,
            expires_at=datetime.utcnow() + timedelta(minutes=15)
        )
        db.add(reservation)

        total += variant.price * item.quantity

    order_amount = total
    if promo_code:
        from app.routes.promo import _apply_promo_core
        from app.schemas.checkout_schema import PromoApplyRequest

        # Validation only (order not created yet) — raises HTTPException if invalid
        promo_result = _apply_promo_core(
            PromoApplyRequest(code=promo_code, user_id=user_id),
            db
        )
        order_amount = promo_result["final_amount"]

    # Shipping cost is added AFTER any promo discount (promos apply to merchandise, not shipping)
    order_amount = order_amount + shipping_cost

    order = Order(
        user_id=user_id,
        total_amount=order_amount,
        shipping_address_id=address_id
    )

    try:
        db.add(order)
        db.flush()
        db.refresh(order)

        for item in cart_items:
            variant = db.query(ProductVariant).filter(ProductVariant.id == item.variant_id).with_for_update().first()
            # variant.stock -= item.quantity  # Stock reduction will be handled after payment confirmation

            order_item = OrderItem(
                order_id=order.id,
                variant_id=item.variant_id,
                quantity=item.quantity,
                price=variant.price
            )
            db.add(order_item)

        db.commit()
    except Exception as e:
        db.rollback()
        # Drop the reservations we just created so stock isn't held hostage
        db.query(InventoryReservation).filter(
            InventoryReservation.user_id == user_id,
            InventoryReservation.expires_at > datetime.utcnow()
        ).delete()
        db.commit()
        raise HTTPException(status_code=500, detail=f"Failed to create order: {str(e)}")

    return {
        "message": "order created",
        "order_id": order.id,
        "total": float(order.total_amount)
    }