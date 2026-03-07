import firebase_admin
from firebase_admin import credentials, auth

cred = credentials.Certificate("app/config/firebase_key.json")

firebase_admin.initialize_app(cred)

def verify_firebase_token(id_token):

    decoded_token = auth.verify_id_token(id_token)

    phone_number = decoded_token.get("phone_number")

    return phone_number