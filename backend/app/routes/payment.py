from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
import razorpay
import os

from app.database.db import get_db
from app.models.payment import Payment
from app.models.order import Order
from app.models.cart_item import CartItem
from app.models.order_item import OrderItem
from app.models.product_variant import ProductVariant
from app.models.inventory_reservation import InventoryReservation
from app.schemas.checkout_schema import PaymentCreateRequest, PaymentConfirmRequest

from fastapi import Header

razorpay_client = razorpay.Client(auth=(
    os.getenv("RAZORPAY_KEY_ID"),
    os.getenv("RAZORPAY_KEY_SECRET")
))

if not os.getenv("RAZORPAY_KEY_ID") or not os.getenv("RAZORPAY_KEY_SECRET"):
    raise Exception("Razorpay keys not set in environment variables")

router = APIRouter()


@router.post("/payment/create")
def create_payment(request: PaymentCreateRequest, db: Session = Depends(get_db)):
    order_id = request.order_id
    provider = request.provider

    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        return {"error": "Order not found"}

    # Prevent creating payment for an already paid/confirmed order
    if getattr(order, "status", None) in ["paid", "confirmed"]:
        raise HTTPException(status_code=400, detail="Order already paid or confirmed")

    existing = db.query(Payment).filter(Payment.order_id == order_id).first()

    if existing:
        # If order amount changed (e.g. promo applied later), regenerate Razorpay order
        amount_changed = float(existing.amount) != float(order.total_amount)
        
        if amount_changed or (not getattr(existing, "razorpay_order_id", None) and provider in ["upi", "card"]):
            try:
                # Update payment amount to match current order total
                existing.amount = order.total_amount
                
                if provider in ["upi", "card"]:
                    razorpay_order = razorpay_client.order.create({
                        "amount": int(float(order.total_amount) * 100),
                        "currency": "INR",
                        "payment_capture": 1
                    })
                    existing.razorpay_order_id = razorpay_order["id"]
                
                db.commit()
                db.refresh(existing)
            except Exception as e:
                raise HTTPException(status_code=400, detail=f"Payment Amount Sync Failed: {str(e)}")
            
        return {
            "payment_id": existing.id,
            "provider": existing.provider,
            "amount": float(existing.amount),
            "razorpay_order_id": getattr(existing, "razorpay_order_id", None),
            "message": "payment updated" if amount_changed else "payment already created"
        }

    order = db.query(Order).filter(Order.id == order_id).first()

    if not order:
        return {"error": "Order not found"}

    payment = Payment(
        order_id=order.id,
        provider=provider,
        status="pending",
        amount=order.total_amount
    )

    razorpay_order = None

    if provider in ["upi", "card"]:
        try:
            razorpay_order = razorpay_client.order.create({
                "amount": int(order.total_amount * 100),
                "currency": "INR",
                "payment_capture": 1
            })
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Razorpay Error: {str(e)}")

    db.add(payment)

    # store razorpay order id if created
    if razorpay_order and hasattr(payment, "razorpay_order_id"):
        payment.razorpay_order_id = razorpay_order["id"]

    db.commit()
    db.refresh(payment)

    return {
        "payment_id": payment.id,
        "provider": provider,
        "amount": order.total_amount,
        "razorpay_order_id": razorpay_order["id"] if razorpay_order else None
    }

@router.post("/payment/confirm")
def confirm_payment(request: PaymentConfirmRequest, db: Session = Depends(get_db)):
    payment_id = request.payment_id
    transaction_id = request.transaction_id

    payment = db.query(Payment).filter(Payment.id == payment_id).first()

    if not payment:
        return {"error": "Payment not found"}

    if payment.status == "paid":
        return {"message": "payment already confirmed"}

    payment.status = "paid"
    payment.payment_id = transaction_id

    order = db.query(Order).filter(Order.id == payment.order_id).first()

    if order:
        order.status = "confirmed"

        # Reduce stock for purchased variants
        items = db.query(OrderItem).filter(OrderItem.order_id == order.id).all()
        for item in items:
            variant = db.query(ProductVariant).filter(ProductVariant.id == item.variant_id).first()
            if variant:
                variant.stock -= item.quantity

        # Remove inventory reservations for this user/order
        db.query(InventoryReservation).filter(InventoryReservation.user_id == order.user_id).delete()

        # Clear cart upon successful payment
        db.query(CartItem).filter(CartItem.user_id == order.user_id).delete()

    db.commit()

    return {
        "message": "payment confirmed"
    }

@router.get("/payment/status/{order_id}")
def payment_status(order_id: int, db: Session = Depends(get_db)):

    payment = db.query(Payment).filter(Payment.order_id == order_id).first()

    if not payment:
        return {"error": "Payment not found"}

    return {
        "order_id": order_id,
        "status": payment.status,
        "provider": payment.provider
    }

@router.post("/payment/webhook")
async def razorpay_webhook(request: Request, db: Session = Depends(get_db)):

    payload = await request.body()

    signature = request.headers.get("X-Razorpay-Signature")
    webhook_secret = os.getenv("RAZORPAY_WEBHOOK_SECRET")

    if webhook_secret and signature:
        try:
            razorpay_client.utility.verify_webhook_signature(
                payload,
                signature,
                webhook_secret
            )
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid Razorpay webhook signature")

    try:
        data = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid webhook payload")

    payment_entity = data.get("payload", {}).get("payment", {}).get("entity", {})

    razorpay_payment_id = payment_entity.get("id")
    razorpay_order_id = payment_entity.get("order_id")

    payment = db.query(Payment).filter(
        (Payment.payment_id == razorpay_payment_id) |
        (Payment.razorpay_order_id == razorpay_order_id)
    ).first()

    if not payment:
        return {"message": "payment not tracked"}

    if payment.status == "paid":
        return {"message": "already processed"}

    payment.status = "paid"
    payment.payment_id = razorpay_payment_id

    order = db.query(Order).filter(Order.id == payment.order_id).first()

    if order:
        order.status = "confirmed"

        # Reduce stock for purchased variants
        items = db.query(OrderItem).filter(OrderItem.order_id == order.id).all()
        for item in items:
            variant = db.query(ProductVariant).filter(ProductVariant.id == item.variant_id).first()
            if variant:
                variant.stock -= item.quantity

        # Remove inventory reservations for this user/order
        db.query(InventoryReservation).filter(InventoryReservation.user_id == order.user_id).delete()

        # Clear cart upon successful payment
        db.query(CartItem).filter(CartItem.user_id == order.user_id).delete()

    db.commit()

    return {"message": "payment recorded"}
