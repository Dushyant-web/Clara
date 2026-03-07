import requests
import os

def send_otp(phone):

    phone = phone.replace("+", "")

    url = "https://control.msg91.com/api/v5/otp"

    payload = {
        "mobile": "91" + phone,
        "template_id": os.getenv("MSG91_TEMPLATE"),
        "otp_length": 6,
        "otp_expiry": 5
    }

    headers = {
        "authkey": os.getenv("MSG91_AUTHKEY"),
        "Content-Type": "application/json"
    }

    response = requests.post(url, json=payload, headers=headers)

    print(response.json())

    return response.json()