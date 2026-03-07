import requests
import os


def send_otp(phone):

    # Remove + if user sends +91XXXXXXXXXX
    phone = phone.replace("+", "")

    url = "https://control.msg91.com/api/v5/otp"

    payload = {
        "mobile": phone,
        "template_id": os.getenv("MSG91_TEMPLATE")
    }

    headers = {
        "authkey": os.getenv("MSG91_AUTHKEY"),
        "Content-Type": "application/json"
    }

    response = requests.post(url, json=payload, headers=headers)

    return response.json()