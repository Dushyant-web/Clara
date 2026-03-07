from pydantic import BaseModel


class SendOTP(BaseModel):
    phone_number: str


class VerifyOTP(BaseModel):
    phone_number: str
    otp: str


class UserResponse(BaseModel):
    id: int
    phone_number: str
    email: str | None
    name: str | None

    class Config:
        orm_mode = True