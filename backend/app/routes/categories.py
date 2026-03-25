from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database.db import get_db
from app.models.categories import Category
from app.models.product import Product

from app.utils.admin_auth import admin_required

router = APIRouter()


# Pydantic schema for category creation
class CategoryCreate(BaseModel):
    name: str
    slug: str

@router.get("/categories")
def get_categories(db: Session = Depends(get_db)):
    return db.query(Category).all()


@router.get("/products/category/{slug}")
def get_products_by_category(slug: str, db: Session = Depends(get_db)):

    category = db.query(Category).filter(Category.slug == slug).first()

    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    return (
        db.query(Product)
        .filter(Product.category_id == category.id)
        .limit(12)
        .all()
    )


# Unified product query endpoint with search, category, sorting, min_price
@router.get("/products")
def get_products(
    search: str | None = Query(None),
    category: str | None = Query(None),
    sort: str | None = Query("newest"),
    min_price: float | None = Query(None),
    max_price: float | None = Query(None),
    page: int = Query(1),
    limit: int = Query(40),
    db: Session = Depends(get_db)
):

    query = db.query(Product, Category.slug.label("category_slug"), Category.name.label("category_name")).join(Category, Product.category_id == Category.id)

    # Search (simple partial search, your trigram search can replace this later)
    if search:
        query = query.filter(Product.name.ilike(f"%{search}%"))

    # Category filter
    if category and category != "all":
        cat = db.query(Category).filter(Category.slug == category).first()

        # If category slug does not exist, return empty result instead of all products
        if not cat:
            return {
                "products": [],
                "total": 0,
                "page": page,
                "limit": limit,
                "pages": 0
            }

        query = query.filter(Product.category_id == cat.id)

    # Price filters
    if min_price is not None:
        query = query.filter(Product.price >= min_price)

    if max_price is not None:
        query = query.filter(Product.price <= max_price)

    # Sorting
    if sort == "price_asc":
        query = query.order_by(Product.price.asc())
    elif sort == "price_desc":
        query = query.order_by(Product.price.desc())
    else:
        query = query.order_by(Product.created_at.desc())

    total = query.count()

    results = (
        query
        .offset((page - 1) * limit)
        .limit(limit)
        .all()
    )

    products = []
    for product, category_slug, category_name in results:
        products.append({
            "id": product.id,
            "name": product.name,
            "price": product.price,
            "main_image": getattr(product, "main_image", None),
            "hover_image": getattr(product, "hover_image", None),
            "created_at": product.created_at,
            "category_slug": category_slug,
            "category": category_name
        })

    return {
        "products": products,
        "total": total,
        "page": page,
        "limit": limit,
        "pages": (total + limit - 1) // limit
    }

@router.post("/admin/category", dependencies=[Depends(admin_required)])
def create_category(data: CategoryCreate, db: Session = Depends(get_db)):

    existing = db.query(Category).filter(Category.slug == data.slug).first()
    if existing:
        return existing   # just return existing instead of failing
    category = Category(
        name=data.name,
        slug=data.slug
    )
    db.add(category)
    db.commit()
    db.refresh(category)
    return category


# Delete category (admin)
@router.delete("/admin/category/{category_id}", dependencies=[Depends(admin_required)])
def delete_category(category_id: int, db: Session = Depends(get_db)):


    category = db.query(Category).filter(Category.id == category_id).first()

    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    db.delete(category)
    db.commit()

    return {"message": "Category deleted"}