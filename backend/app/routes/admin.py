from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.db import get_db
from app.models.product import Product
from app.models.product_variant import ProductVariant
from app.models.promo_code import PromoCode
from app.models.order import Order
from app.models.user import User
from sqlalchemy import func
from datetime import datetime
from app.models.product_image import ProductImage
from app.models.collection import CollectionImage
from app.models.lookbook import LookbookImage

import razorpay
import os



router = APIRouter(prefix="/admin")

@router.post("/product")
def create_product(
    title: str,
    description: str,
    category_id: int,
    image: str = None,
    db: Session = Depends(get_db)
):

    product = Product(
        name=title,
        description=description,
        category_id=category_id,
        image=image,
        price=0
    )

    db.add(product)
    db.commit()
    db.refresh(product)

    return product

@router.post("/product/{product_id}/variant")
def create_variant(
    product_id: int,
    price: float,
    stock: int,
    sku: str,
    db: Session = Depends(get_db)
):

    variant = ProductVariant(
        product_id=product_id,
        price=price,
        stock=stock,
        sku=sku
    )

    db.add(variant)
    db.commit()
    db.refresh(variant)

    return variant

@router.put("/variant/{variant_id}/stock")
def update_stock(
    variant_id: int,
    stock: int,
    db: Session = Depends(get_db)
):

    variant = db.query(ProductVariant).filter(ProductVariant.id == variant_id).first()

    variant.stock = stock
    db.commit()

    return {"message": "stock updated"}

@router.put("/variant/{variant_id}/price")
def update_price(
    variant_id: int,
    price: float,
    db: Session = Depends(get_db)
):

    variant = db.query(ProductVariant).filter(ProductVariant.id == variant_id).first()

    variant.price = price
    db.commit()

    return {"message": "price updated"}

@router.put("/product/{product_id}")
def update_product(
    product_id: int,
    title: str = None,
    description: str = None,
    category_id: int = None,
    image: str = None,
    db: Session = Depends(get_db)
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        return {"error": "Product not found"}

    if title: product.name = title
    if description: product.description = description
    if category_id: product.category_id = category_id
    if image: product.image = image

    db.commit()
    return {"message": "product updated"}

@router.delete("/product/{product_id}")
def delete_product(product_id: int, db: Session = Depends(get_db)):
    db.query(Product).filter(Product.id == product_id).delete()
    db.commit()
    return {"message": "product deleted"}

@router.put("/variant-full/{variant_id}")
def update_variant_full(
    variant_id: int,
    price: float = None,
    stock: int = None,
    sku: str = None,
    size: str = None,
    color: str = None,
    db: Session = Depends(get_db)
):
    variant = db.query(ProductVariant).filter(ProductVariant.id == variant_id).first()
    if not variant:
        return {"error": "Variant not found"}

    if price is not None: variant.price = price
    if stock is not None: variant.stock = stock
    if sku: variant.sku = sku
    if size: variant.size = size
    if color: variant.color = color

    db.commit()
    return {"message": "variant updated"}

@router.post("/promo")
def create_promo(
    code: str,
    discount_type: str,
    discount_value: float,
    min_order_amount: float = 0,
    max_discount: float = None,
    usage_limit: int = None,
    db: Session = Depends(get_db)
):

    promo = PromoCode(
        code=code,
        discount_type=discount_type,
        discount_value=discount_value,
        min_order_amount=min_order_amount,
        max_discount=max_discount,
        usage_limit=usage_limit
    )

    db.add(promo)
    db.commit()
    db.refresh(promo)

    return promo

@router.get("/promos")
def get_promos(db: Session = Depends(get_db)):

    promos = db.query(PromoCode).all()

    return promos


@router.put("/promo/{promo_id}/disable")
def disable_promo(promo_id: int, db: Session = Depends(get_db)):

    promo = db.query(PromoCode).filter(PromoCode.id == promo_id).first()

    promo.active = False
    db.commit()

    return {"message": "promo disabled"}


@router.delete("/promo/{promo_id}")
def delete_promo(promo_id: int, db: Session = Depends(get_db)):

    db.query(PromoCode).filter(PromoCode.id == promo_id).delete()
    db.commit()

    return {"message": "promo deleted"}


@router.post("/admin/product-image")
def add_product_image(product_id: int, image_url: str, db: Session = Depends(get_db)):

    new_image = ProductImage(
        product_id=product_id,
        image_url=image_url
    )

    db.add(new_image)
    db.commit()
    db.refresh(new_image)

    return {
        "message": "Product image added",
        "image": new_image.image_url
    }

@router.post("/admin/collection-image")
def add_collection_image(collection_id: int, image_url: str, db: Session = Depends(get_db)):

    new_image = CollectionImage(
        collection_id=collection_id,
        image_url=image_url
    )

    db.add(new_image)
    db.commit()
    db.refresh(new_image)

    return {
        "message": "Collection image added",
        "image": new_image.image_url
    }

@router.post("/admin/lookbook-image")
def add_lookbook_image(lookbook_id: int, image_url: str, db: Session = Depends(get_db)):

    new_image = LookbookImage(
        lookbook_id=lookbook_id,
        image_url=image_url
    )

    db.add(new_image)
    db.commit()
    db.refresh(new_image)

    return {
        "message": "Lookbook image added",
        "image": new_image.image_url
    }

# ---------------- ADMIN ANALYTICS ----------------

@router.get("/orders")
def admin_orders(db: Session = Depends(get_db)):
    orders = db.query(Order).all()
    return orders


@router.get("/users")
def admin_users(db: Session = Depends(get_db)):
    users = db.query(User).all()
    return users


@router.get("/revenue")
def admin_revenue(db: Session = Depends(get_db)):
    total_revenue = db.query(func.sum(Order.total_amount)).scalar() or 0
    total_orders = db.query(func.count(Order.id)).scalar()

    return {
        "total_revenue": total_revenue,
        "total_orders": total_orders
    }


@router.get("/stats")
def admin_stats(db: Session = Depends(get_db)):
    orders = db.query(func.count(Order.id)).scalar()
    users = db.query(func.count(User.id)).scalar()
    revenue = db.query(func.sum(Order.total_amount)).scalar() or 0
    promos = db.query(func.count(PromoCode.id)).scalar()

    return {
        "orders": orders,
        "users": users,
        "revenue": revenue,
        "promos": promos
    }

# ---------------- ORDER STATUS MANAGEMENT ----------------

@router.patch("/orders/{order_id}/status")
def update_order_status(order_id: int, status: str, db: Session = Depends(get_db)):

    allowed_status = [
        "pending",
        "paid",
        "processing",
        "shipped",
        "delivered",
        "cancelled"
    ]

    if status not in allowed_status:
        return {"error": "Invalid order status"}

    order = db.query(Order).filter(Order.id == order_id).first()

    if not order:
        return {"error": "Order not found"}

    order.status = status
    db.commit()

    return {
        "message": "Order status updated",
        "order_id": order_id,
        "new_status": status
    }

# ---------------- REFUND API ----------------

@router.post("/refund")
def refund_payment(payment_id: str, amount: int = None, db: Session = Depends(get_db)):
    """
    Refund a Razorpay payment.
    amount is optional and should be in paise if provided.
    """

    key_id = os.getenv("RAZORPAY_KEY_ID")
    key_secret = os.getenv("RAZORPAY_KEY_SECRET")

    if not key_id or not key_secret:
        raise HTTPException(status_code=500, detail="Razorpay keys not configured")

    client = razorpay.Client(auth=(key_id, key_secret))

    try:
        refund_data = {"payment_id": payment_id}

        if amount:
            refund_data["amount"] = amount

        refund = client.payment.refund(payment_id, {"amount": amount} if amount else {})

        return {
            "message": "Refund initiated",
            "payment_id": payment_id,
            "refund_id": refund.get("id")
        }

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))