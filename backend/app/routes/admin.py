from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.db import get_db
from app.models.product import Product
from app.models.product_variant import ProductVariant
from app.models.promo_code import PromoCode
from app.models.order import Order
from app.models.user import User
from app.models.review import Review
from sqlalchemy import func
from datetime import datetime
from app.models.product_image import ProductImage
from app.models.collection import CollectionImage
from app.models.lookbook import LookbookImage
from app.schemas.variant import VariantCreate

import razorpay
import os



router = APIRouter(prefix="/admin")

@router.post("/product")
def create_product(
    title: str,
    description: str,
    category_id: int,
    price: float = 0,
    image: str = None,
    db: Session = Depends(get_db)
):

    product = Product(
        name=title,
        description=description,
        category_id=category_id,
        image=image,
        price=price
    )

    db.add(product)
    db.commit()
    db.refresh(product)

    return product


@router.post("/product/{product_id}/variant")
def create_variant(
    product_id: int,
    variant: VariantCreate,
    db: Session = Depends(get_db)
):

    variant = ProductVariant(
        product_id=product_id,
        size=variant.size,
        color=variant.color,
        price=variant.price,
        stock=variant.stock,
        image_url=variant.image_url,
        sku=variant.sku
    )

    db.add(variant)
    db.commit()
    db.refresh(variant)

    return variant

# ----------- VARIANT IMAGE MANAGEMENT -----------
@router.post("/variant/{variant_id}/image")
def add_variant_image(variant_id: int, image_url: str, db: Session = Depends(get_db)):

    variant = db.query(ProductVariant).filter(ProductVariant.id == variant_id).first()

    if not variant:
        raise HTTPException(status_code=404, detail="Variant not found")

    variant.image_url = image_url
    db.commit()

    return {
        "message": "Variant image updated",
        "variant_id": variant_id,
        "image_url": image_url
    }

# ----------- VARIANT MATRIX ENDPOINT -----------
@router.get("/product/{product_id}/variants-matrix")
def get_variant_matrix(product_id: int, db: Session = Depends(get_db)):

    variants = db.query(ProductVariant).filter(ProductVariant.product_id == product_id).all()

    if not variants:
        return {"product_id": product_id, "sizes": [], "colors": [], "matrix": {}}

    sizes = sorted(list(set(v.size for v in variants)))
    colors = sorted(list(set(v.color for v in variants)))

    matrix = {}

    for color in colors:
        matrix[color] = {}
        for size in sizes:
            match = next((v for v in variants if v.color == color and v.size == size), None)
            matrix[color][size] = match.stock if match else 0

    return {
        "product_id": product_id,
        "sizes": sizes,
        "colors": colors,
        "matrix": matrix
    }


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

# ----------- BULK STOCK UPDATE (for Variant Matrix UI) -----------
@router.patch("/variants/bulk-stock")
def bulk_update_stock(updates: list[dict], db: Session = Depends(get_db)):
    """
    updates format:
    [
        {"variant_id": 1, "stock": 12},
        {"variant_id": 2, "stock": 5}
    ]
    """

    updated = []

    for item in updates:
        variant_id = item.get("variant_id")
        stock = item.get("stock")

        variant = db.query(ProductVariant).filter(ProductVariant.id == variant_id).first()

        if variant:
            variant.stock = stock
            updated.append(variant_id)

    db.commit()

    return {
        "message": "stocks updated",
        "updated_variants": updated
    }

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
    price: float = None,
    image: str = None,
    db: Session = Depends(get_db)
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        return {"error": "Product not found"}

    if title: product.name = title
    if description: product.description = description
    if category_id: product.category_id = category_id
    if price is not None: product.price = price
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

# ---------------- REVIEW MANAGEMENT ----------------

@router.get("/reviews")
def admin_get_reviews(rating: int = None, db: Session = Depends(get_db)):
    """
    Get all reviews or filter by rating
    Example:
    /admin/reviews
    /admin/reviews?rating=1
    """

    query = db.query(Review)

    if rating is not None:
        query = query.filter(Review.rating == rating)

    reviews = query.order_by(Review.created_at.desc()).all()

    return reviews


@router.delete("/review/{review_id}")
def delete_review(review_id: int, db: Session = Depends(get_db)):

    review = db.query(Review).filter(Review.id == review_id).first()

    if not review:
        raise HTTPException(status_code=404, detail="Review not found")

    db.delete(review)
    db.commit()

    return {
        "message": "Review deleted",
        "review_id": review_id
    }


@router.get("/reviews/stats")
def review_stats(db: Session = Depends(get_db)):

    total_reviews = db.query(func.count(Review.id)).scalar()

    one_star = db.query(func.count(Review.id)).filter(Review.rating == 1).scalar()
    two_star = db.query(func.count(Review.id)).filter(Review.rating == 2).scalar()
    three_star = db.query(func.count(Review.id)).filter(Review.rating == 3).scalar()
    four_star = db.query(func.count(Review.id)).filter(Review.rating == 4).scalar()
    five_star = db.query(func.count(Review.id)).filter(Review.rating == 5).scalar()

    return {
        "total_reviews": total_reviews,
        "ratings": {
            "1": one_star,
            "2": two_star,
            "3": three_star,
            "4": four_star,
            "5": five_star
        }
    }


# ---------------- USER INTELLIGENCE ----------------

@router.get("/user/{user_id}/profile")
def admin_user_profile(user_id: int, db: Session = Depends(get_db)):
    """
    Returns detailed information about a customer for admin dashboard
    """

    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    orders = db.query(Order).filter(Order.user_id == user_id).all()

    total_orders = len(orders)
    total_spent = sum(order.total_amount for order in orders) if orders else 0

    reviews = db.query(Review).filter(Review.user_id == user_id).all()

    return {
        "user": {
            "id": user.id,
            "email": user.email
        },
        "analytics": {
            "total_orders": total_orders,
            "total_spent": total_spent,
            "reviews_written": len(reviews)
        },
        "orders": orders,
        "reviews": reviews
    }

# ---------------- ADMIN ANALYTICS ----------------

@router.get("/orders")
def admin_orders(db: Session = Depends(get_db)):
    orders = db.query(Order).all()
    return orders


@router.get("/order/{order_id}")
def admin_order_detail(order_id: int, db: Session = Depends(get_db)):
    """
    Get complete details of a specific order for admin dashboard
    """

    order = db.query(Order).filter(Order.id == order_id).first()

    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    return order


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