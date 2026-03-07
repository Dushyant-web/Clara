from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.db import get_db
from app.models.cart_item import CartItem

router = APIRouter()


@router.post("/cart/add")
def add_to_cart(data: dict, db: Session = Depends(get_db)):

    item = CartItem(
        user_id=data["user_id"],
        variant_id=data["variant_id"],
        quantity=data.get("quantity", 1)
    )

    db.add(item)
    db.commit()

    return {"message": "item added to cart"}


@router.get("/cart/{user_id}")
def get_cart(user_id: int, db: Session = Depends(get_db)):

    items = db.query(CartItem).filter(CartItem.user_id == user_id).all()

    return items


@router.delete("/cart/remove/{item_id}")
def remove_cart_item(item_id: int, db: Session = Depends(get_db)):

    item = db.query(CartItem).filter(CartItem.id == item_id).first()

    db.delete(item)
    db.commit()

    return {"message": "item removed"}