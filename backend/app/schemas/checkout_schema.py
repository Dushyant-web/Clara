from pydantic import BaseModel
from typing import Optional

class PromoApplyRequest(BaseModel):
    code: str
    user_id: int
    order_id: Optional[int] = None

class PaymentCreateRequest(BaseModel):
    order_id: int
    provider: str

class PaymentConfirmRequest(BaseModel):
    payment_id: int
    transaction_id: str
