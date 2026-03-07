from fastapi import APIRouter
from app.schemas.user_schema import SendOTP
from app.services.otp_service import send_otp

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/send-otp")
def send_otp_route(data: SendOTP):

    response = send_otp(data.phone_number)

    return {
        "status": "OTP sent",
        "provider_response": response
    }