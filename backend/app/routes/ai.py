from fastapi import APIRouter, Depends, Body
from sqlalchemy.orm import Session

from app.database.db import get_db
from app.models.product import Product

router = APIRouter()


@router.post("/ai/chat")
def ai_chat(data: dict = Body(...), db: Session = Depends(get_db)):
    message = data.get("message", "").strip()
    if not message:
        return {"reply": "How may I assist your selection today?"}
    
    msg = message.lower()
    
    # --- Intent 1: Greetings ---
    greetings = ["hi", "hello", "hey", "greetings", "good morning", "good evening"]
    if any(word == msg or msg.startswith(word + " ") for word in greetings):
        return {
            "reply": "Welcome to the Elite Concierge. I am here to assist you in discovering our finest collections and ensuring a seamless experience. How may I serve you?"
        }

    # --- Intent 2: Shipping & Returns ---
    if any(word in msg for word in ["shipping", "delivery", "track", "arrive", "time"]):
        return {
            "reply": "We offer complimentary express shipping on all orders above ₹500. Standard delivery typically takes 3-5 business days. You can track your pieces in real-time through the 'Account' section once they are dispatched."
        }
    
    if any(word in msg for word in ["return", "exchange", "refund", "change"]):
        return {
            "reply": "Our return policy is as effortless as our aesthetic. We offer a 30-day complimentary return and exchange window for all unworn pieces in their original packaging."
        }

    # --- Intent 3: Product Discovery / Search ---
    # Define primary keywords for database lookup
    search_terms = {
        "hoodie": ["hoodie", "hoodies", "oversized hoodie"],
        "tee": ["tee", "t-shirt", "shirt", "top"],
        "jacket": ["jacket", "outerwear", "coat"],
        "pant": ["pant", "trouser", "bottom", "trackpant"],
        "suit": ["suit", "blazer", "formal"]
    }

    found_category = None
    for category, keywords in search_terms.items():
        if any(kw in msg for kw in keywords):
            found_category = category
            break

    if found_category or "collection" in msg or "show" in msg or "look" in msg:
        query_word = found_category if found_category else ""
        products = db.query(Product).filter(
            (Product.name.ilike(f"%{query_word}%")) | 
            (Product.description.ilike(f"%{msg}%"))
        ).limit(3).all()

        if products:
            product_list = [p.name for p in products]
            return {
                "reply": f"I have curated a selection of our finest {found_category if found_category else 'pieces'} for you. Our {product_list[0]} is a particularly distinguished choice.",
                "products": product_list,
                "action": "view_collection"
            }
        else:
            return {
                "reply": "Our latest collection is currently being curated. However, I recommend exploring our 'Best Sellers' for our most coveted silhouettes."
            }

    # --- Intent 4: Styling Advice & Luxury Context ---
    if any(word in msg for word in ["elegant", "evening", "party", "formal", "wedding"]):
        return {
            "reply": "For distinguished evening affairs, I suggest pieces with structured silhouettes and premium fabrics. Our 'Midnight' series offers the perfect balance of modern luxury and timeless grace."
        }
    
    if any(word in msg for word in ["material", "fabric", "cotton", "quality", "made"]):
        return {
            "reply": "We source only the highest grade sustainable materials globally. From premium heavy-weight cotton to ethically sourced blends, every piece is crafted to endure the test of time and trend."
        }

    # --- Intent 5: Human Contact / Support ---
    if any(word in msg for word in ["human", "person", "talk to someone", "support", "agent"]):
        return {
            "reply": "While I am an AI, I can certainly flag your request for our human representatives. Would you like me to notify an Elite Concierge specialist to contact you via email?"
        }

    # --- Default Fallback ---
    return {
        "reply": "I am here to ensure your experience exceeds expectations. Could you tell me more about the specific style or service you are seeking?"
    }