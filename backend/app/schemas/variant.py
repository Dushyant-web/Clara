from pydantic import BaseModel

class VariantCreate(BaseModel):
    size: str
    color: str
    price: int
    stock: int
    image_url: str
    sku: str