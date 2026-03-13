from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.db import get_db
from app.models.review import Review

router = APIRouter()


@router.post("/reviews")
def create_review(
    product_id: int,
    user_id: int,
    rating: int,
    comment: str,
    variant_id: int | None = None,
    images: list[str] | None = None,
    videos: list[str] | None = None,
    db: Session = Depends(get_db)
):

    review = Review(
        product_id=product_id,
        variant_id=variant_id,
        user_id=user_id,
        rating=rating,
        comment=comment,
        images=images,
        videos=videos
    )

    db.add(review)
    db.commit()
    db.refresh(review)

    return review


@router.get("/reviews/{product_id}")
def get_reviews(
    product_id: int,
    rating: int | None = None,
    photos: bool = False,
    db: Session = Depends(get_db)
):

    query = db.query(Review).filter(Review.product_id == product_id)

    if rating:
        query = query.filter(Review.rating == rating)

    if photos:
        query = query.filter(Review.images.isnot(None))

    reviews = query.order_by(Review.created_at.desc()).all()

    return reviews