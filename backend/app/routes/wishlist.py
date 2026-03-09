from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.wishlist import Wishlist
from datetime import datetime

router = APIRouter(prefix="/wishlist", tags=["Wishlist"])


# Add to wishlist
@router.post("/add")
def add_to_wishlist(user_id: int, product_id: int, db: Session = Depends(get_db)):

    existing = db.query(Wishlist).filter(
        Wishlist.user_id == user_id,
        Wishlist.product_id == product_id
    ).first()

    if existing:
        raise HTTPException(status_code=400, detail="Product already in wishlist")

    item = Wishlist(
        user_id=user_id,
        product_id=product_id,
        created_at=datetime.utcnow()
    )

    db.add(item)
    db.commit()
    db.refresh(item)

    return {"message": "Product added to wishlist", "wishlist_id": item.id}


# Get wishlist for user
@router.get("/{user_id}")
def get_wishlist(user_id: int, db: Session = Depends(get_db)):

    items = db.query(Wishlist).filter(Wishlist.user_id == user_id).all()

    return items


# Remove from wishlist
@router.delete("/remove/{product_id}")
def remove_from_wishlist(user_id: int, product_id: int, db: Session = Depends(get_db)):

    item = db.query(Wishlist).filter(
        Wishlist.user_id == user_id,
        Wishlist.product_id == product_id
    ).first()

    if not item:
        raise HTTPException(status_code=404, detail="Wishlist item not found")

    db.delete(item)
    db.commit()

    return {"message": "Removed from wishlist"}