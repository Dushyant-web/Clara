from jose import jwt, JWTError
import datetime
import os
from fastapi import Header, HTTPException

SECRET_KEY = os.getenv("JWT_SECRET", "secret")
ALGORITHM = "HS256"

# Fail fast in production if JWT_SECRET is missing or default — anyone could forge tokens otherwise.
if os.getenv("ENV") == "production" and SECRET_KEY in ("", "secret"):
    raise RuntimeError("JWT_SECRET must be set to a strong value in production")


def create_token(data: dict):

    payload = data.copy()

    payload["exp"] = datetime.datetime.utcnow() + datetime.timedelta(days=7)

    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def decode_token(token: str) -> dict:
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")


def get_current_user_id(authorization: str = Header(None)) -> int:
    """Extract and verify the user_id from the Authorization Bearer token."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid authorization header")
    token = authorization.split(" ", 1)[1].strip()
    payload = decode_token(token)
    user_id = payload.get("user_id")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token payload")
    return int(user_id)