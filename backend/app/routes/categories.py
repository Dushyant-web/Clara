from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.db import get_db
from app.models.category import Category

router = APIRouter()

@router.get("/categories")
def get_categories(db: Session = Depends(get_db)):
    return db.query(Category).all()

@router.get("/products/category/{slug}")
def get_products_by_category(slug: str, db: Session = Depends(get_db)):

    category = db.query(Category).filter(Category.slug == slug).first()

    if not category:
        return []

    return db.query(Product).filter(Product.category_id == category.id).all()