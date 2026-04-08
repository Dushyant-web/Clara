import os
from fastapi import APIRouter, Depends, Body, HTTPException
from sqlalchemy.orm import Session
from openai import OpenAI

from app.database.db import get_db
from app.models.product import Product

router = APIRouter()

NVIDIA_API_KEY = os.getenv("NVIDIA_API_KEY")

# NVIDIA NIM uses an OpenAI-compatible endpoint
nvidia_client = OpenAI(
    base_url="https://integrate.api.nvidia.com/v1",
    api_key=NVIDIA_API_KEY
) if NVIDIA_API_KEY else None


ABUSE_WORDS = [
    "fuck", "chutiya", "madarchod", "bhenchod", "gaandu", "bhosdike",
    "randi", "harami", "saala", "bastard", "bitch", "asshole", "idiot",
    "shit", "damn", "crap", "motherfucker", "dick", "pussy", "lund"
]

def is_abusive(message: str) -> bool:
    msg = message.lower()
    return any(word in msg for word in ABUSE_WORDS)


def get_product_context(db: Session, message: str) -> str:
    """Fetch relevant products from DB and inject them as context."""
    msg = message.lower()
    products = db.query(Product).filter(
        Product.status == "active",
        (
            Product.name.ilike(f"%{msg}%") |
            Product.description.ilike(f"%{msg}%")
        )
    ).limit(5).all()

    if not products:
        # Fallback: return a few active products for general context
        products = db.query(Product).filter(Product.status == "active").limit(5).all()

    if not products:
        return "No products currently available."

    lines = []
    for p in products:
        lines.append(f"- {p.name}: {p.description or 'Luxury fashion piece'}")
    return "\n".join(lines)


SYSTEM_PROMPT = """You are the Elite Concierge for GAURK, an exclusive luxury fashion brand based in India.
You assist customers in a warm, sophisticated, and concise manner.

Your responsibilities:
- Help customers discover products from our catalog
- Answer questions about shipping (3-5 business days, free above ₹500), returns (30-day window), and sizing
- Provide styling advice aligned with the GAURK luxury aesthetic
- Direct complex issues to: gaurkclothing@gmail.com or WhatsApp +91 92179 60147

STRICT RULES — you must follow these without exception:
- ONLY mention products that are explicitly listed in the GAURK CATALOG provided in the user message
- If the catalog is empty or says "No products currently available", tell the customer we are currently updating our collection and to check back soon
- NEVER invent, guess, or fabricate product names, descriptions, or details
- NEVER reference products not in the provided catalog, no matter what
- Keep responses short (2-4 sentences max) and elegant
- Respond in English only
- Do not reveal you are an AI model or mention NVIDIA/LLaMA
"""


@router.post("/ai/chat")
def ai_chat(data: dict = Body(...), db: Session = Depends(get_db)):
    message = data.get("message", "").strip()
    if not message:
        return {"reply": "How may I assist your selection today?"}

    if is_abusive(message):
        return {"reply": "Teri maa ki aankh,bkl,randi ke bache teri maa chude ghar ghar dhe ke laund seedha baat kar warna block kar dunga. Agar help chahiye toh bata, warna jaa apna kaam kar. 😤"}

    # If NVIDIA key not configured, fall back to rule-based
    if not nvidia_client:
        return _rule_based_fallback(message, db)

    try:
        product_context = get_product_context(db, message)

        user_message = f"""Customer message: {message}

GAURK CATALOG (these are the ONLY real products — do not mention anything outside this list):
{product_context}"""

        response = nvidia_client.chat.completions.create(
            model="meta/llama-3.1-8b-instruct",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_message}
            ],
            temperature=0.6,
            max_tokens=200,
        )

        reply = response.choices[0].message.content.strip()
        return {"reply": reply}

    except Exception as e:
        # Graceful fallback if NVIDIA API fails
        print(f"NVIDIA API error: {e}")
        return _rule_based_fallback(message, db)


def _rule_based_fallback(message: str, db: Session) -> dict:
    """Original keyword-based fallback when AI is unavailable."""
    msg = message.lower()

    greetings = ["hi", "hello", "hey", "greetings", "good morning", "good evening"]
    if any(word == msg or msg.startswith(word + " ") for word in greetings):
        return {"reply": "Welcome to the Elite Concierge. How may I serve you today?"}

    if any(word in msg for word in ["shipping", "delivery", "track", "arrive", "time"]):
        return {"reply": "We offer complimentary express shipping on all orders above ₹500. Standard delivery takes 3-5 business days. Track your order in the 'Account' section."}

    if any(word in msg for word in ["return", "exchange", "refund", "change"]):
        return {"reply": "We offer a 30-day complimentary return and exchange window for all unworn pieces in their original packaging."}

    if any(word in msg for word in ["human", "person", "support", "agent", "contact", "email", "whatsapp"]):
        return {"reply": "You can reach our Elite Concierge at gaurkclothing@gmail.com or WhatsApp +91 92179 60147."}

    return {"reply": "I am here to assist you. Could you tell me more about what you are looking for?"}
