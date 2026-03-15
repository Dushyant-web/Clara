from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.database.db import get_db
from app.models.order import Order
from app.models.order_item import OrderItem
from app.models.product_variant import ProductVariant
from app.models.product import Product
from app.models.product_image import ProductImage
from app.models.variant_image import VariantImage
from app.models.address import Address

router = APIRouter()


@router.get("/order/{order_id}")
def get_order(order_id: int, db: Session = Depends(get_db)):

    order = db.query(Order).filter(Order.id == order_id).first()

    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    
    # Get items with variant details
    items = []
    items_db = db.query(OrderItem).filter(OrderItem.order_id == order.id).all()
    for item in items_db:
        variant = db.query(ProductVariant).filter(ProductVariant.id == item.variant_id).first()
        product = db.query(Product).filter(Product.id == variant.product_id).first() if variant else None
        
        if not variant or not product:
            continue

        # Standardize image fallback (Prioritize Variant Image)
        display_image = getattr(variant, "image_url", None)
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
            display_image = getattr(product, "main_image", None) or getattr(product, "hover_image", None)
        if not display_image:
            first_img = db.query(ProductImage).filter(ProductImage.product_id == product.id).order_by(ProductImage.position).first()
            if first_img:
                display_image = first_img.image_url
        
        items.append({
            "name": product.name,
            "image": display_image,
            "size": getattr(variant, "size", None),
            "color": getattr(variant, "color", None),
            "sku": getattr(variant, "sku", None),
            "quantity": item.quantity,
            "price": float(item.price or 0)
        })

    return {
        "id": order.id,
        "total_amount": float(order.total_amount or 0),
        "status": order.status,
        "created_at": order.created_at,
        "items": items
    }

@router.get("/orders/user/{user_id}")
def get_user_orders(user_id: int, db: Session = Depends(get_db)):
    rows = db.execute(
        text("""
        SELECT 
            o.id AS order_id,
            o.status,
            o.total_amount,
            o.created_at,

            oi.quantity,

            p.name AS product_name,

            pv.size,
            pv.color,
            pv.image_url,

            a.name AS address_name,
            a.address_line,
            a.city,
            a.state,
            a.postal_code,
            a.country,
            a.phone

        FROM orders o
        LEFT JOIN order_items oi ON oi.order_id = o.id
        LEFT JOIN product_variants pv ON pv.id = oi.variant_id
        LEFT JOIN products p ON p.id = pv.product_id
        LEFT JOIN addresses a ON a.id = o.shipping_address_id

        WHERE o.user_id = :user_id
        ORDER BY o.created_at DESC
        """),
        {"user_id": user_id}
    ).mappings().all()

    orders_map = {}

    for row in rows:
        order_id = row["order_id"]

        if order_id not in orders_map:

            shipping_address = None
            if row["address_name"]:
                shipping_address = {
                    "name": row["address_name"],
                    "line1": row["address_line"],
                    "city": row["city"],
                    "state": row["state"],
                    "pincode": row["postal_code"],
                    "country": row["country"],
                    "phone": row["phone"]
                }

            orders_map[order_id] = {
                "order_id": order_id,
                "status": row["status"],
                "total_amount": float(row["total_amount"] or 0),
                "created_at": row["created_at"],
                "items": [],
                "shipping_address": shipping_address
            }

        if row["product_name"]:
            orders_map[order_id]["items"].append({
                "product_name": row["product_name"],
                "size": row["size"],
                "color": row["color"],
                "image": row["image_url"],
                "quantity": row["quantity"]
            })

    return list(orders_map.values())

@router.delete("/orders/unpaid/{user_id}")
def delete_unpaid_orders(user_id: int, db: Session = Depends(get_db)):
    db.query(Order).filter(
        Order.user_id == user_id,
        Order.status == "pending"
    ).delete()
    
    db.commit()
    return {"message": "Unpaid orders cleared"}