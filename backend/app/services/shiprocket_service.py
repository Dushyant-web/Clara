import requests
import os

BASE_URL = "https://apiv2.shiprocket.in/v1/external"

def get_shiprocket_token():

    url = f"{BASE_URL}/auth/login"

    payload = {
        "email": os.getenv("SHIPROCKET_EMAIL"),
        "password": os.getenv("SHIPROCKET_PASSWORD")
    }

    response = requests.post(url, json=payload)

    data = response.json()

    return data["token"]