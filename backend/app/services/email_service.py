import resend
import os

resend.api_key = os.getenv("RESEND_API_KEY")

def send_email(to_email, subject, body):

    resend.Emails.send({
        "from": "CLARA <onboarding@resend.dev>",
        "to": [to_email],
        "subject": subject,
        "text": body
    })