from fastapi import APIRouter
from app.services.firebase_auth import verify_firebase_token
from app.utils.jwt_handler import create_token

router = APIRouter()


@router.post("/firebase-login")
def firebase_login(data: dict):

    id_token = data.get("id_token")

    if not id_token:
        return {"error": "token missing"}

    phone = verify_firebase_token(id_token)

    jwt_token = create_token({"phone": phone})

    return {
        "message": "login success",
        "token": jwt_token,
        "phone": phone
    }