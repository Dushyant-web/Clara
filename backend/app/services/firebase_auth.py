import firebase_admin
from firebase_admin import credentials, auth
import os

# Initialize Firebase only once
if not firebase_admin._apps:
    cred = credentials.Certificate(
        os.getenv("FIREBASE_KEY_PATH", "/etc/secrets/firebase_key.json")
    )
    firebase_admin.initialize_app(cred)


def verify_firebase_token(id_token: str):

    decoded_token = auth.verify_id_token(id_token)

    phone = decoded_token.get("phone_number")

    return phone