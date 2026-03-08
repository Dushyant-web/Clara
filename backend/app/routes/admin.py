from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.db import get_db
from app.models.product import Product
from app.models.product_variant import ProductVariant
from app.models.promo_code import PromoCode
from datetime import datetime



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

@router.post("/promo")
def create_promo(
    code: str,
    discount_type: str,
    discount_value: float,
    min_order_amount: float = 0,
    max_discount: float = None,
    usage_limit: int = None,
    db: Session = Depends(get_db)
):

    promo = PromoCode(
        code=code,
        discount_type=discount_type,
        discount_value=discount_value,
        min_order_amount=min_order_amount,
        max_discount=max_discount,
        usage_limit=usage_limit
    )

    db.add(promo)
    db.commit()
    db.refresh(promo)

    return promo

@router.get("/promos")
def get_promos(db: Session = Depends(get_db)):

    promos = db.query(PromoCode).all()

    return promos


@router.put("/promo/{promo_id}/disable")
def disable_promo(promo_id: int, db: Session = Depends(get_db)):

    promo = db.query(PromoCode).filter(PromoCode.id == promo_id).first()

    promo.active = False
    db.commit()

    return {"message": "promo disabled"}


@router.delete("/promo/{promo_id}")
def delete_promo(promo_id: int, db: Session = Depends(get_db)):

    db.query(PromoCode).filter(PromoCode.id == promo_id).delete()
    db.commit()

    return {"message": "promo deleted"}