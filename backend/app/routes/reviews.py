from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

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