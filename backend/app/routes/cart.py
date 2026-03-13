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
    db.refresh(item)

    return {"message": "cart updated", "item_id": item.id}

from app.models.product import Product
from app.models.product_image import ProductImage

@router.get("/cart/{user_id}")
def get_cart(user_id: int, db: Session = Depends(get_db)):

    items = db.query(CartItem).filter(CartItem.user_id == user_id).all()

    cart_items = []
    subtotal = 0

    for item in items:
        # Get variant and product info
        variant = db.query(ProductVariant).filter(ProductVariant.id == item.variant_id).first()
        if not variant:
            continue
            
        product = db.query(Product).filter(Product.id == variant.product_id).first()
        if not product:
            continue

        # Standardize image fallback (Prioritize Variant Image)
        display_image = variant.image_url if variant.image_url else product.image
        if not display_image:
            first_img = db.query(ProductImage).filter(ProductImage.product_id == product.id).order_by(ProductImage.position).first()
            if first_img:
                display_image = first_img.image_url

        # Use variant-specific price
        price = variant.price
        item_total = price * item.quantity
        subtotal += item_total

        cart_items.append({
            "item_id": item.id,
            "product_id": product.id,
            "variant_id": item.variant_id,
            "name": product.name,
            "image": display_image,
            "size": variant.size,
            "color": variant.color,
            "sku": variant.sku,
            "quantity": item.quantity,
            "price": float(price),
            "item_total": float(item_total)
        })

    return {
        "items": cart_items,
        "cart_subtotal": float(subtotal),
        "cart_total": float(subtotal)
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