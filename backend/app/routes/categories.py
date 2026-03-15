from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database.db import get_db
from app.models.categories import Category
from app.models.product import Product

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

    query = db.query(Product)

    # Search (simple partial search, your trigram search can replace this later)
    if search:
        query = query.filter(Product.name.ilike(f"%{search}%"))

    # Category filter
    if category and category != "all":
        cat = db.query(Category).filter(Category.slug == category).first()
        if cat:
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

    products = (
        query
        .offset((page - 1) * limit)
        .limit(limit)
        .all()
    )

    return {
        "products": products,
        "total": total,
        "page": page,
        "limit": limit,
        "pages": (total + limit - 1) // limit
    }

@router.post("/admin/category")
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