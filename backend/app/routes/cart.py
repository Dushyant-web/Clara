from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.db import get_db
from app.models.cart_item import CartItem
from app.models.product_variant import ProductVariant

router = APIRouter()


@router.post("/cart/add")
def add_to_cart(data: dict, db: Session = Depends(get_db)):

    user_id = data.get("user_id")
    variant_id = data.get("variant_id")
    quantity = data.get("quantity", 1)

    variant = db.query(ProductVariant).filter(ProductVariant.id == variant_id).first()

    if not variant:
        raise HTTPException(status_code=404, detail="Variant not found")

    if quantity > variant.stock:
        raise HTTPException(status_code=400, detail="Not enough inventory")

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

    cart_items = []
    subtotal = 0

    for item in items:
        variant = db.query(ProductVariant).filter(ProductVariant.id == item.variant_id).first()

        if not variant:
            continue

        price = variant.price
        item_total = price * item.quantity

        subtotal += item_total

        cart_items.append({
            "item_id": item.id,
            "variant_id": item.variant_id,
            "quantity": item.quantity,
            "price": price,
            "item_total": item_total
        })

    cart_total = subtotal  # shipping/tax can be added later

    return {
        "items": cart_items,
        "cart_subtotal": subtotal,
        "cart_total": cart_total
    }

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

    variant = db.query(ProductVariant).filter(ProductVariant.id == item.variant_id).first()

    if quantity > variant.stock:
        raise HTTPException(status_code=400, detail="Not enough inventory")

    item.quantity = quantity

    db.commit()

    return {"message": "quantity updated"}