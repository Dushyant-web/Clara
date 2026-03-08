from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timedelta

from app.database.db import get_db
from app.models.product_variant import ProductVariant
from app.models.inventory_reservation import InventoryReservation

router = APIRouter()


@router.post("/reserve")
def reserve_stock(user_id: int, variant_id: int, quantity: int, db: Session = Depends(get_db)):

    variant = db.query(ProductVariant).filter(ProductVariant.id == variant_id).first()

    if not variant:
        raise HTTPException(status_code=404, detail="Variant not found")

    reserved = db.query(InventoryReservation).filter(
        InventoryReservation.variant_id == variant_id,
        InventoryReservation.expires_at > datetime.utcnow()
    ).all()

    reserved_quantity = sum(r.quantity for r in reserved)

    available = variant.stock - reserved_quantity

    if available < quantity:
        raise HTTPException(status_code=400, detail="Not enough stock")

    reservation = InventoryReservation(
        user_id=user_id,
        variant_id=variant_id,
        quantity=quantity,
        expires_at=datetime.utcnow() + timedelta(minutes=10)
    )

    db.add(reservation)
    db.commit()
    db.refresh(reservation)

    return {
        "reservation_id": reservation.id,
        "expires_at": reservation.expires_at
    }