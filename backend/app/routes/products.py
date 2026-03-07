from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.db import get_db
from app.models.product import Product

router = APIRouter()

@router.get("/products")
def get_products(db: Session = Depends(get_db)):
    products = db.query(Product).all()
    return products


@router.get("/products/{product_id}")
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    return product