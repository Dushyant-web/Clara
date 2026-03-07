from jose import jwt
import datetime
import os

SECRET_KEY = os.getenv("JWT_SECRET", "secret")
ALGORITHM = "HS256"


def create_token(data: dict):

    payload = data.copy()

    payload["exp"] = datetime.datetime.utcnow() + datetime.timedelta(days=7)

    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)