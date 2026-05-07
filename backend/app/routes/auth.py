from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from app.database.db import get_db
from app.models.user import User
from app.services.firebase_auth import verify_firebase_token
from app.utils.jwt_handler import create_token
from app.utils.rate_limiter import limiter

router = APIRouter()

@limiter.limit("5/minute")
@router.post("/signup")
def signup(request: Request, data: dict, db: Session = Depends(get_db)):

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
        "email": user.email,
        "created_at": user.created_at.isoformat() if user.created_at else None
    }

@limiter.limit("5/minute")
@router.post("/login")
def login(request: Request, data: dict, db: Session = Depends(get_db)):

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
        "email": user.email,
        "created_at": user.created_at.isoformat() if user.created_at else None
    }