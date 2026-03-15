from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.db import get_db
from app.models.address import Address

router = APIRouter()


from app.schemas.address import AddressCreate

@router.post("/address")
def create_address(
    data: AddressCreate,
    db: Session = Depends(get_db)
):

    address = Address(
        user_id=data.user_id,
        name=data.name,
        phone=data.phone,
        address_line=data.address_line,
        city=data.city,
        state=data.state,
        postal_code=data.postal_code,
        country=data.country,
        label=data.label
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
    data: AddressCreate,
    db: Session = Depends(get_db)
):

    address = db.query(Address).filter(Address.id == address_id).first()

    if not address:
        return {"error": "address not found"}

    address.name = data.name
    address.phone = data.phone
    address.address_line = data.address_line
    address.city = data.city
    address.state = data.state
    address.postal_code = data.postal_code
    address.country = data.country
    address.label = data.label

    db.commit()
    db.refresh(address)

    return address


@router.delete("/address/{address_id}")
def delete_address(address_id: int, db: Session = Depends(get_db)):

    db.query(Address).filter(Address.id == address_id).delete()
    db.commit()

    return {"message": "address deleted"}