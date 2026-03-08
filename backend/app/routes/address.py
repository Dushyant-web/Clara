from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.db import get_db
from app.models.address import Address

router = APIRouter()


@router.post("/address")
def create_address(
    user_id: int,
    full_name: str,
    phone: str,
    address_line: str,
    city: str,
    state: str,
    postal_code: str,
    country: str,
    db: Session = Depends(get_db)
):

    address = Address(
        user_id=user_id,
        name=full_name,
        phone=phone,
        address_line=address_line,
        city=city,
        state=state,
        postal_code=postal_code,
        country=country
    )

    db.add(address)
    db.commit()
    db.refresh(address)

    return address

@router.get("/addresses/{user_id}")
def get_addresses(user_id: int, db: Session = Depends(get_db)):

    return db.query(Address).filter(Address.user_id == user_id).all()

@router.put("/address/{address_id}")
def update_address(
    address_id: int,
    address_line: str,
    city: str,
    state: str,
    postal_code: str,
    db: Session = Depends(get_db)
):

    address = db.query(Address).filter(Address.id == address_id).first()

    if not address:
        return {"error": "address not found"}

    address.address_line = address_line
    address.city = city
    address.state = state
    address.postal_code = postal_code

    db.commit()

    return {"message": "address updated"}


@router.delete("/address/{address_id}")
def delete_address(address_id: int, db: Session = Depends(get_db)):

    db.query(Address).filter(Address.id == address_id).delete()
    db.commit()

    return {"message": "address deleted"}