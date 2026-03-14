from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import func, text

from app.database.db import get_db
from app.models.review import Review
from app.models.order import Order
from app.models.order_item import OrderItem
from app.models.product_variant import ProductVariant
from app.models.product import Product

router = APIRouter()


# Request schema for creating a review
class ReviewCreate(BaseModel):
    product_id: int
    user_id: int
    rating: int
    comment: str
    variant_id: int | None = None
    images: list[str] | None = None
    videos: list[str] | None = None


@router.post("/reviews")
def create_review(
    review: ReviewCreate,
    db: Session = Depends(get_db)
):
    # Prevent multiple reviews for the same variant by the same user
    if review.variant_id is not None:
        existing_review = db.query(Review).filter(
            Review.user_id == review.user_id,
            Review.variant_id == review.variant_id
        ).first()

        if existing_review:
            raise HTTPException(status_code=400, detail="You already reviewed this variant. You can edit your review instead.")

    # media limits
    if review.images and len(review.images) > 5:
        raise HTTPException(status_code=400, detail="Maximum 5 images allowed")

    if review.videos and len(review.videos) > 1:
        raise HTTPException(status_code=400, detail="Only 1 video allowed")

    review = Review(
        product_id=review.product_id,
        variant_id=review.variant_id,
        user_id=review.user_id,
        rating=review.rating,
        comment=review.comment,
        images=review.images,
        videos=review.videos
    )
    db.add(review)
    db.commit()
    db.refresh(review)
    return review


# ---------------- EDIT REVIEW ----------------
@router.put("/reviews/{review_id}")
def update_review(
    review_id: int,
    review_data: ReviewCreate,
    db: Session = Depends(get_db)
):
    review = db.query(Review).filter(Review.id == review_id).first()

    if not review:
        raise HTTPException(status_code=404, detail="Review not found")

    if review_data.images and len(review_data.images) > 5:
        raise HTTPException(status_code=400, detail="Maximum 5 images allowed")

    if review_data.videos and len(review_data.videos) > 1:
        raise HTTPException(status_code=400, detail="Only 1 video allowed")

    review.rating = review_data.rating
    review.comment = review_data.comment
    review.images = review_data.images
    review.videos = review_data.videos

    db.commit()
    db.refresh(review)

    return review


# ---------------- DELETE REVIEW ----------------
@router.delete("/reviews/{review_id}")
def delete_review(review_id: int, db: Session = Depends(get_db)):

    review = db.query(Review).filter(Review.id == review_id).first()

    if not review:
        raise HTTPException(status_code=404, detail="Review not found")

    db.delete(review)
    db.commit()

    return {"message": "Review deleted"}


@router.get("/reviews/{product_id}")
def get_reviews(
    product_id: int,
    user_id: int | None = None,
    rating: int | None = None,
    photos: bool = False,
    db: Session = Depends(get_db)
):

    query = db.query(Review).filter(Review.product_id == product_id)

    if rating is not None:
        query = query.filter(Review.rating == rating)

    if photos:
        query = query.filter(Review.images.isnot(None))

    reviews = query.order_by(Review.created_at.desc()).all()

    enriched_reviews = []

    for r in reviews:
        verified = False

        # Fetch admin replies for this review
        replies = db.execute(
            text("SELECT id, reply, created_at FROM review_replies WHERE review_id = :rid ORDER BY created_at ASC"),
            {"rid": r.id}
        ).fetchall()

        reply_list = [
            {
                "id": row.id,
                "reply": row.reply,
                "created_at": row.created_at
            }
            for row in replies
        ]

        # Check if the user purchased this variant
        variant = None
        if r.variant_id:
            variant = db.query(ProductVariant).filter(ProductVariant.id == r.variant_id).first()
            purchase = db.query(OrderItem).join(Order).filter(
                Order.user_id == r.user_id,
                OrderItem.variant_id == r.variant_id,
                Order.status == "paid"
            ).first()

            if purchase:
                verified = True

        voted = None
        if user_id:
            voted = db.execute(
                text("SELECT id FROM review_votes WHERE review_id = :review_id AND user_id = :user_id"),
                {"review_id": r.id, "user_id": user_id}
            ).fetchone()

        enriched_reviews.append({
            "id": r.id,
            "product_id": r.product_id,
            "variant_id": r.variant_id,
            "user_id": r.user_id,
            "rating": r.rating,
            "comment": r.comment,
            "images": r.images,
            "videos": r.videos,
            "created_at": r.created_at,
            "verified_purchase": verified,
            "color": variant.color if variant else None,
            "size": variant.size if variant else None,
            "user_voted": True if voted else False,
            "replies": reply_list,
            "helpful_count": db.execute(
                text("SELECT COUNT(*) FROM review_votes WHERE review_id = :rid"),
                {"rid": r.id}
            ).scalar() or 0
        })

    return enriched_reviews


@router.get("/reviews/user/{user_id}")
def get_user_reviews(user_id: int, db: Session = Depends(get_db)):
    """
    Fetch all reviews written by a specific user.
    Returns highly enriched data containing product names, variant details, and admin replies.
    """
    reviews = db.query(Review).filter(Review.user_id == user_id).order_by(Review.created_at.desc()).all()
    
    result = []
    
    for r in reviews:
        # Get Product Name
        product = db.query(Product).filter(Product.id == r.product_id).first()
        product_name = product.name if product else "Unknown Product"
        
        # Get Variant Details (Color, Size)
        variant_color = None
        variant_size = None
        if r.variant_id:
            variant = db.query(ProductVariant).filter(ProductVariant.id == r.variant_id).first()
            if variant:
                variant_color = variant.color
                variant_size = variant.size

        # Fetch admin replies for this specific review
        replies = db.execute(
            text("SELECT id, reply, created_at FROM review_replies WHERE review_id = :rid ORDER BY created_at ASC"),
            {"rid": r.id}
        ).fetchall()
        
        reply_list = [
            {
                "id": row.id,
                "reply": row.reply,
                "created_at": row.created_at
            }
            for row in replies
        ]
        
        result.append({
            "id": r.id,
            "product_id": r.product_id,
            "product_name": product_name,
            "rating": r.rating,
            "comment": r.comment,
            "images": r.images or [],
            "videos": r.videos or [],
            "color": variant_color,
            "size": variant_size,
            "created_at": r.created_at,
            "replies": reply_list
        })
        
    return result


# Endpoint to get review statistics for a product
@router.get("/reviews/{product_id}/stats")
def get_review_stats(product_id: int, db: Session = Depends(get_db)):

    total_reviews = db.query(func.count(Review.id)).filter(Review.product_id == product_id).scalar() or 0
    average_rating = db.query(func.avg(Review.rating)).filter(Review.product_id == product_id).scalar() or 0

    one_star = db.query(func.count(Review.id)).filter(Review.product_id == product_id, Review.rating == 1).scalar() or 0
    two_star = db.query(func.count(Review.id)).filter(Review.product_id == product_id, Review.rating == 2).scalar() or 0
    three_star = db.query(func.count(Review.id)).filter(Review.product_id == product_id, Review.rating == 3).scalar() or 0
    four_star = db.query(func.count(Review.id)).filter(Review.product_id == product_id, Review.rating == 4).scalar() or 0
    five_star = db.query(func.count(Review.id)).filter(Review.product_id == product_id, Review.rating == 5).scalar() or 0

    return {
        "product_id": product_id,
        "total_reviews": total_reviews,
        "average_rating": float(average_rating) if average_rating else 0,
        "distribution": {
            "1": one_star,
            "2": two_star,
            "3": three_star,
            "4": four_star,
            "5": five_star
        }
    }


# ---------------- HELPFUL VOTE (1 USER = 1 VOTE) ----------------
@router.post("/reviews/{review_id}/helpful")
def vote_helpful(
    review_id: int,
    user_id: int = Query(...),
    db: Session = Depends(get_db)
):

    review = db.query(Review).filter(Review.id == review_id).first()

    if not review:
        raise HTTPException(status_code=404, detail="Review not found")

    # Check if user already voted
    existing = db.execute(
        text("SELECT id FROM review_votes WHERE review_id = :review_id AND user_id = :user_id"),
        {"review_id": review_id, "user_id": user_id}
    ).fetchone()

    if existing:
        raise HTTPException(status_code=400, detail="You already voted this review")

    # Insert vote
    db.execute(
        text("INSERT INTO review_votes (review_id, user_id) VALUES (:review_id, :user_id)"),
        {"review_id": review_id, "user_id": user_id}
    )

    db.commit()

    helpful_count = db.execute(
        text("SELECT COUNT(*) FROM review_votes WHERE review_id = :rid"),
        {"rid": review_id}
    ).scalar() or 0

    return {
        "review_id": review_id,
        "helpful_count": helpful_count
    }


# ---------------- REMOVE HELPFUL VOTE ----------------
@router.delete("/reviews/{review_id}/helpful")
def remove_helpful_vote(
    review_id: int,
    user_id: int = Query(...),
    db: Session = Depends(get_db)
):

    review = db.query(Review).filter(Review.id == review_id).first()

    if not review:
        raise HTTPException(status_code=404, detail="Review not found")

    existing = db.execute(
        text("SELECT id FROM review_votes WHERE review_id = :review_id AND user_id = :user_id"),
        {"review_id": review_id, "user_id": user_id}
    ).fetchone()

    if not existing:
        raise HTTPException(status_code=400, detail="You have not voted this review")

    db.execute(
        text("DELETE FROM review_votes WHERE review_id = :review_id AND user_id = :user_id"),
        {"review_id": review_id, "user_id": user_id}
    )

    db.commit()

    helpful_count = db.execute(
        text("SELECT COUNT(*) FROM review_votes WHERE review_id = :rid"),
        {"rid": review_id}
    ).scalar() or 0

    return {
        "review_id": review_id,
        "helpful_count": helpful_count
    }

# ---------------- DELETE ADMIN REPLY ----------------
@router.delete("/reviews/replies/{reply_id}")
def delete_review_reply(reply_id: int, db: Session = Depends(get_db)):

    existing = db.execute(
        text("SELECT id FROM review_replies WHERE id = :rid"),
        {"rid": reply_id}
    ).fetchone()

    if not existing:
        raise HTTPException(status_code=404, detail="Reply not found")

    db.execute(
        text("DELETE FROM review_replies WHERE id = :rid"),
        {"rid": reply_id}
    )

    db.commit()

    return {"message": "Reply deleted"}


# ---------------- CREATE ADMIN REPLY ----------------
class ReviewReplyCreate(BaseModel):
    review_id: int
    reply: str

@router.post("/reviews/replies")
def create_review_reply(data: ReviewReplyCreate, db: Session = Depends(get_db)):

    # Ensure review exists
    review = db.query(Review).filter(Review.id == data.review_id).first()

    if not review:
        raise HTTPException(status_code=404, detail="Review not found")

    db.execute(
        text("INSERT INTO review_replies (review_id, reply) VALUES (:review_id, :reply)"),
        {"review_id": data.review_id, "reply": data.reply}
    )

    db.commit()

    return {"message": "Reply added"}