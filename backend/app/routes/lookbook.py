from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.db import get_db
from app.models.lookbook import Lookbook
from app.models.lookbook import LookbookImage

router = APIRouter()

# create lookbook (admin)
@router.post("/admin/lookbook")
def create_lookbook(
    title: str,
    description: str = "",
    image: str = "",
    season: str = "",
    db: Session = Depends(get_db)
):

    lookbook = Lookbook(
        title=title,
        description=description,
        image=image,
        season=season
    )

    db.add(lookbook)
    db.commit()
    db.refresh(lookbook)

    return lookbook


# get all lookbooks
@router.get("/lookbooks")
def get_lookbooks(db: Session = Depends(get_db)):

    return db.query(Lookbook).all()


# get single lookbook
@router.get("/lookbooks/{id}")
def get_lookbook(id: int, db: Session = Depends(get_db)):

    lookbook = db.query(Lookbook).filter(Lookbook.id == id).first()

    if not lookbook:
        return {"error": "Lookbook not found"}

    return lookbook

@router.get("/lookbooks/{lookbook_id}/images")
def get_lookbook_images(lookbook_id: int, db: Session = Depends(get_db)):

    images = db.query(LookbookImage).filter(
        LookbookImage.lookbook_id == lookbook_id
    ).all()

    return images

@router.delete("/admin/lookbook-image/{image_id}")
def delete_lookbook_image(image_id: int, db: Session = Depends(get_db)):

    image = db.query(LookbookImage).filter(LookbookImage.id == image_id).first()

    if not image:
        return {"error": "Image not found"}

    db.delete(image)
    db.commit()

    return {"message": "Lookbook image deleted", "image_id": image_id}