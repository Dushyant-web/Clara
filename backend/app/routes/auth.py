from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.db import get_db
from app.models.user import User
from app.services.firebase_auth import verify_firebase_token
from app.utils.jwt_handler import create_token

router = APIRouter()

@router.post("/signup")
def signup(data: dict, db: Session = Depends(get_db)):

    token = data.get("id_token")

    name = data.get("name")
    email = data.get("email")

    phone = verify_firebase_token(token)

    existing_user = db.query(User).filter(User.phone == phone).first()

    if existing_user:
        raise HTTPException(status_code=400, detail="User already exists")

    user = User(
        phone=phone,
        name=name,
        email=email
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    jwt_token = create_token({"user_id": user.id})

    return {
        "message": "account created",
        "access_token": jwt_token,
        "user_id": user.id,
        "name": user.name,
        "email": user.email
    }

@router.post("/login")
def login(data: dict, db: Session = Depends(get_db)):

    token = data.get("id_token")

    phone = verify_firebase_token(token)

    user = db.query(User).filter(User.phone == phone).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    jwt_token = create_token({"user_id": user.id})

    return {
        "access_token": jwt_token,
        "user_id": user.id,
        "name": user.name,
        "email": user.email
    }