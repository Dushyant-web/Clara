from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.db import get_db
from app.models.order import Order
from app.models.order_item import OrderItem
from app.models.product_variant import ProductVariant
from app.models.product import Product
from app.models.product_image import ProductImage
from app.models.variant_image import VariantImage

router = APIRouter()


@router.get("/order/{order_id}")
def get_order(order_id: int, db: Session = Depends(get_db)):

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
        display_image = variant.image_url
        if not display_image:
            # Try to find 'main' first
            variant_main_img = db.query(VariantImage).filter(
                VariantImage.variant_id == variant.id,
                VariantImage.type == "main"
            ).first()
            
            if not variant_main_img:
                # Fallback to absolute first image for this variant
                variant_main_img = db.query(VariantImage).filter(
                    VariantImage.variant_id == variant.id
                ).order_by(VariantImage.position).first()
                
            if variant_main_img:
                display_image = variant_main_img.image_url
        
        if not display_image:
            display_image = product.main_image or product.hover_image
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

@router.get("/orders/user/{user_id}")
def get_user_orders(user_id: int, db: Session = Depends(get_db)):

    orders = db.query(Order).filter(Order.user_id == user_id).all()

    result = []

    for order in orders:

        items = db.query(OrderItem).filter(OrderItem.order_id == order.id).all()

        enriched_items = []

        for item in items:
            variant = db.query(ProductVariant).filter(
                ProductVariant.id == item.variant_id
            ).first()

            product = db.query(Product).filter(
                Product.id == variant.product_id
            ).first()

            enriched_items.append({
                "product_name": product.name,
                "color": variant.color,
                "size": variant.size,
                "image": variant.images[0] if variant.images else None,
                "quantity": item.quantity
            })

        result.append({
            "order_id": order.id,
            "status": order.status,
            "total_amount": order.total_amount,
            "created_at": order.created_at,
            "items": enriched_items
        })

    return result