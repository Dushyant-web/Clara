from pydantic import BaseModel
from typing import Optional

class PromoApplyRequest(BaseModel):
    code: str
    order_amount: float

class PaymentCreateRequest(BaseModel):
    order_id: int
    provider: str

class PaymentConfirmRequest(BaseModel):
    payment_id: int
    transaction_id: str
