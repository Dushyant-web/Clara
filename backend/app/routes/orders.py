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

    
    # Get items with variant details
    items = []
    for item in order.items:
        variant = db.query(ProductVariant).filter(ProductVariant.id == item.variant_id).first()
        product = db.query(Product).filter(Product.id == variant.product_id).first() if variant else None
        
        if not variant or not product:
            continue

        # Standardize image fallback (Prioritize Variant Image)
        display_image = variant.image_url if variant.image_url else product.image
        if not display_image:
            first_img = db.query(ProductImage).filter(ProductImage.product_id == product.id).order_by(ProductImage.position).first()
            if first_img:
                display_image = first_img.image_url

        items.append({
            "name": product.name,
            "image": display_image,
            "size": variant.size,
            "color": variant.color,
            "sku": variant.sku,
            "quantity": item.quantity,
            "price": float(item.price)
        })

    return {
        "id": order.id,
        "total_amount": float(order.total_amount),
        "status": order.status,
        "created_at": order.created_at,
        "items": items
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