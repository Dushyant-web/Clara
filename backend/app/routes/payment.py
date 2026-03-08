from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
import razorpay
import os

from app.database.db import get_db
from app.models.payment import Payment
from app.models.order import Order
from app.models.product import Product

from fastapi import Header

razorpay_client = razorpay.Client(auth=(
    os.getenv("RAZORPAY_KEY_ID"),
    os.getenv("RAZORPAY_KEY_SECRET")
))

router = APIRouter()


@router.post("/payment/create")
def create_payment(order_id: int, provider: str, db: Session = Depends(get_db)):

    existing = db.query(Payment).filter(Payment.order_id == order_id).first()

    if existing:
        return {
            "payment_id": existing.id,
            "provider": existing.provider,
            "amount": existing.amount,
            "message": "payment already created"
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

    db.add(payment)
    db.commit()
    db.refresh(payment)

    razorpay_order = None

    if provider in ["upi", "card"]:
        razorpay_order = razorpay_client.order.create({
            "amount": int(order.total_amount * 100),
            "currency": "INR",
            "payment_capture": 1
        })

    return {
        "payment_id": payment.id,
        "provider": provider,
        "amount": order.total_amount,
        "razorpay_order_id": razorpay_order["id"] if razorpay_order else None
    }

@router.post("/payment/confirm")
def confirm_payment(payment_id: int, transaction_id: str, db: Session = Depends(get_db)):

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

    # TODO: verify Razorpay webhook signature in production
    # signature = request.headers.get("X-Razorpay-Signature")
    # razorpay_client.utility.verify_webhook_signature(payload, signature, os.getenv("RAZORPAY_WEBHOOK_SECRET"))

    try:
        data = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid webhook payload")

    payment_entity = data.get("payload", {}).get("payment", {}).get("entity", {})

    razorpay_payment_id = payment_entity.get("id")

    payment = db.query(Payment).filter(Payment.payment_id == razorpay_payment_id).first()

    if not payment:
        return {"message": "payment not tracked"}

    if payment.status == "paid":
        return {"message": "already processed"}

    payment.status = "paid"

    order = db.query(Order).filter(Order.id == payment.order_id).first()

    if order:
        order.status = "confirmed"

    db.commit()

    return {"message": "payment recorded"}

