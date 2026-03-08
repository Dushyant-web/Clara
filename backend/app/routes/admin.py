from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.db import get_db
from app.models.product import Product
from app.models.product_variant import ProductVariant


router = APIRouter(prefix="/admin")

@router.post("/product")
def create_product(
    title: str,
    description: str,
    category_id: int,
    db: Session = Depends(get_db)
):

    product = Product(
        name=title,
        description=description,
        category_id=category_id,
        price=0
    )

    db.add(product)
    db.commit()
    db.refresh(product)

    return product

@router.post("/product/{product_id}/variant")
def create_variant(
    product_id: int,
    price: float,
    stock: int,
    sku: str,
    db: Session = Depends(get_db)
):

    variant = ProductVariant(
        product_id=product_id,
        price=price,
        stock=stock,
        sku=sku
    )

    db.add(variant)
    db.commit()
    db.refresh(variant)

    return variant

@router.put("/variant/{variant_id}/stock")
def update_stock(
    variant_id: int,
    stock: int,
    db: Session = Depends(get_db)
):

    variant = db.query(ProductVariant).filter(ProductVariant.id == variant_id).first()

    variant.stock = stock
    db.commit()

    return {"message": "stock updated"}

@router.put("/variant/{variant_id}/price")
def update_price(
    variant_id: int,
    price: float,
    db: Session = Depends(get_db)
):

    variant = db.query(ProductVariant).filter(ProductVariant.id == variant_id).first()

    variant.price = price
    db.commit()

    return {"message": "price updated"}

@router.delete("/product/{product_id}")
def delete_product(product_id: int, db: Session = Depends(get_db)):

    db.query(Product).filter(Product.id == product_id).delete()
    db.commit()

    return {"message": "product deleted"}