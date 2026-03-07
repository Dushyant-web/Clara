from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_
from app.database.db import get_db
from app.models.product import Product
from app.models.category import Category
from app.models.product_image import ProductImage

router = APIRouter()


@router.get("/products")
def get_products(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db)
):

    offset = (page - 1) * limit

    results = (
        db.query(Product, Category.name.label("category"), ProductImage.image_url.label("image"))
        .outerjoin(Category, Product.category_id == Category.id)
        .outerjoin(
            ProductImage,
            and_(ProductImage.product_id == Product.id, ProductImage.is_primary == True)
        )
        .offset(offset)
        .limit(limit)
        .all()
    )

    products = []

    for product, category, image in results:
        products.append({
            "id": product.id,
            "name": product.name,
            "price": product.price,
            "category": category,
            "image": image
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