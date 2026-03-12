from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.db import get_db
from app.models.product_variant import ProductVariant
from app.models.product import Product

router = APIRouter(prefix="/admin")


@router.post("/product/{product_id}/variant")
def create_variant(product_id: int, variant: dict, db: Session = Depends(get_db)):

    product = db.query(Product).filter(Product.id == product_id).first()

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    new_variant = ProductVariant(
        product_id=product_id,
        size=variant.get("size"),
        color=variant.get("color"),
        price=variant.get("price"),
        stock=variant.get("stock"),
        image_url=variant.get("image_url"),
        sku=variant.get("sku")
    )

    db.add(new_variant)
    db.commit()
    db.refresh(new_variant)

    return new_variant

@router.get("/product/{product_id}/variants")
def get_variants(product_id: int, db: Session = Depends(get_db)):

    variants = db.query(ProductVariant).filter(
        ProductVariant.product_id == product_id
    ).all()

    return variants

@router.put("/variant/{variant_id}")
def update_variant(variant_id: int, variant: dict, db: Session = Depends(get_db)):

    v = db.query(ProductVariant).filter(ProductVariant.id == variant_id).first()

    if not v:
        raise HTTPException(status_code=404, detail="Variant not found")

    v.size = variant.get("size", v.size)
    v.color = variant.get("color", v.color)
    v.price = variant.get("price", v.price)
    v.stock = variant.get("stock", v.stock)
    v.image_url = variant.get("image_url", v.image_url)

    db.commit()

    return {"message": "Variant updated"}


@router.delete("/variant/{variant_id}")
def delete_variant(variant_id: int, db: Session = Depends(get_db)):

    variant = db.query(ProductVariant).filter(
        ProductVariant.id == variant_id
    ).first()

    if not variant:
        raise HTTPException(status_code=404, detail="Variant not found")

    db.delete(variant)
    db.commit()

    return {"message": "Variant deleted"}