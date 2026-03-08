from fastapi import APIRouter, Depends, Query, HTTPException
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

@router.get("/products/{product_id}/related")
def get_related_products(product_id: int, db: Session = Depends(get_db)):

    product = db.query(Product).filter(Product.id == product_id).first()

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    related_products = (
        db.query(Product)
        .filter(Product.category_id == product.category_id)
        .filter(Product.id != product_id)
        .limit(4)
        .all()
    )

    result = []

    for p in related_products:
        result.append({
            "id": p.id,
            "name": p.name,
            "price": p.price,
            "image": p.image
        })

    return result