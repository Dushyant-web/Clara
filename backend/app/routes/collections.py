from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.db import get_db
from app.models.collection import Collection
from app.models.product import Product

from app.models.collection import CollectionImage

from fastapi import HTTPException
from sqlalchemy.exc import IntegrityError



router = APIRouter()

# Create collection (admin)
@router.post("/admin/collection")
def create_collection(name: str, slug: str, description: str = "", db: Session = Depends(get_db)):

    collection = Collection(
        name=name,
        slug=slug,
        description=description
    )

    try:
        db.add(collection)
        db.commit()
        db.refresh(collection)
        return collection

    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="Collection slug already exists")


# Get all collections
@router.get("/collections")
def get_collections(db: Session = Depends(get_db)):

    collections = db.query(Collection).all()

    result = []

    for c in collections:

        hero_image = (
            db.query(CollectionImage)
            .filter(CollectionImage.collection_id == c.id)
            .first()
        )

        result.append({
            "id": c.id,
            "name": c.name,
            "slug": c.slug,
            "description": c.description,
            "hero_image": hero_image.image_url if hero_image else None
        })

    return result


# Get products in collection
@router.get("/collections/{slug}/products")
def get_collection_products(slug: str, db: Session = Depends(get_db)):

    collection = db.query(Collection).filter(Collection.slug == slug).first()

    if not collection:
        return {"error": "Collection not found"}

    products = db.query(Product).filter(Product.collection_id == collection.id).all()

    return products


@router.delete("/admin/collection/{collection_id}")
def delete_collection(collection_id: int, db: Session = Depends(get_db)):

    collection = db.query(Collection).filter(Collection.id == collection_id).first()

    if not collection:
        raise HTTPException(status_code=404, detail="Collection not found")

    db.delete(collection)
    db.commit()

    return {"message": "Collection deleted"}

@router.get("/collections/{collection_id}/images")
def get_collection_images(collection_id: int, db: Session = Depends(get_db)):

    images = db.query(CollectionImage).filter(
        CollectionImage.collection_id == collection_id
    ).all()

    return [
        {
            "id": img.id,
            "image_url": img.image_url
        }
        for img in images
    ]

@router.get("/collections/{slug}")
def get_collection(slug: str, db: Session = Depends(get_db)):
    collection = db.query(Collection).filter(Collection.slug == slug).first()

    if not collection:
        raise HTTPException(status_code=404, detail="Collection not found")

    return collection