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

    print("SHIPROCKET RESPONSE:", data)

    if "token" not in data:
        raise Exception(f"Shiprocket auth failed: {data}")

    return data["token"]