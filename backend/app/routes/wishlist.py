from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.db import get_db
from app.models.wishlist import Wishlist
from app.models.product import Product
from app.models.categories import Category
from datetime import datetime

router = APIRouter(prefix="/wishlist", tags=["Wishlist"])


# Add to wishlist
@router.post("/add")
def add_to_wishlist(user_id: int, product_id: int, db: Session = Depends(get_db)):

    existing = db.query(Wishlist).filter(
        Wishlist.user_id == user_id,
        Wishlist.product_id == product_id
    ).first()

    if existing:
        raise HTTPException(status_code=400, detail="Product already in wishlist")

    item = Wishlist(
        user_id=user_id,
        product_id=product_id,
        created_at=datetime.utcnow()
    )

    db.add(item)
    db.commit()
    db.refresh(item)

    return {"message": "Product added to wishlist", "wishlist_id": item.id}

from app.models.product_image import ProductImage

# Get wishlist for user
@router.get("/{user_id}")
def get_wishlist(user_id: int, db: Session = Depends(get_db)):

    results = (
        db.query(Product, Category.name.label("category"))
        .join(Wishlist, Wishlist.product_id == Product.id)
        .outerjoin(Category, Product.category_id == Category.id)
        .filter(Wishlist.user_id == user_id)
        .all()
    )

    wishlist_items = []
    for product, category in results:
        # Standardize image fallback
        display_image = product.image
        if not display_image:
            first_img = db.query(ProductImage).filter(ProductImage.product_id == product.id).order_by(ProductImage.position).first()
            if first_img:
                display_image = first_img.image_url

        wishlist_items.append({
            "id": product.id,
            "name": product.name,
            "price": product.price,
            "category": category,
            "image": display_image
        })

    return wishlist_items


# Remove from wishlist
@router.delete("/remove/{product_id}")
def remove_from_wishlist(user_id: int, product_id: int, db: Session = Depends(get_db)):

    item = db.query(Wishlist).filter(
        Wishlist.user_id == user_id,
        Wishlist.product_id == product_id
    ).first()

    if not item:
        raise HTTPException(status_code=404, detail="Wishlist item not found")

    db.delete(item)
    db.commit()

    return {"message": "Removed from wishlist"}