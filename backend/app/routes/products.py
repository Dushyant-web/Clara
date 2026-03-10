from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import and_
from app.database.db import get_db
from app.models.product import Product
from app.models.categories import Category
from app.models.product_image import ProductImage

from app.models.product_variant import ProductVariant

router = APIRouter()


@router.get("/products")
def get_products(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=500),
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
        # Standardize image fallback
        display_image = product.image
        if not display_image:
            first_img = db.query(ProductImage).filter(ProductImage.product_id == product.id).order_by(ProductImage.position).first()
            if first_img:
                display_image = first_img.image_url

        products.append({
            "id": product.id,
            "name": product.name,
            "price": product.price,
            "category": category,
            "image": display_image
        })

    return {
        "page": page,
        "limit": limit,
        "products": products
    }


@router.get("/products/{product_id}")
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    variants = db.query(ProductVariant).filter(ProductVariant.product_id == product_id).all()
    
    product_data = {
        "id": product.id,
        "name": product.name,
        "description": product.description,
        "price": product.price,
        "image": product.image,
        "category_id": product.category_id,
        "variants": [
            {
                "id": v.id,
                "size": v.size,
                "color": v.color,
                "price": v.price,
                "stock": v.stock,
                "sku": v.sku
            } for v in variants
        ]
    }
    return product_data

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


@router.get("/products/{product_id}/images")
def get_product_images(product_id: int, db: Session = Depends(get_db)):

    images = (
        db.query(ProductImage)
        .filter(ProductImage.product_id == product_id)
        .order_by(ProductImage.position)
        .all()
    )

    if not images:
        return {
            "main_image": None,
            "hover_image": None,
            "gallery": []
        }

    main_image = images[0].image_url if len(images) >= 1 else None
    hover_image = images[1].image_url if len(images) >= 2 else None

    gallery = [img.image_url for img in images[2:]]

    return {
        "main_image": main_image,
        "hover_image": hover_image,
        "gallery": gallery
    }