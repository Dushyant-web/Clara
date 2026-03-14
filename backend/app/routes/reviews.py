from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import func, text

from app.database.db import get_db
from app.models.review import Review
from app.models.order import Order
from app.models.order_item import OrderItem

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

        # Check if the user purchased this variant
        if r.variant_id:
            purchase = db.query(OrderItem).join(Order).filter(
                Order.user_id == r.user_id,
                OrderItem.variant_id == r.variant_id,
                OrderItem.order_id == Order.id
            ).first()

            if purchase:
                verified = True

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
            "helpful_count": db.execute(
                text("SELECT COUNT(*) FROM review_votes WHERE review_id = :rid"),
                {"rid": r.id}
            ).scalar() or 0
        })

    return enriched_reviews


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