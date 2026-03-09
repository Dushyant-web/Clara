from pydantic import BaseModel

class WishlistCreate(BaseModel):
    user_id: int
    product_id: int