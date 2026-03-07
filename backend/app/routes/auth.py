from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.db import get_db
from app.models.user import User
from app.services.firebase_auth import verify_firebase_token

router = APIRouter()

@router.post("/firebase-login")
def firebase_login(data: dict, db: Session = Depends(get_db)):

    token = data.get("id_token")

    phone = verify_firebase_token(token)

    user = db.query(User).filter(User.phone_number == phone).first()

    if not user:
        user = User(phone_number=phone)
        db.add(user)
        db.commit()
        db.refresh(user)

    return {
        "message": "login successful",
        "user_id": user.id
    }