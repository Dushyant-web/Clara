from fastapi import APIRouter, Depends, Body
from sqlalchemy.orm import Session

from app.database.db import get_db
from app.models.product import Product

router = APIRouter()


@router.post("/ai/chat")
def ai_chat(data: dict = Body(...), db: Session = Depends(get_db)):

    message = data.get("message", "")
    msg = message.lower()

    # hoodie search
    if "hoodie" in msg:
        products = db.query(Product).filter(Product.name.ilike("%hoodie%")).all()

        return {
            "reply": "Here are some hoodies you may like.",
            "products": [p.name for p in products]
        }

    # elegant / evening suggestion
    if "elegant" in msg or "evening" in msg:
        return {
            "reply": "I recommend exploring our Evening Edit collection for elegant looks."
        }

    # jacket suggestion
    if "jacket" in msg:
        products = db.query(Product).filter(Product.name.ilike("%jacket%")).all()

        return {
            "reply": "You might like these jackets.",
            "products": [p.name for p in products]
        }

    # default fallback
    return {
        "reply": "Our latest collections feature timeless luxury pieces crafted for modern elegance."
    }