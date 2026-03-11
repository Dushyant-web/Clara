from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.db import get_db
from app.models.cart_item import CartItem
from app.models.product_variant import ProductVariant
from app.models.inventory_reservation import InventoryReservation
from app.models.order import Order
from app.models.order_item import OrderItem
from app.models.user import User

router = APIRouter()


@router.post("/checkout")
def checkout(user_id: int, promo_code: str | None = None, idempotency_key: str | None = None, db: Session = Depends(get_db)):

    # --- Idempotency check ---
    if idempotency_key:
        existing_order = db.query(Order).filter(
            Order.user_id == user_id,
            Order.status == "pending"
        ).order_by(Order.created_at.desc()).first()

        if existing_order:
            # If promo_code is provided, update the existing order's amount
            if promo_code:
                try:
                    from app.routes.promo import apply_promo
                    from app.schemas.checkout_schema import PromoApplyRequest
                    # apply_promo will update existing_order.total_amount because we pass order_id
                    res = apply_promo(
                        PromoApplyRequest(code=promo_code, user_id=user_id, order_id=existing_order.id),
                        db
                    )
                    # We continue to return the existing order
                    return {
                        "message": "order updated with promo",
                        "order_id": existing_order.id,
                        "total": float(res["final_amount"])
                    }
                except Exception as e:
                    # If promo fails, we still return the existing order's current total
                    pass
            
            return {
                "message": "order already created",
                "order_id": existing_order.id,
                "total": float(existing_order.total_amount)
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

            # Reserve stock for this variant (temporary hold during checkout)
            reservation = InventoryReservation(
                user_id=user_id,
                variant_id=item.variant_id,
                quantity=item.quantity
            )
            db.add(reservation)

            total += variant.price * item.quantity

        order_amount = total
        if promo_code:
            try:
                from app.routes.promo import apply_promo
                from app.schemas.checkout_schema import PromoApplyRequest
                
                # Validation only (order not created yet)
                promo_result = apply_promo(
                    PromoApplyRequest(code=promo_code, user_id=user_id),
                    db
                )
                order_amount = promo_result["final_amount"]
            except Exception:
                pass

        order = Order(
            user_id=user_id,
            total_amount=order_amount
        )

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

    return {
        "message": "order created",
        "order_id": order.id,
        "total": float(order.total_amount)
    }