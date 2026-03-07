from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.db import get_db
from app.models.cart_item import CartItem

router = APIRouter()


@router.post("/cart/add")
def add_to_cart(data: dict, db: Session = Depends(get_db)):

    user_id = data.get("user_id")
    variant_id = data.get("variant_id")
    quantity = data.get("quantity", 1)

    item = db.query(CartItem).filter(
        CartItem.user_id == user_id,
        CartItem.variant_id == variant_id
    ).first()

    if item:
        item.quantity += quantity
    else:
        item = CartItem(
            user_id=user_id,
            variant_id=variant_id,
            quantity=quantity
        )
        db.add(item)

    db.commit()

    return {"message": "cart updated"}

@router.get("/cart/{user_id}")
def get_cart(user_id: int, db: Session = Depends(get_db)):

    items = db.query(CartItem).filter(CartItem.user_id == user_id).all()

    return items

@router.delete("/cart/remove/{item_id}")
def remove_cart_item(item_id: int, db: Session = Depends(get_db)):

    item = db.query(CartItem).filter(CartItem.id == item_id).first()

    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    db.delete(item)
    db.commit()

    return {"message": "item removed"}

@router.put("/cart/update")
def update_cart(data: dict, db: Session = Depends(get_db)):

    item_id = data.get("item_id")
    quantity = data.get("quantity")

    item = db.query(CartItem).filter(CartItem.id == item_id).first()

    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    item.quantity = quantity

    db.commit()

    return {"message": "quantity updated"}