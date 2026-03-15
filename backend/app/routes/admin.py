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
from sqlalchemy import text
from datetime import datetime
from app.models.product_image import ProductImage
from app.models.variant_image import VariantImage
from app.models.collection import CollectionImage
from app.models.lookbook import LookbookImage
from app.schemas.variant import VariantCreate
from fastapi import Query
import razorpay
import os



router = APIRouter(prefix="/admin")

@router.post("/product")
def create_product(
    name: str,
    description: str,
    category_id: int,
    price: float = 0,
    main_image: str = None,
    hover_image: str = None,
    db: Session = Depends(get_db)
):

    product = Product(
        name=name,
        description=description,
        category_id=category_id,
        main_image=main_image,
        hover_image=hover_image,
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

    new_image = VariantImage(
        variant_id=variant_id,
        image_url=image_url,
        type="main",
        position=0
    )

    db.add(new_image)
    db.commit()
    db.refresh(new_image)

    return {
        "message": "Variant image added",
        "variant_id": variant_id,
        "image": new_image.image_url
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
    name: str = None,
    description: str = None,
    category_id: int = None,
    price: float = None,
    main_image: str = None,
    hover_image: str = None,
    db: Session = Depends(get_db)
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        return {"error": "Product not found"}

    if name: product.name = name
    if description: product.description = description
    if category_id: product.category_id = category_id
    if price is not None: product.price = price
    if main_image is not None: product.main_image = main_image
    if hover_image is not None: product.hover_image = hover_image

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
    price: float = Query(None),
    stock: int = Query(None),
    sku: str = Query(None),
    size: str = Query(None),
    color: str = Query(None),
    image_url: str = Query(None),
    db: Session = Depends(get_db)
):
    variant = db.query(ProductVariant).filter(ProductVariant.id == variant_id).first()

    if not variant:
        return {"error": "Variant not found"}

    if price is not None:
        variant.price = price

    if stock is not None:
        variant.stock = stock

    if sku:
        variant.sku = sku

    if size:
        variant.size = size

    if color:
        variant.color = color

    if image_url:
        variant.image_url = image_url

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


@router.post("/product-image")
def add_product_image(
    product_id: int,
    image_url: str,
    image_type: str = Query("gallery"),  # cover | hover | gallery
    position: int = Query(0),
    db: Session = Depends(get_db)
):

    new_image = ProductImage(
        product_id=product_id,
        image_url=image_url,
        type=image_type,
        position=position
    )

    db.add(new_image)
    db.commit()
    db.refresh(new_image)

    return {
        "message": "Product image added",
        "image": {
            "id": new_image.id,
            "url": new_image.image_url,
            "type": image_type,
            "position": position
        }
    }

# ----------- PRODUCT IMAGE FETCH ENDPOINT -----------
@router.get("/product/{product_id}/images")
def get_product_images(product_id: int, db: Session = Depends(get_db)):

    images = (
        db.query(ProductImage)
        .filter(ProductImage.product_id == product_id)
        .order_by(ProductImage.position.asc())
        .all()
    )

    return [
        {
            "id": img.id,
            "url": img.image_url,
            "type": getattr(img, "type", "gallery"),
            "position": getattr(img, "position", 0)
        }
        for img in images
    ]

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

# ----------- DELETE LOOKBOOK -----------
@router.delete("/lookbook/{lookbook_id}")
def delete_lookbook(lookbook_id: int, db: Session = Depends(get_db)):

    from app.models.lookbook import Lookbook

    lookbook = db.query(Lookbook).filter(Lookbook.id == lookbook_id).first()

    if not lookbook:
        raise HTTPException(status_code=404, detail="Lookbook not found")

    db.delete(lookbook)
    db.commit()

    return {
        "message": "Lookbook deleted",
        "lookbook_id": lookbook_id
    }

# ---------------- REVIEW MANAGEMENT ----------------

@router.get("/reviews")
def admin_get_reviews(rating: int = None, db: Session = Depends(get_db)):
    """
    Get all reviews or filter by rating with associated user email
    """
    query = db.query(Review, User.email.label("user_email")).join(User, Review.user_id == User.id)

    if rating is not None:
        query = query.filter(Review.rating == rating)

    results = query.order_by(Review.created_at.desc()).all()

    # Flatten the result to include user_email in the review object
    reviews = []
    for review, email in results:
        # Fetch admin replies for this review
        replies = db.execute(
            text("""
                SELECT id, review_id, admin_id, reply, created_at
                FROM review_replies
                WHERE review_id = :review_id
                ORDER BY created_at ASC
            """),
            {"review_id": review.id}
        ).fetchall()

        reply_list = [
            {
                "id": r.id,
                "review_id": r.review_id,
                "admin_id": r.admin_id,
                "reply": r.reply,
                "created_at": r.created_at
            }
            for r in replies
        ]

        review_dict = {
            "id": review.id,
            "product_id": review.product_id,
            "variant_id": review.variant_id,
            "user_id": review.user_id,
            "rating": review.rating,
            "comment": review.comment,
            "created_at": review.created_at,
            "user_email": email,

            # Variant label
            "color": getattr(review, "color", None),
            "size": getattr(review, "size", None),

            # Verified purchase badge
            "verified_purchase": getattr(review, "verified_purchase", False),

            # Helpful votes
            "helpful_count": getattr(review, "helpful_count", 0),

            # Media
            "images": review.images if hasattr(review, "images") else [],
            "videos": review.videos if hasattr(review, "videos") else [],

            "replies": reply_list,
        }
        reviews.append(review_dict)

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


# ---------------- ADMIN REVIEW REPLY ----------------


@router.post("/review-reply")
def reply_to_review(
    review_id: int,
    reply: str,
    admin_id: int = 1,
    db: Session = Depends(get_db)
):
    """
    Admin can reply to a customer review
    """

    review = db.query(Review).filter(Review.id == review_id).first()

    if not review:
        raise HTTPException(status_code=404, detail="Review not found")

    db.execute(
        text("""
            INSERT INTO review_replies (review_id, admin_id, reply, created_at)
            VALUES (:review_id, :admin_id, :reply, NOW())
        """),
        {
            "review_id": review_id,
            "admin_id": admin_id,
            "reply": reply
        }
    )

    db.commit()

    return {
        "message": "Reply added",
        "review_id": review_id
    }


# ----------- GET REVIEW REPLIES ENDPOINT -----------
@router.get("/review-replies/{review_id}")
def get_review_replies(review_id: int, db: Session = Depends(get_db)):
    """
    Fetch all admin replies for a specific review
    """

    replies = db.execute(
        text("""
            SELECT id, review_id, admin_id, reply, created_at
            FROM review_replies
            WHERE review_id = :review_id
            ORDER BY created_at ASC
        """),
        {"review_id": review_id}
    ).fetchall()

    return [
        {
            "id": r.id,
            "review_id": r.review_id,
            "admin_id": r.admin_id,
            "reply": r.reply,
            "created_at": r.created_at
        }
        for r in replies
    ]


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

    reviews_results = db.query(Review).filter(Review.user_id == user_id).all()
    reviews = []
    for r in reviews_results:
        reviews.append({
            "id": r.id,
            "product_id": r.product_id,
            "user_id": r.user_id,
            "rating": r.rating,
            "comment": r.comment,
            "created_at": r.created_at,
            "user_email": user.email
        })

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
    from app.models.order_item import OrderItem
    from app.models.product_variant import ProductVariant
    from app.models.product import Product
    from app.models.product_image import ProductImage

    order = db.query(Order).filter(Order.id == order_id).first()

    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    items = db.query(OrderItem).filter(OrderItem.order_id == order_id).all()
    
    items_detail = []
    for item in items:
        variant = db.query(ProductVariant).filter(ProductVariant.id == item.variant_id).first()
        product = db.query(Product).filter(Product.id == (variant.product_id if variant else None)).first()
        # Standardize image fallback (Prioritize Variant Image)
        display_image = variant.image_url if variant else None
        if variant and not display_image:
            from app.models.variant_image import VariantImage
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
        
        if not display_image and product:
            display_image = product.main_image or product.hover_image
        
        if not display_image and product:
            first_img = db.query(ProductImage).filter(ProductImage.product_id == product.id).order_by(ProductImage.position).first()
            if first_img:
                display_image = first_img.image_url

        items_detail.append({
            "item_id": item.id,
            "variant_id": item.variant_id,
            "name": product.name if product else "Unknown Product",
            "image": display_image,
            "size": variant.size if variant else "N/A",
            "color": variant.color if variant else "N/A",
            "quantity": item.quantity,
            "price": float(item.price),
            "item_total": float(item.price * item.quantity)
        })

    # Convert to dict to add items
    order_data = {
        "id": order.id,
        "user_id": order.user_id,
        "status": order.status,
        "total_amount": float(order.total_amount),
        "created_at": order.created_at,
        "items": items_detail
    }

    return order_data


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

# ---------------- REVIEW INTELLIGENCE DASHBOARD ----------------

@router.get("/review-intelligence")
def review_intelligence_dashboard(db: Session = Depends(get_db)):
    """
    Returns analytics for the Admin Review Intelligence Dashboard
    """

    # ⭐ Website Rating
    website_rating = db.query(func.avg(Review.rating)).scalar() or 0

    # 🧾 Total Reviews
    total_reviews = db.query(func.count(Review.id)).scalar() or 0

    # 🔥 Best Product
    best_product = (
        db.query(
            Product.id,
            Product.name,
            func.avg(Review.rating).label("avg_rating"),
            func.count(Review.id).label("review_count")
        )
        .join(Review, Review.product_id == Product.id)
        .group_by(Product.id)
        .order_by(func.avg(Review.rating).desc())
        .first()
    )

    # ⚠ Worst Product
    worst_product = (
        db.query(
            Product.id,
            Product.name,
            func.avg(Review.rating).label("avg_rating"),
            func.count(Review.id).label("review_count")
        )
        .join(Review, Review.product_id == Product.id)
        .group_by(Product.id)
        .order_by(func.avg(Review.rating).asc())
        .first()
    )

    # 📈 Review Growth (reviews per day)
    review_growth = (
        db.query(
            func.date(Review.created_at).label("date"),
            func.count(Review.id).label("reviews")
        )
        .group_by(func.date(Review.created_at))
        .order_by(func.date(Review.created_at))
        .all()
    )

    review_growth_data = [
        {
            "date": str(r.date),
            "reviews": r.reviews
        }
        for r in review_growth
    ]

    # 🏆 Product Review Rankings
    rankings = (
        db.query(
            Product.id,
            Product.name,
            func.avg(Review.rating).label("avg_rating"),
            func.count(Review.id).label("review_count")
        )
        .join(Review, Review.product_id == Product.id)
        .group_by(Product.id)
        .order_by(func.avg(Review.rating).desc())
        .all()
    )

    ranking_data = []
    rank = 1
    for r in rankings:
        ranking_data.append({
            "rank": rank,
            "product_id": r.id,
            "product_name": r.name,
            "avg_rating": round(float(r.avg_rating), 2),
            "review_count": r.review_count
        })
        rank += 1

    return {
        "website_rating": round(float(website_rating), 2),
        "total_reviews": total_reviews,
        "best_product": {
            "id": best_product.id,
            "name": best_product.name,
            "rating": round(float(best_product.avg_rating), 2),
            "reviews": best_product.review_count
        } if best_product else None,
        "worst_product": {
            "id": worst_product.id,
            "name": worst_product.name,
            "rating": round(float(worst_product.avg_rating), 2),
            "reviews": worst_product.review_count
        } if worst_product else None,
        "review_growth": review_growth_data,
        "product_rankings": ranking_data
    }

# ---------------- PRODUCT REVIEW BREAKDOWN ----------------

@router.get("/product-review-breakdown/{product_id}")
def product_review_breakdown(product_id: int, db: Session = Depends(get_db)):

    breakdown = db.query(
        Review.rating,
        func.count(Review.id).label("count")
    ).filter(
        Review.product_id == product_id
    ).group_by(
        Review.rating
    ).all()

    result = {
        "1": 0,
        "2": 0,
        "3": 0,
        "4": 0,
        "5": 0
    }

    for r in breakdown:
        result[str(r.rating)] = r.count

    return result


# ---------------- REVIEW MODERATION QUEUE ----------------

@router.get("/review-moderation-queue")
def review_moderation_queue(db: Session = Depends(get_db)):

    flagged_reviews = db.query(
        Review,
        User.email
    ).join(
        User, Review.user_id == User.id
    ).filter(
        Review.rating == 1
    ).order_by(
        Review.created_at.desc()
    ).all()

    result = []

    for review, email in flagged_reviews:
        result.append({
            "review_id": review.id,
            "user": email,
            "rating": review.rating,
            "comment": review.comment,
            "product_id": review.product_id,
            "reason": "1-star review",
            "created_at": review.created_at
        })

    return result


# ---------------- REVIEW TIMELINE GRAPH ----------------

@router.get("/review-timeline")
def review_timeline(db: Session = Depends(get_db)):

    data = db.query(
        func.date(Review.created_at).label("date"),
        func.count(Review.id).label("reviews")
    ).group_by(
        func.date(Review.created_at)
    ).order_by(
        func.date(Review.created_at)
    ).all()

    return [
        {
            "date": str(row.date),
            "reviews": row.reviews
        }
        for row in data
    ]

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
    
@router.delete("/product-image/{image_id}")
def delete_product_image(image_id: int, db: Session = Depends(get_db)):

    image = db.query(ProductImage).filter(ProductImage.id == image_id).first()

    if not image:
        raise HTTPException(status_code=404, detail="Image not found")

    db.delete(image)
    db.commit()

    return {
        "message": "Image deleted",
        "image_id": image_id
    }
@router.patch("/product-images/reorder")
def reorder_product_images(images: list[dict], db: Session = Depends(get_db)):

    for img in images:
        image = db.query(ProductImage).filter(ProductImage.id == img["id"]).first()
        if image:
            image.position = img["position"]

    db.commit()

    return {"message": "image order updated"}

@router.post("/variant-image")
def add_variant_image(
    variant_id: int,
    image_url: str,
    type: str = "gallery",
    position: int = 0,
    db: Session = Depends(get_db)
):

    image = VariantImage(
        variant_id=variant_id,
        image_url=image_url,
        type=type,
        position=position
    )

    db.add(image)
    db.commit()
    db.refresh(image)

    return image

@router.get("/variant/{variant_id}/images")
def get_variant_images(variant_id: int, db: Session = Depends(get_db)):

    images = (
        db.query(VariantImage)
        .filter(VariantImage.variant_id == variant_id)
        .order_by(VariantImage.position.asc())
        .all()
    )

    return [
        {
            "id": img.id,
            "image_url": img.image_url,
            "type": img.type,
            "position": img.position
        }
        for img in images
    ]

# ---------------- PRODUCT CATEGORY ASSIGNMENT ----------------
@router.patch("/product/{product_id}/category")
def assign_category(product_id: int, category_id: int, db: Session = Depends(get_db)):

    product = db.query(Product).filter(Product.id == product_id).first()

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    product.category_id = category_id
    db.commit()

    return {"message": "Category assigned"}


# ---------------- PRODUCT COLLECTION ASSIGNMENT ----------------
@router.patch("/product/{product_id}/collection")
def assign_collection(product_id: int, collection_id: int, db: Session = Depends(get_db)):

    product = db.query(Product).filter(Product.id == product_id).first()

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    product.collection_id = collection_id
    db.commit()

    return {"message": "Collection assigned"}


@router.get("/products/unassigned")
def get_unassigned_products(db: Session = Depends(get_db)):

    products = db.query(Product).filter(Product.category_id == None).all()

    return products