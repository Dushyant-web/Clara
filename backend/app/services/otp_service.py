import requests
import os


def send_otp(phone):

    url = "https://control.msg91.com/api/v5/otp"

    payload = {
        "mobile": phone,
        "authkey": os.getenv("MSG91_AUTHKEY")
    }

    headers = {
        "Content-Type": "application/json"
    }

    response = requests.post(url, json=payload, headers=headers)

    return response.json()