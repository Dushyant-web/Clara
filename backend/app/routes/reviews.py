from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database.db import get_db
from app.models.review import Review

router = APIRouter()


@router.post("/reviews")
def create_review(product_id:int,user_id:int,rating:int,comment:str,db:Session=Depends(get_db)):

    review = Review(
        product_id=product_id,
        user_id=user_id,
        rating=rating,
        comment=comment
    )

    db.add(review)
    db.commit()
    db.refresh(review)

    return review


@router.get("/reviews/{product_id}")
def get_reviews(product_id:int,db:Session=Depends(get_db)):

    return db.query(Review).filter(Review.product_id==product_id).all()

# ---------------- ADMIN REVIEW MODERATION ---------------- #

@router.get("/admin/reviews")
def admin_get_reviews(rating: int | None = None, db: Session = Depends(get_db)):
    query = db.query(Review)

    if rating:
        query = query.filter(Review.rating == rating)

    reviews = query.order_by(Review.id.desc()).all()
    return {"reviews": reviews}


@router.get("/admin/reviews/stats")
def admin_review_stats(db: Session = Depends(get_db)):
    total_count = db.query(func.count(Review.id)).scalar() or 0
    average_rating = db.query(func.avg(Review.rating)).scalar() or 0

    return {
        "total_count": total_count,
        "average_rating": float(average_rating) if average_rating else 0
    }


@router.delete("/admin/reviews/{review_id}")
def delete_review(review_id: int, db: Session = Depends(get_db)):
    review = db.query(Review).filter(Review.id == review_id).first()

    if not review:
        return {"message": "Review not found"}

    db.delete(review)
    db.commit()

    return {"message": "Review deleted"}