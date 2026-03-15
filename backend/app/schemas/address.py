from pydantic import BaseModel

class AddressCreate(BaseModel):
    user_id: int
    name: str
    phone: str
    address_line: str
    city: str
    state: str
    postal_code: str
    country: str
    label: str | None = None