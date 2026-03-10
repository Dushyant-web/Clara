from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.db import get_db
from app.models.promo_code import PromoCode
from app.schemas.checkout_schema import PromoApplyRequest
from datetime import datetime

router = APIRouter(prefix="/promo")


@router.post("/apply")
def apply_promo(request: PromoApplyRequest, db: Session = Depends(get_db)):
    code = request.code
    # If order_id is provided, use order total. Otherwise, calculate from user's cart.
    if request.order_id:
        from app.models.order import Order
        order = db.query(Order).filter(Order.id == request.order_id).first()
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        order_amount = float(order.total_amount)
        # Prevent applying multiple promo codes to the same order
        if hasattr(order, "promo_code") and order.promo_code:
            raise HTTPException(status_code=400, detail="Promo code already applied to this order")
    else:
        from app.models.cart_item import CartItem
        from app.models.product_variant import ProductVariant
        cart_items = db.query(CartItem).filter(CartItem.user_id == request.user_id).all()
        if not cart_items:
            raise HTTPException(status_code=400, detail="Cart is empty")
        
        order_amount = 0
        for item in cart_items:
            variant = db.query(ProductVariant).filter(ProductVariant.id == item.variant_id).first()
            if variant:
                order_amount += float(variant.price) * item.quantity

    promo = db.query(PromoCode).filter(PromoCode.code == code).first()

    if not promo:
        raise HTTPException(status_code=404, detail="Promo not found")

    if not promo.active:
        raise HTTPException(status_code=400, detail="Promo inactive")

    if promo.expires_at and promo.expires_at < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Promo expired")

    # Prevent infinite reuse of promo codes
    if promo.usage_limit is not None:
        if promo.usage_limit <= 0:
            raise HTTPException(status_code=400, detail="Promo usage limit reached")

    if order_amount < promo.min_order_amount:
        raise HTTPException(status_code=400, detail="Minimum order not met")

    if promo.discount_type == "percentage":
        discount = order_amount * float(promo.discount_value) / 100

        if promo.max_discount:
            discount = min(discount, float(promo.max_discount))

    else:
        discount = float(promo.discount_value)

    # Ensure the final payable amount never goes below ₹1
    final_amount = max(order_amount - discount, 1)

    # Only update DB if an actual order exists (final checkout step)
    if request.order_id:
        order.total_amount = final_amount
        order.promo_code = promo.code
        if promo.usage_limit is not None:
            promo.usage_limit -= 1
        db.commit()

    return {
        "promo": promo.code,
        "discount": discount,
        "final_amount": final_amount
    }