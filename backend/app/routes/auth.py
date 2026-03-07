from fastapi import APIRouter
from app.services.firebase_auth import verify_firebase_token
from app.utils.jwt_handler import create_token

router = APIRouter()

@router.post("/firebase-login")
def firebase_login(data: dict):

    id_token = data.get("id_token")

    phone = verify_firebase_token(id_token)

    token = create_token({"phone": phone})

    return {
        "message": "login success",
        "token": token,
        "phone": phone
    }