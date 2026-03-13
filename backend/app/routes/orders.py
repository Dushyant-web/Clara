from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.db import get_db
from app.models.order import Order
from app.models.order_item import OrderItem
from app.models.product_variant import ProductVariant

router = APIRouter()


@router.get("/order/{order_id}")
def get_order(order_id: int, db: Session = Depends(get_db)):

    from app.models.product import Product
    from app.models.product_image import ProductImage

    order = db.query(Order).filter(Order.id == order_id).first()

    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    items = db.query(OrderItem).filter(OrderItem.order_id == order_id).all()

    result = []

    for item in items:

        variant = db.query(ProductVariant).filter(ProductVariant.id == item.variant_id).first()
        if not variant:
            continue
            
        product = db.query(Product).filter(Product.id == variant.product_id).first()
        if not product:
            continue
            
        # Standardize image fallback
        display_image = product.image
        if not display_image:
            first_img = db.query(ProductImage).filter(ProductImage.product_id == product.id).order_by(ProductImage.position).first()
            if first_img:
                display_image = first_img.image_url

        result.append({
            "variant_id": item.variant_id,
            "product_id": product.id,
            "name": product.name,
            "image": display_image,
            "size": variant.size,
            "color": variant.color,
            "quantity": item.quantity,
            "price": float(item.price),
            "item_total": float(item.price * item.quantity)
        })

    return {
        "order_id": order.id,
        "status": order.status,
        "total": float(order.total_amount),
        "created_at": order.created_at,
        "items": result
    }

@router.get("/orders/{user_id}")
def get_user_orders(user_id: int, db: Session = Depends(get_db)):

    orders = db.query(Order).filter(Order.user_id == user_id).all()

    result = []

    for order in orders:
        result.append({
            "order_id": order.id,
            "status": order.status,
            "total": order.total_amount,
            "created_at": order.created_at
        })

    return result