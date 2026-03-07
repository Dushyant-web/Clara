from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_
from app.database.db import get_db
from app.models.product import Product
from app.models.categories import Category

router = APIRouter()


@router.get("/products")
def get_products(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db)
):

    offset = (page - 1) * limit

    results = (
        db.query(Product, Category.name.label("category"))
        .outerjoin(Category, Product.category_id == Category.id)
        .offset(offset)
        .limit(limit)
        .all()
    )

    products = []

    for product, category in results:
        products.append({
            "id": product.id,
            "name": product.name,
            "price": product.price,
            "category": category
        })

    return {
        "page": page,
        "limit": limit,
        "products": products
    }


@router.get("/products/{product_id}")
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    return product