from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.db import get_db
from app.models.collection import Collection
from app.models.product import Product

router = APIRouter()

# Create collection (admin)
@router.post("/admin/collection")
def create_collection(name: str, slug: str, description: str = "", db: Session = Depends(get_db)):

    collection = Collection(
        name=name,
        slug=slug,
        description=description
    )

    db.add(collection)
    db.commit()
    db.refresh(collection)

    return collection


# Get all collections
@router.get("/collections")
def get_collections(db: Session = Depends(get_db)):
    return db.query(Collection).all()


# Get products in collection
@router.get("/collections/{slug}/products")
def get_collection_products(slug: str, db: Session = Depends(get_db)):

    collection = db.query(Collection).filter(Collection.slug == slug).first()

    if not collection:
        return {"error": "Collection not found"}

    products = db.query(Product).filter(Product.collection_id == collection.id).all()

    return products