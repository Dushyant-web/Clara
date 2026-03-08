from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.db import get_db
from app.models.notification import Notification


router = APIRouter()


# internal helper to create notifications from other services
def create_system_notification(db: Session, user_id: int, title: str, message: str):
    notif = Notification(
        user_id=user_id,
        title=title,
        message=message
    )
    db.add(notif)
    db.commit()
    db.refresh(notif)
    return notif


# create notification
@router.post("/notifications")
def create_notification(
    user_id: int,
    title: str,
    message: str,
    db: Session = Depends(get_db)
):

    notif = Notification(
        user_id=user_id,
        title=title,
        message=message
    )

    db.add(notif)
    db.commit()
    db.refresh(notif)

    return notif


# get user notifications
@router.get("/notifications/{user_id}")
def get_notifications(user_id: int, db: Session = Depends(get_db)):

    return db.query(Notification).filter(Notification.user_id == user_id).all()


# mark notification as read
@router.patch("/notifications/{id}/read")
def mark_read(id: int, db: Session = Depends(get_db)):

    notif = db.query(Notification).filter(Notification.id == id).first()

    if not notif:
        return {"error": "Notification not found"}

    notif.is_read = True
    db.commit()

    return {"message": "Notification marked as read"}


# -------- automatic ecommerce notifications --------

def notify_payment_confirmed(db: Session, user_id: int, order_id: int):
    return create_system_notification(
        db,
        user_id,
        "Payment Confirmed",
        f"Your payment for order #{order_id} has been confirmed."
    )


def notify_order_shipped(db: Session, user_id: int, order_id: int):
    return create_system_notification(
        db,
        user_id,
        "Order Shipped",
        f"Your order #{order_id} has been shipped."
    )


def notify_promo_created(db: Session, user_id: int, code: str):
    return create_system_notification(
        db,
        user_id,
        "New Promo Available",
        f"A new promo code '{code}' is now available."
    )


def notify_collection_launched(db: Session, user_id: int, collection_name: str):
    return create_system_notification(
        db,
        user_id,
        "New Collection",
        f"The collection '{collection_name}' is now live."
    )