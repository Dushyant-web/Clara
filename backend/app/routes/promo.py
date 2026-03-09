from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.db import get_db
from app.models.promo_code import PromoCode
from app.schemas.checkout_schema import PromoApplyRequest
from datetime import datetime

router = APIRouter()


@router.post("/promo/apply")
def apply_promo(request: PromoApplyRequest, db: Session = Depends(get_db)):
    code = request.code
    # Fetch the order directly from DB instead of trusting frontend price
    from app.models.order import Order
    order = db.query(Order).filter(Order.id == request.order_id).first()

    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    order_amount = float(order.total_amount)

    promo = db.query(PromoCode).filter(PromoCode.code == code).first()

    if not promo:
        raise HTTPException(status_code=404, detail="Promo not found")

    if not promo.active:
        raise HTTPException(status_code=400, detail="Promo inactive")

    if promo.expires_at and promo.expires_at < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Promo expired")

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

    # Update order total so payment uses the discounted amount
    order.total_amount = final_amount
    db.commit()

    return {
        "promo": promo.code,
        "discount": discount,
        "final_amount": final_amount
    }